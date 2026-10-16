import type { NextRequest } from "next/server";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { collections } from "@/server/db";
import { parseId, toAddress, validateAddress } from "@/server/addresses";
import { json } from "@/server/adminAuth";
import { readBody } from "@/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const _id = parseId((await params).id);
  const result = validateAddress(await readBody(req));
  if ("error" in result) return json({ error: result.error }, 400);
  const { addresses } = await collections();
  const doc = _id && (await addresses.findOneAndUpdate({ _id, userId: auth.user._id }, { $set: result.fields }, { returnDocument: "after" }));
  return doc ? json({ address: toAddress(doc) }) : json({ error: "Address not found." }, 404);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const _id = parseId((await params).id);
  const { addresses } = await collections();
  const removed = _id && (await addresses.findOneAndDelete({ _id, userId: auth.user._id }));
  if (!removed) return json({ error: "Address not found." }, 404);
  // Keep one default if the default was removed.
  if (removed.isDefault) {
    const next = await addresses.findOne({ userId: auth.user._id }, { sort: { createdAt: 1 } });
    if (next) await addresses.updateOne({ _id: next._id }, { $set: { isDefault: true } });
  }
  return json({ ok: true });
}
