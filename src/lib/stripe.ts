import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  }

  return stripeClient;
}

export const PRICE_LOOKUP = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? "",
  family_plus_monthly: process.env.STRIPE_PRICE_FAMILY_PLUS_MONTHLY ?? "",
  family_plus_yearly: process.env.STRIPE_PRICE_FAMILY_PLUS_YEARLY ?? "",
} as const;
