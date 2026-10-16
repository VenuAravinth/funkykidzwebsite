import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { adminEnv, isAdminConfigured } from "./env";
import { decrypt, encrypt, getDummyHash, hashCode, hashPassword, randomId, randomOtp, verifyPassword } from "./crypto";
import { audit, getAdmin, updateAdmin, type AdminRecord, type PendingLogin } from "./adminStore";
import { sendAdminOtpEmail } from "./mailer";
import { rateLimit } from "./rateLimit";
import { COOKIE, cookieOptions, safeEqual, signToken, verifyToken, type PreAuthToken, type SessionToken } from "./tokens";
import { generateTotpSecret, otpauthUrl, totpQrDataUrl, verifyTotp } from "./totp";

// ---------------------------------------------------------------------------
// Policy
// ---------------------------------------------------------------------------

const PENDING_TTL_MS = 10 * 60_000; // whole login (password → OTP → TOTP) must finish in 10 min
const OTP_TTL_MS = 5 * 60_000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_GAP_MS = 30_000;
const OTP_MAX_SENDS = 5;
const TOTP_MAX_ATTEMPTS = 5;
const LOCK_AFTER_FAILURES = 5;
const LOCK_MS = 15 * 60_000;
const SESSION_MS = Math.max(1, adminEnv.sessionHours) * 3_600_000;

export type Stage = PendingLogin["stage"];

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

export function clientIp(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

const userAgent = (h: Headers) => (h.get("user-agent") ?? "").slice(0, 200);

/** Blocks cross-site form posts / CSRF: mutations must come from our own origin. */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}${"•".repeat(Math.max(2, user.length - 2))}@${domain}`;
};

// ---------------------------------------------------------------------------
// Pre-auth (between password and full session)
// ---------------------------------------------------------------------------

function setPreCookie(res: NextResponse, pid: string) {
  res.cookies.set(COOKIE.pre, signToken({ typ: "pre", pid, exp: Date.now() + PENDING_TTL_MS }), cookieOptions(PENDING_TTL_MS / 1000));
}

async function loadPending(req: NextRequest): Promise<{ admin: AdminRecord; pending: PendingLogin } | null> {
  const token = verifyToken<PreAuthToken>(req.cookies.get(COOKIE.pre)?.value, "pre");
  if (!token) return null;
  const admin = await getAdmin();
  const pending = admin.pending;
  if (!pending || !safeEqual(pending.pid, token.pid) || pending.exp < Date.now()) return null;
  return { admin, pending };
}

async function issueOtp(pid: string, ip: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = randomOtp();
  let sendTo = "";
  let error = "";
  await updateAdmin((a) => {
    const p = a.pending;
    if (!p || p.pid !== pid) return void (error = "Session expired. Please sign in again.");
    if (p.otpSentAt && Date.now() - p.otpSentAt < OTP_RESEND_GAP_MS) return void (error = "Please wait 30 seconds before requesting a new code.");
    if (p.otpSends >= OTP_MAX_SENDS) return void (error = "Too many codes requested. Please sign in again later.");
    p.otpHash = hashCode(code);
    p.otpExpires = Date.now() + OTP_TTL_MS;
    p.otpAttempts = 0;
    p.otpSentAt = Date.now();
    p.otpSends += 1;
    sendTo = adminEnv.email!;
  });
  if (error) return { ok: false, error };
  try {
    await sendAdminOtpEmail(sendTo, code, ip);
    return { ok: true };
  } catch (err) {
    console.error("[admin] failed to send OTP email", err);
    return { ok: false, error: "Could not send the verification email. Check the SMTP settings." };
  }
}

// ---------------------------------------------------------------------------
// Step 1 — username + password
// ---------------------------------------------------------------------------

export async function loginWithPassword(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`admin-login:${ip}`, 10, 15 * 60_000);
  if (!limit.ok) return json({ error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} min.` }, 429);

  const body = (await req.json().catch(() => null)) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username.trim().slice(0, 100) : "";
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  if (!username || !password) return json({ error: "Enter your username and password." }, 400);

  const admin = await getAdmin();
  if (admin.lockedUntil > Date.now()) {
    return json({ error: "Account temporarily locked after failed attempts. Try again later." }, 423);
  }

  const userMatches = safeEqual(username.toLowerCase(), admin.username.toLowerCase());
  // Always run the slow hash so a wrong username takes as long as a wrong password.
  const passwordOk = await verifyPassword(password, userMatches ? admin.passwordHash : await getDummyHash());

  if (!userMatches || !passwordOk) {
    await updateAdmin((a) => {
      a.failedLogins += 1;
      if (a.failedLogins >= LOCK_AFTER_FAILURES) {
        a.lockedUntil = Date.now() + LOCK_MS;
        a.failedLogins = 0;
        audit(a, "account locked after repeated failed logins", ip);
      } else {
        audit(a, "failed password login", ip);
      }
    });
    return json({ error: "Invalid username or password." }, 401);
  }

  const pid = randomId();
  await updateAdmin((a) => {
    a.failedLogins = 0;
    a.pending = { pid, stage: "otp", exp: Date.now() + PENDING_TTL_MS, otpAttempts: 0, otpSends: 0, totpAttempts: 0 };
    audit(a, "password accepted, email OTP requested", ip);
  });

  const sent = await issueOtp(pid, ip);
  if (!sent.ok) return json({ error: sent.error }, 500);

  const res = json({ stage: "otp" satisfies Stage, email: maskEmail(adminEnv.email!) });
  setPreCookie(res, pid);
  return res;
}

