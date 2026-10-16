// Product types and pure helpers. The catalogue itself lives in MongoDB (see
// src/server/catalog.ts); server code loads it and client code gets it from ProductsProvider.
import { sizeToAgeBucket, type Gender } from "./categories";

export type Figure = "girl" | "boy";

export type Colorway = {
  name: string;
  swatchHex: string;
  outfit: string;
  outfitDark?: string;
  accent?: string;
  bg: string;
  // Photo URLs for this colour, front first. When there are none, cards show a neutral
  // "photo coming soon" tile in the same 4:5 frame.
  images?: string[];
};

export type Product = {
  slug: string;
  name: string;
  // Selling price in ₹.
  price: number;
  // Only set when the item was genuinely sold at this price before the markdown.
  oldPrice?: number;
  tag?: "Bestseller" | "New";
  gender: Gender;
  // Category name as managed in ERP Admin → Categories.
  category: string;
  variant: Figure;
  // Every size the product comes in, across all colours.
  sizes: string[];
  // Units per Color + Size: { Rose: { "2-3Y": 4 } }. A combination that isn't listed doesn't
  // exist; null means it isn't stock-tracked (sold as available, no count shown).
  stock?: Partial<Record<string, Partial<Record<string, number | null>>>>;
  // One entry per colour (names match the keys of `stock`). The chosen colour's name is stored
  // on cart lines and orders; `colorways[0]` is the default shown on cards.
  colorways: Colorway[];
  // Product photos, main photo first, uploaded from ERP Admin → Products (served by the ERP
  // Backend's /api/v1/public/product-images/<file>, which redirects to a signed Cloudflare R2 URL).
  images?: string[];
  shortDescription: string;
  description: string;
  fabric: string;
  fit: string;
  care: string;
  // Units sold (or any ranking you trust). Used only for "Popularity" sorting, never shown.
  popularity: number;
  dateAdded: string;
};


export function getPriceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  let min = products[0].price;
  let max = products[0].price;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min: Math.floor(min), max: Math.ceil(max) };
}

// ---------------------------------------------------------------------
// Pricing, stock and listing helpers
// ---------------------------------------------------------------------

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

export const LOW_STOCK_THRESHOLD = 3;

export type StockState = { status: "in" | "low" | "out"; units?: number };

/** Sizes offered in one colour, in the product's size order. */
export function sizesFor(product: Product, color: string): string[] {
  const sizes = product.stock?.[color];
  return sizes ? product.sizes.filter((s) => s in sizes) : product.sizes;
}

export const hasVariant = (product: Product, color: string, size: string) =>
  product.colorways.some((c) => c.name === color) && sizesFor(product, color).includes(size);

export function sizeStock(product: Product, color: string, size: string): StockState {
  const sizes = product.stock?.[color];
  if (!sizes) return { status: "in" };
  if (!(size in sizes)) return { status: "out", units: 0 };
  const units = sizes[size];
  if (units === null || units === undefined) return { status: "in" };
  if (units <= 0) return { status: "out", units: 0 };
  return { status: units <= LOW_STOCK_THRESHOLD ? "low" : "in", units };
}

/** Sizes with stock in `color`, or in any colour when no colour is given. */
export function availableSizes(product: Product, color?: string): string[] {
  const colors = color ? [color] : product.colorways.map((c) => c.name);
  return product.sizes.filter((s) => colors.some((c) => sizesFor(product, c).includes(s) && sizeStock(product, c, s).status !== "out"));
}

/** Stock across one colour, or the whole product. */
export function productStock(product: Product, color?: string): StockState {
  const colors = color ? [color] : product.colorways.map((c) => c.name);
  const states = colors.flatMap((c) => sizesFor(product, c).map((s) => sizeStock(product, c, s)));
  if (!states.some((s) => s.status !== "out")) return { status: "out", units: 0 };
  if (states.some((s) => s.units === undefined)) return { status: "in" };
  const total = states.reduce((sum, s) => sum + (s.units ?? 0), 0);
  return { status: total <= LOW_STOCK_THRESHOLD ? "low" : "in", units: total };
}

export const isInStock = (product: Product) => productStock(product).status !== "out";

// "1-2Y – 14-15Y" style summary for cards.
export function sizeRangeLabel(product: Product): string {
  const sizes = availableSizes(product);
  if (sizes.length === 0) return "Sold out";
  if (sizes.length === 1) return sizes[0];
  return `${sizes[0]} – ${sizes[sizes.length - 1]}`;
}

export const byNewest = (a: Product, b: Product) => b.dateAdded.localeCompare(a.dateAdded);
export const byPopularity = (a: Product, b: Product) => b.popularity - a.popularity;

export const bestSellers = (products: Product[]) => products.filter(isInStock).sort(byPopularity);
export const newArrivals = (products: Product[]) => products.filter(isInStock).sort(byNewest);

// Products added in the last 90 days count as "new" for the New Arrivals filter.
const NEW_WINDOW_DAYS = 90;
export function isNewArrival(product: Product, now = new Date()): boolean {
  return now.getTime() - new Date(product.dateAdded).getTime() <= NEW_WINDOW_DAYS * 86_400_000 || product.tag === "New";
}

/** All photos for the product, main photo first (older data kept them on the colourway). */
export function productPhotos(product: Product): string[] {
  if (product.images?.length) return product.images;
  return product.colorways[0]?.images ?? [];
}

export function productImage(product: Product): string | undefined {
  return productPhotos(product)[0];
}

const ageBuckets = (p: Product) => new Set(p.sizes.map((s) => sizeToAgeBucket(s)).filter(Boolean));

/**
 * "You may also like": other in-stock products ranked by how closely they match — same
 * category, same girls/boys line, overlapping age range, then similar price.
 */
export function relatedProducts(product: Product, all: Product[], limit = 8): Product[] {
  const ages = ageBuckets(product);
  const genderFits = (g: Gender) => g === product.gender || g === "Unisex" || product.gender === "Unisex";
  return all
    .filter((p) => p.slug !== product.slug && isInStock(p))
    .map((p) => {
      const sharedAges = [...ageBuckets(p)].filter((a) => ages.has(a)).length;
      const priceGap = Math.abs(p.price - product.price) / Math.max(product.price, 1);
      const score =
        (p.category === product.category ? 4 : 0) +
        (genderFits(p.gender) ? 3 : 0) +
        (sharedAges > 0 ? 2 + Math.min(sharedAges, 3) * 0.25 : 0) +
        Math.max(0, 1 - priceGap);
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || b.p.popularity - a.p.popularity)
    .slice(0, limit)
    .map(({ p }) => p);
}
