"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import ProductGrid from "./ProductGrid";
import { BATCH_SIZE, type GridLayout } from "./gridLayout";

// Shows products 30 at a time and adds the next 30 as the shopper nears the end of the list,
// so long listings stay quick to render and only the visible cards' photos load.
// Remount it (via `key`) when the filters change to start again from the top batch.
export default function InfiniteProductGrid({
  products,
  layout,
  priorityCount,
  emptyMessage,
}: {
  products: Product[];
  layout: GridLayout;
  priorityCount?: number;
  emptyMessage?: string;
}) {
  const [count, setCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = count < products.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    // Start the next batch well before the shopper reaches the last row.
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setCount((c) => c + BATCH_SIZE), { rootMargin: "0px 0px 900px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, count]);

  return (
    <>
      <ProductGrid products={products.slice(0, count)} layout={layout} priorityCount={priorityCount} emptyMessage={emptyMessage} />
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-10" role="status" aria-live="polite">
          <span className="flex items-center gap-2 text-sm text-ink/50">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark" aria-hidden />
            Loading more styles…
          </span>
        </div>
      ) : (
        products.length > BATCH_SIZE && <p className="py-10 text-center text-sm text-ink/45">You&apos;ve seen every style. ✨</p>
      )}
    </>
  );
}
