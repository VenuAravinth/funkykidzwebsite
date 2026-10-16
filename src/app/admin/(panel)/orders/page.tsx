import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/server/adminAuth";
import { listOrders, ORDER_STATUSES, PAYMENT_STATUSES } from "@/server/orderStore";
import StatusBadge from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Orders" };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type Search = Promise<{ q?: string; status?: string; payment?: string }>;

export default async function OrdersPage({ searchParams }: { searchParams: Search }) {
  await requireAdminPage();
  const { q = "", status = "", payment = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const all = (await listOrders()).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  const orders = all.filter(
    (o) =>
      (!status || o.status === status) &&
      (!payment || o.paymentStatus === payment) &&
      (!query ||
        o.orderNumber.includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.phone.includes(query) ||
        o.address.city.toLowerCase().includes(query)),
  );

  const select = "rounded-xl border border-plum/15 bg-white px-3 py-2.5 text-sm text-ink/80 outline-none focus:border-rose-dark";

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-serif-display text-3xl font-bold text-plum">Orders</h1>
      <p className="mt-1 text-sm text-ink/55">
        {orders.length} of {all.length} orders
      </p>

      <form className="mt-6 flex flex-wrap gap-3" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order #, name, phone, city"
          className="min-w-[220px] flex-1 rounded-xl border border-plum/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rose-dark"
        />
        <select name="status" defaultValue={status} className={select} aria-label="Order status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select name="payment" defaultValue={payment} className={select} aria-label="Payment status">
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="rounded-xl bg-plum px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-light">Filter</button>
        {(q || status || payment) && (
          <Link href="/admin/orders" className="self-center text-sm font-semibold text-ink/50 hover:text-plum">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white ring-1 ring-plum/5">
        {orders.length === 0 ? (
          <p className="p-10 text-center text-sm text-ink/45">No orders match.</p>
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[#faf8fb] text-xs text-ink/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Placed</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">City</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderNumber} className="border-t border-plum/5 transition-colors hover:bg-[#faf8fb]">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${o.orderNumber}`} className="font-semibold text-plum hover:text-rose-dark">
                      #{o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink/60">{when(o.placedAt)}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-ink/80">{o.customerName}</p>
                    <p className="text-xs text-ink/45">{o.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-ink/60">{o.address.city}</td>
                  <td className="px-5 py-3.5"><StatusBadge value={o.paymentStatus} /></td>
                  <td className="px-5 py-3.5"><StatusBadge value={o.status} /></td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-plum">{inr(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
