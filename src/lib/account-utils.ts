import { MOCK_OTP_ACCOUNTS } from "@/lib/mock-otp-accounts";

// Uses client-side mock data instead of Firestore. Only the @test.myfamily.app
// accounts (and mock-OTP phone accounts) are mock-DATA accounts.
export function isMockAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.endsWith("@test.myfamily.app") || MOCK_OTP_ACCOUNTS.some(acc => acc.email === email);
}

// Pre-seeded demo accounts that should land straight on the populated dashboard
// (skip the setup checklist). Includes the mock-data accounts AND the
// @family.local accounts, which read REAL seeded Firestore data.
export function isDemoAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return isMockAccount(email) || email.endsWith("@family.local");
}

export function getMockAccountByEmail(email: string) {
  return MOCK_OTP_ACCOUNTS.find(acc => acc.email === email);
}

export function getMockAccountByPhone(phone: string) {
  const normalized = phone.replace(/\D/g, "").slice(-10);
  return MOCK_OTP_ACCOUNTS.find(acc => acc.phone.slice(-10) === normalized);
}
