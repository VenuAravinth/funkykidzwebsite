"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiPackage, FiMapPin } from "react-icons/fi";
import OrderTrackingResult from "@/components/track-order/OrderTrackingResult";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { TrackedOrder } from "@/lib/tracking";
import type { DeliveryAddressSnapshot } from "@/lib/placedOrders";
import type { User } from "@/lib/auth";

type CustomerOrder = TrackedOrder & { address: DeliveryAddressSnapshot };

const STATUS_STYLE: Record<TrackedOrder["status"], string> = {
  Processing: "bg-blush text-rose-dark",
  Packed: "bg-blush text-rose-dark",
  "In Transit": "bg-gold/15 text-gold",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-ink/5 text-ink/50",
};

// Every order on the customer's account, with live status from the database.
export default function OrderHistoryList({ user }: { user: User }) {
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api<{ orders: CustomerOrder[] }>("/api/orders").then((res) => {
      if (!alive) return;
      if (res.ok) setOrders(res.data.orders);
      else setError(res.error);
    });
    return () => {
      alive = false;
    };
  }, [user.id]);

  const heading = <h3 className="font-serif-display text-xl font-bold text-plum">Order History</h3>;

  if (error) return <div>{heading}<p className="mt-4 text-sm text-rose-dark">{error}</p></div>;
  if (!orders) {
    return (
      <div>
        {heading}
        <div className="mt-6 space-y-3">
          {[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />)}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        {heading}
        <div className="mt-6 rounded-2xl border border-dashed border-plum/15 bg-cream/40 p-8 text-center">
          <FiPackage className="mx-auto text-3xl text-rose-dark" />
          <p className="mt-3 text-sm text-ink/60">You haven&apos;t placed any orders yet.</p>
          <Link href="/collections" className="mt-3 inline-block text-sm font-semibold text-rose-dark underline underline-offset-2">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {heading}
      <div className="mt-6 flex flex-col gap-4">
        {orders.map((order) => {
          const isOpen = expanded === order.orderNumber;
          const count = order.items.reduce((n, i) => n + i.quantity, 0);
          return (
            <div key={order.orderNumber} className="rounded-2xl border border-rose-light/60 bg-white shadow-sm">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : order.orderNumber)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-plum">#{order.orderNumber}</p>
                  <p className="text-xs text-ink/50">
                    {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                    {count} {count === 1 ? "item" : "items"} · {formatPrice(order.total)}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                  <FiChevronDown className={`text-ink/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-rose-light/60 p-4 sm:p-5">
                  <p className="flex items-start gap-1.5 text-xs text-ink/60">
                    <FiMapPin className="mt-0.5 shrink-0 text-rose-dark" />
                    <span>
                      {order.address.recipientName} ·{" "}
                      {[order.address.line1, order.address.line2, `${order.address.city} ${order.address.postalCode}`].filter(Boolean).join(", ")}
                    </span>
                  </p>
                  <OrderTrackingResult order={order} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
