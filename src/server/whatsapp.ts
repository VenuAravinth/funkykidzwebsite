import "server-only";
import { isProduction, whatsappEnv } from "./env";

// Sends the customer login code on WhatsApp through Meta's WhatsApp Cloud API.
//
// WhatsApp only delivers OTPs through an approved "Authentication" message template (created in
// WhatsApp Manager → Message templates, with a "Copy code" button). Its body holds the code as
// {{1}} and the button repeats it, so the same code is passed to both.
//
// Until WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_OTP_TEMPLATE are set, the
// code is printed in the terminal running "npm run dev" (and shown on the login screen) instead.

const { accessToken, phoneNumberId, otpTemplate, templateLanguage, apiVersion } = whatsappEnv;

export const whatsappConfigured = Boolean(accessToken && phoneNumberId && otpTemplate);

type GraphError = { error?: { message?: string; code?: number; error_subcode?: number; error_data?: { details?: string } } };

/** `phone` is the 10-digit Indian mobile number; WhatsApp wants it with the country code. */
export async function sendLoginOtp(phone: string, code: string): Promise<void> {
  if (!whatsappConfigured) {
    if (isProduction) throw new Error("WhatsApp is not configured — cannot send customer login OTP");
    console.warn(`\n[login] WhatsApp not configured. OTP for +91 ${phone}: ${code}\n`);
    return;
  }

  const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: `91${phone}`,
      type: "template",
      template: {
        name: otpTemplate,
        language: { code: templateLanguage },
        components: [
          { type: "body", parameters: [{ type: "text", text: code }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
        ],
      },
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  if (!res.ok) {
    const { error } = ((await res.json().catch(() => ({}))) as GraphError) ?? {};
    const detail = error?.error_data?.details ?? error?.message ?? "no details";
    throw new Error(`WhatsApp API ${res.status} (code ${error?.code ?? "?"}/${error?.error_subcode ?? "-"}): ${detail}`);
  }
}
