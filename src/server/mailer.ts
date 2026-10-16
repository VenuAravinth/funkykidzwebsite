import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { isProduction, smtpEnv } from "./env";

const configured = () => Boolean(smtpEnv.host && smtpEnv.user && smtpEnv.pass);

let transporter: Transporter | null = null;
const getTransport = () =>
  (transporter ??= nodemailer.createTransport({
    host: smtpEnv.host,
    port: smtpEnv.port,
    secure: smtpEnv.port === 465,
    auth: { user: smtpEnv.user, pass: smtpEnv.pass },
  }));

export async function sendAdminOtpEmail(to: string, code: string, ip: string) {
  if (!configured()) {
    if (isProduction) throw new Error("SMTP is not configured — cannot send admin OTP");
    // Development only: no SMTP yet, so print the code to the server terminal.
    console.warn(`\n[admin] SMTP not configured. Login OTP for ${to}: ${code}\n`);
    return;
  }

  const minutes = 5;
  await getTransport().sendMail({
    from: smtpEnv.from ?? smtpEnv.user,
    to,
    subject: `${code} is your FunkyKidz admin login code`,
    text: `Your FunkyKidz admin verification code is ${code}.\n\nIt expires in ${minutes} minutes. Requested from IP ${ip}.\nIf this wasn't you, change your admin password immediately.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
<h2 style="color:#362a45;margin:0 0 12px">FunkyKidz Admin</h2>
<p style="color:#555">Your verification code is:</p>
<p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#d9647c;margin:12px 0">${code}</p>
<p style="color:#888;font-size:13px">Expires in ${minutes} minutes · Requested from IP ${ip}.<br>If this wasn't you, change your admin password immediately.</p>
</div>`,
  });
}
