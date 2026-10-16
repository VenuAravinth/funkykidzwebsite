"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FiShoppingBag } from "react-icons/fi";
import { formatPrice } from "@/lib/format";

// Appears on phones once the main Add to Bag button scrolls out of view, so shoppers
// reading the details never have to scroll back up to buy.
export default function MobileBuyBar({
  targetId,
  price,
  label,
  onAdd,
}: {
  targetId: string;
  price: number;
  label: string;
  onAdd: () => void;
}) {
  const [show, setShow] = useState(false);
  // Rendered into <body>: an animated (transformed) ancestor would otherwise pin a
  // position:fixed bar to itself instead of the screen.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(target);
    return () => io.disconnect();
  }, [targetId]);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-plum/10 bg-white/95 px-4 pb-3 pt-3 md:bottom-0 md:pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(54,42,69,0.25)] backdrop-blur transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-[150%] opacity-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <p className="text-lg font-bold text-ink">{formatPrice(price)}</p>
        <button
          type="button"
          tabIndex={show ? 0 : -1}
          onClick={onAdd}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose/30"
        >
          <FiShoppingBag /> {label}
        </button>
      </div>
    </div>,
    document.body,
  );
}

const noopSubscribe = () => () => {};
