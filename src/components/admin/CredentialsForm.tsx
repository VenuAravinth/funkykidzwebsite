"use client";

import { useState } from "react";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrengthMeter, { PasswordMatch } from "@/components/auth/PasswordStrengthMeter";


export default function CredentialsForm({ currentUsername, firstLogin }: { currentUsername: string; firstLogin: boolean }) {
  const [form, setForm] = useState({ currentPassword: "", newUsername: firstLogin ? "" : currentUsername, newPassword: "", confirm: "", totpCode: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (form.newPassword !== form.confirm) return setMessage({ ok: false, text: "New passwords don't match." });
    setBusy(true);
    const res = await fetch("/api/admin/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { error?: string } | undefined;
    setBusy(false);
    if (res?.status === 401 && !data?.error) return window.location.assign("/admin/login");
    if (!res?.ok) return setMessage({ ok: false, text: data?.error ?? "Could not update. Please try again." });
    setMessage({ ok: true, text: "Login updated. Other devices have been signed out." });
    setForm({ ...form, currentPassword: "", newPassword: "", confirm: "", totpCode: "" });
    if (firstLogin) window.location.assign("/admin/dashboard");
  }

  const input = "w-full rounded-xl border border-plum/15 px-4 py-2.5 text-sm outline-none transition focus:border-rose-dark focus:ring-4 focus:ring-rose/15";

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-6 ring-1 ring-plum/5 sm:p-8">
      <h2 className="text-lg font-bold text-plum">Change username &amp; password</h2>
      <p className="mt-1 text-sm text-ink/55">Requires your current password and a fresh Google Authenticator code.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink/60 sm:col-span-2">
          Current password
          <PasswordInput autoComplete="current-password" required value={form.currentPassword} onChange={set("currentPassword")} className={input} wrapperClassName="mt-1.5" />
        </label>
        <label className="text-xs font-semibold text-ink/60 sm:col-span-2">
          New username
          <input autoComplete="username" required minLength={4} maxLength={50} pattern="[a-zA-Z0-9._\-]{4,50}" value={form.newUsername} onChange={set("newUsername")} className={`mt-1.5 ${input}`} />
        </label>
        <label className="text-xs font-semibold text-ink/60">
          New password
          <PasswordInput autoComplete="new-password" required value={form.newPassword} onChange={set("newPassword")} className={input} wrapperClassName="mt-1.5" />
        </label>
        <label className="text-xs font-semibold text-ink/60">
          Confirm new password
          <PasswordInput autoComplete="new-password" required value={form.confirm} onChange={set("confirm")} className={input} wrapperClassName="mt-1.5" />
        </label>
      </div>

      <PasswordStrengthMeter password={form.newPassword} minLength={12} goodLength={12} personal={[form.newUsername]} />
      <PasswordMatch password={form.newPassword} confirm={form.confirm} />

      <label className="mt-5 block max-w-[220px] text-xs font-semibold text-ink/60">
        Authenticator code
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          value={form.totpCode}
          onChange={(e) => setForm({ ...form, totpCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          className={`mt-1.5 ${input} text-center font-mono tracking-[0.4em]`}
        />
      </label>

      {message && (
        <p role="status" className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-medium ${message.ok ? "bg-[#e8f6ee] text-[#1f7a4a]" : "bg-rose-light/60 text-rose-dark"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 rounded-xl bg-plum px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-light disabled:opacity-50"
      >
        {busy ? "Saving…" : "Update login"}
      </button>
    </form>
  );
}
