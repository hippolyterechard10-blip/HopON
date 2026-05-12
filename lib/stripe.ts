/**
 * Centralized Stripe config.
 * The publishable key lives in EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY and is read
 * by StripeProvider at the root layout.
 */

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const MERCHANT_IDENTIFIER = "merchant.com.hopon.app";
