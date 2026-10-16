import type { NextRequest } from "next/server";
import { Binary } from "mongodb";
import { guardMutation, requireUser, toPublicUser } from "@/server/customerAuth";
import { collections } from "@/server/db";
import { json } from "@/server/adminAuth";
import { readBody, str } from "@/server/http";

// Profile photo, stored in MongoDB and only ever served to its owner.
// The browser shrinks the photo to a small square before uploading, so 1 MB is plenty.
const MAX_BYTES = 1024 * 1024;

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { avatars } = await collections();
  const doc = await avatars.findOne({ _id: auth.user._id });
  if (!doc) return new Response(null, { status: 404 });
  return new Response(Buffer.from(doc.data.buffer), {
    headers: {
      "Content-Type": doc.contentType,
      // URLs carry ?v=<version>, so a cached copy is never stale.
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function PUT(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await readBody(req, MAX_BYTES * 2);
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(str(body.dataUrl, MAX_BYTES * 2));
  if (!match) return json({ error: "Please choose a JPG, PNG or WebP image." }, 400);
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_BYTES) return json({ error: "That image is too large. Please choose a smaller one." }, 400);

  const { avatars, users } = await collections();
  await avatars.replaceOne(
    { _id: auth.user._id },
    { contentType: match[1], data: new Binary(bytes), updatedAt: new Date() },
    { upsert: true }
  );
  const updated = await users.findOneAndUpdate({ _id: auth.user._id }, { $set: { avatarVersion: Date.now() } }, { returnDocument: "after" });
  return json({ user: updated ? toPublicUser(updated) : null });
}

export async function DELETE(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { avatars, users } = await collections();
  await avatars.deleteOne({ _id: auth.user._id });
  const updated = await users.findOneAndUpdate({ _id: auth.user._id }, { $unset: { avatarVersion: "" } }, { returnDocument: "after" });
  return json({ user: updated ? toPublicUser(updated) : null });
}
