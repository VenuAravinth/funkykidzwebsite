import "server-only";
import { adminEnv } from "./env";
import { hashPassword } from "./crypto";
import { collections, plain } from "./db";

export type PendingLogin = {
  pid: string;
  stage: "otp" | "totp" | "totp_setup";
  exp: number;
  otpHash?: string;
  otpExpires?: number;
  otpAttempts: number;
  otpSentAt?: number;
  otpSends: number;
  totpAttempts: number;
  setupSecretEnc?: string;
};

export type AdminSession = { sid: string; createdAt: number; exp: number; ip: string; ua: string };

export type AuditEvent = { at: number; event: string; ip?: string };

export type AdminRecord = {
  username: string;
  passwordHash: string;
  mustChangeCredentials: boolean;
  credentialsUpdatedAt: number;
  totp: { secretEnc: string; enrolledAt: number; lastUsedStep: number } | null;
  failedLogins: number;
  lockedUntil: number;
  pending: PendingLogin | null;
  sessions: AdminSession[];
  audit: AuditEvent[];
};

const AUDIT_LIMIT = 200;

async function seed(): Promise<AdminRecord> {
  // First run: the default login comes from env vars and must be changed on first sign-in.
  return {
    username: adminEnv.defaultUsername!,
    passwordHash: await hashPassword(adminEnv.defaultPassword!),
    mustChangeCredentials: true,
    credentialsUpdatedAt: Date.now(),
    totp: null,
    failedLogins: 0,
    lockedUntil: 0,
    pending: null,
    sessions: [],
    audit: [{ at: Date.now(), event: "admin account created from default credentials" }],
  };
}

export async function getAdmin(): Promise<AdminRecord> {
  const { admin } = await collections();
  const existing = await admin.findOne({ _id: "admin" });
  if (existing) return plain(existing);
  return updateAdmin((a) => a);
}

// Read-modify-write is serialised in this process so two admin requests can't overwrite
// each other's changes (there is a single admin document).
let queue: Promise<unknown> = Promise.resolve();

/** Atomic update. Seeds the record on first use. */
export function updateAdmin(mutate: (admin: AdminRecord) => AdminRecord | void): Promise<AdminRecord> {
  const run = queue.then(async () => {
    const { admin } = await collections();
    const current = await admin.findOne({ _id: "admin" });
    const record: AdminRecord = current ? plain(current) : await seed();
    const next = mutate(record) ?? record;
    const now = Date.now();
    next.sessions = next.sessions.filter((s) => s.exp > now);
    if (next.pending && next.pending.exp < now) next.pending = null;
    next.audit = next.audit.slice(-AUDIT_LIMIT);
    await admin.replaceOne({ _id: "admin" }, next, { upsert: true });
    return next;
  });
  queue = run.catch(() => undefined);
  return run;
}

export function audit(admin: AdminRecord, event: string, ip?: string) {
  admin.audit.push({ at: Date.now(), event, ip });
}
