// Server-only configuration. Every secret comes from environment variables (.env.local in
// development, the host's secret manager in production) — nothing sensitive lives in code.
//
// Deliberately free of `server-only`/fs imports so proxy.ts can use it too.

const read = (name: string) => {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
};

export const adminEnv = {
  accessKey: read("ADMIN_ACCESS_KEY"),
  host: read("ADMIN_HOST")?.toLowerCase(),
  sessionSecret: read("ADMIN_SESSION_SECRET"),
  encryptionKey: read("ADMIN_ENCRYPTION_KEY"),
  email: read("ADMIN_EMAIL"),
  defaultUsername: read("ADMIN_DEFAULT_USERNAME"),
  defaultPassword: read("ADMIN_DEFAULT_PASSWORD"),
  sessionHours: Number(read("ADMIN_SESSION_HOURS") ?? 8),
  totpIssuer: read("ADMIN_TOTP_ISSUER") ?? "FunkyKidz Admin",
};

export const smtpEnv = {
  host: read("SMTP_HOST"),
  port: Number(read("SMTP_PORT") ?? 465),
  user: read("SMTP_USER"),
  pass: read("SMTP_PASS"),
  from: read("SMTP_FROM"),
};

export const isProduction = process.env.NODE_ENV === "production";

/**
 * The admin area only exists when every required secret is present and strong enough.
 * If anything is missing the proxy answers 404 for all admin URLs instead of running half-configured.
 */
export function adminConfigProblems(): string[] {
  const problems: string[] = [];
  if (!adminEnv.accessKey || adminEnv.accessKey.length < 24) problems.push("ADMIN_ACCESS_KEY must be at least 24 characters");
  if (!adminEnv.sessionSecret || adminEnv.sessionSecret.length < 32) problems.push("ADMIN_SESSION_SECRET must be at least 32 characters");
  if (!adminEnv.encryptionKey || adminEnv.encryptionKey.length < 32) problems.push("ADMIN_ENCRYPTION_KEY must be at least 32 characters");
  if (!adminEnv.email) problems.push("ADMIN_EMAIL is required");
  if (!adminEnv.defaultUsername) problems.push("ADMIN_DEFAULT_USERNAME is required");
  if (!adminEnv.defaultPassword || adminEnv.defaultPassword.length < 12) problems.push("ADMIN_DEFAULT_PASSWORD must be at least 12 characters");
  return problems;
}

export const isAdminConfigured = () => adminConfigProblems().length === 0;