export async function resendOtp(req: NextRequest) {
  const ip = clientIp(req.headers);
  const loaded = await loadPending(req);
  if (!loaded || loaded.pending.stage !== "otp") return json({ error: "Session expired. Please sign in again." }, 401);
  const sent = await issueOtp(loaded.pending.pid, ip);
  return sent.ok ? json({ ok: true }) : json({ error: sent.error }, 429);
}

// ---------------------------------------------------------------------------
// Step 2 — email OTP
// ---------------------------------------------------------------------------

export async function verifyEmailOtp(req: NextRequest) {
  const ip = clientIp(req.headers);
  const loaded = await loadPending(req);
  if (!loaded || loaded.pending.stage !== "otp") return json({ error: "Session expired. Please sign in again." }, 401);

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.replace(/\s/g, "") : "";

  let outcome = "bad" as "ok" | "bad" | "expired" | "locked";
  let nextStage: Stage = "totp";
  await updateAdmin((a) => {
    const p = a.pending;
    if (!p || p.pid !== loaded.pending.pid || p.stage !== "otp") return void (outcome = "expired");
    if (!p.otpHash || !p.otpExpires || p.otpExpires < Date.now()) return void (outcome = "expired");
    if (p.otpAttempts >= OTP_MAX_ATTEMPTS) {
      a.pending = null;
      audit(a, "login cancelled: too many wrong email codes", ip);
      return void (outcome = "locked");
    }
    if (/^\d{6}$/.test(code) && safeEqual(hashCode(code), p.otpHash)) {
      p.otpHash = undefined;
      nextStage = a.totp ? "totp" : "totp_setup";
      p.stage = nextStage;
      audit(a, "email OTP verified", ip);
      outcome = "ok";
    } else {
      p.otpAttempts += 1;
    }
  });

  if (outcome === "expired") return json({ error: "Code expired. Request a new one." }, 401);
  if (outcome === "locked") return json({ error: "Too many wrong codes. Please sign in again." }, 401);
  if (outcome === "bad") return json({ error: "Incorrect code." }, 401);
  return json({ stage: nextStage });
}

// ---------------------------------------------------------------------------
// Step 3 — Google Authenticator (setup on first login, then every login)
// ---------------------------------------------------------------------------

