"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import SectionHeading from "@/components/SectionHeading";
import type { Faq } from "@/lib/seoContent";

// Answers stay in the DOM (only visually collapsed) so search engines can read them.
export default function FaqSection({ faqs, title, eyebrow = "FAQ" }: { faqs: Faq[]; title: string; eyebrow?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 md:py-20">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="mt-12 space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`rounded-2xl bg-white ring-1 transition-shadow ${isOpen ? "shadow-lg ring-rose/30" : "ring-plum/5"}`}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-plum"
                >
                  {f.q}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isOpen ? "bg-rose-dark text-white" : "bg-rose-light text-rose-dark"}`}
                  >
                    <FiPlus />
                  </motion.span>
                </button>
              </h3>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-sm leading-relaxed text-ink/65">{f.a}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
