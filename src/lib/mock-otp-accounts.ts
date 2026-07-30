import type { Lang, Role } from "@/lib/app-state";

export type MockOtpAccount = {
  phone: string;
  otp: string;
  role: Role;
  name: string;
  email: string;
  language: Lang;
  relationship: string;
  familyId: string;
  city: string;
  plan: "free" | "premium";
};

// 7 test accounts: fam-1 (1 parent + 2 kids), fam-2 (2 parents + 2 kids)
export const MOCK_OTP_ACCOUNTS: MockOtpAccount[] = [
  // Family 1: Rajesh (parent) + Arjun (son) + Priya (daughter)
  { phone: "9876543210", otp: "111111", role: "parent", name: "Rajesh Kumar", email: "rajesh.kumar@test.myfamily.app", language: "en", relationship: "Father", familyId: "fam-1", city: "Bangalore", plan: "premium" },
  { phone: "9876543211", otp: "111112", role: "family", name: "Arjun Kumar", email: "arjun.kumar@test.myfamily.app", language: "en", relationship: "Son", familyId: "fam-1", city: "Bangalore", plan: "premium" },
  { phone: "9876543212", otp: "111113", role: "family", name: "Priya Kumar", email: "priya.kumar@test.myfamily.app", language: "en", relationship: "Daughter", familyId: "fam-1", city: "Bangalore", plan: "premium" },

  // Family 2: Anita (parent) + Vikram (parent) + Rohan (son) + Sneha (daughter)
  { phone: "9876543220", otp: "222221", role: "parent", name: "Anita Singh", email: "anita.singh@test.myfamily.app", language: "hi", relationship: "Mother", familyId: "fam-2", city: "Delhi", plan: "premium" },
  { phone: "9876543221", otp: "222222", role: "parent", name: "Vikram Singh", email: "vikram.singh@test.myfamily.app", language: "hi", relationship: "Father", familyId: "fam-2", city: "Delhi", plan: "premium" },
  { phone: "9876543222", otp: "222223", role: "family", name: "Rohan Singh", email: "rohan.singh@test.myfamily.app", language: "en", relationship: "Son", familyId: "fam-2", city: "Delhi", plan: "premium" },
  { phone: "9876543223", otp: "222224", role: "family", name: "Sneha Singh", email: "sneha.singh@test.myfamily.app", language: "en", relationship: "Daughter", familyId: "fam-2", city: "Delhi", plan: "premium" },
];
