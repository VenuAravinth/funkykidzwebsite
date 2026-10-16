"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/cartPricing";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";


const MESSAGES = [
  { text: `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)} · ${RETURN_WINDOW_DAYS}-day returns`, href: "/shipping-info" },
  { text: "New Korean-style arrivals every month", href: "/collections?new=1&sort=newest" },
  { text: `Help with sizes? WhatsApp us — ${SITE.phone}`, href: "/contact" },
  { text: "Visit our store at Jawahar Bazaar, Karur", href: "/kids-dresses-karur" },
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  const count = MESSAGES.length;
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 4000);
    return () => window.clearInterval(id);
  }, [count]);

  const message = MESSAGES[index % count];

  return (
    <div className="w-full bg-plum text-[13px] text-white/90">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-2">
        <span className="hidden text-white/60 md:block">Korean-style kids&apos; clothing · Ages 0–15</span>
        <div className="relative mx-auto h-5 flex-1 overflow-hidden text-center md:mx-0 md:max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center gap-2"
            >
              <FiHeart className="shrink-0 text-rose" />
              <Link href={message.href} className="truncate hover:underline">
                {message.text}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="hidden text-white/60 md:block">Prices in INR ₹</span>
      </div>
    </div>
  );
}
