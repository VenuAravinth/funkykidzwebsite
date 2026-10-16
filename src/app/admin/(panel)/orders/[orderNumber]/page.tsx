import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { requireAdminPage } from "@/server/adminAuth";
import { getOrder, ORDER_STATUSES, PAYMENT_STATUSES } from "@/server/orderStore";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderActions from "@/components/admin/OrderActions";

export const metadata: Metadata = { title: "Order" };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  await requireAdminPage();
  const { orderNumber } = await params;
  if (!/^\d{6,12}$/.test(orderNumber)) notFound();
  const order = await getOrder(orderNumber);
  if (!order) notFound();

  const a = order.address;
  const proofUrl = `/api/admin/orders/${order.orderNumber}/proof`;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/50 hover:text-plum">
        <FiArrowLeft /> All orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-serif-display text-3xl font-bold text-plum">Order #{order.orderNumber}</h1>
        <StatusBadge value={order.paymentStatus} />
        <StatusBadge value={order.status} />
      </div>
      <p className="mt-1 text-sm text-ink/55">Placed {when(order.placedAt)} · UPI</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-plum/5">
            <h2 className="text-sm font-semibold text-ink/60">Items</h2>
            <ul className="mt-3 divide-y divide-plum/5">
              {order.items.map((i) => (
                <li key={`${i.slug}-${i.size}-${i.colorwayName}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-plum">{i.name}</p>
                    <p className="text-xs text-ink/50">
                      Size {i.size} · Qty {i.quantity}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums text-plum">{inr(i.unitPrice * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-plum/10 pt-3 text-sm">
              <div className="flex justify-between text-ink/60"><dt>Subtotal</dt><dd className="tabular-nums">{inr(order.subtotal)}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700"><dt>Redeem code{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd className="tabular-nums">−{inr(order.discount)}</dd></div>
              )}
              <div className="flex justify-between text-ink/60"><dt>Delivery</dt><dd className="tabular-nums">{order.deliveryFee ? inr(order.deliveryFee) : "Free"}</dd></div>
              <div className="flex justify-between text-base font-bold text-plum"><dt>Total</dt><dd className="tabular-nums">{inr(order.total)}</dd></div>
            </dl>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 text-sm ring-1 ring-plum/5">
              <h2 className="text-sm font-semibold text-ink/60">Customer</h2>
              <p className="mt-3 font-semibold text-plum">{order.customerName}</p>
              <p className="text-ink/65">{order.phone}</p>
              {order.customerEmail && <p className="text-ink/65">{order.customerEmail}</p>}
            </div>
            <div className="rounded-3xl bg-white p-6 text-sm ring-1 ring-plum/5">
              <h2 className="text-sm font-semibold text-ink/60">Ship to {a.label && `(${a.label})`}</h2>
              <address className="mt-3 not-italic leading-relaxed text-ink/70">
                <span className="font-semibold text-plum">{a.recipientName}</span>
                <br />
                {a.line1}
                {a.line2 && <>, {a.line2}</>}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.country} · {a.phone}
              </address>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 ring-1 ring-plum/5">
            <h2 className="text-sm font-semibold text-ink/60">History</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {[...order.statusHistory].reverse().map((h, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="text-ink/75">{h.status}</span>
                  <span className="text-ink/45">{when(h.at)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <OrderActions
            orderNumber={order.orderNumber}
            status={order.status}
            paymentStatus={order.paymentStatus}
            adminNote={order.adminNote}
            statuses={ORDER_STATUSES}
            paymentStatuses={PAYMENT_STATUSES}
          />
          <section className="rounded-3xl bg-white p-6 ring-1 ring-plum/5">
            <h2 className="text-sm font-semibold text-ink/60">UPI payment proof</h2>
            {order.proofFile ? (
              <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-protected image */}
                <img src={proofUrl} alt={`Payment screenshot for order ${order.orderNumber}`} className="w-full rounded-xl ring-1 ring-plum/10" />
                <span className="mt-2 block text-xs font-semibold text-rose-dark">Open full size →</span>
              </a>
            ) : (
              <p className="mt-3 text-sm text-ink/45">No screenshot uploaded.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
