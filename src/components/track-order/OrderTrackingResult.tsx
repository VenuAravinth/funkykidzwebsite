"use client";

import { useProducts } from "@/context/ProductsContext";
import Link from "next/link";
import { FiCheck, FiPrinter, FiXCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import ProductPhoto from "@/components/product/ProductPhoto";
import { productImage } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { TRACKING_STEPS, type TrackedOrder } from "@/lib/tracking";
import { whatsappLink } from "@/lib/site";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const PAYMENT_NOTE: Record<TrackedOrder["paymentStatus"], { text: string; cls: string }> = {
  "Pending Verification": { text: "Payment being verified", cls: "bg-gold/15 text-gold" },
  Verified: { text: "Payment verified", cls: "bg-emerald-50 text-emerald-700" },
  Rejected: { text: "Payment not received", cls: "bg-rose-light text-rose-dark" },
};

export default function OrderTrackingResult({ order }: { order: TrackedOrder }) {
  const { getProduct: getProductBySlug } = useProducts();
  const cancelled = order.status === "Cancelled";
  const currentIndex = TRACKING_STEPS.findIndex((s) => s.status === order.status);
  const dateFor = (status: string) => {
    const hit = [...order.history].reverse().find((h) => h.status === status);
    return hit ? fmtDate(hit.at) : null;
  };
  const payment = PAYMENT_NOTE[order.paymentStatus];
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="mx-auto mt-6 max-w-3xl space-y-4">
      <div className="rounded-2xl border border-rose-light/60 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Order</p>
            <p className="font-serif-display text-xl font-bold text-plum">#{order.orderNumber}</p>
            <p className="mt-0.5 text-xs text-ink/50">
              Placed {fmtDate(order.placedAt)} · {itemCount} {itemCount === 1 ? "item" : "items"} · {formatPrice(order.total)}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.cls}`}>{payment.text}</span>
        </div>

        {order.paymentStatus === "Rejected" && (
          <p className="mt-4 rounded-xl bg-rose-light/50 p-3 text-sm text-rose-dark">
            We couldn&apos;t match your UPI payment. Please message us on WhatsApp with your payment screenshot and
            order number so we can sort it out.
          </p>
        )}

        {cancelled ? (
          <p className="mt-6 flex items-center gap-2 rounded-xl bg-cream p-4 text-sm font-semibold text-ink/70">
            <FiXCircle className="shrink-0 text-lg text-rose-dark" /> This order was cancelled. Contact us if you have
            questions about a refund.
          </p>
        ) : (
          // Vertical on phones so every label is readable; horizontal from tablet up.
          <ol className="mt-6 flex flex-col gap-0 sm:flex-row">
            {TRACKING_STEPS.map((step, i) => {
              const done = i <= currentIndex;
              const date = dateFor(step.status);
              const last = i === TRACKING_STEPS.length - 1;
              return (
                <li key={step.status} className="relative flex gap-3 pb-6 last:pb-0 sm:flex-1 sm:flex-col sm:items-center sm:pb-0 sm:text-center">
                  {!last && (
                    <span
                      aria-hidden
                      className={`absolute left-4 top-8 h-[calc(100%-2rem)] w-0.5 sm:left-[calc(50%+1rem)] sm:top-4 sm:h-0.5 sm:w-[calc(100%-2rem)] ${
                        i < currentIndex ? "bg-plum" : "bg-plum/15"
                      }`}
                    />
                  )}
                  <span
                    className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      done ? "bg-plum text-white" : "border-2 border-plum/20 bg-white text-plum/40"
                    }`}
                  >
                    {done ? <FiCheck /> : i + 1}
                  </span>
                  <span className="pt-1 sm:pt-2">
                    <span className={`block text-sm font-semibold ${done ? "text-plum" : "text-ink/40"}`}>{step.label}</span>
                    <span className="block text-xs text-ink/45">{date ?? (done ? "" : "Pending")}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="rounded-2xl border border-rose-light/60 bg-white p-5 shadow-sm sm:p-8">
        <h3 className="font-serif-display text-lg font-bold text-plum">Items</h3>
        <ul className="mt-3 divide-y divide-rose-light/60">
          {order.items.map((item) => {
            const product = getProductBySlug(item.slug);
            return (
              <li key={`${item.slug}-${item.size}-${item.colorwayName}`} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush/60">
                  <ProductPhoto src={product && productImage(product)} alt="" label={false} width={56} height={70} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  {product ? (
                    <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-plum">
                      {item.name}
                    </Link>
                  ) : (
                    <p className="line-clamp-2 text-sm font-semibold text-plum">{item.name}</p>
                  )}
                  <p className="text-xs text-ink/50">
                    Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-plum">{formatPrice(item.unitPrice * item.quantity)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-rose-light/60 pt-4 text-sm">
          <div className="flex justify-between text-ink/60">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-plum">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-ink/60">
              <dt>Discount</dt>
              <dd className="font-semibold text-plum">−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-ink/60">
            <dt>Delivery</dt>
            <dd className="font-semibold text-plum">{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-plum">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row print:hidden">
          <a
            href={whatsappLink(`Hi FunkyKidz, I have a question about order #${order.orderNumber}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white"
          >
            <FaWhatsapp /> Ask about this order
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-plum/20 px-5 py-3 text-sm font-semibold text-plum"
          >
            <FiPrinter /> Print / save receipt
          </button>
        </div>
      </div>
    </div>
  );
}
