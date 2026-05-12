// Supabase Edge Function: stripe-webhook
//
// Receives Stripe events on the platform account and reconciles them against
// the payments table. Idempotent — uses stripe_payment_intent_id as the
// uniqueness key.
//
// Deploy with --no-verify-jwt because Stripe authenticates via signature:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET   whsec_...

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

// Service-role client — bypasses RLS to update payments idempotently.
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response(`Bad signature: ${(e as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await admin
          .from("payments")
          .upsert(
            {
              stripe_payment_intent_id: pi.id,
              stripe_charge_id:
                typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id ?? null,
              amount_cents: pi.amount,
              currency: pi.currency,
              status: "succeeded",
              barn_id: pi.metadata?.barn_id ?? null,
              payer_id: pi.metadata?.supabase_user_id ?? null,
              paid_at: new Date().toISOString(),
            },
            { onConflict: "stripe_payment_intent_id" },
          );
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await admin
          .from("payments")
          .upsert(
            {
              stripe_payment_intent_id: pi.id,
              status: "failed",
              amount_cents: pi.amount,
              currency: pi.currency,
              barn_id: pi.metadata?.barn_id ?? null,
            },
            { onConflict: "stripe_payment_intent_id" },
          );
        break;
      }
      case "charge.refunded": {
        const ch = event.data.object as Stripe.Charge;
        if (ch.payment_intent && typeof ch.payment_intent === "string") {
          await admin
            .from("payments")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", ch.payment_intent);
        }
        break;
      }
      default:
        // Unhandled — return 200 so Stripe doesn't retry.
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(`Handler error: ${(e as Error).message}`, { status: 500 });
  }
});
