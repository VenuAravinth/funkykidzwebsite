import type { NextRequest } from "next/server";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { evaluateCoupon, toApplied } from "@/server/coupons";
import { priceItems } from "@/server/orderStore";
import { json } from "@/server/adminAuth";
import { rateLimit } from "@/server/rateLimit";
import { readBody } from "@/server/http";

// Checks a redeem code against the customer's checkout items: { code, items }.
// The order is checked again when it's placed; this just shows the customer what they'll save.
export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  // Slows down anyone trying to guess codes.
  const limit = rateLimit(`coupon:${auth.user._id.toHexString()}`, 15, 10 * 60_000);
  if (!limit.ok) return json({ error: "Too many attempts. Please wait a few minutes and try again." }, 429);

  const body = await readBody(req);
  const priced = await priceItems(body.items);
  if (!priced.ok) return json({ error: priced.error }, 400);
  const result = await evaluateCoupon(typeof body.code === "string" ? body.code : "", auth.user._id, priced.subtotal);
  return result.ok ? json({ coupon: toApplied(result) }) : json({ error: result.error }, 422);
}
