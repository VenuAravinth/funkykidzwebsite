import type { NextRequest } from "next/server";
import { json, requireAdminApi } from "@/server/adminAuth";
import { listOrders } from "@/server/orderStore";

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi(req);
  if ("error" in guard) return guard.error;
  const orders = (await listOrders()).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  return json({ orders });
}
