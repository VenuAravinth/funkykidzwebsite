import "server-only";
import { randomInt } from "node:crypto";
import { Binary, ObjectId } from "mongodb";
import { normalizeMobile, normalizeOrderNumber, type TrackedOrder } from "@/lib/tracking";
import { calcDelivery } from "@/lib/cartPricing";
import { addressLabelText } from "@/lib/addresses";
import type { OrderStatus } from "@/lib/orders";
import type { DeliveryAddressSnapshot } from "@/lib/placedOrders";
import { collections, plain, type OrderDoc, type UserDoc } from "./db";
import { getProduct, releaseStock, reserveStock } from "./catalog";
import { hasVariant } from "@/lib/products";
import { evaluateCoupon, recordRedemption, releaseCouponUse, reserveCouponUse } from "./coupons";

export type PaymentStatus = "Pending Verification" | "Verified" | "Rejected";
export type AdminOrderStatus = OrderStatus | "Cancelled";

export const ORDER_STATUSES: AdminOrderStatus[] = ["Processing", "Packed", "In Transit", "Delivered", "Cancelled"];
export const PAYMENT_STATUSES: PaymentStatus[] = ["Pending Verification", "Verified", "Rejected"];

export type StoredOrderItem = {
  slug: string;
  name: string;
  colorwayName: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type StoredOrder = {
  orderNumber: string;
  placedAt: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: DeliveryAddressSnapshot;
  items: StoredOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string; // redeem code used, if any
  couponReleased?: boolean; // set once a cancelled order gives its code use back
  total: number;
  paymentMethod: "UPI";
  paymentStatus: PaymentStatus;
  proofFile: string | null; // "db" when the screenshot is in the payment_proofs collection
  status: AdminOrderStatus;
  statusHistory: { status: string; at: string }[];
  adminNote: string;
  stockReleased?: boolean; // set once stock is returned after a cancellation
};

/** What a customer sees in "My orders": tracking info plus where it's being delivered. */
export type CustomerOrder = TrackedOrder & { address: DeliveryAddressSnapshot };

const toStored = (doc: OrderDoc): StoredOrder => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId, ...rest } = plain(doc);
  return rest;
};

const toTracked = (o: StoredOrder): TrackedOrder => ({
  orderNumber: o.orderNumber,
  placedAt: o.placedAt,
  status: o.status,
  paymentStatus: o.paymentStatus,
  history: o.statusHistory,
  items: o.items,
  subtotal: o.subtotal,
  deliveryFee: o.deliveryFee,
  discount: o.discount,
  total: o.total,
});

export async function listOrders(): Promise<StoredOrder[]> {
  const { orders } = await collections();
  return (await orders.find().sort({ placedAt: -1 }).toArray()).map(toStored);
}

export async function getOrder(orderNumber: string): Promise<StoredOrder | null> {
  const { orders } = await collections();
  const doc = await orders.findOne({ orderNumber });
  return doc ? toStored(doc) : null;
}

export async function listOrdersForUser(userId: ObjectId): Promise<CustomerOrder[]> {
  const { orders } = await collections();
  const docs = await orders.find({ userId }).sort({ placedAt: -1 }).limit(100).toArray();
  return docs.map((d) => {
    const o = toStored(d);
    return { ...toTracked(o), address: o.address };
  });
}

// ---------------------------------------------------------------------------
// Customer order intake
// ---------------------------------------------------------------------------

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type NewOrderInput = {
  items?: unknown;
  addressId?: unknown;
  proofDataUrl?: unknown;
  couponCode?: unknown;
};

type Result = { ok: true; orderNumber: string } | { ok: false; error: string; status?: number };

