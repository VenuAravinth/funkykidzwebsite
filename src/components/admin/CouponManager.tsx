"use client";

import { useState, type FormEvent } from "react";
import { FiPause, FiPlay, FiPlus, FiTrash2 } from "react-icons/fi";
import type { AdminCoupon } from "@/server/coupons";

const field = "w-full rounded-xl border border-plum/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-rose-dark";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50";

const statusStyle: Record<AdminCoupon["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Scheduled: "bg-sky-50 text-sky-700",
  Expired: "bg-ink/5 text-ink/50",
  "Used up": "bg-ink/5 text-ink/50",
  Paused: "bg-gold/15 text-plum",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : null;

const EMPTY = { code: "", type: "flat", value: "", maxDiscount: "", minOrder: "", startsAt: "", expiresAt: "", usageLimit: "", perCustomerLimit: "1", note: "" };

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  }).catch(() => null);
  const data = await res?.json().catch(() => ({}));
  return { ok: Boolean(res?.ok), data: data ?? {}, error: (data?.error as string) ?? "Something went wrong. Please try again." };
}

export default function CouponManager({ initialCoupons }: { initialCoupons: AdminCoupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(initialCoupons.length === 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rowError, setRowError] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await send("/api/admin/coupons", "POST", form);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setCoupons((c) => [res.data.coupon as AdminCoupon, ...c]);
    setForm(EMPTY);
    setCreating(false);
  }

  async function toggle(c: AdminCoupon) {
    setRowError("");
    const res = await send(`/api/admin/coupons/${c.id}`, "PATCH", { active: !c.active });
    if (!res.ok) return setRowError(res.error);
    setCoupons((list) => list.map((x) => (x.id === c.id ? (res.data.coupon as AdminCoupon) : x)));
  }

  async function remove(c: AdminCoupon) {
    if (!window.confirm(`Delete ${c.code}? Customers won't be able to use it.`)) return;
    setRowError("");
    const res = await send(`/api/admin/coupons/${c.id}`, "DELETE");
    if (!res.ok) return setRowError(res.error);
    setCoupons((list) => list.filter((x) => x.id !== c.id));
  }

  return (
    <div className="mt-6">
      {creating ? (
        <form onSubmit={create} className="rounded-2xl border border-plum/10 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-serif-display text-xl font-bold text-plum">New redeem code</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor="c-code" className={label}>Code</label>
              <input id="c-code" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") }))} placeholder="e.g. WELCOME100" maxLength={24} className={`${field} font-mono uppercase tracking-wider`} />
            </div>
            <div>
              <label htmlFor="c-type" className={label}>Discount type</label>
              <select id="c-type" value={form.type} onChange={set("type")} className={field}>
                <option value="flat">Rupees off (₹)</option>
                <option value="percent">Percentage off (%)</option>
              </select>
            </div>
            <div>
              <label htmlFor="c-value" className={label}>{form.type === "flat" ? "Amount off (₹)" : "Percent off"}</label>
              <input id="c-value" required inputMode="numeric" value={form.value} onChange={set("value")} placeholder={form.type === "flat" ? "100" : "10"} className={field} />
            </div>
            {form.type === "percent" && (
              <div>
                <label htmlFor="c-max" className={label}>Max discount (₹)</label>
                <input id="c-max" inputMode="numeric" value={form.maxDiscount} onChange={set("maxDiscount")} placeholder="No cap" className={field} />
              </div>
            )}
            <div>
              <label htmlFor="c-min" className={label}>Minimum order (₹)</label>
              <input id="c-min" inputMode="numeric" value={form.minOrder} onChange={set("minOrder")} placeholder="None" className={field} />
            </div>
            <div>
              <label htmlFor="c-start" className={label}>Starts</label>
              <input id="c-start" type="date" value={form.startsAt} onChange={set("startsAt")} className={field} />
            </div>
            <div>
              <label htmlFor="c-end" className={label}>Ends (last day)</label>
              <input id="c-end" type="date" value={form.expiresAt} onChange={set("expiresAt")} className={field} />
            </div>
            <div>
              <label htmlFor="c-total" className={label}>Total uses</label>
              <input id="c-total" inputMode="numeric" value={form.usageLimit} onChange={set("usageLimit")} placeholder="Unlimited" className={field} />
            </div>
            <div>
              <label htmlFor="c-per" className={label}>Uses per customer</label>
              <input id="c-per" inputMode="numeric" value={form.perCustomerLimit} onChange={set("perCustomerLimit")} className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-note" className={label}>Internal note</label>
              <input id="c-note" value={form.note} onChange={set("note")} placeholder="Who it's for — only admins see this" maxLength={200} className={field} />
            </div>
          </div>
          {error && <p role="alert" className="mt-4 text-sm font-medium text-rose-dark">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Creating…" : "Create code"}
            </button>
            {coupons.length > 0 && (
              <button type="button" onClick={() => setCreating(false)} className="rounded-full border border-plum/15 px-6 py-2.5 text-sm font-semibold text-ink/70">
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-white">
          <FiPlus /> New redeem code
        </button>
      )}

      {rowError && <p role="alert" className="mt-4 text-sm font-medium text-rose-dark">{rowError}</p>}

      {coupons.length > 0 && (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {coupons.map((c) => (
            <li key={c.id} className="rounded-2xl border border-plum/10 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold tracking-wider text-plum">{c.code}</p>
                  <p className="text-sm font-semibold text-ink/70">{c.label}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[c.status]}`}>{c.status}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink/60">
                <dt>Minimum order</dt>
                <dd className="text-right font-medium text-ink/80">{c.minOrder ? inr(c.minOrder) : "None"}</dd>
                <dt>Valid</dt>
                <dd className="text-right font-medium text-ink/80">
                  {day(c.startsAt) ?? "Now"} – {day(c.expiresAt) ?? "No end date"}
                </dd>
                <dt>Used</dt>
                <dd className="text-right font-medium text-ink/80">
                  {c.usedCount}
                  {c.usageLimit ? ` of ${c.usageLimit}` : ""} · {c.perCustomerLimit}× per customer
                </dd>
              </dl>
              {c.note && <p className="mt-2 text-xs italic text-ink/50">{c.note}</p>}
              <div className="mt-3 flex gap-2 border-t border-plum/10 pt-3">
                <button type="button" onClick={() => toggle(c)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-plum hover:bg-cream">
                  {c.active ? <><FiPause /> Pause</> : <><FiPlay /> Resume</>}
                </button>
                {c.usedCount === 0 && (
                  <button type="button" onClick={() => remove(c)} className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink/50 hover:bg-rose-light hover:text-rose-dark">
                    <FiTrash2 /> Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
