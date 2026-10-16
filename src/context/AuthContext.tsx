"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/auth";

type Outcome = { ok: true } | { ok: false; error: string };
export type SendOtpOutcome = { ok: true; resendIn: number; devCode?: string } | { ok: false; error: string; resendIn?: number };
export type VerifyOtpOutcome = { ok: true; user: User; isNew: boolean } | { ok: false; error: string; expired?: boolean };

type AuthContextValue = {
  currentUser: User | null;
  isAuthenticated: boolean;
  /** False until the session check with the server has finished. */
  ready: boolean;
  /** Texts a login code to the number. */
  sendOtp: (phone: string) => Promise<SendOtpOutcome>;
  /** Checks the code and signs in; creates the profile if the number is new. */
  verifyOtp: (phone: string, code: string) => Promise<VerifyOtpOutcome>;
  updateName: (name: string) => Promise<Outcome>;
  /** `dataUrl` null removes the photo. */
  updateAvatar: (dataUrl: string | null) => Promise<Outcome>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Mirrors the session for code that runs outside React renders (e.g. an action queued
// behind the login pop-up), so it always sees who is signed in right now.
let signedInUserId: string | null = null;
export const getSignedInUserId = () => signedInUserId;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const apply = useCallback((user: User | null) => {
    signedInUserId = user?.id ?? null;
    setCurrentUser(user);
  }, []);

  // The session lives in an HTTP-only cookie; ask the server who we are.
  useEffect(() => {
    let alive = true;
    api<{ user: User | null }>("/api/auth/me").then((res) => {
      if (!alive) return;
      apply(res.ok ? res.data.user : null);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [apply]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      ready,
      sendOtp: async (phone) => {
        const res = await api<{ resendIn: number; devCode?: string }>("/api/auth/otp/send", { body: { phone } });
        if (!res.ok) {
          const resendIn = typeof res.body?.resendIn === "number" ? res.body.resendIn : undefined;
          return { ok: false, error: res.error, resendIn };
        }
        return { ok: true, resendIn: res.data.resendIn, devCode: res.data.devCode };
      },
      verifyOtp: async (phone, code) => {
        const res = await api<{ user: User; isNew: boolean }>("/api/auth/otp/verify", { body: { phone, code } });
        if (!res.ok) return { ok: false, error: res.error, expired: res.body?.expired === true };
        apply(res.data.user);
        return { ok: true, user: res.data.user, isNew: res.data.isNew };
      },
      updateName: async (name) => {
        const res = await api<{ user: User }>("/api/account", { method: "PATCH", body: { name } });
        if (!res.ok) return { ok: false, error: res.error };
        apply(res.data.user);
        return { ok: true };
      },
      updateAvatar: async (dataUrl) => {
        const res = await api<{ user: User }>(
          "/api/account/avatar",
          dataUrl ? { method: "PUT", body: { dataUrl } } : { method: "DELETE" }
        );
        if (!res.ok) return { ok: false, error: res.error };
        apply(res.data.user);
        return { ok: true };
      },
      logout: async () => {
        await api("/api/auth/logout", { method: "POST", body: {} });
        apply(null);
      },
    }),
    [currentUser, ready, apply]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
