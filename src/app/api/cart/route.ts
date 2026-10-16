import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { collections, type CartItemDoc } from "@/server/db";
import { getProduct } from "@/server/catalog";
import { hasVariant } from "@/lib/products";
import { json } from "@/server/adminAuth";
import { readBody, str } from "@/server/http";

// The signed-in customer's cart. Every response returns the full, up-to-date item list.

const lineIdFor = (slug: string, colorwayName: string, size: string) => `${slug}__${colorwayName}__${size}`;

async function items(userId: ObjectId): Promise<CartItemDoc[]> {
  const { carts } = await collections();
  return (await carts.findOne({ userId }))?.items ?? [];
}

async function save(userId: ObjectId, next: CartItemDoc[]) {
  const { carts } = await collections();
  await carts.updateOne(
    { userId },
    { $set: { items: next, updatedAt: new Date() }, $setOnInsert: { _id: new ObjectId(), userId } },
    { upsert: true },
  );
  return json({ items: next });
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  return json({ items: await items(auth.user._id) });
}

/** Add a product (or increase its quantity). */
export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await readBody(req);

  const product = await getProduct(str(body.slug, 120));
  const size = str(body.size, 20);
  const colorwayName = str(body.colorwayName, 40);
  const quantity = body.quantity === undefined ? 1 : Number(body.quantity);
  if (!product) return json({ error: "This product is no longer available." }, 404);
  if (!hasVariant(product, colorwayName, size)) {
    return json({ error: "Please choose a valid size and colour." }, 400);
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return json({ error: "Invalid quantity." }, 400);

  const lineId = lineIdFor(product.slug, colorwayName, size);
  const current = await items(auth.user._id);
  const existing = current.find((l) => l.lineId === lineId);
  const next = existing
    ? current.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.min(20, l.quantity + quantity) } : l))
    : [...current, { lineId, slug: product.slug, colorwayName, size, quantity }].slice(-50);
  return save(auth.user._id, next);
}

/** Set a line's quantity (0 removes it). */
export async function PATCH(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await readBody(req);
  const lineId = str(body.lineId, 200);
  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) return json({ error: "Invalid quantity." }, 400);
  const current = await items(auth.user._id);
  const next = quantity === 0 ? current.filter((l) => l.lineId !== lineId) : current.map((l) => (l.lineId === lineId ? { ...l, quantity } : l));
  return save(auth.user._id, next);
}

/** Remove one line (?lineId=…) or empty the cart. */
export async function DELETE(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const lineId = req.nextUrl.searchParams.get("lineId");
  const next = lineId ? (await items(auth.user._id)).filter((l) => l.lineId !== lineId) : [];
  return save(auth.user._id, next);
}
