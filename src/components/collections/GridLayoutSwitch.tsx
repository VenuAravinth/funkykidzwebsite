"use client";

import { GRID_LAYOUTS, type CardDensity, type GridLayout } from "./gridLayout";

const densityLabel: Record<CardDensity, string> = {
  large: "Large cards",
  default: "Standard cards",
  compact: "Small cards",
};

// Bars hint at card size: fewer, wider bars = bigger cards.
const barCount: Record<CardDensity, number> = { large: 2, default: 3, compact: 4 };

export default function GridLayoutSwitch({
  value,
  onChange,
}: {
  value: GridLayout;
  onChange: (value: GridLayout) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Products per row" className="flex items-center rounded-full border border-plum/15 bg-white p-0.5">
      {GRID_LAYOUTS.map((option) => {
        const active = option.value === value;
        const { columns: c } = option;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={densityLabel[option.density]}
            title={densityLabel[option.density]}
            onClick={() => onChange(option.value)}
            className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-bold transition-colors ${
              active ? "bg-plum text-white" : "text-plum/70 hover:bg-plum/10 hover:text-plum"
            }`}
          >
            <span aria-hidden className="flex h-3 items-stretch gap-[2px]">
              {Array.from({ length: barCount[option.density] }, (_, i) => (
                <span key={i} className="w-[3px] rounded-[1px] bg-current opacity-80" />
              ))}
            </span>
            {/* The number matches the columns actually shown at the current screen width. */}
            <span aria-hidden className="tabular-nums">
              <span className="sm:hidden">{c.base}</span>
              <span className="hidden sm:inline md:hidden">{c.sm}</span>
              <span className="hidden md:inline lg:hidden">{c.md}</span>
              <span className="hidden lg:inline xl:hidden">{c.lg}</span>
              <span className="hidden xl:inline">{c.xl}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
