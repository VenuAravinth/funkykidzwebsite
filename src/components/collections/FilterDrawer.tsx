"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import type { Product } from "@/lib/products";
import FilterPanel, { activeFilterCount } from "./FilterPanel";
import { applyFilters, type Filters, type ProductFilters } from "./useProductFilters";

const EMPTY: Pick<Filters, "genders" | "categories" | "sizes" | "ages" | "colors" | "price" | "inStock" | "onlyNew"> = {
  genders: [],
  categories: [],
  sizes: [],
  ages: [],
  colors: [],
  price: null,
  inStock: false,
  onlyNew: false,
};

// Side drawer with every filter. Choices are a draft until "Apply Filters"; closing the drawer
// any other way (×, backdrop, Esc) throws the draft away.
export default function FilterDrawer({
  open,
  onClose,
  api,
  products,
}: {
  open: boolean;
  onClose: () => void;
  api: ProductFilters;
  products: Product[];
}) {
  return (
    <AnimatePresence>
      {open && <DrawerBody key="filters" onClose={onClose} api={api} products={products} />}
    </AnimatePresence>
  );
}

function DrawerBody({ onClose, api, products }: { onClose: () => void; api: ProductFilters; products: Product[] }) {
  // Fresh draft from the applied filters every time the drawer opens.
  const [draft, setDraft] = useState<Filters>(api.filters);
  const closeRef = useRef<HTMLButtonElement>(null);
  const resultCount = useMemo(() => applyFilters(products, draft).length, [products, draft]);
  const draftCount = activeFilterCount(draft);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  function apply() {
    api.update({ ...draft, q: api.filters.q, sort: api.filters.sort });
    onClose();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-y-0 right-0 z-[75] flex w-[92vw] max-w-[440px] flex-col bg-cream shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-plum/10 px-5 py-4">
          <h2 id="filter-drawer-title" className="font-serif-display text-xl font-bold text-plum">
            Filters
            {draftCount > 0 && <span className="ml-2 align-middle text-xs font-semibold text-rose-dark">{draftCount} selected</span>}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="grid h-10 w-10 place-items-center rounded-full text-plum hover:bg-rose-light"
          >
            <FiX className="text-xl" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <FilterPanel
            value={draft}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            priceBounds={api.priceBounds}
            categoryOptions={api.categoryOptions}
            sizeOptions={api.sizeOptions}
            colorOptions={api.colorOptions}
            colorHex={api.colorHex}
            idPrefix="drawer"
          />
        </div>

        <footer className="flex items-center gap-3 border-t border-plum/10 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, ...EMPTY }))}
            disabled={draftCount === 0}
            className="rounded-full px-4 py-3 text-sm font-semibold text-rose-dark hover:bg-rose-light disabled:text-ink/30 disabled:hover:bg-transparent"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={resultCount === 0}
            className="flex-1 rounded-full bg-plum px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:bg-ink/25 disabled:hover:scale-100"
          >
            {resultCount === 0 ? "No matching products" : `Apply Filters · ${resultCount} ${resultCount === 1 ? "product" : "products"}`}
          </button>
        </footer>
      </motion.div>
    </>
  );
}
