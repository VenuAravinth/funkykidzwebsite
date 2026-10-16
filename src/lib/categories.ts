export type Gender = "Girls" | "Boys" | "Unisex";

export const GENDERS: Exclude<Gender, "Unisex">[] = ["Girls", "Boys"];

// ---------------------------------------------------------------------
// Sizes (0–15 years)
// ---------------------------------------------------------------------

export const KIDS_SIZES = [
  "0-3M",
  "3-6M",
  "6-9M",
  "9-12M",
  "1-2Y",
  "2-3Y",
  "3-4Y",
  "4-5Y",
  "5-6Y",
  "6-7Y",
  "7-8Y",
  "8-10Y",
  "10-12Y",
  "12-13Y",
  "13-14Y",
  "14-15Y",
];

export const ONE_SIZE = "One Size";

const SIZE_ORDER = [...KIDS_SIZES, ONE_SIZE];

/** Sizes in chart order (babies first); sizes the chart doesn't know go last, A–Z. */
export function sortSizes(sizes: Iterable<string>): string[] {
  const rank = (s: string) => (SIZE_ORDER.includes(s) ? SIZE_ORDER.indexOf(s) : SIZE_ORDER.length);
  return [...new Set(sizes)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export const AGE_RANGE_LABEL = "0–15 years";

// ---------------------------------------------------------------------
// Age filter (independent from size, so parents can shop by age)
// ---------------------------------------------------------------------

export const KIDS_AGE_BUCKETS = [
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5-7 Years",
  "7-10 Years",
  "10-12 Years",
  "12-15 Years",
];

const AGE_BUCKET_BY_SIZE: Record<string, string> = {
  "0-3M": "0-1 Years",
  "3-6M": "0-1 Years",
  "6-9M": "0-1 Years",
  "9-12M": "0-1 Years",
  "1-2Y": "1-3 Years",
  "2-3Y": "1-3 Years",
  "3-4Y": "3-5 Years",
  "4-5Y": "3-5 Years",
  "5-6Y": "5-7 Years",
  "6-7Y": "5-7 Years",
  "7-8Y": "7-10 Years",
  "8-10Y": "7-10 Years",
  "10-12Y": "10-12 Years",
  "12-13Y": "12-15 Years",
  "13-14Y": "12-15 Years",
  "14-15Y": "12-15 Years",
};

export function sizeToAgeBucket(size: string): string | undefined {
  return AGE_BUCKET_BY_SIZE[size];
}

// ---------------------------------------------------------------------
// Price
// ---------------------------------------------------------------------

export type PriceQuickRange = {
  label: string;
  min: number;
  max: number;
};

export const PRICE_QUICK_RANGES: PriceQuickRange[] = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹1,500", min: 1000, max: 1500 },
  { label: "₹1,500 – ₹2,000", min: 1500, max: 2000 },
  { label: "Above ₹2,000", min: 2000, max: Infinity },
];

// ---------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------

export type SortOption = "recommended" | "newest" | "price-asc" | "price-desc" | "popularity";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Popularity" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.some((o) => o.value === value);
}
