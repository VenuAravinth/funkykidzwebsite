import "server-only";
import { isProduction } from "./env";

// Sends the customer login code by SMS.
//
// No SMS gateway is connected yet. In development the code is printed in the terminal
// running "npm run dev" (and shown on the login screen), like the admin email OTP.
// To go live, call your provider (MSG91, Twilio, Fast2SMS…) here using its DLT-approved
// OTP template, with credentials from environment variables.

export const smsConfigured = false;

export async function sendLoginOtp(phone: string, code: string): Promise<void> {
  if (!smsConfigured) {
    if (isProduction) throw new Error("SMS is not configured — cannot send customer login OTP");
    console.warn(`\n[login] SMS not configured. OTP for +91 ${phone}: ${code}\n`);
    return;
  }
}
