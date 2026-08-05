export type UserRole = "parent" | "family" | "admin";
export type SubscriptionTier = "free" | "premium" | "family_plus";
export type MediaKind = "photo" | "video" | "voice" | "text";

export type ProfileDoc = {
  id: string;
  role: UserRole;
  full_name: string;
  dob?: string | null;
  language: string;
  avatar_url?: string | null;
  family_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionDoc = {
  id: string;
  family_id: string;
  /** PhonePe merchant order id for the originating payment. */
  provider_order_id: string;
  /** PhonePe subscription / mandate id once AutoPay is set up. */
  provider_subscription_id: string;
  tier: SubscriptionTier;
  status: string;
  current_period_end: string | null;
};
