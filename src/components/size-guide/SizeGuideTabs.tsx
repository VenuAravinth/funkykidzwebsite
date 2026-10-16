"use client";

import { useState } from "react";
import { FiUser, FiUsers } from "react-icons/fi";
import { PiBabyBold } from "react-icons/pi";
import { KIDS_SIZE_CHART, type SizeChartRow } from "@/lib/sizeChart";

type Column = { key: keyof SizeChartRow; label: string };

type SizeTable = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  note: string;
  rows: SizeChartRow[];
};

const COLUMNS: Column[] = [
  { key: "size", label: "Size" },
  { key: "age", label: "Age" },
  { key: "heightCm", label: "Height (cm)" },
  { key: "chestCm", label: "Chest (cm)" },
  { key: "waistCm", label: "Waist (cm)" },
];

const BABY = ["0-3M", "3-6M", "6-9M", "9-12M"];
const OLDER = ["8-10Y", "10-12Y", "12-13Y", "13-14Y", "14-15Y"];

// Size labels match the ones on every product page, so parents can read across directly.
const TABLES: SizeTable[] = [
  {
    label: "Babies",
    icon: PiBabyBold,
    note: "0–12 months · body measurements in cm",
    rows: KIDS_SIZE_CHART.filter((r) => BABY.includes(r.size)),
  },
  {
    label: "Kids",
    icon: FiUser,
    note: "1–8 years · body measurements in cm",
    rows: KIDS_SIZE_CHART.filter((r) => !BABY.includes(r.size) && !OLDER.includes(r.size)),
  },
  {
    label: "Older kids",
    icon: FiUsers,
    note: "8–15 years · body measurements in cm. Between sizes? Go one size up.",
    rows: KIDS_SIZE_CHART.filter((r) => OLDER.includes(r.size)),
  },
];

export default function SizeGuideTabs() {
  const [active, setActive] = useState(0);
  const table = TABLES[active];

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-dark shadow-sm">
          Size Chart
        </span>
        <h2 className="mt-4 font-serif-display text-3xl font-bold text-plum md:text-4xl">
          Find Your Perfect Fit
        </h2>
        <p className="mt-3 text-ink/60">
          Every FunkyKidz piece is cut a little differently — use the chart below alongside the size
          picked on each product page to confirm your fit.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {TABLES.map((t, i) => {
          const Icon = t.icon;
          const isActive = i === active;
          return (
            <button
              key={t.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-plum bg-plum text-white"
                  : "border-plum/15 bg-white text-plum hover:bg-rose-light"
              }`}
            >
              <Icon className="text-base" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-rose-light/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-blush/60">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.key === "age" ? "hidden sm:table-cell " : ""}px-2 py-3 text-[11px] font-semibold uppercase leading-tight tracking-wide text-plum sm:px-5 sm:text-xs`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-light/60">
              {table.rows.map((row) => (
                <tr key={row.size} className="transition-colors hover:bg-blush/30">
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-2 py-3 sm:px-5 ${col.key === "age" ? "hidden sm:table-cell " : ""}${
                        col.key === "size" ? "font-semibold text-plum" : "text-ink/70"
                      }`}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-rose-light/60 bg-blush/30 px-5 py-3 text-xs text-ink/50">
          {table.note}
        </p>
      </div>
    </section>
  );
}
