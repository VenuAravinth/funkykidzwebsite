"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export type CategoryTile = {
  label: string;
  href: string;
  // Uploaded in ERP Admin (URL) or bundled with the site; null shows the initial instead.
  image: string | StaticImageData | null;
  bg: string;
  // Keeps faces in frame when a tall photo is cropped to a circle.
  focus?: string;
  // Shown greyed out and not clickable, e.g. while the range isn't stocked yet.
  disabled?: boolean;
};

const arrowClass =
  "grid h-10 w-10 place-items-center rounded-full border border-plum/15 bg-white text-lg text-plum shadow-sm transition-colors hover:bg-plum hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-plum";

/** The "Shop by Category" heading and row; `children` replaces the row (loading/empty states). */
export function CategorySection({ arrows, children }: { arrows?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby="shop-by-category" className="mx-auto max-w-[1400px] px-4 pt-5 sm:px-6 md:pl-24 md:pr-12">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="shop-by-category" className="font-serif-display text-xl font-bold text-plum md:text-2xl">
          Shop by Category
        </h2>
        {arrows}
      </div>
      {children}
    </section>
  );
}

const trackClass = "no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:gap-6 sm:px-0";
const tileClass = "group flex w-[88px] flex-col items-center gap-2 text-center md:w-32";
const circleClass = "relative grid h-20 w-20 place-items-center overflow-hidden rounded-full ring-2 ring-white shadow transition-transform md:h-28 md:w-28";

/** Placeholder circles while the categories load, same size as the real row so nothing jumps. */
export function CategoryRailSkeleton() {
  return (
    <CategorySection>
      <ul aria-hidden="true" className={trackClass}>
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="shrink-0">
            <span className={tileClass}>
              <span className={`${circleClass} animate-pulse bg-plum/10`} />
              <span className="h-3 w-14 animate-pulse rounded bg-plum/10 md:h-4 md:w-20" />
            </span>
          </li>
        ))}
      </ul>
    </CategorySection>
  );
}

export default function CategoryRail({ tiles }: { tiles: CategoryTile[] }) {
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
    <CategorySection
      arrows={
        // Hidden when every category already fits on screen.
        <div className={`flex gap-2 ${canPrev || canNext ? "" : "invisible"}`}>
          <button type="button" aria-label="Previous categories" onClick={() => scroll(-1)} disabled={!canPrev} className={arrowClass}>
            <FiChevronLeft />
          </button>
          <button type="button" aria-label="Next categories" onClick={() => scroll(1)} disabled={!canNext} className={arrowClass}>
            <FiChevronRight />
          </button>
        </div>
      }
    >
      <ul ref={trackRef} onScroll={updateArrows} className={trackClass}>
        {tiles.map((c) => {
          const tile = (
            <>
              <span className={`${circleClass} ${c.disabled ? "opacity-50 grayscale" : "group-hover:scale-105"}`} style={{ background: c.bg }}>
                {c.image ? (
                  <Image src={c.image} alt="" fill sizes="(min-width: 768px) 112px, 80px" className="object-cover" style={{ objectPosition: c.focus }} />
                ) : (
                  <span aria-hidden="true" className="font-serif-display text-2xl font-bold text-plum/60 md:text-4xl">
                    {c.label.charAt(0)}
                  </span>
                )}
              </span>
              <span className={`text-xs font-semibold leading-tight md:text-sm ${c.disabled ? "text-ink/40" : "text-plum"}`}>
                {c.label}
                {c.disabled && <span className="mt-0.5 block text-[10px] font-medium md:text-xs">Coming soon</span>}
              </span>
            </>
          );
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
    </CategorySection>
  );
}
