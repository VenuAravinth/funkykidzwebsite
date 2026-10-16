import "server-only";
import { ObjectId } from "mongodb";
import { COUPON_CODE_PATTERN, normalizeCouponCode, type AppliedCoupon } from "@/lib/coupons";
import { formatPrice } from "@/lib/format";
import { collections, type CouponDoc } from "./db";

// Redeem codes: validation, the discount they give, and reserving/releasing a use.
// A code takes money off the item subtotal only; delivery is worked out before the discount.

type Evaluation = { ok: true; coupon: CouponDoc; discount: number; label: string } | { ok: false; error: string };

const dateLabel = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function couponLabel(c: Pick<CouponDoc, "type" | "value" | "maxDiscount">): string {
  if (c.type === "flat") return `${formatPrice(c.value)} off`;
  return c.maxDiscount ? `${c.value}% off (up to ${formatPrice(c.maxDiscount)})` : `${c.value}% off`;
}

export function discountFor(c: Pick<CouponDoc, "type" | "value" | "maxDiscount">, subtotal: number): number {
  const raw = c.type === "flat" ? c.value : Math.floor((subtotal * c.value) / 100);
  const capped = c.type === "percent" && c.maxDiscount ? Math.min(raw, c.maxDiscount) : raw;
  return Math.max(0, Math.min(capped, subtotal));
}

/** Can this customer use `code` on an order with this item subtotal right now? */
export async function evaluateCoupon(rawCode: string, userId: ObjectId, subtotal: number, now = new Date()): Promise<Evaluation> {
  const code = normalizeCouponCode(rawCode);
  if (!COUPON_CODE_PATTERN.test(code)) return { ok: false, error: "That doesn't look like a valid code. Check the spelling and try again." };

  const { coupons, couponRedemptions } = await collections();
  const coupon = await coupons.findOne({ code });
  if (!coupon) return { ok: false, error: `“${code}” isn't a valid code. Check the spelling and try again.` };
  if (!coupon.active) return { ok: false, error: `“${code}” is no longer active.` };
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: `“${code}” can be used from ${dateLabel(coupon.startsAt)}.` };
  if (coupon.expiresAt && coupon.expiresAt < now) return { ok: false, error: `“${code}” expired on ${dateLabel(coupon.expiresAt)}.` };
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: `“${code}” has been fully redeemed and can't be used any more.` };
  }
  const usedByCustomer = await couponRedemptions.countDocuments({ couponId: coupon._id, userId });
  if (usedByCustomer >= coupon.perCustomerLimit) {
    return { ok: false, error: coupon.perCustomerLimit === 1 ? `You've already used “${code}”.` : `You've used “${code}” the maximum number of times.` };
  }
  if (subtotal < coupon.minOrder) {
    return { ok: false, error: `“${code}” needs a minimum order of ${formatPrice(coupon.minOrder)}. Add ${formatPrice(coupon.minOrder - subtotal)} more to use it.` };
  }
  const discount = discountFor(coupon, subtotal);
  if (discount <= 0) return { ok: false, error: `“${code}” can't be applied to this order.` };
  return { ok: true, coupon, discount, label: couponLabel(coupon) };
}

export const toApplied = (e: Extract<Evaluation, { ok: true }>): AppliedCoupon => ({ code: e.coupon.code, discount: e.discount, label: e.label });

/**
 * Takes one use of the code for an order. Atomic, so the last remaining use can't be taken twice.
 * Returns false if it ran out in the meantime.
 */
