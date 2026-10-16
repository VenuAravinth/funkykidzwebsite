"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FiSearch } from "react-icons/fi";
import { fetchTrackedOrder, type TrackedOrder } from "@/lib/tracking";
import OrderTrackingResult from "./OrderTrackingResult";

const inputClass =
  "w-full rounded-xl border border-plum/15 bg-cream px-4 py-3 text-base text-ink outline-none placeholder:text-ink/40 focus:border-rose-dark sm:text-sm";

export default function TrackOrderLookup() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(number: string, mobile: string) {
    setLoading(true);
    setError("");
    const result = await fetchTrackedOrder(number, mobile);
    setLoading(false);
    if ("order" in result) setOrder(result.order);
    else {
      setOrder(null);
      setError(result.error);
    }
  }

  // Links from the order confirmation and My Account arrive as ?order=…&phone=… and load straight away.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const number = params.get("order");
    const mobile = params.get("phone");
    if (!number || !mobile) return;
    (async () => {
      setOrderNumber(number);
      setPhone(mobile);
      await lookup(number, mobile);
    })();
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Enter your order number and the 10-digit mobile number used at checkout.");
      return;
    }
    lookup(orderNumber, phone);
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 md:px-12">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-rose-light/60 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="track-order" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
              Order number
            </label>
            <input
              id="track-order"
              inputMode="numeric"
              autoComplete="off"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. 2315482546"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="track-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
              Mobile number
            </label>
            <input
              id="track-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Used at checkout"
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-full bg-rose-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 disabled:opacity-60"
        >
          <FiSearch /> {loading ? "Looking up…" : "Track order"}
        </button>
        <p className="text-center text-xs text-ink/45">Your order number is on the confirmation screen after checkout.</p>
      </form>

      {error && (
        <p
          role="alert"
          className="mx-auto mt-6 max-w-xl rounded-2xl border border-rose-light/60 bg-blush/50 px-5 py-4 text-center text-sm font-medium text-rose-dark"
        >
          {error}
        </p>
      )}

      {order && <OrderTrackingResult order={order} />}
    </section>
  );
}
