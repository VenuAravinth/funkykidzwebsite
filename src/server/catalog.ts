import "server-only";
import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import type { Product } from "@/lib/products";
import type { Review, ReviewStats } from "@/lib/reviews";
import { collections, plain, type ReviewDoc } from "./db";

// Catalogue reads. Products, categories and brands are managed — and served — only by the
// FunkyKidz ERP Backend; the shop loads published products from its public API
// (GET <ERP_API_URL>/api/v1/public/products). Cached across requests for a minute (tag "products")
// and de-duplicated within a request; the ERP calls /api/revalidate so changes show immediately.
// Product image URLs in the response point at the ERP Backend, which signs them (≤ 20 min) per request.

function erpApiUrl(): string {
  const url = process.env.ERP_API_URL?.trim();
  if (!url) throw new Error("ERP_API_URL is not set. Add it to .env.local (e.g. http://localhost:4000).");
  return url.replace(/\/+$/, "");
}

// The ERP builds image URLs from its own PUBLIC_BASE_URL, which may be unset or point at
// localhost. Re-root them on ERP_API_URL so they always match next.config's remotePatterns.
const IMAGE_PATH = "/api/v1/public/product-images/";
const rootImage = (url: string) => {
  const i = url.indexOf(IMAGE_PATH);
  return i === -1 ? url : `${erpApiUrl()}${url.slice(i)}`;
};
const withErpImageHost = (p: Product): Product => ({
  ...p,
  images: p.images?.map(rootImage),
  colorways: p.colorways.map((c) => (c.images ? { ...c, images: c.images.map(rootImage) } : c)),
});

const loadProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const res = await fetch(`${erpApiUrl()}/api/v1/public/products`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    // Throwing (instead of returning an empty list) keeps the last good catalogue on screen.
    if (!res.ok) throw new Error(`ERP Backend returned ${res.status} for the product catalogue.`);
    const { products } = (await res.json()) as { products: Product[] };
    return products.map(withErpImageHost);
  },
  ["catalog-products"],
  { tags: ["products"], revalidate: 60 },
);

export const getProducts = cache(() => loadProducts());

/** An active category as the ERP's public API returns it, in the admin's sort order. */
export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  // The picture uploaded in ERP Admin → Categories (served like product photos), or null.
  image: string | null;
  // Published products in it.
  productCount: number;
};

// Same tag as products, so the ERP's revalidate call refreshes both.
const loadCategories = unstable_cache(
  async (): Promise<ShopCategory[]> => {
    const res = await fetch(`${erpApiUrl()}/api/v1/public/categories`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`ERP Backend returned ${res.status} for the categories.`);
    const { categories } = (await res.json()) as { categories: ShopCategory[] };
    return categories.map((c) => ({ ...c, image: c.image ? rootImage(c.image) : null }));
  },
  ["catalog-categories"],
  { tags: ["products"], revalidate: 60 },
);

export const getCategories = cache(() => loadCategories());

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

const loadReviews = unstable_cache(
  async (): Promise<Review[]> => {
    const { reviews } = await collections();
    const docs = await reviews.find({ status: "approved" }).sort({ createdAt: -1, date: -1 }).limit(2000).toArray();
    return docs.map(toPublicReview);
  },
  ["catalog-reviews"],
  { tags: ["reviews"], revalidate: 300 },
);

export const getReviews = cache(() => loadReviews());

/** A review as the storefront sees it: who wrote it and which order it came from stay here. */
export function toPublicReview(d: ReviewDoc): Review {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status, createdAt, userId, orderNumber, ...r } = plain(d);
  return { ...r, id: d._id?.toHexString() };
}

/** One page of a product's approved reviews, newest first. */
export async function getReviewPage(slug: string, offset: number, limit: number): Promise<Review[]> {
  const { reviews } = await collections();
  const docs = await reviews
    .find({ status: "approved", productSlug: slug })
    .sort({ date: -1, _id: -1 })
    .skip(Math.max(0, offset))
    .limit(Math.min(Math.max(1, limit), 50))
    .toArray();
  return docs.map(toPublicReview);
}

/**
 * Average, total and star breakdown over all of a product's approved reviews. Not cached, so it
 * always agrees with the paged list (one indexed aggregate per product page).
 */
export async function getReviewStats(slug: string): Promise<ReviewStats> {
  const { reviews } = await collections();
  const rows = await reviews
    .aggregate<{ _id: number; count: number }>([
      { $match: { status: "approved", productSlug: slug } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ])
    .toArray();
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: rows.find((r) => r._id === stars)?.count ?? 0 }));
  const count = breakdown.reduce((s, b) => s + b.count, 0);
  const average = count ? breakdown.reduce((s, b) => s + b.stars * b.count, 0) / count : 0;
  return { average, count, breakdown };
}


type StockLine = { slug: string; colorwayName: string; size: string; quantity: number };

const stockField = (line: StockLine) => `stock.${line.colorwayName}.${line.size}`;

// Same rule as the ERP Backend: something is sellable while any Color + Size is untracked (null)
// or has units left.
const STOCK_VALUES = {
  $reduce: {
    input: { $objectToArray: { $ifNull: ["$stock", {}] } },
    initialValue: [],
    in: { $concatArrays: ["$$value", { $map: { input: { $objectToArray: "$$this.v" }, as: "s", in: "$$s.v" } }] },
  },
};
const IN_STOCK = { $or: [{ $in: [null, STOCK_VALUES] }, { $gt: [{ $sum: STOCK_VALUES }, 0] }] };

/** Takes a product off the shop once its last piece is sold; the admin re-publishes it after restocking. */
async function unpublishIfSoldOut(slugs: string[]) {
  const { products } = await collections();
  await products.updateMany({ slug: { $in: slugs }, published: true, $expr: { $not: [IN_STOCK] } }, [
    { $set: { published: false, active: false, updatedAt: "$$NOW", rev: { $add: [{ $ifNull: ["$rev", 0] }, 1] } } },
  ]);
}

/**
 * Takes stock for an order. A Color + Size with a tracked count must have enough units;
 * untracked ones (null) always pass. Each decrement is a single conditional update, so two
 * shoppers can't both buy the last unit. If any line fails, earlier lines are put back.
 */
export async function reserveStock(
  lines: StockLine[],
): Promise<{ ok: true } | { ok: false; slug: string; colorwayName: string; size: string }> {
  const { products } = await collections();
  const done: StockLine[] = [];
  for (const line of lines) {
    const field = stockField(line);
    const tracked = await products.countDocuments({ slug: line.slug, [field]: { $type: "number" } });
    if (tracked) {
      const res = await products.updateOne(
        { slug: line.slug, [field]: { $gte: line.quantity } },
        { $inc: { [field]: -line.quantity, popularity: line.quantity }, $set: { updatedAt: new Date() } },
      );
      if (res.modifiedCount === 0) {
        await releaseStock(done);
        return { ok: false, slug: line.slug, colorwayName: line.colorwayName, size: line.size };
      }
    } else {
      await products.updateOne({ slug: line.slug }, { $inc: { popularity: line.quantity } });
    }
    done.push(line);
  }
  await unpublishIfSoldOut([...new Set(lines.map((l) => l.slug))]);
  revalidateTag("products", { expire: 0 });
  return { ok: true };
}

export async function releaseStock(lines: StockLine[]) {
  const { products } = await collections();
  for (const line of lines) {
    const field = stockField(line);
    await products.updateOne({ slug: line.slug, [field]: { $type: "number" } }, { $inc: { [field]: line.quantity } });
  }
  if (lines.length) revalidateTag("products", { expire: 0 });
}
