"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import bestImg1 from "@/assets/img/home/best-seller/best-img-1.png";
import bestImg2 from "@/assets/img/home/best-seller/best-img-2.png";
import bestImg3 from "@/assets/img/home/best-seller/best-img-3.png";
import bestImg4 from "@/assets/img/home/best-seller/best-img-4.png";
import bestImg5 from "@/assets/img/home/best-seller/best-img-5.png";
import bestImg6 from "@/assets/img/home/best-seller/best-img-6.png";
import girlImg from "@/assets/img/img-w1.png";
import boyImg from "@/assets/img/img-b1.png";

type Category = {
  label: string;
  href: string;
  image: typeof bestImg1;
  bg: string;
  // Keeps faces in frame when a tall photo is cropped to a circle.
  focus?: string;
  // Shown greyed out and not clickable, e.g. while the range isn't stocked yet.
  disabled?: boolean;
};

// Girls and boys first, then clothing types, then shop-by-age. Every tile links to a real, pre-filtered listing.
// The catalogue has no T-Shirt/Shirt categories yet, so those open Tops rather than an empty page.
const CATEGORIES: Category[] = [
  { label: "Little Princess", href: "/collections?gender=Girls", image: girlImg, bg: "#f7e2df", focus: "50% 20%" },
  { label: "Little Champ", href: "/collections?gender=Boys", image: boyImg, bg: "#eef0f7", focus: "50% 20%" },
  { label: "Party Wear", href: "/collections?q=party", image: bestImg2, bg: "#f4f0e8" },
  { label: "T-Shirts", href: "/collections?category=Tops", image: bestImg6, bg: "#f7e2df" },
  { label: "Shirts", href: "/collections?category=Tops", image: bestImg4, bg: "#f4ede0" },
  { label: "Jackets", href: "/collections?q=jacket", image: bestImg3, bg: "#eef0f7" },
  { label: "Toddler", href: "/collections?age=1-3+Years", image: bestImg5, bg: "#f7e2df" },
  { label: "Little Kids", href: "/collections?age=3-5+Years,5-7+Years", image: bestImg1, bg: "#f4ede0" },
];

const arrowClass =
  "grid h-10 w-10 place-items-center rounded-full border border-plum/15 bg-white text-lg text-plum shadow-sm transition-colors hover:bg-plum hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-plum";

export default function ShopByCollection() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Enable each arrow only when there is more to see in that direction.
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateArrows]);

  // Move by most of the visible width so a tap reveals the next set of categories.
  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="shop-by-category" className="mx-auto max-w-[1400px] px-4 pt-5 sm:px-6 md:pl-24 md:pr-12">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="shop-by-category" className="font-serif-display text-xl font-bold text-plum md:text-2xl">
          Shop by Category
        </h2>
        {/* Hidden when every category already fits on screen. */}
        <div className={`flex gap-2 ${canPrev || canNext ? "" : "invisible"}`}>
          <button type="button" aria-label="Previous categories" onClick={() => scroll(-1)} disabled={!canPrev} className={arrowClass}>
            <FiChevronLeft />
          </button>
          <button type="button" aria-label="Next categories" onClick={() => scroll(1)} disabled={!canNext} className={arrowClass}>
            <FiChevronRight />
          </button>
        </div>
      </div>
      <ul
        ref={trackRef}
        onScroll={updateArrows}
        className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:gap-6 sm:px-0"
      >
        {CATEGORIES.map((c) => {
          const tile = (
            <>
              <span
                className={`relative grid h-20 w-20 place-items-center overflow-hidden rounded-full ring-2 ring-white shadow transition-transform md:h-28 md:w-28 ${
                  c.disabled ? "opacity-50 grayscale" : "group-hover:scale-105"
                }`}
                style={{ background: c.bg }}
              >
                <Image src={c.image} alt="" fill sizes="(min-width: 768px) 112px, 80px" className="object-cover" style={{ objectPosition: c.focus }} />
              </span>
              <span className={`text-xs font-semibold leading-tight md:text-sm ${c.disabled ? "text-ink/40" : "text-plum"}`}>
                {c.label}
                {c.disabled && <span className="mt-0.5 block text-[10px] font-medium md:text-xs">Coming soon</span>}
              </span>
            </>
          );
          const tileClass = "group flex w-[88px] flex-col items-center gap-2 text-center md:w-32";
          return (
            <li key={c.label} className="shrink-0 snap-start">
              {c.disabled ? (
                <span aria-disabled="true" className={`${tileClass} cursor-not-allowed`}>
                  {tile}
                </span>
              ) : (
                <Link href={c.href} className={tileClass}>
                  {tile}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
