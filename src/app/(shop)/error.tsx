"use client";

import { useEffect } from "react";
import { CatalogUnavailable } from "@/components/CatalogStatus";

// A shop page failed to render (most often: the product catalogue couldn't be fetched).
export default function ShopError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <CatalogUnavailable onRetry={unstable_retry} />;
}
