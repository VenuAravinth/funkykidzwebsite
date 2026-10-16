#!/usr/bin/env node
// Emergency recovery — run on the server only:
//   npm run admin:reset -- --yes
// Deletes the admin login record (username, password hash, authenticator, sessions).
// Orders are untouched. The next sign-in uses ADMIN_DEFAULT_USERNAME / ADMIN_DEFAULT_PASSWORD
// from the environment, then asks you to set a new login and re-scan Google Authenticator.
import { rm } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));
const file = path.join(dir, "admin.json");

if (!process.argv.includes("--yes")) {
  console.log(`This will reset the admin login stored in:\n  ${file}\n\nRe-run with --yes to confirm:  npm run admin:reset -- --yes`);
  process.exit(1);
}
await rm(file, { force: true });
console.log("Admin login reset. Restart the server, then sign in with the default credentials from your environment.");
