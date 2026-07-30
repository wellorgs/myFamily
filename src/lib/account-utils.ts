import { MOCK_OTP_ACCOUNTS } from "@/lib/mock-otp-accounts";

export function isMockAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.endsWith("@test.myfamily.app") || MOCK_OTP_ACCOUNTS.some(acc => acc.email === email);
}

export function getMockAccountByEmail(email: string) {
  return MOCK_OTP_ACCOUNTS.find(acc => acc.email === email);
}

export function getMockAccountByPhone(phone: string) {
  const normalized = phone.replace(/\D/g, "").slice(-10);
  return MOCK_OTP_ACCOUNTS.find(acc => acc.phone.slice(-10) === normalized);
}
