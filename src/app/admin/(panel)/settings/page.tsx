import type { Metadata } from "next";
import { FiAlertTriangle, FiCheckCircle, FiMail, FiSmartphone } from "react-icons/fi";
import { maskEmail, requireAdminPage } from "@/server/adminAuth";
import { adminEnv } from "@/server/env";
import CredentialsForm from "@/components/admin/CredentialsForm";

export const metadata: Metadata = { title: "Account & security" };

const when = (ms: number) =>
  new Date(ms).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ first?: string }> }) {
  const { admin, session } = await requireAdminPage({ allowMustChange: true });
  const firstLogin = admin.mustChangeCredentials || (await searchParams).first === "1";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif-display text-3xl font-bold text-plum">Account &amp; security</h1>

      {admin.mustChangeCredentials && (
        <div className="mt-6 flex gap-3 rounded-2xl bg-[#fff4e0] px-5 py-4 text-sm text-[#9a5b00] ring-1 ring-[#f3d9a8]">
          <FiAlertTriangle className="mt-0.5 shrink-0 text-lg" />
          <p>
            <b>You&apos;re using the default login.</b> Choose your own username and a strong password to continue — the rest of the admin
            panel unlocks after this.
          </p>
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-plum/5">
          <FiMail className="mt-1 shrink-0 text-xl text-rose-dark" />
          <div className="text-sm">
            <p className="font-semibold text-plum">Email OTP</p>
            <p className="text-ink/55">Codes go to {maskEmail(adminEnv.email!)}</p>
            <p className="mt-1 text-xs text-ink/40">Change via ADMIN_EMAIL on the server.</p>
          </div>
        </div>
        <div className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-plum/5">
          <FiSmartphone className="mt-1 shrink-0 text-xl text-rose-dark" />
          <div className="text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-plum">
              Google Authenticator {admin.totp && <FiCheckCircle className="text-[#1f7a4a]" />}
            </p>
            <p className="text-ink/55">{admin.totp ? `Enabled ${when(admin.totp.enrolledAt)}` : "Not set up"}</p>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <CredentialsForm currentUsername={admin.username} firstLogin={firstLogin} />
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-plum/5">
        <h2 className="text-sm font-semibold text-ink/60">Active sessions</h2>
        <ul className="mt-3 divide-y divide-plum/5 text-sm">
          {admin.sessions.map((s) => (
            <li key={s.sid} className="flex flex-wrap justify-between gap-2 py-2.5">
              <span className="text-ink/70">
                {s.ip} · <span className="text-ink/45">{s.ua.slice(0, 60) || "Unknown device"}</span>
              </span>
              <span className="text-ink/45">
                {s.sid === session.sid ? <b className="text-[#1f7a4a]">This device</b> : `since ${when(s.createdAt)}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-plum/5">
        <h2 className="text-sm font-semibold text-ink/60">Recent security activity</h2>
        <ol className="mt-3 max-h-80 divide-y divide-plum/5 overflow-auto text-sm">
          {[...admin.audit].reverse().slice(0, 40).map((e, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-2 py-2">
              <span className="text-ink/75">{e.event}</span>
              <span className="text-ink/45">
                {e.ip ? `${e.ip} · ` : ""}
                {when(e.at)}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
