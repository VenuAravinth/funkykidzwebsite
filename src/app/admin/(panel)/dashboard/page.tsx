import type { Metadata } from "next";
import Link from "next/link";
import { FiAlertCircle, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { requireAdminPage } from "@/server/adminAuth";
import { getAnalytics } from "@/server/analytics";
import RevenueChart from "@/components/admin/RevenueChart";
import StatusBadge from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Analytics" };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function BarList({ title, rows, empty }: { title: string; rows: { label: string; value: number; display: string }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-plum/5">
      <h2 className="text-sm font-semibold text-ink/60">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-ink/40">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between text-sm">
                <span className="truncate text-ink/75">{r.label}</span>
                <span className="ml-3 font-semibold tabular-nums text-plum">{r.display}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-plum/5">
                <div className="h-full rounded-full bg-[#d9647c]" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  await requireAdminPage();
  const a = await getAnalytics(30);
  const t = a.totals;

  const tiles = [
    { label: "Total revenue", value: inr(t.revenue), note: `${inr(t.verifiedRevenue)} payment-verified` },
    { label: "Orders", value: t.orders.toLocaleString("en-IN"), note: `${t.uniqueCustomers} customers` },
    { label: "Avg. order value", value: inr(t.avgOrderValue), note: `${t.units} items sold` },
    { label: "To ship", value: String(t.toShip), note: "Processing or packed" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl font-bold text-plum">Analytics</h1>
          <p className="mt-1 text-sm text-ink/55">Online orders placed through the website.</p>
        </div>
        {t.trendPct !== null && (
          <p className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${t.trendPct >= 0 ? "bg-[#e8f6ee] text-[#1f7a4a]" : "bg-[#fdecec] text-[#b42318]"}`}>
            {t.trendPct >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {t.trendPct >= 0 ? "+" : ""}
            {t.trendPct}% vs previous 15 days
          </p>
        )}
      </header>

      {t.pendingVerification > 0 && (
        <Link
          href="/admin/orders?payment=Pending%20Verification"
          className="mt-6 flex items-center gap-3 rounded-2xl bg-[#fff4e0] px-5 py-4 text-sm font-medium text-[#9a5b00] ring-1 ring-[#f3d9a8] transition hover:shadow-md"
        >
          <FiAlertCircle className="shrink-0 text-lg" />
          {t.pendingVerification} order{t.pendingVerification === 1 ? "" : "s"} waiting for UPI payment verification →
        </Link>
      )}

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-3xl bg-white p-5 ring-1 ring-plum/5">
            <p className="text-xs font-semibold text-ink/50">{tile.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-plum">{tile.value}</p>
            <p className="mt-1 text-xs text-ink/45">{tile.note}</p>
          </div>
        ))}
      </section>

      <div className="mt-6">
        <RevenueChart data={a.series} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <BarList
          title="Top products by revenue"
          rows={a.topProducts.map((p) => ({ label: p.name, value: p.revenue, display: inr(p.revenue) }))}
          empty="No sales yet."
        />
        <BarList
          title="Orders by status"
          rows={a.byStatus.filter((s) => s.count > 0).map((s) => ({ label: s.status, value: s.count, display: String(s.count) }))}
          empty="No orders yet."
        />
        <BarList
          title="Top delivery cities"
          rows={a.topCities.map((c) => ({ label: c.city, value: c.count, display: `${c.count} order${c.count === 1 ? "" : "s"}` }))}
          empty="No orders yet."
        />
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-plum/5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink/60">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-rose-dark hover:underline">
            All orders →
          </Link>
        </div>
        {a.recentOrders.length === 0 ? (
          <p className="mt-6 text-sm text-ink/40">Orders placed on the website will appear here.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-ink/45">
                <tr>
                  <th className="pb-2 font-semibold">Order</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Payment</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {a.recentOrders.map((o) => (
                  <tr key={o.orderNumber} className="border-t border-plum/5">
                    <td className="py-3">
                      <Link href={`/admin/orders/${o.orderNumber}`} className="font-semibold text-plum hover:text-rose-dark">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-ink/70">{o.customerName}</td>
                    <td className="py-3"><StatusBadge value={o.paymentStatus} /></td>
                    <td className="py-3"><StatusBadge value={o.status} /></td>
                    <td className="py-3 text-right font-semibold tabular-nums text-plum">{inr(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
