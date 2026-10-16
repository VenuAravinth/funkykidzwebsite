"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";
import LoginForm from "@/components/auth/LoginForm";
import { getSignedInUserId, useAuth } from "./AuthContext";

type LoginModalValue = {
  /** Runs `action` now if signed in; otherwise opens the pop-up and runs it right after login. */
  requireLogin: (action?: () => void, reason?: string) => void;
  openLogin: (reason?: string) => void;
};

const LoginModalContext = createContext<LoginModalValue | null>(null);

const WELCOME_SEEN_KEY = "funkykidz:welcome-login-seen";
// Pages where an automatic pop-up would get in the way.
const NO_WELCOME = ["/login", "/checkout", "/privacy-policy", "/terms-conditions"];

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { ready: authReady } = useAuth();
  const welcomeChecked = useRef(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const pending = useRef<(() => void) | null>(null);

  const openLogin = useCallback((why?: string) => {
    setReason(why);
    setOpen(true);
  }, []);

  const requireLogin = useCallback(
    (action?: () => void, why?: string) => {
      if (getSignedInUserId()) {
        action?.();
        return;
      }
      pending.current = action ?? null;
      openLogin(why);
    },
    [openLogin]
  );

  const close = useCallback(() => {
    pending.current = null;
    setOpen(false);
  }, []);

  // The page underneath (selected size/colour, filters…) never unmounts, so the queued
  // action finishes exactly what the shopper was doing.
  const handleSuccess = useCallback(() => {
    const action = pending.current;
    pending.current = null;
    setOpen(false);
    if (action) setTimeout(action, 0);
  }, []);

  // Welcome pop-up once per visit for signed-out shoppers, after the server has confirmed
  // there's no session. Closable — browsing stays open.
  useEffect(() => {
    if (!authReady || welcomeChecked.current) return;
    welcomeChecked.current = true;
    if (getSignedInUserId() || NO_WELCOME.some((p) => pathname.startsWith(p))) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(WELCOME_SEEN_KEY) === "1";
      sessionStorage.setItem(WELCOME_SEEN_KEY, "1");
    } catch {
      /* storage blocked: still show once */
    }
    if (seen) return;
    const id = window.setTimeout(() => {
      if (!getSignedInUserId()) openLogin("Log in to shop, save favourites and track your orders.");
    }, 1200);
    return () => window.clearTimeout(id);
    // Only once, on the first page of the visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, close]);

  return (
    <LoginModalContext.Provider value={{ requireLogin, openLogin }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Log in">
          <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" />
          <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:max-w-md sm:rounded-3xl">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-ink/60 hover:bg-rose-light"
            >
              <FiX className="text-xl" />
            </button>
            {reason && <p className="px-8 pt-6 pr-14 text-sm font-medium text-rose-dark">{reason}</p>}
            {/* Remounts on every open so it always starts at the mobile-number step. */}
            <LoginForm onSuccess={handleSuccess} />
            <div className="px-8 pb-6">
              <button type="button" onClick={close} className="w-full py-2.5 text-sm font-semibold text-ink/50 hover:text-plum">
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal(): LoginModalValue {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used within LoginModalProvider");
  return ctx;
}
