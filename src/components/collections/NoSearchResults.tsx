"use client";

import { useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import type { Product } from "@/lib/products";
import { relatedProducts } from "@/lib/search";
import ProductGrid from "./ProductGrid";
import type { GridLayout } from "./gridLayout";

// Shown when a search returns nothing: a clear message, then products related to the keyword
// (partial or near-miss matches, topped up with best sellers).
export default function NoSearchResults({
  query,
  products,
  layout,
  hasOtherFilters,
  onClearSearch,
  onClearFilters,
}: {
  query: string;
  products: Product[];
  layout: GridLayout;
  hasOtherFilters: boolean;
  onClearSearch: () => void;
  onClearFilters: () => void;
}) {
  const suggestions = useMemo(() => relatedProducts(products, query, 8), [products, query]);

  return (
    <div>
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-plum/15 bg-white px-6 py-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-light/60 text-2xl text-rose-dark">
          <FiSearch />
        </span>
        <h2 className="mt-4 font-serif-display text-2xl font-bold text-plum">No products found</h2>
        <p className="mt-2 text-sm text-ink/60">
          We couldn&apos;t find anything for <span className="font-semibold text-plum">“{query}”</span>
          {hasOtherFilters ? " with the filters you've chosen." : "."} Try a different word, check the spelling, or
          browse the suggestions below.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {hasOtherFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-white"
            >
              Search without filters
            </button>
          )}
          <button
            type="button"
            onClick={onClearSearch}
            className="rounded-full border border-plum/20 px-5 py-2.5 text-sm font-semibold text-plum hover:border-plum"
          >
            View all products
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-10">
          <h3 id="related-heading" className="mb-4 font-serif-display text-xl font-bold text-plum md:text-2xl">
            You might like these
          </h3>
          <ProductGrid products={suggestions} layout={layout} />
        </section>
      )}
    </div>
  );
}
