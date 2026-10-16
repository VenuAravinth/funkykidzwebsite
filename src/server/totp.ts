import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { adminEnv } from "./env";
import { safeEqual } from "./tokens";

// RFC 6238 TOTP (SHA-1, 6 digits, 30 s) — the format Google Authenticator, Microsoft
// Authenticator, Authy and 1Password all understand.

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error("Invalid base32");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export const generateTotpSecret = () => base32Encode(randomBytes(20));

function codeForStep(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const bin = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(bin).padStart(6, "0");
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

/**
 * Accepts the current code or one step either side (clock drift). Returns the matched step so the
 * caller can reject re-use of the same code (replay protection), or null if no match.
 */
export function verifyTotp(secret: string, code: string, lastUsedStep = -1): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const now = currentStep();
  for (const step of [now, now - 1, now + 1]) {
    if (step <= lastUsedStep) continue;
    if (safeEqual(codeForStep(secret, step), code)) return step;
  }
  return null;
}

export function otpauthUrl(secret: string, account: string): string {
  const issuer = adminEnv.totpIssuer;
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: String(STEP_SECONDS) });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export const totpQrDataUrl = (url: string) => QRCode.toDataURL(url, { margin: 1, width: 240, errorCorrectionLevel: "M" });

// Exported for the self-test script only.
export const __test = { codeForStep, base32Encode, base32Decode };
