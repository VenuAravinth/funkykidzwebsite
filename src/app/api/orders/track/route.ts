import type { NextRequest } from "next/server";
import { findOrderForCustomer } from "@/server/orderStore";
import { clientIp, json, sameOrigin } from "@/server/adminAuth";
import { rateLimit } from "@/server/rateLimit";

// Public: customers look up their own order with order number + checkout mobile number.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  // Generous for real shoppers, slow for anyone guessing order numbers.
  const limit = rateLimit(`track:${clientIp(req.headers)}`, 30, 15 * 60_000);
  if (!limit.ok) return json({ error: "Too many lookups. Please wait a few minutes and try again." }, 429);

  const body = (await req.json().catch(() => null)) as { orderNumber?: unknown; phone?: unknown } | null;
  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber : "";
  const phone = typeof body?.phone === "string" ? body.phone : "";
  if (!orderNumber || !phone) return json({ error: "Enter your order number and mobile number." }, 400);

  const order = await findOrderForCustomer(orderNumber, phone);
  if (!order) {
    return json({ error: "We couldn't find an order with that number and mobile. Please check both and try again." }, 404);
  }
  return json({ order });
}
