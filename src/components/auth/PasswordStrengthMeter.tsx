"use client";

import { passwordStrength } from "@/lib/passwordStrength";

const BAR = ["bg-ink/10", "bg-rose-dark", "bg-gold", "bg-emerald-500", "bg-emerald-600"];
const TEXT = ["text-ink/50", "text-rose-dark", "text-gold", "text-emerald-700", "text-emerald-700"];

// Four-segment meter + checklist under a "new password" field. Hidden until typing starts.
export default function PasswordStrengthMeter({
  password,
  minLength = 6,
  goodLength = 8,
  personal = [],
}: {
  password: string;
  minLength?: number;
  goodLength?: number;
  personal?: string[];
}) {
  if (!password) return null;
  const s = passwordStrength(password, { minLength, goodLength, personal });

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-1.5 rounded-full transition-colors ${i <= s.score ? BAR[s.score] : "bg-ink/10"}`} />
          ))}
        </div>
        <span className={`w-16 text-right text-xs font-semibold ${TEXT[s.score]}`}>{s.label}</span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {s.checks.map((c) => (
          <li
            key={c.label}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c.ok ? "bg-emerald-50 text-emerald-700" : "bg-plum/5 text-ink/45"}`}
          >
            {c.ok ? "✓" : "•"} {c.label}
          </li>
        ))}
      </ul>
      {s.hint && <p className="mt-1.5 text-xs text-ink/55">{s.hint}</p>}
    </div>
  );
}

/** "Passwords match" line under a confirm field. */
export function PasswordMatch({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return null;
  const ok = password === confirm;
  return (
    <p aria-live="polite" className={`mt-1.5 text-xs font-semibold ${ok ? "text-emerald-700" : "text-rose-dark"}`}>
      {ok ? "✓ Passwords match" : "Passwords don’t match yet"}
    </p>
  );
}
