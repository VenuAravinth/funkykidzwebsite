#!/usr/bin/env node
// Prints fresh random values for the admin secrets. Paste them into .env.local (dev) or your
// host's environment settings (production). Never commit them.
import { randomBytes } from "node:crypto";

const r = (n) => randomBytes(n).toString("base64url");
console.log(`ADMIN_ACCESS_KEY=${r(32)}
ADMIN_SESSION_SECRET=${r(48)}
ADMIN_ENCRYPTION_KEY=${r(48)}
ADMIN_DEFAULT_PASSWORD=${r(12)}-Fk9!`);
