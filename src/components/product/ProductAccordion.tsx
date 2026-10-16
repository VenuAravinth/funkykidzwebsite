"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

type Section = { id?: string; title: string; content: React.ReactNode };

export default function ProductAccordion({ sections }: { sections: Section[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Links like "#size-chart" open and scroll to their section.
  useEffect(() => {
    function openFromHash() {
      const id = window.location.hash.slice(1);
      const index = sections.findIndex((s) => s.id === id);
      if (index === -1) return;
      setOpenIndex(index);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [sections]);

  return (
    <div className="divide-y divide-plum/10 border-t border-plum/10">
      {sections.map((section, i) => {
        const open = openIndex === i;
        return (
          <div key={section.title} id={section.id} className="scroll-mt-28">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-plum"
            >
              {section.title}
              <FiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-sm text-ink/60">{section.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
