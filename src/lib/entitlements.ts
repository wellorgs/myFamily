import type { SubscriptionTier } from "@/integrations/firebase/types";

export function hasPremiumAccess(tier: SubscriptionTier | null | undefined) {
  return tier === "premium" || tier === "family_plus";
}

export function hasFamilyPlusAccess(tier: SubscriptionTier | null | undefined) {
  return tier === "family_plus";
}
