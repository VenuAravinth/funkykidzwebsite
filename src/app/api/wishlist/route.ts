import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { collections } from "@/server/db";
import { getProduct } from "@/server/catalog";
import { json } from "@/server/adminAuth";
import { readBody, str } from "@/server/http";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { wishlists } = await collections();
  return json({ slugs: (await wishlists.findOne({ userId: auth.user._id }))?.slugs ?? [] });
}

/** Toggle a product in the wishlist; returns the updated list. */
export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const slug = str((await readBody(req)).slug, 120);
  if (!(await getProduct(slug))) return json({ error: "This product is no longer available." }, 404);

  const { wishlists } = await collections();
  const userId = auth.user._id;
  const has = await wishlists.countDocuments({ userId, slugs: slug });
  const doc = await wishlists.findOneAndUpdate(
    { userId },
    { ...(has ? { $pull: { slugs: slug } } : { $addToSet: { slugs: slug } }), $set: { updatedAt: new Date() }, $setOnInsert: { _id: new ObjectId() } },
    { upsert: true, returnDocument: "after" },
  );
  return json({ slugs: doc?.slugs ?? [] });
}
