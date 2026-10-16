import type { NextRequest } from "next/server";
import { json, requireAdminApi } from "@/server/adminAuth";
import { createCoupon, listCoupons } from "@/server/coupons";
import { readBody } from "@/server/http";

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi(req);
  if ("error" in guard) return guard.error;
  return json({ coupons: await listCoupons() });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi(req, { mutation: true });
  if ("error" in guard) return guard.error;
  const result = await createCoupon(await readBody(req));
  return result.ok ? json({ coupon: result.coupon }, 201) : json({ error: result.error }, 400);
}
