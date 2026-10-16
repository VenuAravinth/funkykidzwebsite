"use client";

import { useSyncExternalStore } from "react";

// What the shopper has chosen on the product page they're looking at. Kept in memory (not
// localStorage) so the mobile bottom bar's Buy Now knows whether a size and colour are picked.
export type ProductSelection = { slug: string; colorwayName: string; size: string | null };

let current: ProductSelection | null = null;
const listeners = new Set<() => void>();

export function setProductSelection(next: ProductSelection | null) {
  current = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useProductSelection(): ProductSelection | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