export async function startTotpSetup(req: NextRequest) {
  const loaded = await loadPending(req);
  if (!loaded || loaded.pending.stage !== "totp_setup") return json({ error: "Session expired. Please sign in again." }, 401);

  // Reuse the same secret if the page is refreshed mid-setup, so an already-scanned QR stays valid.
  let secret = loaded.pending.setupSecretEnc ? decrypt(loaded.pending.setupSecretEnc) : "";
  if (!secret) {
    secret = generateTotpSecret();
    await updateAdmin((a) => {
      if (a.pending?.pid === loaded.pending.pid) a.pending.setupSecretEnc = encrypt(secret);
    });
  }
  const url = otpauthUrl(secret, loaded.admin.username);
  return json({ qr: await totpQrDataUrl(url), secret: secret.match(/.{1,4}/g)?.join(" ") ?? secret });
}

export async function verifyTotpAndSignIn(req: NextRequest) {
  const ip = clientIp(req.headers);
  const loaded = await loadPending(req);
  if (!loaded || (loaded.pending.stage !== "totp" && loaded.pending.stage !== "totp_setup")) {
    return json({ error: "Session expired. Please sign in again." }, 401);
  }

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.replace(/\s/g, "") : "";

  const sid = randomId(24);
  let outcome = "bad" as "ok" | "bad" | "expired" | "locked";
  let mustChange = false;
  await updateAdmin((a) => {
    const p = a.pending;
    if (!p || p.pid !== loaded.pending.pid) return void (outcome = "expired");
    if (p.totpAttempts >= TOTP_MAX_ATTEMPTS) {
      a.pending = null;
      audit(a, "login cancelled: too many wrong authenticator codes", ip);
      return void (outcome = "locked");
    }

    if (p.stage === "totp_setup") {
      if (!p.setupSecretEnc) return void (outcome = "expired");
      const secret = decrypt(p.setupSecretEnc);
      const step = verifyTotp(secret, code);
      if (step === null) return void (p.totpAttempts += 1);
      a.totp = { secretEnc: p.setupSecretEnc, enrolledAt: Date.now(), lastUsedStep: step };
      audit(a, "Google Authenticator enrolled", ip);
    } else {
      if (!a.totp) return void (outcome = "expired");
      const step = verifyTotp(decrypt(a.totp.secretEnc), code, a.totp.lastUsedStep);
      if (step === null) return void (p.totpAttempts += 1);
      a.totp.lastUsedStep = step;
    }

    a.pending = null;
    a.sessions.push({ sid, createdAt: Date.now(), exp: Date.now() + SESSION_MS, ip, ua: userAgent(req.headers) });
    audit(a, "signed in", ip);
    mustChange = a.mustChangeCredentials;
    outcome = "ok";
  });

  if (outcome === "expired") return json({ error: "Session expired. Please sign in again." }, 401);
  if (outcome === "locked") return json({ error: "Too many wrong codes. Please sign in again." }, 401);
  if (outcome === "bad") return json({ error: "Incorrect authenticator code." }, 401);

  const res = json({ ok: true, redirect: mustChange ? "/admin/settings?first=1" : "/admin/dashboard" });
  res.cookies.set(COOKIE.session, signToken({ typ: "session", sid, exp: Date.now() + SESSION_MS }), cookieOptions(SESSION_MS / 1000));
  res.cookies.delete(COOKIE.pre);
  return res;
}

export async function loginStatus(req: NextRequest) {
  const loaded = await loadPending(req);
  if (!loaded) return json({ stage: "password" });
  return json({ stage: loaded.pending.stage, email: maskEmail(adminEnv.email!) });
}

// ---------------------------------------------------------------------------
// Sessions & guards
// ---------------------------------------------------------------------------

async function sessionFrom(token: string | undefined) {
  if (!isAdminConfigured()) return null;
  const parsed = verifyToken<SessionToken>(token, "session");
  if (!parsed) return null;
  const admin = await getAdmin();
  // Signature alone isn't enough: the session must still exist server-side (logout / password change revoke it).
  const session = admin.sessions.find((s) => safeEqual(s.sid, parsed.sid) && s.exp > Date.now());
  return session ? { admin, session } : null;
}

