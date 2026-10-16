"use client";

import { useState } from "react";

type Point = { date: string; revenue: number; orders: number };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const shortDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// Single-series bar chart: one hue (validated #d9647c on white), 4px rounded tops anchored to
// the baseline, recessive grid, per-bar hover/focus tooltip, and a table view.
export default function RevenueChart({ data }: { data: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const niceMax = (() => {
    const pow = 10 ** Math.floor(Math.log10(max));
    return Math.ceil(max / pow) * pow;
  })();
  const ticks = [0, 0.5, 1].map((t) => t * niceMax);
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-plum/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink/60">Revenue · last {data.length} days</h2>
          <p className="mt-1 text-2xl font-bold text-plum">{inr(total)}</p>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="rounded-full border border-plum/15 px-3 py-1.5 text-xs font-semibold text-ink/60 hover:text-plum"
        >
          {asTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {asTable ? (
        <div className="mt-5 max-h-72 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs text-ink/50">
              <tr>
                <th className="py-2 font-semibold">Date</th>
                <th className="py-2 text-right font-semibold">Orders</th>
                <th className="py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.date} className="border-t border-plum/5">
                  <td className="py-2 text-ink/70">{shortDate(d.date)}</td>
                  <td className="py-2 text-right tabular-nums text-ink/70">{d.orders}</td>
                  <td className="py-2 text-right font-medium tabular-nums text-plum">{inr(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-6 h-56 pl-12" onMouseLeave={() => setActive(null)}>
          {ticks.map((t) => (
            <div key={t} className="absolute left-12 right-0 border-t border-dashed border-plum/10" style={{ bottom: `${(t / niceMax) * 100}%` }}>
              <span className="absolute -left-12 -translate-y-1/2 text-[10px] tabular-nums text-ink/40">
                {t >= 1000 ? `₹${t / 1000}k` : `₹${t}`}
              </span>
            </div>
          ))}
          <div className="relative flex h-full items-end gap-[2px]">
            {data.map((d, i) => (
              <button
                key={d.date}
                type="button"
                aria-label={`${shortDate(d.date)}: ${inr(d.revenue)} from ${d.orders} orders`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group relative flex h-full flex-1 items-end outline-none"
              >
                <span
                  className={`block w-full rounded-t-[4px] transition-all duration-500 ${
                    active === i ? "bg-plum" : "bg-[#d9647c]"
                  } ${d.revenue === 0 ? "opacity-0" : ""}`}
                  style={{ height: `${(d.revenue / niceMax) * 100}%`, minHeight: d.revenue > 0 ? 3 : 0 }}
                />
              </button>
            ))}
          </div>
          {active !== null && (() => {
            // Keep the tooltip inside the card: anchor it left/right near the edges.
            const pct = (active + 0.5) / data.length;
            const align = pct > 0.8 ? "-translate-x-full" : pct < 0.2 ? "" : "-translate-x-1/2";
            return (
              <div
                role="status"
                className={`pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded-xl bg-plum px-3 py-2 text-xs text-white shadow-lg ${align}`}
                style={{ left: `calc(3rem + (100% - 3rem) * ${pct})` }}
              >
                <p className="text-sm font-bold tabular-nums">{inr(data[active].revenue)}</p>
                <p className="text-white/70">
                  {shortDate(data[active].date)} · {data[active].orders} order{data[active].orders === 1 ? "" : "s"}
                </p>
              </div>
            );
          })()}
          <div className="mt-2 flex justify-between pl-0 text-[10px] text-ink/40">
            <span>{shortDate(data[0].date)}</span>
            <span>{shortDate(data[data.length - 1].date)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