/** Checks the items against the catalogue and prices them from the database (never the browser). */
export async function priceItems(rawItems: unknown): Promise<{ ok: true; items: StoredOrderItem[]; subtotal: number } | { ok: false; error: string }> {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
    return { ok: false, error: "Your order has no items." };
  }
  const items: StoredOrderItem[] = [];
  for (const raw of rawItems as Record<string, unknown>[]) {
    const product = await getProduct(str(raw?.slug, 120));
    const quantity = Number(raw?.quantity);
    const size = str(raw?.size, 20);
    const colorwayName = str(raw?.colorwayName, 40);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return { ok: false, error: "Invalid item in order." };
    if (!hasVariant(product, colorwayName, size)) {
      return { ok: false, error: `Invalid size for ${product.name}.` };
    }
    items.push({ slug: product.slug, name: product.name, colorwayName, size, quantity, unitPrice: product.price });
  }
  return { ok: true, items, subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) };
}

export async function createOrder(input: NewOrderInput, user: UserDoc): Promise<Result> {
  const priced = await priceItems(input.items);
  if (!priced.ok) return priced;
  const { items, subtotal } = priced;

  // Redeem code: checked again here, whatever the browser showed.
  const couponCode = str(input.couponCode, 40);
  const coupon = couponCode ? await evaluateCoupon(couponCode, user._id, subtotal) : null;
  if (coupon && !coupon.ok) return { ok: false, status: 409, error: `${coupon.error} Remove the code to continue.` };

  // Address: must be one of this customer's saved addresses (never trusted from the browser).
  const { addresses, orders, proofs, carts } = await collections();
  const addressId = str(input.addressId, 24);
  const saved = ObjectId.isValid(addressId) ? await addresses.findOne({ _id: new ObjectId(addressId), userId: user._id }) : null;
  if (!saved) return { ok: false, error: "Please choose a delivery address." };
  const address: DeliveryAddressSnapshot = {
    label: addressLabelText(saved),
    recipientName: saved.recipientName,
    phone: saved.phone,
    line1: saved.line1,
    line2: saved.line2,
    city: saved.city,
    state: saved.state,
    postalCode: saved.postalCode,
    country: saved.country,
  };

  // Payment proof: decoded and size-checked; stored privately in MongoDB, never under /public.
  const proof = str(input.proofDataUrl, MAX_PROOF_BYTES * 2);
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(proof);
  if (!match) return { ok: false, error: "Payment screenshot must be a PNG, JPG or WEBP image." };
  const proofBytes = Buffer.from(match[2], "base64");
  if (proofBytes.length > MAX_PROOF_BYTES) return { ok: false, error: "Payment screenshot is larger than 5 MB." };

  // Stock: taken now so two customers can't buy the same last piece.
  const stock = await reserveStock(items);
  if (!stock.ok) {
    const name = items.find((i) => i.slug === stock.slug)?.name ?? "An item";
    return { ok: false, status: 409, error: `${name} in ${stock.colorwayName} / ${stock.size} just sold out. Please remove it or pick another size.` };
  }

  // Take one use of the code now, so the last remaining use can't go to two orders.
  if (coupon?.ok && !(await reserveCouponUse(coupon.coupon._id))) {
    await releaseStock(items);
    return { ok: false, status: 409, error: `“${coupon.coupon.code}” has just been fully redeemed. Remove the code to continue.` };
  }
  const discount = coupon?.ok ? coupon.discount : 0;
  // Delivery is based on the item subtotal before the discount, so a code never costs free shipping.
  const deliveryFee = calcDelivery(subtotal);
  const placedAt = new Date().toISOString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = String(randomInt(1_000_000_000, 9_999_999_999));
    const doc: OrderDoc = {
      userId: user._id,
      orderNumber,
      placedAt,
      customerId: user._id.toHexString(),
      customerName: user.name,
      customerEmail: user.email ?? "",
      phone: user.phone,
      address,
      items,
      subtotal,
      deliveryFee,
      discount,
      ...(coupon?.ok ? { couponCode: coupon.coupon.code } : {}),
      total: subtotal - discount + deliveryFee,
      paymentMethod: "UPI",
      paymentStatus: "Pending Verification",
      proofFile: "db",
      status: "Processing",
      statusHistory: [{ status: "Processing", at: placedAt }],
      adminNote: "",
    };
    try {
      await orders.insertOne(doc);
    } catch (err) {
      if ((err as { code?: number }).code === 11000) continue; // order number collision: try another
      await releaseStock(items);
      if (coupon?.ok) await releaseCouponUse(coupon.coupon._id);
      throw err;
    }
    if (coupon?.ok) await recordRedemption(coupon.coupon, user._id, orderNumber, discount);
    await proofs.insertOne({ orderNumber, contentType: match[1], data: new Binary(proofBytes), createdAt: new Date() });
    // Remove the bought lines from the customer's cart.
    const cart = await carts.findOne({ userId: user._id });
    if (cart) {
      const bought = new Set(items.map((i) => `${i.slug}__${i.colorwayName}__${i.size}`));
      await carts.updateOne(
        { _id: cart._id },
        { $set: { items: cart.items.filter((l) => !bought.has(l.lineId)), updatedAt: new Date() } },
      );
    }
    return { ok: true, orderNumber };
  }
  await releaseStock(items);
  if (coupon?.ok) await releaseCouponUse(coupon.coupon._id);
  return { ok: false, error: "Could not place your order. Please try again." };
}

