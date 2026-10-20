import "server-only";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import type { NextRequest } from "next/server";
import { collections, type UserDoc } from "./db";
import { isProduction } from "./env";
import { rateLimit } from "./rateLimit";
import { sendLoginOtp, whatsappConfigured } from "./whatsapp";
import { clientIp, json, sameOrigin } from "./adminAuth";

// Customer login is mobile number + WhatsApp OTP only — no passwords, no separate sign-up.
// A verified number that isn't in `users` yet gets a new profile on the spot.
// Sessions are opaque tokens in an HTTP-only cookie; only their SHA-256 is stored in `sessions`.

export const SESSION_COOKIE = isProduction ? "__Host-fk_session" : "fk_session";
const SESSION_DAYS = 30;

export const DEFAULT_CUSTOMER_NAME = "Lucky Customer";

const OTP_TTL_MS = 5 * 60_000;
const OTP_RESEND_GAP_MS = 30_000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MS = 60 * 60_000;
const OTP_MAX_SENDS_PER_WINDOW = 5;

export type PublicUser = { id: string; name: string; phone: string; avatarUrl: string | null; createdAt: string };

export const toPublicUser = (u: UserDoc): PublicUser => ({
  id: u._id.toHexString(),
  name: u.name,
  phone: u.phone,
  // Version in the URL so a new photo isn't hidden behind the browser cache.
  avatarUrl: u.avatarVersion ? `/api/account/avatar?v=${u.avatarVersion}` : null,
  createdAt: u.createdAt.toISOString(),
});

const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");
const hashOtp = (salt: string, code: string) => createHash("sha256").update(`${salt}:${code}`).digest("base64url");
export const normalizePhone = (phone: string) => phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
const isValidPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);

export function validateName(input: unknown) {
  const name = typeof input === "string" ? input.trim().replace(/\s+/g, " ").slice(0, 60) : "";
  if (name.length < 2) return { error: "Please enter a name with at least 2 characters." } as const;
  return { name } as const;
}

async function startSession(userId: ObjectId, ua: string) {
  const { sessions } = await collections();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  await sessions.insertOne({ _id: new ObjectId(), tokenHash: hashToken(token), userId, createdAt: now, expiresAt, ua: ua.slice(0, 200) });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

/** The signed-in customer for this request, or null. */
export async function currentUser(): Promise<UserDoc | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { sessions, users } = await collections();
  const session = await sessions.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return users.findOne({ _id: session.userId });
}

/** For route handlers: the user, or a ready-made 401 response. */
export async function requireUser(): Promise<{ user: UserDoc } | { error: Response }> {
  const user = await currentUser();
  return user ? { user } : { error: json({ error: "Please log in to continue." }, 401) };
}

/** Same-origin check for every customer mutation (blocks cross-site form posts). */
export function guardMutation(req: NextRequest): Response | null {
  return sameOrigin(req) ? null : json({ error: "Forbidden" }, 403);
}

