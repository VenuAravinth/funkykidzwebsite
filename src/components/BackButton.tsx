"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

// Remembers the previous page *within this visit*, so a Back button can return to it
// (keeping the shopper's filters, search and scroll) — or fall back to a sensible page when
// the visitor arrived directly, e.g. from a WhatsApp link or a new tab.

let previousPath: string | null = null;
let currentPath: string | null = null;
const listeners = new Set<() => void>();

/** Mounted once in the shop layout; records each in-app page change. */
export function NavigationTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const full = pathname + window.location.search;
    if (currentPath && currentPath !== full) previousPath = currentPath;
    currentPath = full;
    listeners.forEach((l) => l());
  }, [pathname]);
  return null;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export default function BackButton({
  fallbackHref,
  fallbackLabel,
  shopLabel = "Back to Shop",
}: {
  /** Where to go when there is no earlier page in this visit. */
  fallbackHref: string;
  fallbackLabel: string;
  /** Label when the previous page was the Shop listing. */
  shopLabel?: string;
}) {
  const router = useRouter();
  const prev = useSyncExternalStore(subscribe, () => previousPath, () => null);
  const label = !prev ? fallbackLabel : prev.startsWith("/collections") ? shopLabel : "Back";

  return (
    <button
      type="button"
      onClick={() => (prev ? router.back() : router.push(fallbackHref))}
      className="group inline-flex h-10 items-center gap-2 rounded-full border border-plum/15 bg-white pl-3 pr-4 text-sm font-semibold text-plum shadow-sm transition-colors hover:border-plum hover:bg-plum hover:text-white"
    >
      <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}
