import "server-only";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import { REVIEW_LIMITS, type Review, type ReviewMedia } from "@/lib/reviews";
import { DEFAULT_CUSTOMER_NAME } from "@/lib/auth";
import { collections, type ReviewDoc, type UserDoc } from "./db";
import { IMAGE_TYPES, VIDEO_TYPES, findMedia, mediaIdFromUrl, mediaUrl, saveMedia, setMediaMeta, TooLargeError } from "./media";
import { rateLimit } from "./rateLimit";
import { getProduct } from "./catalog";

// Verified-purchase reviews: only a customer with a (non-cancelled) order containing the
// product can review it, once. Photos/videos are uploaded first as private drafts, then
// attached and made public when the review is submitted.

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = REVIEW_LIMITS.maxVideoMb * 1024 * 1024;

export type ReviewEligibility = "ok" | "not-purchased" | "reviewed";

async function purchaseOf(userId: ObjectId, slug: string) {
  const { orders } = await collections();
  return orders.findOne({ userId, "items.slug": slug, status: { $ne: "Cancelled" } }, { projection: { orderNumber: 1 }, sort: { placedAt: -1 } });
}

export async function reviewEligibility(user: UserDoc, slug: string): Promise<ReviewEligibility> {
  const { reviews } = await collections();
  if (await reviews.findOne({ userId: user._id, productSlug: slug }, { projection: { _id: 1 } })) return "reviewed";
  return (await purchaseOf(user._id, slug)) ? "ok" : "not-purchased";
}

type UploadResult = { ok: true; media: ReviewMedia } | { ok: false; error: string; status: number };

/** Stores one photo or video (raw request body) as a private draft for this customer. */
export async function uploadReviewMedia(user: UserDoc, body: ReadableStream<Uint8Array> | null, contentType: string): Promise<UploadResult> {
  const limit = rateLimit(`review-media:${user._id.toHexString()}`, 40, 60 * 60_000);
  if (!limit.ok) return { ok: false, error: "Too many uploads. Please try again later.", status: 429 };
  const isImage = (IMAGE_TYPES as readonly string[]).includes(contentType);
  const isVideo = (VIDEO_TYPES as readonly string[]).includes(contentType);
  if (!isImage && !isVideo) return { ok: false, error: "Please upload a JPG, PNG or WebP photo, or an MP4, MOV or WebM video.", status: 415 };
  if (!body) return { ok: false, error: "No file received.", status: 400 };

  try {
    const { id } = await saveMedia(body, {
      contentType,
      filename: `review.${contentType.split("/")[1]}`,
      metadata: { kind: "review-draft", userId: user._id.toHexString() },
      maxBytes: isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES,
    });
    return { ok: true, media: { type: isVideo ? "video" : "image", url: mediaUrl(id) } };
  } catch (err) {
    if (err instanceof TooLargeError) {
      return { ok: false, error: isVideo ? `Videos can be up to ${REVIEW_LIMITS.maxVideoMb} MB.` : "That photo is larger than 10 MB.", status: 413 };
    }
    throw err;
  }
}

type SubmitResult = { ok: true; review: Review } | { ok: false; error: string; status: number };

export async function submitReview(user: UserDoc, body: Record<string, unknown>): Promise<SubmitResult> {
  const slug = typeof body.productSlug === "string" ? body.productSlug : "";
  const product = slug ? await getProduct(slug) : undefined;
  if (!product) return { ok: false, error: "Product not found.", status: 404 };

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: "Please choose a star rating from 1 to 5.", status: 400 };
  const text = typeof body.text === "string" ? body.text.trim().replace(/\s+\n/g, "\n") : "";
  if (text.length < REVIEW_LIMITS.minText) return { ok: false, error: `Please write at least ${REVIEW_LIMITS.minText} characters.`, status: 400 };
  if (text.length > REVIEW_LIMITS.maxText) return { ok: false, error: `Please keep your review under ${REVIEW_LIMITS.maxText} characters.`, status: 400 };

  // Every attached file must be one of this customer's own draft uploads.
  const requested = Array.isArray(body.media) ? body.media : [];
  const mediaIds: ObjectId[] = [];
  const media: ReviewMedia[] = [];
  for (const item of requested.slice(0, REVIEW_LIMITS.maxImages + REVIEW_LIMITS.maxVideos)) {
    const id = mediaIdFromUrl((item as { url?: unknown })?.url);
    const file = id ? await findMedia(id) : null;
    const meta = file?.metadata as { kind?: string; userId?: string; contentType?: string } | undefined;
    if (!id || !meta || meta.kind !== "review-draft" || meta.userId !== user._id.toHexString()) {
      return { ok: false, error: "One of the attachments has expired. Please remove it and upload it again.", status: 400 };
    }
    media.push({ type: meta.contentType?.startsWith("video/") ? "video" : "image", url: mediaUrl(id) });
    mediaIds.push(id);
  }
  if (media.filter((m) => m.type === "image").length > REVIEW_LIMITS.maxImages) {
    return { ok: false, error: `You can add up to ${REVIEW_LIMITS.maxImages} photos.`, status: 400 };
  }
  if (media.filter((m) => m.type === "video").length > REVIEW_LIMITS.maxVideos) return { ok: false, error: "You can add one video.", status: 400 };

  const { reviews, avatars } = await collections();
  if (await reviews.findOne({ userId: user._id, productSlug: slug }, { projection: { _id: 1 } })) {
    return { ok: false, error: "You've already reviewed this product. Thank you!", status: 409 };
  }
  const order = await purchaseOf(user._id, slug);
  if (!order) return { ok: false, error: "Only customers who bought this product can review it.", status: 403 };

  // Snapshot the profile photo so it shows publicly with the review (profile photos are private).
  let avatarUrl: string | undefined;
  const avatar = await avatars.findOne({ _id: user._id });
  if (avatar) {
    const { id } = await saveMedia(Buffer.from(avatar.data.buffer), {
      contentType: avatar.contentType,
      filename: "reviewer.jpg",
      metadata: { kind: "review", userId: user._id.toHexString() },
      maxBytes: 2 * 1024 * 1024,
    });
    avatarUrl = mediaUrl(id);
  }

  const now = new Date();
  const doc: ReviewDoc = {
    _id: new ObjectId(),
    name: user.name === DEFAULT_CUSTOMER_NAME ? "FunkyKidz customer" : user.name,
    rating: rating as Review["rating"],
    quote: text,
    date: now.toISOString().slice(0, 10),
    productSlug: slug,
    media,
    ...(avatarUrl ? { avatarUrl } : {}),
    verified: true,
    status: "approved",
    createdAt: now,
    userId: user._id,
    orderNumber: order.orderNumber,
  };
  try {
    await reviews.insertOne(doc);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return { ok: false, error: "You've already reviewed this product. Thank you!", status: 409 };
    throw err;
  }
  await setMediaMeta(mediaIds, { kind: "review", userId: user._id.toHexString(), reviewId: doc._id!.toHexString() });
  revalidateTag("reviews", { expire: 0 });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, status, createdAt, userId, orderNumber, ...publicFields } = doc;
  return { ok: true, review: { ...publicFields, id: _id!.toHexString() } };
}
