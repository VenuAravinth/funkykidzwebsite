import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { collections } from "@/server/db";
import { listAddresses, toAddress, validateAddress } from "@/server/addresses";
import { json } from "@/server/adminAuth";
import { readBody } from "@/server/http";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  return json({ addresses: await listAddresses(auth.user._id) });
}

export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const result = validateAddress(await readBody(req));
  if ("error" in result) return json({ error: result.error }, 400);

  const { addresses } = await collections();
  const count = await addresses.countDocuments({ userId: auth.user._id });
  if (count >= 50) return json({ error: "You can save up to 50 addresses." }, 400);
  const doc = { _id: new ObjectId(), userId: auth.user._id, ...result.fields, isDefault: count === 0, createdAt: new Date() };
  await addresses.insertOne(doc);
  return json({ address: toAddress(doc) }, 201);
}
