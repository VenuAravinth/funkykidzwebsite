"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderActions({
  orderNumber,
  status,
  paymentStatus,
  adminNote,
  statuses,
  paymentStatuses,
}: {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  adminNote: string;
  statuses: string[];
  paymentStatuses: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({ status, paymentStatus, adminNote });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = form.status !== status || form.paymentStatus !== paymentStatus || form.adminNote !== adminNote;

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    }).catch(() => null);
    setSaving(false);
    if (res?.status === 401) return window.location.assign("/admin/login");
    if (!res?.ok) return setMessage({ ok: false, text: "Could not save. Please try again." });
    setMessage({ ok: true, text: "Saved." });
    router.refresh();
  }

  const select = "mt-1.5 w-full rounded-xl border border-plum/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-dark";

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-plum/5">
      <h2 className="text-sm font-semibold text-ink/60">Update order</h2>
      <label className="mt-4 block text-xs font-semibold text-ink/55">
        Payment
        <select className={select} value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
          {paymentStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-xs font-semibold text-ink/55">
        Fulfilment status
        <select className={select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-xs font-semibold text-ink/55">
        Internal note
        <textarea
          rows={3}
          maxLength={1000}
          value={form.adminNote}
          onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
          placeholder="Courier, tracking number, customer request…"
          className="mt-1.5 w-full rounded-xl border border-plum/15 px-3 py-2.5 text-sm outline-none focus:border-rose-dark"
        />
      </label>
      <button
        type="button"
        onClick={save}
        disabled={!dirty || saving}
        className="mt-5 w-full rounded-xl bg-plum py-3 text-sm font-semibold text-white transition hover:bg-plum-light disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {message && <p className={`mt-3 text-sm font-medium ${message.ok ? "text-[#1f7a4a]" : "text-rose-dark"}`}>{message.text}</p>}
    </section>
  );
}
