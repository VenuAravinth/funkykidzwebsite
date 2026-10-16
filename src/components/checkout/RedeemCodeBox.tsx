"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FiCheckCircle, FiTag, FiX } from "react-icons/fi";
import { api } from "@/lib/api";
import { normalizeCouponCode, type AppliedCoupon } from "@/lib/coupons";
import { formatPrice } from "@/lib/format";
import type { CheckoutItem } from "./OrderBillSummary";

// "Have a redeem code?" box in the checkout summary. The server decides whether a code is valid
// and how much it takes off; it checks again when the order is placed.
export default function RedeemCodeBox({
  items,
  applied,
  onChange,
  locked,
}: {
  items: CheckoutItem[];
  applied: AppliedCoupon | null;
  onChange: (coupon: AppliedCoupon | null) => void;
  locked: boolean; // once the customer has paid, the amount can't change
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function apply(e: FormEvent) {
    e.preventDefault();
    const value = normalizeCouponCode(code);
    if (!value) return setError("Enter your redeem code.");
    setBusy(true);
    setError("");
    const res = await api<{ coupon: AppliedCoupon }>("/api/coupons/validate", { body: { code: value, items } });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    onChange(res.data.coupon);
    setCode("");
    setOpen(false);
  }

  if (applied) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-600" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-emerald-800">
              <span className="font-mono tracking-wide">{applied.code}</span> applied
            </p>
            <p className="text-emerald-700">
              {applied.label} · you save {formatPrice(applied.discount)}
            </p>
          </div>
          {!locked && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              <FiX /> Remove
            </button>
          )}
        </div>
        {locked && <p className="mt-2 text-xs text-emerald-700/80">Locked in with your payment.</p>}
      </div>
    );
  }

  if (locked) return null;

  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-2 py-1 text-sm font-semibold text-plum">
          <FiTag className="text-rose-dark" /> Have a redeem code?
          <span className="ml-auto text-xs font-semibold text-rose-dark">Apply Code</span>
        </button>
      ) : (
        <form onSubmit={apply} noValidate>
          <label htmlFor="redeem-code" className="flex items-center gap-2 text-sm font-semibold text-plum">
            <FiTag className="text-rose-dark" /> Redeem code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="redeem-code"
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={24}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="Enter code"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "redeem-error" : undefined}
              className="min-w-0 flex-1 rounded-xl border border-plum/15 bg-cream/40 px-3 py-2.5 font-mono text-base uppercase tracking-wider text-ink outline-none focus:border-rose-dark sm:text-sm"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="shrink-0 rounded-xl bg-plum px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {busy ? "Checking…" : "Apply"}
            </button>
          </div>
          {error && (
            <p id="redeem-error" role="alert" className="mt-2 text-xs font-medium text-rose-dark">
              {error}
            </p>
          )}
          <p className="mt-2 text-[11px] text-ink/50">
            One code per order.{" "}
            <Link href="/redeem-codes" target="_blank" className="font-semibold text-rose-dark underline underline-offset-2">
              How redeem codes work
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
