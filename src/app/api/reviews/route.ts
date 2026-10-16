import type { NextRequest } from "next/server";
import { getReviewPage, getReviews, getReviewStats } from "@/server/catalog";
import { REVIEW_PAGE_SIZE } from "@/lib/reviews";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { submitReview } from "@/server/reviews";
import { json } from "@/server/adminAuth";
import { readBody } from "@/server/http";

// Approved reviews. With ?product=slug they come a page at a time (&offset=0&limit=10, newest
// first) together with the total, so the product page never loads every review at once.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const slug = params.get("product");
  if (!slug) return json({ reviews: await getReviews() });
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || REVIEW_PAGE_SIZE));
  const [reviews, stats] = await Promise.all([getReviewPage(slug, offset, limit), getReviewStats(slug)]);
  return json({ reviews, total: stats.count, hasMore: offset + reviews.length < stats.count });
}

// Submit a verified-purchase review: { productSlug, rating, text, media: [{ url }] }.
export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const result = await submitReview(auth.user, await readBody(req));
  return result.ok ? json({ review: result.review }, 201) : json({ error: result.error }, result.status);
}