export async function reserveCouponUse(couponId: ObjectId): Promise<boolean> {
  const { coupons } = await collections();
  const res = await coupons.updateOne(
    { _id: couponId, active: true, $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
    { $inc: { usedCount: 1 } },
  );
  return res.modifiedCount === 1;
}

export async function recordRedemption(coupon: CouponDoc, userId: ObjectId, orderNumber: string, discount: number) {
  const { couponRedemptions } = await collections();
  await couponRedemptions.insertOne({ _id: new ObjectId(), couponId: coupon._id, code: coupon.code, userId, orderNumber, discount, at: new Date() });
}

/** Gives a use back, e.g. when the order didn't go through or was cancelled. */
export async function releaseCouponUse(couponId: ObjectId, orderNumber?: string) {
  const { coupons, couponRedemptions } = await collections();
  await coupons.updateOne({ _id: couponId, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
  if (orderNumber) await couponRedemptions.deleteOne({ orderNumber });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export type AdminCoupon = {
  id: string;
  code: string;
  type: CouponDoc["type"];
  value: number;
  maxDiscount: number | null;
  minOrder: number;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  perCustomerLimit: number;
  usedCount: number;
  active: boolean;
  note: string;
  label: string;
  status: "Active" | "Scheduled" | "Expired" | "Used up" | "Paused";
};

export function toAdminCoupon(c: CouponDoc, now = new Date()): AdminCoupon {
  const status: AdminCoupon["status"] = !c.active
    ? "Paused"
    : c.expiresAt && c.expiresAt < now
      ? "Expired"
      : c.usageLimit !== undefined && c.usedCount >= c.usageLimit
        ? "Used up"
        : c.startsAt && c.startsAt > now
          ? "Scheduled"
          : "Active";
  return {
    id: c._id.toHexString(),
    code: c.code,
    type: c.type,
    value: c.value,
    maxDiscount: c.maxDiscount ?? null,
    minOrder: c.minOrder,
    startsAt: c.startsAt?.toISOString() ?? null,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    usageLimit: c.usageLimit ?? null,
    perCustomerLimit: c.perCustomerLimit,
    usedCount: c.usedCount,
    active: c.active,
    note: c.note ?? "",
    label: couponLabel(c),
    status,
  };
}

export async function listCoupons(): Promise<AdminCoupon[]> {
  const { coupons } = await collections();
  return (await coupons.find({}).sort({ createdAt: -1 }).limit(500).toArray()).map((c) => toAdminCoupon(c));
}

const num = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : Number(v));
// Dates arrive as "YYYY-MM-DD" from the form and are read as India time: start of day / end of day.
const day = (v: unknown, end: boolean) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T${end ? "23:59:59" : "00:00:00"}+05:30`) : undefined;

export async function createCoupon(body: Record<string, unknown>): Promise<{ ok: true; coupon: AdminCoupon } | { ok: false; error: string }> {
  const code = normalizeCouponCode(typeof body.code === "string" ? body.code : "");
  if (!COUPON_CODE_PATTERN.test(code)) return { ok: false, error: "Code must be 3–24 letters, numbers or dashes." };
  const type = body.type === "percent" ? "percent" : body.type === "flat" ? "flat" : null;
  if (!type) return { ok: false, error: "Choose a discount type." };
  const value = num(body.value);
  if (value === undefined || !Number.isFinite(value) || value <= 0) return { ok: false, error: "Enter the discount amount." };
  if (type === "percent" && (value > 90 || !Number.isInteger(value))) return { ok: false, error: "Percentage must be a whole number from 1 to 90." };
  if (type === "flat" && (value > 100000 || !Number.isInteger(value))) return { ok: false, error: "Rupee amount must be a whole number." };
  const maxDiscount = type === "percent" ? num(body.maxDiscount) : undefined;
  const minOrder = num(body.minOrder) ?? 0;
  const usageLimit = num(body.usageLimit);
  const perCustomerLimit = num(body.perCustomerLimit) ?? 1;
  for (const [label, v] of [["Maximum discount", maxDiscount], ["Minimum order", minOrder], ["Total uses", usageLimit], ["Uses per customer", perCustomerLimit]] as const) {
    if (v !== undefined && (!Number.isInteger(v) || v < 0)) return { ok: false, error: `${label} must be a whole number.` };
  }
  if (usageLimit === 0 || perCustomerLimit < 1) return { ok: false, error: "Usage limits must be at least 1." };
  if (type === "flat" && minOrder > 0 && value > minOrder) return { ok: false, error: "A rupee discount shouldn't be more than the minimum order." };
  const startsAt = day(body.startsAt, false);
  const expiresAt = day(body.expiresAt, true);
  if (startsAt && expiresAt && expiresAt < startsAt) return { ok: false, error: "The end date is before the start date." };

  const doc: CouponDoc = {
    _id: new ObjectId(),
    code,
    type,
    value,
    ...(maxDiscount ? { maxDiscount } : {}),
    minOrder,
    ...(startsAt ? { startsAt } : {}),
    ...(expiresAt ? { expiresAt } : {}),
    ...(usageLimit ? { usageLimit } : {}),
    perCustomerLimit,
    usedCount: 0,
    active: true,
    ...(typeof body.note === "string" && body.note.trim() ? { note: body.note.trim().slice(0, 200) } : {}),
    createdAt: new Date(),
  };
  const { coupons } = await collections();
  try {
    await coupons.insertOne(doc);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return { ok: false, error: `A code called ${code} already exists.` };
    throw err;
  }
  return { ok: true, coupon: toAdminCoupon(doc) };
}

export async function setCouponActive(id: string, active: boolean) {
  if (!ObjectId.isValid(id)) return null;
  const { coupons } = await collections();
  const doc = await coupons.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { active } }, { returnDocument: "after" });
  return doc ? toAdminCoupon(doc) : null;
}

/** Unused codes can be deleted; used ones are kept (orders refer to them) and can only be paused. */
export async function deleteCoupon(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ObjectId.isValid(id)) return { ok: false, error: "Not found." };
  const { coupons } = await collections();
  const res = await coupons.deleteOne({ _id: new ObjectId(id), usedCount: 0 });
  return res.deletedCount ? { ok: true } : { ok: false, error: "This code has been used on orders, so it can only be paused." };
}
