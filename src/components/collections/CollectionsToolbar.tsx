"use client";

import { motion } from "framer-motion";
import { FiSliders } from "react-icons/fi";
import type { SortOption } from "@/lib/categories";
import SortDropdown from "./SortDropdown";
import GridLayoutSwitch from "./GridLayoutSwitch";
import type { GridLayout } from "./gridLayout";

export default function CollectionsToolbar({
  activeFilters,
  sortBy,
  onSortChange,
  onOpenFilters,
  layout,
  onLayoutChange,
}: {
  activeFilters: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onOpenFilters: () => void;
  layout: GridLayout;
  onLayoutChange: (value: GridLayout) => void;
}) {
  return (
    // Phones: [Filter] on the first row, [card size · sort] on the second.
    // From sm up: one row, filter on the left, view options on the right.
    <div className="mb-5 flex flex-col gap-3 border-b border-plum/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={onOpenFilters}
          whileTap={{ scale: 0.96 }}
          aria-haspopup="dialog"
          className={`relative flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold transition-colors ${
            activeFilters > 0 ? "bg-plum text-white hover:bg-plum-light" : "border border-plum/20 bg-white text-plum hover:border-plum"
          }`}
        >
          <FiSliders />
          Filter
          {activeFilters > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1.5 text-[11px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </motion.button>
      </div>

      <div className="flex items-center gap-2">
        <GridLayoutSwitch value={layout} onChange={onLayoutChange} />
        <div className="min-w-0 flex-1 sm:flex-none [&_select]:w-full">
          <SortDropdown value={sortBy} onChange={onSortChange} />
        </div>
      </div>
    </div>
  );
}