// ---------------------------------------------------------------------------
// Customer tracking (needs both the order number and the checkout mobile number)
// ---------------------------------------------------------------------------

export async function findOrderForCustomer(orderNumber: string, phone: string): Promise<TrackedOrder | null> {
  const number = normalizeOrderNumber(orderNumber);
  const mobile = normalizeMobile(phone);
  if (!number || mobile.length < 10) return null;
  const order = await getOrder(number);
  if (!order || (normalizeMobile(order.phone) !== mobile && normalizeMobile(order.address.phone) !== mobile)) return null;
  return toTracked(order);
}

// ---------------------------------------------------------------------------
// Admin updates
// ---------------------------------------------------------------------------

export async function updateOrder(
  orderNumber: string,
  patch: { status?: unknown; paymentStatus?: unknown; adminNote?: unknown },
): Promise<StoredOrder | null> {
  const { orders } = await collections();
  const order = await getOrder(orderNumber);
  if (!order) return null;
  const now = new Date().toISOString();
  const set: Partial<StoredOrder> = {};
  const history: { status: string; at: string }[] = [];

  if (typeof patch.status === "string" && ORDER_STATUSES.includes(patch.status as AdminOrderStatus) && patch.status !== order.status) {
    set.status = patch.status as AdminOrderStatus;
    history.push({ status: set.status, at: now });
  }
  if (
    typeof patch.paymentStatus === "string" &&
    PAYMENT_STATUSES.includes(patch.paymentStatus as PaymentStatus) &&
    patch.paymentStatus !== order.paymentStatus
  ) {
    set.paymentStatus = patch.paymentStatus as PaymentStatus;
    history.push({ status: `Payment ${set.paymentStatus}`, at: now });
  }
  if (typeof patch.adminNote === "string") set.adminNote = patch.adminNote.slice(0, 1000);

  // Cancelling returns the pieces to stock and the redeem code use (once each).
  if (set.status === "Cancelled" && !order.stockReleased) {
    await releaseStock(order.items);
    set.stockReleased = true;
  }
  if (set.status === "Cancelled" && order.couponCode && !order.couponReleased) {
    const { coupons } = await collections();
    const coupon = await coupons.findOne({ code: order.couponCode }, { projection: { _id: 1 } });
    if (coupon) await releaseCouponUse(coupon._id, order.orderNumber);
    set.couponReleased = true;
  }

  const updated = await orders.findOneAndUpdate(
    { orderNumber },
    { $set: set, ...(history.length ? { $push: { statusHistory: { $each: history } } } : {}) },
    { returnDocument: "after" },
  );
  return updated ? toStored(updated) : null;
}

export async function readProof(order: StoredOrder): Promise<{ data: Buffer; type: string } | null> {
  const { proofs } = await collections();
  const doc = await proofs.findOne({ orderNumber: order.orderNumber });
  return doc ? { data: Buffer.from(doc.data.buffer), type: doc.contentType } : null;
}
