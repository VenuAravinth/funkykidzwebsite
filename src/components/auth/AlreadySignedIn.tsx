import Link from "next/link";
import { FiCheckCircle, FiLogOut } from "react-icons/fi";
import { formatPhone, type User } from "@/lib/auth";

export default function AlreadySignedIn({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
      <FiCheckCircle className="mx-auto text-4xl text-rose-dark" />
      <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">You&apos;re signed in as {user.name}</h3>
      <p className="mt-2 text-sm text-ink/60">{formatPhone(user.phone)}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/profile"
          className="rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
        >
          My Account
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 rounded-full border border-plum/15 px-7 py-3 text-sm font-semibold text-ink/70 transition-colors hover:border-rose-dark hover:text-rose-dark"
        >
          <FiLogOut /> Log out
        </button>
      </div>
    </div>
  );
}