/** Step 1: text a 6-digit code to the number. */
export async function sendOtp(req: NextRequest, body: Record<string, unknown>) {
  const phone = normalizePhone(typeof body.phone === "string" ? body.phone : "");
  if (!isValidPhone(phone)) return json({ error: "Please enter a valid 10-digit mobile number." }, 400);

  const ipLimit = rateLimit(`otp-send-ip:${clientIp(req.headers)}`, 20, OTP_WINDOW_MS);
  if (!ipLimit.ok) return json({ error: "Too many codes requested from this network. Please try again later." }, 429);

  const { loginOtps } = await collections();
  const now = new Date();
  const existing = await loginOtps.findOne({ _id: phone });
  if (existing) {
    const wait = Math.ceil((existing.lastSentAt.getTime() + OTP_RESEND_GAP_MS - now.getTime()) / 1000);
    if (wait > 0) return json({ error: `Please wait ${wait} seconds before requesting a new code.`, resendIn: wait }, 429);
  }
  const inWindow = existing && now.getTime() - existing.windowStart.getTime() < OTP_WINDOW_MS;
  if (inWindow && existing.sends >= OTP_MAX_SENDS_PER_WINDOW) {
    return json({ error: "Too many codes requested for this number. Please try again in an hour." }, 429);
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = randomBytes(16).toString("base64url");
  const windowStart = inWindow ? existing.windowStart : now;
  await loginOtps.updateOne(
    { _id: phone },
    {
      $set: {
        codeHash: hashOtp(salt, code),
        salt,
        codeExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
        expiresAt: new Date(windowStart.getTime() + OTP_WINDOW_MS),
        attempts: 0,
        sends: inWindow ? existing.sends + 1 : 1,
        windowStart,
        lastSentAt: now,
      },
    },
    { upsert: true }
  );

  try {
    await sendLoginOtp(phone, code);
  } catch (err) {
    console.error("[login] OTP send failed", err);
    await loginOtps.updateOne({ _id: phone }, { $set: { codeHash: null } });
    return json({ error: "We couldn't send the code right now. Please try again in a moment." }, 503);
  }

  return json({
    ok: true,
    resendIn: OTP_RESEND_GAP_MS / 1000,
    // Development without WhatsApp configured: show the code so login can be tested.
    ...(!isProduction && !whatsappConfigured ? { devCode: code } : {}),
  });
}

/** Step 2: check the code, then sign in — creating the customer profile on first login. */
export async function verifyOtp(req: NextRequest, body: Record<string, unknown>) {
  const phone = normalizePhone(typeof body.phone === "string" ? body.phone : "");
  const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";
  if (!isValidPhone(phone)) return json({ error: "Please enter a valid 10-digit mobile number." }, 400);
  if (code.length !== 6) return json({ error: "Enter the 6-digit code we sent you." }, 400);

  const ipLimit = rateLimit(`otp-verify-ip:${clientIp(req.headers)}`, 60, 15 * 60_000);
  if (!ipLimit.ok) return json({ error: "Too many attempts. Please wait a few minutes and try again." }, 429);

  const { loginOtps, users } = await collections();
  const otp = await loginOtps.findOne({ _id: phone });
  if (!otp?.codeHash || otp.codeExpiresAt < new Date()) {
    return json({ error: "This code has expired. Please request a new one.", expired: true }, 400);
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    return json({ error: "Too many incorrect attempts. Please request a new code.", expired: true }, 429);
  }

  const expected = Buffer.from(otp.codeHash);
  const given = Buffer.from(hashOtp(otp.salt, code));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    const updated = await loginOtps.findOneAndUpdate({ _id: phone }, { $inc: { attempts: 1 } }, { returnDocument: "after" });
    const left = OTP_MAX_ATTEMPTS - (updated?.attempts ?? OTP_MAX_ATTEMPTS);
    return json(
      left > 0
        ? { error: `Incorrect code. ${left} ${left === 1 ? "attempt" : "attempts"} left.` }
        : { error: "Too many incorrect attempts. Please request a new code.", expired: true },
      400
    );
  }
  // Single use: a correct code can't be replayed.
  await loginOtps.updateOne({ _id: phone }, { $set: { codeHash: null } });

  const now = new Date();
  let user = await users.findOneAndUpdate({ phone }, { $set: { lastLoginAt: now } }, { returnDocument: "after" });
  let isNew = false;
  if (!user) {
    const doc: UserDoc = { _id: new ObjectId(), name: DEFAULT_CUSTOMER_NAME, phone, createdAt: now, lastLoginAt: now };
    try {
      await users.insertOne(doc);
      user = doc;
      isNew = true;
    } catch (err) {
      // Two verifications racing for the same new number: use the profile the other one created.
      if ((err as { code?: number }).code !== 11000) throw err;
      user = await users.findOne({ phone });
      if (!user) throw err;
    }
  }

  await startSession(user._id, req.headers.get("user-agent") ?? "");
  return json({ user: toPublicUser(user), isNew });
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const { sessions } = await collections();
    await sessions.deleteOne({ tokenHash: hashToken(token) });
  }
  jar.delete(SESSION_COOKIE);
  return json({ ok: true });
}
