// Signed-in customer as the browser sees it. Customers log in with mobile number + OTP.
export type User = {
  id: string;
  name: string;
  phone: string; // 10 digits
  avatarUrl: string | null; // profile photo, if one was uploaded
  createdAt: string;
};

// Name every new customer starts with until they change it (matches the server).
export const DEFAULT_CUSTOMER_NAME = "Lucky Customer";

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(phone));
}

/** "9876543210" → "+91 98765 43210" */
export function formatPhone(phone: string): string {
  const p = normalizePhone(phone);
  return p.length === 10 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : phone;
}
