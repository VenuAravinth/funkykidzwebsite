"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

// three.js is ~600 KB, so the petals load only on desktop, after the page is interactive, and
// never for visitors who prefer reduced motion.
const PetalField = dynamic(() => import("./PetalField"), { ssr: false });

const QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function LazyPetalField({ className }: { className?: string }) {
  const show = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  return show ? <PetalField className={className} /> : null;
}
