import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { isProduction, whatsappEnv } from "@/server/env";

// WhatsApp Cloud API webhook (Meta App → WhatsApp → Configuration → Webhook).
// Callback URL: https://<site>/api/whatsapp/webhook · Verify token: WHATSAPP_WEBHOOK_VERIFY_TOKEN.
//
// GET  — Meta's one-time check when the URL is saved: echo hub.challenge if the token matches.
// POST — events (delivery status of the login codes we send, replies). Signed by Meta with the
//        App Secret (X-Hub-Signature-256); unsigned or wrongly signed requests are refused.
// Codes that can't be delivered are logged so they show up in the server logs.

const digest = (s: string) => createHash("sha256").update(s).digest();
const sameSecret = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const token = whatsappEnv.webhookVerifyToken;
  const ok = params.get("hub.mode") === "subscribe" && token && sameSecret(params.get("hub.verify_token") ?? "", token);
  if (!ok) return new Response("Forbidden", { status: 403 });
  return new Response(params.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
}

type StatusEvent = { id: string; status: string; recipient_id?: string; errors?: { code: number; title?: string; message?: string }[] };
type WebhookBody = { entry?: { changes?: { field?: string; value?: { statuses?: StatusEvent[] } }[] }[] };

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = whatsappEnv.appSecret;
  if (secret) {
    const expected = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
    if (!sameSecret(req.headers.get("x-hub-signature-256") ?? "", expected)) return new Response("Invalid signature", { status: 401 });
  } else if (isProduction) {
    console.error("[whatsapp] WHATSAPP_APP_SECRET is not set — webhook events refused");
    return new Response("Not configured", { status: 503 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  for (const change of body.entry?.flatMap((e) => e.changes ?? []) ?? []) {
    for (const s of change.value?.statuses ?? []) {
      if (s.status !== "failed") continue;
      // Last 4 digits only: enough to match a customer complaint, not a full number in the logs.
      const to = s.recipient_id ? `…${s.recipient_id.slice(-4)}` : "unknown";
      const reason = s.errors?.map((e) => `${e.code} ${e.title ?? e.message ?? ""}`.trim()).join("; ") || "no details";
      console.warn(`[whatsapp] login code to ${to} not delivered: ${reason}`);
    }
  }

  // Always 200 once verified, or Meta keeps retrying the same event.
  return new Response("OK", { status: 200 });
}
