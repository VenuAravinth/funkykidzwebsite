"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa6";
import { FiArrowUp } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/site";

// Hidden where it would cover form fields on small screens.
const HIDE_ON = ["/checkout", "/cart", "/login", "/register"];

export default function FloatingActions() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <div
      // Phones use the bottom nav instead (WhatsApp is in the menu and footer), so these
      // floating buttons never sit on top of page content there.
      className={`fixed right-5 z-50 hidden flex-col items-end gap-3 md:flex ${
        pathname.startsWith("/product/") ? "bottom-24 lg:bottom-5" : "bottom-5"
      }`}
    >
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.8 }}
            whileHover={{ y: -3 }}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-plum shadow-lg ring-1 ring-plum/10"
          >
            <FiArrowUp />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with FunkyKidz on WhatsApp"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.8 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-3 text-white sm:h-14 sm:px-4 shadow-xl shadow-[#25d366]/30"
      >
        <span className="absolute inset-0 -z-10 animate-ping-slow rounded-full bg-[#25d366]/50" />
        <FaWhatsapp className="text-2xl" />
        <span className="hidden text-sm font-semibold sm:inline">Order on WhatsApp</span>
      </motion.a>
    </div>
  );
}
