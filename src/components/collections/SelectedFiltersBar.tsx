"use client";

import { FiX } from "react-icons/fi";
import { formatPrice } from "@/lib/format";
import type { ProductFilters } from "./useProductFilters";

type Chip = { key: string; label: string; onRemove: () => void };

export default function SelectedFiltersBar({ api }: { api: ProductFilters }) {
  const { filters, update, toggle, clearAll } = api;
  const chips: Chip[] = [];

  if (filters.q) chips.push({ key: "q", label: `Search: “${filters.q}”`, onRemove: () => update({ q: "" }) });
  for (const g of filters.genders) chips.push({ key: `g-${g}`, label: g, onRemove: () => toggle("genders", g) });
  for (const c of filters.categories) chips.push({ key: `c-${c}`, label: c, onRemove: () => toggle("categories", c) });
  for (const s of filters.sizes) chips.push({ key: `s-${s}`, label: `Size: ${s}`, onRemove: () => toggle("sizes", s) });
  for (const a of filters.ages) chips.push({ key: `a-${a}`, label: `Age: ${a}`, onRemove: () => toggle("ages", a) });
  for (const c of filters.colors) chips.push({ key: `col-${c}`, label: c, onRemove: () => toggle("colors", c) });
  if (filters.price) {
    const max = Number.isFinite(filters.price.max) ? formatPrice(filters.price.max) : "+";
    chips.push({ key: "price", label: `${formatPrice(filters.price.min)} – ${max}`, onRemove: () => update({ price: null }) });
  }
  if (filters.inStock) chips.push({ key: "instock", label: "In stock", onRemove: () => update({ inStock: false }) });
  if (filters.onlyNew) chips.push({ key: "new", label: "New arrivals", onRemove: () => update({ onlyNew: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Remove filter ${chip.label}`}
          className="flex min-h-9 items-center gap-1.5 rounded-full bg-rose-light px-3 py-2 text-xs font-semibold text-rose-dark transition-colors hover:bg-rose-light/70"
        >
          {chip.label}
          <FiX className="text-[13px]" />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="px-2 py-2.5 text-xs font-semibold text-ink/50 underline-offset-2 hover:underline">
        Clear All
      </button>
    </div>
  );
}
