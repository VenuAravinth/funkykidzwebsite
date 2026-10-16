"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import pairImg from "@/assets/img/home/best-seller/best-img-1.png";
import girlImg from "@/assets/img/home/best-seller/best-img-2.png";
import boyImg from "@/assets/img/home/best-seller/best-img-3.png";
import babyImg from "@/assets/img/home/hero/first-birthday.png";
import newImg from "@/assets/img/img-w6.png";

type Slide = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  text: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: StaticImageData;
  alt: string;
  /** Background wash behind the slide. */
  tint: string;
  /** object-position for the photo, so faces stay in frame on every screen size. */
  focus?: string;
};

const INTERVAL_MS = 5000;
const EASE = [0.16, 1, 0.3, 1] as const;

const SLIDES: Slide[] = [
  {
    id: "all",
    eyebrow: "Korean-style kids' clothing · Ages 0–15",
    title: (
      <>
        Korean-style outfits for girls &amp; boys, <span className="text-rose-dark">0–15 years</span>
      </>
    ),
    text: "Hanbok sets, party dresses and everyday wear. Order online with delivery across India, or visit our store in Karur.",
    primary: { label: "Shop Now", href: "/collections" },
    secondary: { label: "New Arrivals", href: "/collections?new=1&sort=newest" },
    image: pairImg,
    alt: "Brother and sister wearing Korean hanbok outfits",
    tint: "#f8e4e6",
    focus: "50% 30%",
  },
  {
    id: "girls",
    eyebrow: "For girls",
    title: (
      <>
        Party dresses &amp; <span className="text-rose-dark">hanbok</span> made for twirling
      </>
    ),
    text: "Soft tulle, satin trims and pastel colours for birthdays, festivals and family photos.",
    primary: { label: "Shop Girls", href: "/collections?gender=Girls" },
    secondary: { label: "Dresses", href: "/collections?category=Dresses" },
    image: girlImg,
    alt: "Girl wearing a pink Korean-style party dress",
    tint: "#fbe6ec",
    focus: "50% 35%",
  },
  {
    id: "boys",
    eyebrow: "For boys",
    title: (
      <>
        Smart, comfy looks for <span className="text-rose-dark">little gentlemen</span>
      </>
    ),
    text: "Embroidered hanbok sets, festive jackets and easy everyday pieces they can actually play in.",
    primary: { label: "Shop Boys", href: "/collections?gender=Boys" },
    secondary: { label: "Hanbok Sets", href: "/collections?category=Hanbok+Sets" },
    image: boyImg,
    alt: "Boy wearing a light blue Korean-style top",
    tint: "#e6edf6",
    focus: "50% 30%",
  },
  {
    id: "baby",
    eyebrow: "Babies · First birthdays",
    title: (
      <>
        Hanbok for the <span className="text-rose-dark">first birthday</span> and beyond
      </>
    ),
    text: "Gentle fabrics and tiny sizes from 0–3 months, perfect for Doljanchi, naming ceremonies and keepsake photos.",
    primary: { label: "Shop 0–12 Months", href: "/collections?age=0-1+Years" },
    secondary: { label: "Size Guide", href: "/size-guide" },
    image: babyImg,
    alt: "Baby in a Korean hanbok at a first-birthday celebration",
    tint: "#f4ede0",
    focus: "50% 40%",
  },
  {
    id: "new",
    eyebrow: "Just in",
    title: (
      <>
        New arrivals, <span className="text-rose-dark">fresh</span> for the season
      </>
    ),
    text: "The latest Korean-style pieces for every age: soft pastels, delicate embroidery and easy-to-wear shapes.",
    primary: { label: "See What's New", href: "/collections?new=1&sort=newest" },
    secondary: { label: "Best Sellers", href: "/collections?sort=popularity" },
    image: newImg,
    alt: "Baby in a bright yellow and blue hanbok",
    tint: "#fbefd9",
    focus: "50% 40%",
  },
];

