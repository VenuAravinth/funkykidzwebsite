"use client";

import { PRICE_QUICK_RANGES } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import type { PriceRange } from "./useProductFilters";

const THUMB_CLASSES =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-plum [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-plum [&::-moz-range-thumb]:cursor-pointer";

export default function PriceRangeFilter({
  bounds,
  value,
  onChange,
}: {
  bounds: PriceRange;
  value: PriceRange;
  onChange: (next: PriceRange) => void;
}) {
  const span = Math.max(1, bounds.max - bounds.min);
  const leftPct = ((value.min - bounds.min) / span) * 100;
  const rightPct = 100 - ((value.max - bounds.min) / span) * 100;

  function handleMinChange(raw: number) {
    const next = Math.min(raw, value.max);
    onChange({ ...value, min: next });
  }

  function handleMaxChange(raw: number) {
    const next = Math.max(raw, value.min);
    onChange({ ...value, max: next });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <label className="flex-1">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/45">Min</span>
          <input
            type="number"
            min={bounds.min}
            max={value.max}
            value={value.min}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="w-full rounded-lg border border-plum/15 px-2.5 py-1.5 text-sm text-plum focus:border-plum focus:outline-none"
          />
        </label>
        <span className="mt-4 text-ink/30">–</span>
        <label className="flex-1">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/45">Max</span>
          <input
            type="number"
            min={value.min}
            max={bounds.max}
            value={value.max}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="w-full rounded-lg border border-plum/15 px-2.5 py-1.5 text-sm text-plum focus:border-plum focus:outline-none"
          />
        </label>
      </div>

      <div className="relative mt-5 h-4">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-plum/10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-plum"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={bounds.min}
          max={bounds.max}
          value={value.min}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className={`pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent ${THUMB_CLASSES}`}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={bounds.min}
          max={bounds.max}
          value={value.max}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className={`pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent ${THUMB_CLASSES}`}
        />
      </div>

      <p className="mt-3 text-xs text-ink/50">
        {formatPrice(value.min)} – {formatPrice(value.max)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRICE_QUICK_RANGES.map((range) => {
          const active = value.min === Math.max(range.min, bounds.min) && value.max === Math.min(range.max, bounds.max);
          return (
            <button
              key={range.label}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange({
                  min: Math.max(range.min, bounds.min),
                  max: Math.min(range.max, bounds.max),
                })
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? "border-plum bg-plum text-white" : "border-plum/20 text-plum hover:bg-rose-light"
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
