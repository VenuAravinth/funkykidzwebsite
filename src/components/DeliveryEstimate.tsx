"use client";

import { useSyncExternalStore } from "react";
import { deliveryWindowLabel } from "@/lib/cartPricing";

const noopSubscribe = () => () => {};

// Dates depend on "today", so they're computed in the browser only to avoid a stale or
// mismatched date from the server render.
export default function DeliveryEstimate({ prefix = "Estimated delivery:" }: { prefix?: string }) {
  const label = useSyncExternalStore(noopSubscribe, () => deliveryWindowLabel(), () => null);
  if (!label) return <span className="inline-block h-4 w-40 animate-pulse rounded bg-plum/5 align-middle" />;
  return (
    <span>
      {prefix} <strong className="font-semibold text-plum">{label}</strong>
    </span>
  );
}