/** Full (store-backed) session check without redirecting. */
export async function getAdminSession() {
  const store = await cookies();
  return sessionFrom(store.get(COOKIE.session)?.value);
}

/** For server components under /admin. Redirects to login when not signed in. */
export async function requireAdminPage(opts: { allowMustChange?: boolean } = {}) {
  const store = await cookies();
  const ctx = await sessionFrom(store.get(COOKIE.session)?.value);
  if (!ctx) redirect("/admin/login");
  if (ctx.admin.mustChangeCredentials && !opts.allowMustChange) redirect("/admin/settings?first=1");
  return ctx;
}

/** For /api/admin route handlers. Returns a 401 response when not authorised. */
export async function requireAdminApi(req: NextRequest, opts: { mutation?: boolean } = {}) {
  if (opts.mutation && !sameOrigin(req)) return { error: json({ error: "Forbidden" }, 403) } as const;
  const ctx = await sessionFrom(req.cookies.get(COOKIE.session)?.value);
  if (!ctx) return { error: json({ error: "Unauthorized" }, 401) } as const;
  return { ctx } as const;
}

export async function logout(req: NextRequest) {
  const parsed = verifyToken<SessionToken>(req.cookies.get(COOKIE.session)?.value, "session");
  if (parsed) {
    const ip = clientIp(req.headers);
    await updateAdmin((a) => {
      a.sessions = a.sessions.filter((s) => s.sid !== parsed.sid);
      audit(a, "signed out", ip);
    });
  }
  const res = json({ ok: true });
  res.cookies.delete(COOKIE.session);
  res.cookies.delete(COOKIE.pre);
  return res;
}

// ---------------------------------------------------------------------------
// Account settings
// ---------------------------------------------------------------------------

export function passwordProblems(password: string, username: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Use upper and lower case letters, a number and a symbol.";
  }
  if (password.toLowerCase().includes(username.toLowerCase())) return "Password must not contain the username.";
  if (adminEnv.defaultPassword && password === adminEnv.defaultPassword) return "Choose a password different from the default one.";
  return null;
}

export async function changeCredentials(req: NextRequest) {
  const guard = await requireAdminApi(req, { mutation: true });
  if ("error" in guard) return guard.error;
  const ip = clientIp(req.headers);

  const limit = rateLimit(`admin-account:${ip}`, 10, 15 * 60_000);
  if (!limit.ok) return json({ error: "Too many attempts. Try again later." }, 429);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const str = (k: string, max = 200) => (typeof body?.[k] === "string" ? (body[k] as string).slice(0, max) : "");
  const currentPassword = str("currentPassword");
  const newUsername = str("newUsername", 50).trim();
  const newPassword = str("newPassword");
  const totpCode = str("totpCode", 10).replace(/\s/g, "");

  if (!/^[a-zA-Z0-9._-]{4,50}$/.test(newUsername)) {
    return json({ error: "Username must be 4–50 characters: letters, numbers, dot, dash or underscore." }, 400);
  }
  const problem = passwordProblems(newPassword, newUsername);
  if (problem) return json({ error: problem }, 400);

  const admin = guard.ctx.admin;
  if (!(await verifyPassword(currentPassword, admin.passwordHash))) return json({ error: "Current password is incorrect." }, 401);
  if (!admin.totp) return json({ error: "Authenticator not set up." }, 400);
  const step = verifyTotp(decrypt(admin.totp.secretEnc), totpCode, admin.totp.lastUsedStep);
  if (step === null) return json({ error: "Incorrect authenticator code." }, 401);

  const passwordHash = await hashPassword(newPassword);
  const keepSid = guard.ctx.session.sid;
  await updateAdmin((a) => {
    a.username = newUsername;
    a.passwordHash = passwordHash;
    a.mustChangeCredentials = false;
    a.credentialsUpdatedAt = Date.now();
    if (a.totp) a.totp.lastUsedStep = step;
    // Sign out every other device.
    a.sessions = a.sessions.filter((s) => s.sid === keepSid);
    audit(a, "username/password changed; other sessions revoked", ip);
  });
  return json({ ok: true });
}
