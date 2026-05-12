// Supabase Edge Function: stripe-create-payment-intent
//
// Creates a PaymentIntent on the barn's connected Stripe account and returns
// the ingredients needed by the React Native PaymentSheet (clientSecret,
// ephemeralKey, customer). Auth is enforced via the caller's JWT (RLS-aware).
//
// Deploy:
//   supabase functions deploy stripe-create-payment-intent --no-verify-jwt
// Secrets required (set with `supabase secrets set`):
//   STRIPE_SECRET_KEY      sk_test_... / sk_live_...
//   STRIPE_API_VERSION     2024-06-20

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY, {
      apiVersion:
        (Deno.env.get("STRIPE_API_VERSION") as Stripe.LatestApiVersion) ?? "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    })
  : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!stripe) {
      return json({ error: "Stripe is not configured on this Supabase project." }, 500);
    }

    const { barnId, amountCents, lessonTypeId, startsAt } = await req.json();
    if (!barnId || !amountCents) {
      return json({ error: "Missing barnId or amountCents." }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
      auth: { persistSession: false },
    });

    // Identify the caller
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    // Look up the barn's connected account
    const { data: barn, error: barnErr } = await supabase
      .from("barns")
      .select("id, name, stripe_account_id")
      .eq("id", barnId)
      .single();
    if (barnErr || !barn) return json({ error: "Barn not found." }, 404);
    if (!barn.stripe_account_id) {
      return json({ error: "Barn has not connected Stripe yet." }, 400);
    }

    // Reuse-or-create Stripe Customer per user
    const customers = await stripe.customers.list({ email: user.email ?? undefined, limit: 1 });
    const customer =
      customers.data[0] ??
      (await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      }));

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      transfer_data: { destination: barn.stripe_account_id },
      metadata: {
        supabase_user_id: user.id,
        barn_id: barn.id,
        lesson_type_id: lessonTypeId ?? "",
        starts_at: startsAt ?? "",
      },
    });

    return json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return json({ error: message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
