"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheckCircle, FiSmartphone } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_CUSTOMER_NAME, formatPhone, isValidPhone, normalizePhone, type User } from "@/lib/auth";
import AlreadySignedIn from "./AlreadySignedIn";

type Step = "phone" | "otp" | "done";

const input =
  "w-full rounded-xl border border-plum/15 bg-cream/40 px-4 py-3 text-base text-ink outline-none transition-colors focus:border-rose-dark";
const primaryButton =
  "w-full rounded-full bg-rose px-7 py-3.5 font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100";

// One login for everyone: mobile number → OTP. New numbers get a profile automatically.
export default function LoginForm({
  onSuccess,
}: {
  // Inside the pop-up: called after login instead of redirecting.
  onSuccess?: () => void;
} = {}) {
  const router = useRouter();
  const { currentUser, isAuthenticated, sendOtp, verifyOtp, logout } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [welcome, setWelcome] = useState<{ user: User; isNew: boolean } | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  // Ticks the "Resend in Ns" countdown.
  useEffect(() => {
    if (step !== "otp" || resendAt <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [step, resendAt]);

  useEffect(() => {
    if (step === "otp") codeRef.current?.focus();
  }, [step]);

  // After login: page version returns to where the shopper came from; pop-up version hands back.
  useEffect(() => {
    if (step !== "done" || !welcome) return;
    const timer = window.setTimeout(finish, welcome.isNew ? 3500 : 1500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, welcome]);

  function finish(target?: string) {
    if (onSuccess) {
      onSuccess();
      if (target) router.push(target);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    router.push(target ?? safeNext);
  }

  async function requestCode() {
    setError("");
    setBusy(true);
    const result = await sendOtp(phone);
    setBusy(false);
    if (!result.ok) {
      if (result.resendIn) {
        setResendAt(Date.now() + result.resendIn * 1000);
        setNow(Date.now());
      }
      setError(result.error);
      return false;
    }
    setDevCode(result.devCode);
    setResendAt(Date.now() + result.resendIn * 1000);
    setNow(Date.now());
    return true;
  }

  async function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) return setError("Please enter a valid 10-digit mobile number.");
    setPhone(normalizePhone(phone));
    if (await requestCode()) {
      setCode("");
      setStep("otp");
    }
  }

  async function submitCode(value: string) {
    if (value.length !== 6 || busy) return;
    setError("");
    setBusy(true);
    const result = await verifyOtp(phone, value);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setCode("");
      codeRef.current?.focus();
      if (result.expired) setResendAt(0);
      return;
    }
    setWelcome({ user: result.user, isNew: result.isNew });
    setStep("done");
  }

  async function handleResend() {
    setCode("");
    if (await requestCode()) codeRef.current?.focus();
  }

  if (isAuthenticated && currentUser && step !== "done" && !onSuccess) {
    return <AlreadySignedIn user={currentUser} onLogout={logout} />;
  }

  if (step === "done" && welcome) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center sm:p-10" role="status">
        <FiCheckCircle className="mx-auto text-5xl text-emerald-500" />
        {welcome.isNew ? (
          <>
            <h3 className="mt-4 font-serif-display text-2xl font-bold text-plum">Welcome to FunkyKidz!</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink/60">
              Your profile is ready. We&apos;ve called you <strong className="text-plum">{DEFAULT_CUSTOMER_NAME}</strong> for now. You
              can change your name any time in My Account.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => finish("/profile")} className="rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30">
                Set up my profile
              </button>
              <button type="button" onClick={() => finish()} className="rounded-full border border-plum/15 px-6 py-3 text-sm font-semibold text-plum hover:border-rose-dark">
                Continue shopping
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="mt-4 font-serif-display text-2xl font-bold text-plum">Welcome back, {welcome.user.name}!</h3>
            <p className="mt-2 text-sm text-ink/60">You&apos;re logged in. Taking you back&hellip;</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8">
      {step === "phone" ? (
        <>
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-dark">Login</span>
          <h2 className="mt-2 font-serif-display text-3xl font-bold text-plum">Enter your mobile number</h2>
          <p className="mt-2 text-sm text-ink/60">We&apos;ll text you a 6-digit code. New here? Your account is created automatically.</p>

          <form onSubmit={handlePhoneSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="login-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                Mobile number
              </label>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-plum/15 bg-cream/40 transition-colors focus-within:border-rose-dark">
                <span className="flex items-center gap-1.5 border-r border-plum/10 px-3 text-base font-semibold text-ink/60">
                  <FiSmartphone className="text-rose-dark" /> +91
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  maxLength={14}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^\d+\s]/g, ""));
                    setError("");
                  }}
                  placeholder="98765 43210"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className="w-full min-w-0 bg-transparent px-3 py-3 text-base tracking-wide text-ink outline-none"
                />
              </div>
            </div>

            {error && (
              <p id="login-error" role="alert" className="text-sm font-medium text-rose-dark">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy || normalizePhone(phone).length < 10} className={primaryButton}>
              {busy ? "Sending code…" : "Send OTP"}
            </button>
          </form>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setError("");
              setCode("");
            }}
            className="-ml-1 flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-rose-dark"
          >
            <FiArrowLeft /> Change number
          </button>
          <h2 className="mt-3 font-serif-display text-3xl font-bold text-plum">Verify OTP</h2>
          <p className="mt-2 text-sm text-ink/60">
            Enter the 6-digit code sent to <strong className="whitespace-nowrap text-plum">{formatPhone(phone)}</strong>
          </p>

          {devCode && (
            <p className="mt-4 rounded-xl border border-dashed border-gold bg-gold/10 px-4 py-2.5 text-xs text-ink/70">
              Development mode (no SMS service yet): your code is <strong className="font-mono text-sm tracking-widest text-plum">{devCode}</strong>
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitCode(code);
            }}
            className="mt-6 flex flex-col gap-4"
            noValidate
          >
            <div>
              <label htmlFor="login-otp" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                One-time code
              </label>
              <input
                id="login-otp"
                ref={codeRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                disabled={busy}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(digits);
                  setError("");
                  // Submits as soon as the last digit is typed or the SMS code is auto-filled.
                  if (digits.length === 6) void submitCode(digits);
                }}
                placeholder="••••••"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "otp-error" : undefined}
                className={`${input} text-center font-mono text-2xl tracking-[0.6em] placeholder:tracking-[0.6em]`}
              />
            </div>

            {error && (
              <p id="otp-error" role="alert" className="text-sm font-medium text-rose-dark">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy || code.length !== 6} className={primaryButton}>
              {busy ? "Verifying…" : "Verify & continue"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            Didn&apos;t get it?{" "}
            {resendIn > 0 ? (
              <span className="font-semibold text-ink/45">Resend in {resendIn}s</span>
            ) : (
              <button type="button" onClick={handleResend} disabled={busy} className="font-semibold text-rose-dark underline underline-offset-4 disabled:opacity-60">
                Resend code
              </button>
            )}
          </p>
        </>
      )}
    </div>
  );
}