export default function HeroSlider() {
  const slides = SLIDES;
  const count = slides.length;
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const playing = !userPaused && !hoverPaused && !hidden;

  const go = useCallback(
    (next: number, dir: 1 | -1) => {
      setDirection(dir);
      setIndex(((next % count) + count) % count);
    },
    [count]
  );
  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  // Auto-advance every 5 s. Re-armed on every change, so a manual click gets a full 5 s too.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(next, INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, next]);

  // Don't rotate in a background tab.
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Swipe: horizontal drags change slides; vertical drags still scroll the page (touch-action: pan-y).
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) (dx < 0 ? next : prev)();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  // ---- animation variants (lighter when the visitor prefers reduced motion) ----
  const textGroup: Variants = {
    active: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.28 } },
    inactive: { transition: { staggerChildren: reduce ? 0 : 0.03, staggerDirection: -1 } },
  };
  const textItem: Variants = {
    active: { opacity: 1, x: 0, y: 0, transition: { duration: reduce ? 0.2 : 0.6, ease: EASE } },
    inactive: (dir: number) => ({
      opacity: 0,
      x: reduce ? 0 : -24 * dir,
      y: reduce ? 0 : 8,
      transition: { duration: reduce ? 0.15 : 0.25, ease: "easeIn" },
    }),
  };
  const imageFrame: Variants = {
    active: { opacity: 1, scale: 1, x: 0, transition: { duration: reduce ? 0.2 : 0.9, ease: EASE } },
    inactive: (dir: number) => ({
      opacity: 0,
      scale: reduce ? 1 : 1.06,
      x: reduce ? 0 : 30 * dir,
      transition: { duration: reduce ? 0.15 : 0.5, ease: "easeInOut" },
    }),
  };

  const current = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      className="relative overflow-hidden"
    >
      {/* Background wash eases between each slide's colour. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={false}
        animate={{ backgroundColor: current.tint }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/40 blur-3xl" />

      <div className="mx-auto max-w-[1400px] px-4 pb-3 pt-5 sm:px-6 md:pb-4 md:pl-24 md:pr-12 md:pt-8 lg:pt-10">
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="grid touch-pan-y grid-cols-1 items-center gap-5 md:grid-cols-[1.05fr_1fr] md:gap-8 lg:gap-12"
        >
          {/* Text: every slide is stacked in one grid cell, so the height never jumps. */}
          <div className="grid">
            {slides.map((s, i) => {
              const active = i === index;
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <motion.div
                  key={s.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!active}
                  inert={!active}
                  custom={direction}
                  variants={textGroup}
                  initial={false}
                  animate={active ? "active" : "inactive"}
                  className={`col-start-1 row-start-1 ${active ? "z-10" : "pointer-events-none"}`}
                >
                  <motion.p
                    custom={direction}
                    variants={textItem}
                    className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-dark shadow-sm"
                  >
                    {s.eyebrow}
                  </motion.p>
                  <motion.div custom={direction} variants={textItem}>
                    <Heading className="mt-3 font-serif-display text-[1.75rem] font-bold leading-[1.15] text-plum sm:text-4xl lg:text-[2.9rem]">
                      {s.title}
                    </Heading>
                  </motion.div>
                  <motion.p custom={direction} variants={textItem} className="mt-2 max-w-lg text-sm text-ink/65 sm:mt-3 sm:text-base">
                    {s.text}
                  </motion.p>
                  <motion.div custom={direction} variants={textItem} className="mt-4 flex flex-wrap gap-3 sm:mt-6">
                    <Link
                      href={s.primary.href}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-rose px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose/30 transition-colors hover:bg-rose-dark sm:px-6"
                    >
                      {s.primary.label}
                      <FiChevronRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    {s.secondary && (
                      <Link
                        href={s.secondary.href}
                        className="rounded-full border border-plum/20 bg-white/80 px-5 py-3 text-sm font-bold uppercase tracking-wide text-plum transition-colors hover:bg-white sm:px-6"
                      >
                        {s.secondary.label}
                      </Link>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Image: crossfade + gentle zoom; the active photo also drifts slowly (Ken Burns). */}
          <div className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-white/50 shadow-xl shadow-plum/10 sm:aspect-[16/9] md:aspect-[5/4] md:max-w-[560px] md:rounded-[2rem]">
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <motion.div
                  key={s.id}
                  aria-hidden={!active}
                  custom={direction}
                  variants={imageFrame}
                  initial={false}
                  animate={active ? "active" : "inactive"}
                  className={`absolute inset-0 ${active ? "z-10" : "pointer-events-none"}`}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    animate={{ scale: active && !reduce ? 1.06 : 1 }}
                    transition={{ duration: active ? INTERVAL_MS / 1000 + 1 : 0.6, ease: "linear" }}
                  >
                    <Image
                      src={s.image}
                      alt={active ? s.alt : ""}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                      style={{ objectPosition: s.focus ?? "50% 50%" }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/40" />
          </div>
        </div>

        {/* Controls below the slider */}
        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3 md:mt-6">
          <ArrowButton label="Previous slide" onClick={prev} dir="left" />
          <div className="flex items-center" role="group" aria-label="Choose slide">
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i, i > index ? 1 : -1)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                  className="grid h-9 place-items-center px-1"
                >
                  <span
                    className={`relative block h-2 overflow-hidden rounded-full transition-all duration-500 ${
                      active ? "w-8 bg-plum/15" : "w-2 bg-plum/25 hover:bg-plum/40"
                    }`}
                  >
                    {active && (
                      <span
                        key={`${index}-${playing}`}
                        className="absolute inset-y-0 left-0 rounded-full bg-rose-dark"
                        style={{
                          width: "100%",
                          transformOrigin: "left",
                          animation: `fk-hero-progress ${INTERVAL_MS}ms linear forwards`,
                          animationPlayState: playing ? "running" : "paused",
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <motion.button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            whileHover={reduce ? undefined : { scale: 1.08 }}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            className="grid h-9 w-9 place-items-center rounded-full text-plum/70 transition-colors hover:bg-white/70 hover:text-plum"
          >
            {userPaused ? <FiPlay /> : <FiPause />}
          </motion.button>
          <ArrowButton label="Next slide" onClick={next} dir="right" />
        </div>
        <p className="sr-only" aria-live={playing ? "off" : "polite"}>
          Slide {index + 1} of {count}
        </p>
      </div>
    </section>
  );
}

function ArrowButton({ label, onClick, dir }: { label: string; onClick: () => void; dir: "left" | "right" }) {
  const reduce = useReducedMotion();
  const Icon = dir === "left" ? FiChevronLeft : FiChevronRight;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={reduce ? undefined : { scale: 1.08, y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.88 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="group grid h-11 w-11 place-items-center rounded-full border border-plum/15 bg-white text-lg text-plum shadow-md shadow-plum/10 transition-colors hover:border-plum hover:bg-plum hover:text-white focus-visible:bg-plum focus-visible:text-white"
    >
      <Icon className={`transition-transform duration-200 ${dir === "left" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
    </motion.button>
  );
}
