"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import PetalField from "./LazyPetalField";

type Crumb = { label: string; href?: string };
type Cta = { label: string; href: string; external?: boolean };

const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function LandingHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  primary,
  secondary,
  tone = "light",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: React.ReactNode;
  breadcrumb: Crumb[];
  primary?: Cta;
  secondary?: Cta;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const button = (cta: Cta, main: boolean) => {
    const cls = main
      ? "rounded-full bg-rose px-7 py-3 text-center font-semibold text-white shadow-lg shadow-rose/30 transition-all hover:scale-105 hover:bg-rose-dark"
      : `rounded-full border px-7 py-3 text-center font-semibold transition-colors ${
          dark ? "border-white/30 text-white hover:bg-white/10" : "border-plum/20 bg-white/70 text-plum hover:bg-white"
        }`;
    return cta.external ? (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {cta.label}
      </a>
    ) : (
      <Link href={cta.href} className={cls}>
        {cta.label}
      </Link>
    );
  };

  return (
    <section
      className={`relative overflow-hidden ${
        dark ? "bg-gradient-to-br from-plum via-plum-light to-rose-dark text-white" : "bg-gradient-to-b from-blush via-rose-light/50 to-cream"
      }`}
    >
      {!dark && <PetalField />}
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 animate-blob bg-rose/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 animate-blob bg-gold/20 blur-3xl [animation-delay:-7s]" />

      <motion.div
        variants={container}
        initial={false}
        animate="visible"
        className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center px-4 py-8 text-center sm:px-6 md:px-24 md:py-24"
      >
        <motion.nav variants={item} aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm font-medium ${dark ? "text-white/60" : "text-ink/60"}`}>
          {breadcrumb.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              {i > 0 && <FiChevronRight className="opacity-50" />}
              {c.href ? (
                <Link href={c.href} className="inline-block py-2.5 transition-colors hover:text-rose-dark">
                  {c.label}
                </Link>
              ) : (
                <span className={dark ? "text-rose-light" : "text-rose-dark"}>{c.label}</span>
              )}
            </span>
          ))}
        </motion.nav>
        <motion.span
          variants={item}
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] md:mt-6 font-semibold tracking-[0.2em] ${
            dark ? "bg-white/15 text-white" : "bg-white/80 text-rose-dark shadow-sm"
          }`}
        >
          <HiSparkles className="text-gold" /> {eyebrow}
        </motion.span>
        <motion.h1
          variants={item}
          className={`mt-4 font-serif-display text-3xl font-bold leading-[1.15] sm:text-4xl md:mt-5 md:text-6xl ${dark ? "text-white" : "text-plum"}`}
        >
          {title}
        </motion.h1>
        <motion.p variants={item} className={`mt-4 max-w-2xl text-base leading-relaxed md:mt-6 md:text-lg ${dark ? "text-white/75" : "text-ink/65"}`}>
          {intro}
        </motion.p>
        {(primary || secondary) && (
          <motion.div variants={item} className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center md:mt-9">
            {primary && button(primary, true)}
            {secondary && button(secondary, false)}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
