import type { NextRequest } from "next/server";
import { json, requireAdminApi } from "@/server/adminAuth";
import { deleteCoupon, setCouponActive } from "@/server/coupons";
import { readBody } from "@/server/http";

type Ctx = { params: Promise<{ id: string }> };

// Pause or resume a code: { active: boolean }.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdminApi(req, { mutation: true });
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const body = await readBody(req);
  if (typeof body.active !== "boolean") return json({ error: "Nothing to change." }, 400);
  const coupon = await setCouponActive(id, body.active);
  return coupon ? json({ coupon }) : json({ error: "Not found." }, 404);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdminApi(req, { mutation: true });
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const result = await deleteCoupon(id);
  return result.ok ? json({ ok: true }) : json({ error: result.error }, 409);
}
