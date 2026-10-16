"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FiGrid, FiShoppingBag, FiSettings, FiLogOut, FiExternalLink, FiTag } from "react-icons/fi";

const LINKS = [
  { href: "/admin/dashboard", label: "Analytics", icon: FiGrid },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { href: "/admin/coupons", label: "Redeem codes", icon: FiTag },
  { href: "/admin/settings", label: "Account & security", icon: FiSettings },
];

export default function AdminNav({ username, pendingCount }: { username: string; pendingCount: number }) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    window.location.assign("/admin/login");
  }

  return (
    <aside className="flex flex-col gap-2 border-b border-plum/10 bg-plum px-4 py-4 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:px-5 lg:py-8">
      <div className="flex items-center justify-between lg:block">
        <div>
          <p className="font-serif-display text-xl font-bold">FunkyKidz</p>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-rose-light">ADMIN CONSOLE</p>
        </div>
        <p className="text-xs text-white/60 lg:mt-6">
          Signed in as <span className="font-semibold text-white">{username}</span>
        </p>
      </div>

      <nav className="mt-2 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col">
        {LINKS.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`relative flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-plum" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-white" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <l.icon className="relative" />
              <span className="relative">{l.label}</span>
              {l.href === "/admin/orders" && pendingCount > 0 && (
                <span className="relative ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-plum">{pendingCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 flex gap-2 lg:mt-auto lg:flex-col">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <FiExternalLink /> View store
        </a>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <FiLogOut /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
