"use client";

import { useCallback, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize2 } from "react-icons/fi";
import ProductPhoto from "./ProductPhoto";
import { productPhotos, type Product } from "@/lib/products";
import PhotoViewer from "./PhotoViewer";

const arrow =
  "grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-plum shadow-md backdrop-blur transition-opacity hover:bg-white disabled:opacity-0";

// Main photo with swipe (phones), arrows and thumbnails (everywhere). Tapping the photo opens a
// full-screen viewer with zoom. Shows a neutral "photo coming soon" tile when there are none.
export default function ProductGallery({ product, colorwayName }: { product: Product; colorwayName?: string }) {
  const photos = productPhotos(product);
  const cover = product.colorways.find((c) => c.name === colorwayName) ?? product.colorways[0];
  const bg = cover?.bg;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  const goTo = useCallback((i: number, smooth = true) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setActive(i);
  }, []);

  function handleScroll() {
    const el = trackRef.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (photos.length === 0) {
    return (
      <div className="relative -mx-4 aspect-[4/5] overflow-hidden sm:mx-0 sm:rounded-2xl">
        <ProductPhoto alt={product.name} />
      </div>
    );
  }

  const many = photos.length > 1;

  return (
    <div>
      <div className="group relative -mx-4 sm:mx-0">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto sm:rounded-2xl"
          style={{ background: bg }}
          aria-roledescription="carousel"
          aria-label={`${product.name} photos`}
        >
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setViewerOpen(true)}
              aria-label={`View photo ${i + 1} of ${photos.length} full screen`}
              className="relative aspect-[4/5] w-full shrink-0 cursor-zoom-in snap-center"
            >
              <ProductPhoto
                src={src}
                alt={`${product.name}, photo ${i + 1} of ${photos.length}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {many && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
              <button type="button" aria-label="Previous photo" disabled={active === 0} onClick={() => goTo(active - 1)} className={`pointer-events-auto ${arrow}`}>
                <FiChevronLeft />
              </button>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
              <button
                type="button"
                aria-label="Next photo"
                disabled={active === photos.length - 1}
                onClick={() => goTo(active + 1)}
                className={`pointer-events-auto ${arrow}`}
              >
                <FiChevronRight />
              </button>
            </div>
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/60 px-2.5 py-1 text-xs font-semibold text-white">
              {active + 1} / {photos.length}
            </span>
          </>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-plum shadow">
          <FiMaximize2 /> Tap to zoom
        </span>
      </div>

      {many && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Choose photo">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1}`}
              onClick={() => goTo(i)}
              className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition sm:w-20 ${
                i === active ? "ring-rose-dark" : "opacity-70 ring-transparent hover:opacity-100"
              }`}
              style={{ background: bg }}
            >
              <ProductPhoto src={src} alt="" label={false} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {viewerOpen && (
        <PhotoViewer
          photos={photos}
          start={active}
          name={product.name}
          onClose={(last) => {
            setViewerOpen(false);
            goTo(last, false);
          }}
        />
      )}
    </div>
  );
}
