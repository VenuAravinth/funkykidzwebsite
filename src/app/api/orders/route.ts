import type { NextRequest } from "next/server";
import { createOrder, listOrdersForUser, type NewOrderInput } from "@/server/orderStore";
import { clientIp, json } from "@/server/adminAuth";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { rateLimit } from "@/server/rateLimit";
import { readBody } from "@/server/http";

/** The signed-in customer's orders, newest first. */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  return json({ orders: await listOrdersForUser(auth.user._id) });
}

/** Place an order (signed-in customers only). Prices, stock and address are checked on the server. */
export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const limit = rateLimit(`order:${clientIp(req.headers)}`, 10, 60 * 60_000);
  if (!limit.ok) return json({ error: "Too many orders from this network. Please try again later." }, 429);

  const body = (await readBody(req, 8 * 1024 * 1024)) as NewOrderInput;
  const result = await createOrder(body, auth.user);
  return result.ok ? json({ orderNumber: result.orderNumber }, 201) : json({ error: result.error }, result.status ?? 400);
}
