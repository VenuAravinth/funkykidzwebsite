"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isSortOption, sizeToAgeBucket, sortSizes, type SortOption } from "@/lib/categories";
import {
  availableSizes,
  byNewest,
  byPopularity,
  getPriceBounds,
  isInStock,
  isNewArrival,
  type Product,
} from "@/lib/products";
import { searchProducts } from "@/lib/search";

export type PriceRange = { min: number; max: number };

// Every filter lives in the URL (?gender=Girls&size=5-6Y&sort=price-asc …) so nav links,
// search, sharing and the back button all land on the same filtered view.
export type Filters = {
  q: string;
  genders: string[];
  categories: string[];
  sizes: string[];
  ages: string[];
  colors: string[];
  price: PriceRange | null;
  inStock: boolean;
  onlyNew: boolean;
  sort: SortOption;
};

const LIST_KEYS = { genders: "gender", categories: "category", sizes: "size", ages: "age", colors: "color" } as const;
type ListKey = keyof typeof LIST_KEYS;

function parse(params: URLSearchParams): Filters {
  const list = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const min = Number(params.get("min"));
  const max = Number(params.get("max"));
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    genders: list("gender"),
    categories: list("category"),
    sizes: list("size"),
    ages: list("age"),
    colors: list("color"),
    price: params.has("min") || params.has("max") ? { min: min || 0, max: max || Infinity } : null,
    inStock: params.get("instock") === "1",
    onlyNew: params.get("new") === "1",
    sort: isSortOption(sort) ? sort : "recommended",
  };
}

function serialize(f: Filters): string {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  for (const key of Object.keys(LIST_KEYS) as ListKey[]) {
    if (f[key].length) params.set(LIST_KEYS[key], f[key].join(","));
  }
  if (f.price) {
    params.set("min", String(f.price.min));
    if (Number.isFinite(f.price.max)) params.set("max", String(f.price.max));
  }
  if (f.inStock) params.set("instock", "1");
  if (f.onlyNew) params.set("new", "1");
  if (f.sort !== "recommended") params.set("sort", f.sort);
  return params.toString();
}

function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case "newest":
      return sorted.sort(byNewest);
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "popularity":
      return sorted.sort(byPopularity);
    default:
      // In-stock first, then the catalogue's own order.
      return sorted.sort((a, b) => Number(isInStock(b)) - Number(isInStock(a)));
  }
}

export function applyFilters(products: Product[], f: Filters): Product[] {
  let out = f.q ? searchProducts(products, f.q) : products;
  if (f.genders.length) out = out.filter((p) => f.genders.includes(p.gender) || p.gender === "Unisex");
  if (f.categories.length) out = out.filter((p) => f.categories.includes(p.category));
  if (f.price) {
    const { min, max } = f.price;
    out = out.filter((p) => p.price >= min && p.price <= max);
  }
  if (f.colors.length) out = out.filter((p) => p.colorways.some((c) => f.colors.includes(c.name)));
  // Size and age only count sizes that are actually available when "in stock" is on.
  const sizesOf = (p: Product) => (f.inStock ? availableSizes(p) : p.sizes);
  if (f.sizes.length) out = out.filter((p) => sizesOf(p).some((s) => f.sizes.includes(s)));
  if (f.ages.length)
    out = out.filter((p) => sizesOf(p).some((s) => f.ages.includes(sizeToAgeBucket(s) ?? "")));
  if (f.inStock) out = out.filter(isInStock);
  if (f.onlyNew) out = out.filter((p) => isNewArrival(p));
  return sortProducts(out, f.sort);
}

export function useProductFilters(allProducts: Product[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parse(new URLSearchParams(searchParams.toString())), [searchParams]);

  const priceBounds = useMemo(() => getPriceBounds(allProducts), [allProducts]);
  // Category and size chips list only what the published catalogue actually has.
  const categoryOptions = useMemo(
    () => [...new Set(allProducts.map((p) => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [allProducts]
  );
  const sizeOptions = useMemo(() => sortSizes(allProducts.flatMap((p) => p.sizes)), [allProducts]);
  const colorOptions = useMemo(
    () => [...new Set(allProducts.flatMap((p) => p.colorways.map((c) => c.name)))].sort(),
    [allProducts]
  );
  const colorHex = useMemo(
    () => Object.fromEntries(allProducts.flatMap((p) => p.colorways.map((c) => [c.name, c.swatchHex]))),
    [allProducts]
  );

  const results = useMemo(() => applyFilters(allProducts, filters), [allProducts, filters]);

  const update = useCallback(
    (patch: Partial<Filters>) => {
      const qs = serialize({ ...filters, ...patch });
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  const toggle = useCallback(
    (key: ListKey, value: string) => {
      const current = filters[key];
      update({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
    },
    [filters, update]
  );

  const clearAll = useCallback(() => update({ ...parse(new URLSearchParams()), sort: filters.sort }), [filters.sort, update]);

  return { filters, results, priceBounds, categoryOptions, sizeOptions, colorOptions, colorHex, update, toggle, clearAll };
}

export type ProductFilters = ReturnType<typeof useProductFilters>;
