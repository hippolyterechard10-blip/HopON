import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStripe } from "@stripe/stripe-react-native";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

type BookInput = {
  barnId: string;
  lessonTypeId: string;
  horseId: string | null;
  trainerId: string | null;
  startsAt: string;
  endsAt: string;
  priceCents: number;
};

/**
 * One-shot booking: ask the Edge Function for a PaymentIntent client secret,
 * present the Stripe PaymentSheet (with Apple Pay/Google Pay), and on success
 * insert the lesson + payment row. The Edge Function should also tie the
 * Connect account; the client never touches a secret key.
 */
export function useBookLesson() {
  const stripe = useStripe();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: BookInput) => {
      if (!userId) throw new Error("Not signed in.");

      // 1. Edge Function returns { clientSecret, paymentIntentId, ephemeralKey, customer }
      const { data: intent, error: feErr } = await supabase.functions.invoke(
        "stripe-create-payment-intent",
        {
          body: {
            barnId: input.barnId,
            amountCents: input.priceCents,
            lessonTypeId: input.lessonTypeId,
            startsAt: input.startsAt,
          },
        },
      );
      if (feErr || !intent?.clientSecret) {
        throw new Error(feErr?.message ?? "Could not start payment.");
      }

      // 2. Initialize + present the Stripe PaymentSheet
      const init = await stripe.initPaymentSheet({
        merchantDisplayName: "HopOn",
        paymentIntentClientSecret: intent.clientSecret,
        customerId: intent.customer,
        customerEphemeralKeySecret: intent.ephemeralKey,
        applePay: { merchantCountryCode: "US" },
        googlePay: { merchantCountryCode: "US", testEnv: true },
        allowsDelayedPaymentMethods: false,
        returnURL: "hopon://stripe-callback",
      });
      if (init.error) throw new Error(init.error.message);

      const present = await stripe.presentPaymentSheet();
      if (present.error) {
        if (present.error.code === "Canceled") {
          throw new Error("Payment cancelled.");
        }
        throw new Error(present.error.message);
      }

      // 3. Insert the lesson + payment rows once Stripe confirms
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({
          barn_id: input.barnId,
          payer_id: userId,
          recipient_id: input.trainerId,
          amount_cents: input.priceCents,
          status: "succeeded",
          stripe_payment_intent_id: intent.paymentIntentId,
          is_prepayment: true,
          paid_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (payErr) throw payErr;

      const { data: lesson, error: lessonErr } = await supabase
        .from("lessons")
        .insert({
          barn_id: input.barnId,
          lesson_type_id: input.lessonTypeId,
          trainer_id: input.trainerId,
          horse_id: input.horseId,
          client_id: userId,
          status: "confirmed",
          starts_at: input.startsAt,
          ends_at: input.endsAt,
          is_paid: true,
          payment_id: payment?.id ?? null,
        })
        .select("id")
        .single();
      if (lessonErr) throw lessonErr;

      return { lessonId: lesson.id, paymentId: payment?.id ?? null };
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots", vars.barnId] });
    },
  });
}
