import "server-only";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "./db";

// Uploaded photos and videos (product photos, review photos/videos) live in MongoDB GridFS,
// bucket "media". Files are served by /api/media/<id>; `metadata.kind` decides who may see them.

export type MediaKind = "product" | "review" | "review-draft";
export type MediaMeta = { kind: MediaKind; userId?: string; reviewId?: string; productSlug?: string };

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const mediaUrl = (id: ObjectId | string) => `/api/media/${typeof id === "string" ? id : id.toHexString()}`;

/** Media id from one of our own /api/media/<id> URLs, or null for anything else. */
export function mediaIdFromUrl(url: unknown): ObjectId | null {
  const m = typeof url === "string" ? /^\/api\/media\/([0-9a-f]{24})$/.exec(url) : null;
  return m ? new ObjectId(m[1]) : null;
}

export async function mediaBucket() {
  return new GridFSBucket(await getDb(), { bucketName: "media" });
}

export class TooLargeError extends Error {}

/**
 * Streams `body` into GridFS, aborting once it passes `maxBytes` (the partial file is removed).
 * Returns the new file id and its size.
 */
export async function saveMedia(
  body: ReadableStream<Uint8Array> | Buffer,
  { contentType, filename, metadata, maxBytes }: { contentType: string; filename: string; metadata: MediaMeta; maxBytes: number },
): Promise<{ id: ObjectId; size: number }> {
  const bucket = await mediaBucket();
  const id = new ObjectId();
  const upload = bucket.openUploadStreamWithId(id, filename.slice(0, 120), { metadata: { ...metadata, contentType } });
  let size = 0;
  const source = Buffer.isBuffer(body) ? Readable.from([body]) : Readable.fromWeb(body as import("node:stream/web").ReadableStream<Uint8Array>);
  source.on("data", (chunk: Buffer) => {
    size += chunk.length;
    if (size > maxBytes) source.destroy(new TooLargeError("File too large"));
  });
  try {
    await pipeline(source, upload);
  } catch (err) {
    await bucket.delete(id).catch(() => {});
    throw err;
  }
  if (size === 0) {
    await bucket.delete(id).catch(() => {});
    throw new Error("Empty file");
  }
  return { id, size };
}

export async function findMedia(id: ObjectId) {
  const bucket = await mediaBucket();
  const [file] = await bucket.find({ _id: id }).limit(1).toArray();
  return file ?? null;
}

export async function deleteMedia(ids: ObjectId[]) {
  const bucket = await mediaBucket();
  await Promise.all(ids.map((id) => bucket.delete(id).catch(() => {})));
}

/** Re-tags files, e.g. draft review uploads once the review is published. Keeps other metadata. */
export async function setMediaMeta(ids: ObjectId[], metadata: MediaMeta) {
  if (ids.length === 0) return;
  const db = await getDb();
  // Field by field, so the stored contentType survives.
  const fields = Object.fromEntries(Object.entries(metadata).map(([k, v]) => [`metadata.${k}`, v]));
  await db.collection("media.files").updateMany({ _id: { $in: ids } }, { $set: fields });
}
