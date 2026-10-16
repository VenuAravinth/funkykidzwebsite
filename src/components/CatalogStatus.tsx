"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiRefreshCw, FiShoppingBag } from "react-icons/fi";

// What the shop shows instead of products: when none are published yet, and when the ERP Backend
// can't be reached. Never a stand-in product list. (Loading skeletons live in loading.tsx files.)

const box = "mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-plum/15 bg-white px-6 py-12 text-center";
const icon = "grid h-14 w-14 place-items-center rounded-full bg-rose-light/60 text-2xl text-rose-dark";

/** No published products yet (or none in this section). */
export function ComingSoon({ title = "New styles coming soon", message }: { title?: string; message?: string }) {
  return (
    <div className="px-4 py-10">
      <div className={box}>
        <span className={icon}>
          <FiShoppingBag />
        </span>
        <h2 className="mt-4 font-serif-display text-2xl font-bold text-plum">{title}</h2>
        <p className="mt-2 text-sm text-ink/60">
          {message ?? "We're getting our next collection ready. Please check back soon, or message us on WhatsApp for what's in store today."}
        </p>
      </div>
    </div>
  );
}

/**
 * The product catalogue couldn't be loaded. `onRetry` re-renders the failed segment (error.tsx's
 * unstable_retry); without it the whole page is fetched again from the server.
 */
export function CatalogUnavailable({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const retry = () => startTransition(() => (onRetry ? onRetry() : router.refresh()));

  return (
    <div className="px-4 py-16">
      <div role="alert" className={box}>
        <span className={icon}>
          <FiAlertCircle />
        </span>
        <h2 className="mt-4 font-serif-display text-2xl font-bold text-plum">We couldn&apos;t load our products</h2>
        <p className="mt-2 text-sm text-ink/60">
          Something went wrong on our side. Please try again in a moment — your cart and wishlist are safe.
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={pending}
          className="mt-5 flex items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <FiRefreshCw className={pending ? "animate-spin" : ""} /> {pending ? "Retrying…" : "Try again"}
        </button>
      </div>
    </div>
  );
}
