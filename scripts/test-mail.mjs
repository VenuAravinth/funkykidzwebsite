// Sends one test email using the SMTP settings in .env.local.
// Usage: node --env-file=.env.local scripts/test-mail.mjs you@example.com
import nodemailer from "nodemailer";

const to = process.argv[2];
const { SMTP_HOST, SMTP_PORT = "465", SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

if (!to) throw new Error("Pass the recipient address: node --env-file=.env.local scripts/test-mail.mjs you@example.com");
const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((k) => !process.env[k]);
if (missing.length) throw new Error(`Missing in .env.local: ${missing.join(", ")}`);

const port = Number(SMTP_PORT);
const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });

await transport.verify();
console.log(`SMTP login OK (${SMTP_USER} @ ${SMTP_HOST}:${port})`);

const info = await transport.sendMail({
  from: SMTP_FROM || SMTP_USER,
  to,
  subject: "FunkyKidz test email",
  text: "This is a test email from the FunkyKidz portal. If you can read this, SMTP is working.",
  html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
<h2 style="color:#362a45;margin:0 0 12px">FunkyKidz Admin</h2>
<p style="color:#555">This is a test email. If you can read this, SMTP is working.</p>
</div>`,
});
console.log(`Sent to ${to}: ${info.messageId} (${info.response})`);
