// Review shape and helpers. Reviews are stored in the MongoDB `reviews` collection; only
// documents with status "approved" are shown. Customer reviews can only be written by someone
// who bought the product (see src/server/reviews.ts), and are published straight away.
export type ReviewMedia = { type: "image" | "video"; url: string };

export type Review = {
  id?: string;
  name: string; // as shown, e.g. "Priya S."
  city?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  date: string; // YYYY-MM-DD
  productSlug?: string;
  photo?: string; // older single-photo reviews
  media?: ReviewMedia[];
  avatarUrl?: string; // reviewer's profile photo at the time of writing
  verified?: boolean; // written by a customer with an order for this product
};

/** Rating summary across all of a product's reviews (computed on the server). */
export type ReviewStats = { average: number; count: number; breakdown: { stars: number; count: number }[] };

/** Reviews are fetched in pages of this size. */
export const REVIEW_PAGE_SIZE = 10;

export const REVIEW_LIMITS = { minText: 10, maxText: 2000, maxImages: 6, maxVideos: 1, maxVideoMb: 50 } as const;

export function ratingSummary(reviews: Review[]): { average: number; count: number } | null {
  if (reviews.length === 0) return null;
  return { average: reviews.reduce((s, r) => s + r.rating, 0) / reviews.length, count: reviews.length };
}

/** How many reviews gave each star rating, 5 down to 1. */
export function ratingBreakdown(reviews: Review[]): { stars: number; count: number }[] {
  return [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((r) => r.rating === stars).length }));
}

/** Every photo/video on a review, including the older single `photo` field. */
export function reviewMedia(review: Review): ReviewMedia[] {
  return [...(review.photo ? [{ type: "image" as const, url: review.photo }] : []), ...(review.media ?? [])];
}
