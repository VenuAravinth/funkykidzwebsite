import { createHmac, timingSafeEqual } from "node:crypto";
import { adminEnv, isProduction } from "./env";

// Compact signed tokens (payload.signature, HMAC-SHA256) for the admin cookies.
// No fs access here so proxy.ts can verify signatures cheaply on every request.

export type GateToken = { typ: "gate"; exp: number };
export type PreAuthToken = { typ: "pre"; pid: string; exp: number };
export type SessionToken = { typ: "session"; sid: string; exp: number };
type AnyToken = GateToken | PreAuthToken | SessionToken;

const prefix = isProduction ? "__Host-" : "";
export const COOKIE = {
  gate: `${prefix}fk_admin_gate`,
  pre: `${prefix}fk_admin_pre`,
  session: `${prefix}fk_admin_session`,
};

export const cookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/",
  maxAge: maxAgeSeconds,
});

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");

function hmac(data: string, purpose: string): Buffer {
  // Purpose is mixed into the key so a token minted for one cookie can never be replayed as another.
  return createHmac("sha256", `${adminEnv.sessionSecret ?? ""}:${purpose}`).update(data).digest();
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  // Compare against a same-length buffer even on mismatch so timing doesn't leak the length.
  if (ab.length !== bb.length) {
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function signToken(payload: AnyToken): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(hmac(body, payload.typ))}`;
}

export function verifyToken<T extends AnyToken>(token: string | undefined, typ: T["typ"]): T | null {
  if (!token || !adminEnv.sessionSecret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (!safeEqual(sig, b64(hmac(body, typ)))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    if (payload.typ !== typ || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isValidAccessKey(candidate: string): boolean {
  return Boolean(adminEnv.accessKey) && safeEqual(candidate, adminEnv.accessKey!);
}
