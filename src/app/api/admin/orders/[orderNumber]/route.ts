import type { NextRequest } from "next/server";
import { clientIp, json, requireAdminApi } from "@/server/adminAuth";
import { audit, updateAdmin } from "@/server/adminStore";
import { getOrder, updateOrder } from "@/server/orderStore";

type Ctx = { params: Promise<{ orderNumber: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdminApi(req);
  if ("error" in guard) return guard.error;
  const order = await getOrder((await params).orderNumber);
  return order ? json({ order }) : json({ error: "Not found" }, 404);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdminApi(req, { mutation: true });
  if ("error" in guard) return guard.error;
  const { orderNumber } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid request." }, 400);

  const order = await updateOrder(orderNumber, body);
  if (!order) return json({ error: "Not found" }, 404);
  const ip = clientIp(req.headers);
  await updateAdmin((a) => audit(a, `order ${orderNumber} updated (${order.status}, payment ${order.paymentStatus})`, ip));
  return json({ order });
}
