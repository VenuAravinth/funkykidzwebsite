"use client";

import { GENDERS, KIDS_AGE_BUCKETS } from "@/lib/categories";
import ChipMultiSelect from "./ChipMultiSelect";
import FilterSection from "./FilterSection";
import PriceRangeFilter from "./PriceRangeFilter";
import type { Filters, PriceRange } from "./useProductFilters";

type ListKey = "genders" | "categories" | "sizes" | "ages" | "colors";

// Controlled filter form. It edits a draft; nothing changes on the page until the drawer's
// "Apply Filters" button commits it.
export default function FilterPanel({
  value,
  onChange,
  priceBounds,
  categoryOptions,
  sizeOptions,
  colorOptions,
  colorHex,
  idPrefix = "filter",
}: {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
  priceBounds: PriceRange;
  categoryOptions: string[];
  sizeOptions: string[];
  colorOptions: string[];
  colorHex: Record<string, string>;
  idPrefix?: string;
}) {
  const toggle = (key: ListKey, v: string) =>
    onChange({ [key]: value[key].includes(v) ? value[key].filter((x) => x !== v) : [...value[key], v] });

  const price = value.price
    ? { min: Math.max(value.price.min, priceBounds.min), max: Math.min(value.price.max, priceBounds.max) }
    : priceBounds;

  const flags = [
    { key: "inStock" as const, label: "In stock only" },
    { key: "onlyNew" as const, label: "New arrivals" },
  ];

  return (
    <div>
      <FilterSection title="Category" idPrefix={idPrefix}>
        <ChipMultiSelect options={categoryOptions} selected={value.categories} onToggle={(v) => toggle("categories", v)} />
      </FilterSection>

      <FilterSection title="Shop for" idPrefix={idPrefix}>
        <ChipMultiSelect options={GENDERS} selected={value.genders} onToggle={(v) => toggle("genders", v)} />
      </FilterSection>

      <FilterSection title="Age" idPrefix={idPrefix}>
        <ChipMultiSelect options={KIDS_AGE_BUCKETS} selected={value.ages} onToggle={(v) => toggle("ages", v)} />
      </FilterSection>

      <FilterSection title="Size" idPrefix={idPrefix}>
        <ChipMultiSelect options={sizeOptions} selected={value.sizes} onToggle={(v) => toggle("sizes", v)} />
      </FilterSection>

      <FilterSection title="Colour" idPrefix={idPrefix}>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => {
            const active = value.colors.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => toggle("colors", c)}
                className={`flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? "border-plum bg-plum text-white" : "border-plum/20 text-plum hover:bg-rose-light"
                }`}
              >
                <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: colorHex[c] }} />
                {c}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Price" idPrefix={idPrefix}>
        <PriceRangeFilter
          bounds={priceBounds}
          value={price}
          onChange={(next) => {
            const full = next.min <= priceBounds.min && next.max >= priceBounds.max;
            onChange({ price: full ? null : next });
          }}
        />
      </FilterSection>

      <FilterSection title="Availability" idPrefix={idPrefix}>
        <div className="space-y-1">
          {flags.map((f) => (
            <label key={f.key} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-plum">
              <input
                type="checkbox"
                checked={value[f.key]}
                onChange={(e) => onChange({ [f.key]: e.target.checked })}
                className="h-4 w-4 accent-plum"
              />
              {f.label}
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

/** How many filters are on (each chip/checkbox/price range counts once). Search and sort excluded. */
export function activeFilterCount(f: Filters): number {
  return (
    f.genders.length + f.categories.length + f.sizes.length + f.ages.length + f.colors.length +
    (f.price ? 1 : 0) + (f.inStock ? 1 : 0) + (f.onlyNew ? 1 : 0)
  );
}
