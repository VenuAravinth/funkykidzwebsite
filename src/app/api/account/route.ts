import type { NextRequest } from "next/server";
import { guardMutation, requireUser, toPublicUser, validateName } from "@/server/customerAuth";
import { collections } from "@/server/db";
import { json } from "@/server/adminAuth";
import { readBody } from "@/server/http";

// Change the customer's display name. The mobile number is their login, so it isn't editable here.
export async function PATCH(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const result = validateName((await readBody(req)).name);
  if ("error" in result) return json({ error: result.error }, 400);

  const { users } = await collections();
  const updated = await users.findOneAndUpdate({ _id: auth.user._id }, { $set: { name: result.name } }, { returnDocument: "after" });
  return json({ user: updated ? toPublicUser(updated) : null });
}
