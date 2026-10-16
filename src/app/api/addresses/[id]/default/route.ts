import type { NextRequest } from "next/server";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { collections } from "@/server/db";
import { parseId } from "@/server/addresses";
import { json } from "@/server/adminAuth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const _id = parseId((await params).id);
  const { addresses } = await collections();
  if (!_id || !(await addresses.countDocuments({ _id, userId: auth.user._id }))) return json({ error: "Address not found." }, 404);
  await addresses.updateMany({ userId: auth.user._id }, { $set: { isDefault: false } });
  await addresses.updateOne({ _id }, { $set: { isDefault: true } });
  return json({ ok: true });
}
