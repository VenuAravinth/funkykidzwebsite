"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FiLock, FiMail, FiShield, FiSmartphone, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import logo from "@/assets/img/logo/logo.png";

type Stage = "loading" | "password" | "otp" | "totp_setup" | "totp";

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data: data as Record<string, string> };
}

const STEPS: { id: Stage; label: string }[] = [
  { id: "password", label: "Password" },
  { id: "otp", label: "Email code" },
  { id: "totp", label: "Authenticator" },
];

function CodeInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <input
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="••••••"
      aria-label="6-digit code"
      className="w-full rounded-xl border border-plum/15 bg-white px-4 py-3.5 text-center font-mono text-2xl tracking-[0.6em] text-plum outline-none transition focus:border-rose-dark focus:ring-4 focus:ring-rose/15"
    />
  );
}

export default function AdminLoginFlow() {
  const [stage, setStage] = useState<Stage>("loading");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const setupRequested = useRef(false);

  // Resume where the admin left off (e.g. page refreshed while waiting for the email).
  useEffect(() => {
    fetch("/api/admin/auth/status", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d: { stage?: Stage; email?: string }) => {
        setEmail(d.email ?? "");
        setStage(d.stage && d.stage !== "loading" ? d.stage : "password");
      })
      .catch(() => setStage("password"));
  }, []);

  useEffect(() => {
    if (stage !== "totp_setup" || setupRequested.current) return;
    setupRequested.current = true;
    fetch("/api/admin/auth/totp-setup", { credentials: "same-origin" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Could not start authenticator setup.");
        setSetup(d);
      })
      .catch((e: Error) => {
        setError(e.message);
        setStage("password");
      });
  }, [stage]);

  const restart = (message = "") => {
    setStage("password");
    setCode("");
    setPassword("");
    setSetup(null);
    setupRequested.current = false;
    setError(message);
    setInfo("");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (stage === "password") {
        const { ok, data } = await post("/api/admin/auth/login", { username, password });
        if (!ok) return setError(data.error ?? "Sign in failed.");
        setPassword("");
        setEmail(data.email ?? "");
        setStage("otp");
      } else if (stage === "otp") {
        const { ok, data } = await post("/api/admin/auth/verify-otp", { code });
        if (!ok) {
          if (/sign in again|expired/i.test(data.error ?? "") && !/new one/i.test(data.error ?? "")) return restart(data.error);
          return setError(data.error ?? "Incorrect code.");
        }
        setCode("");
        setStage(data.stage as Stage);
      } else if (stage === "totp" || stage === "totp_setup") {
        const { ok, data } = await post("/api/admin/auth/totp", { code });
        if (!ok) {
          if (/sign in again/i.test(data.error ?? "")) return restart(data.error);
          return setError(data.error ?? "Incorrect code.");
        }
        window.location.assign(data.redirect ?? "/admin/dashboard");
        return;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    setInfo("");
    const { ok, data } = await post("/api/admin/auth/resend-otp");
    if (ok) setInfo("A new code has been sent.");
    else if (/sign in again/i.test(data.error ?? "")) restart(data.error);
    else setError(data.error ?? "Could not resend the code.");
  }

  const stepIndex = stage === "totp_setup" ? 2 : STEPS.findIndex((s) => s.id === stage);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div aria-hidden className="absolute -left-32 -top-32 h-96 w-96 animate-blob bg-rose/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] animate-blob bg-plum/15 blur-3xl [animation-delay:-6s]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-plum/10 ring-1 ring-plum/5 sm:p-10"
      >
        <div className="flex items-center gap-3">
          <Image src={logo} alt="" className="h-11 w-auto" priority />
          <div>
            <p className="font-serif-display text-xl font-bold text-plum">FunkyKidz</p>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-rose-dark">ADMIN CONSOLE</p>
          </div>
        </div>

        <ol className="mt-8 flex items-center gap-2" aria-label="Sign-in steps">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex flex-1 flex-col gap-1.5">
              <span className={`h-1.5 rounded-full transition-colors duration-500 ${i <= stepIndex ? "bg-rose-dark" : "bg-plum/10"}`} />
              <span className={`text-[11px] font-semibold ${i <= stepIndex ? "text-plum" : "text-ink/35"}`}>{s.label}</span>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.form
            key={stage}
            onSubmit={submit}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            {stage === "loading" && <p className="py-10 text-center text-sm text-ink/50">Loading…</p>}

            {stage === "password" && (
              <>
                <h1 className="text-2xl font-bold text-plum">Sign in</h1>
                <p className="mt-1 text-sm text-ink/55">Authorised staff only. All activity is logged.</p>
                <label className="mt-6 block text-xs font-semibold text-ink/60" htmlFor="admin-username">
                  Username
                </label>
                <div className="relative mt-1.5">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    id="admin-username"
                    autoComplete="username"
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-plum/15 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-rose-dark focus:ring-4 focus:ring-rose/15"
                  />
                </div>
                <label className="mt-4 block text-xs font-semibold text-ink/60" htmlFor="admin-password">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-plum/15 py-3 pl-11 pr-11 text-sm outline-none transition focus:border-rose-dark focus:ring-4 focus:ring-rose/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-ink/40 hover:bg-plum/5 hover:text-plum"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </>
            )}

            {stage === "otp" && (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-light text-xl text-rose-dark">
                  <FiMail />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-plum">Check your email</h1>
                <p className="mt-1 text-sm text-ink/55">
                  We sent a 6-digit code to <span className="font-semibold text-plum">{email || "your registered email"}</span>. It
                  expires in 5 minutes.
                </p>
                <div className="mt-6">
                  <CodeInput value={code} onChange={setCode} autoFocus />
                </div>
                <button type="button" onClick={resend} className="mt-3 text-xs font-semibold text-rose-dark hover:underline">
                  Resend code
                </button>
              </>
            )}

            {stage === "totp_setup" && (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-light text-xl text-rose-dark">
                  <FiSmartphone />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-plum">Set up Google Authenticator</h1>
                <p className="mt-1 text-sm text-ink/55">
                  One-time setup. Open Google Authenticator (or any authenticator app), tap <b>+</b> → <b>Scan a QR code</b>, then
                  enter the 6-digit code it shows.
                </p>
                <div className="mt-5 grid place-items-center rounded-2xl bg-[#f6f3f8] p-4">
                  {setup ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data: URL generated server-side
                    <img src={setup.qr} alt="Authenticator setup QR code" width={200} height={200} className="rounded-lg bg-white p-2" />
                  ) : (
                    <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-white" />
                  )}
                  {setup && (
                    <details className="mt-3 w-full text-center text-xs text-ink/55">
                      <summary className="cursor-pointer font-semibold">Can&apos;t scan? Enter this key</summary>
                      <code className="mt-2 block select-all break-all font-mono text-sm text-plum">{setup.secret}</code>
                    </details>
                  )}
                </div>
                <div className="mt-5">
                  <CodeInput value={code} onChange={setCode} autoFocus />
                </div>
              </>
            )}

            {stage === "totp" && (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-light text-xl text-rose-dark">
                  <FiShield />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-plum">Authenticator code</h1>
                <p className="mt-1 text-sm text-ink/55">Enter the current 6-digit code from Google Authenticator.</p>
                <div className="mt-6">
                  <CodeInput value={code} onChange={setCode} autoFocus />
                </div>
              </>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-rose-light/60 px-4 py-2.5 text-sm font-medium text-rose-dark">
                {error}
              </p>
            )}
            {info && <p className="mt-4 rounded-xl bg-[#e8f6ee] px-4 py-2.5 text-sm font-medium text-[#1f7a4a]">{info}</p>}

            {stage !== "loading" && (
              <button
                type="submit"
                disabled={busy || (stage !== "password" && code.length !== 6)}
                className="mt-6 w-full rounded-xl bg-plum py-3.5 text-sm font-semibold text-white shadow-lg shadow-plum/20 transition hover:bg-plum-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Please wait…" : stage === "password" ? "Continue" : stage === "totp_setup" ? "Verify & finish setup" : "Verify"}
              </button>
            )}
            {stage !== "password" && stage !== "loading" && (
              <button type="button" onClick={() => restart()} className="mt-3 w-full text-xs font-semibold text-ink/45 hover:text-plum">
                Start over
              </button>
            )}
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
