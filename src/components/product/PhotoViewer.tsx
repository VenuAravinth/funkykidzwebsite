"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";

const ZOOM = 2.5;

// Full-screen photo viewer: swipe/arrow keys between photos, tap or click to zoom in at that
// spot, then drag (touch) or move the mouse to look around.
export default function PhotoViewer({ photos, start, name, onClose }: { photos: string[]; start: number; name: string; onClose: (index: number) => void }) {
  const [index, setIndex] = useState(start);
  const [zoomed, setZoomed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // Size of the zoomed photo in px: ZOOM × its fitted size, so zooming never adds empty margins.
  const [zoomSize, setZoomSize] = useState<{ w: number; h: number } | null>(null);
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= photos.length) return;
      setZoomed(false);
      setIndex(next);
    },
    [photos.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(indexRef.current);
      if (e.key === "ArrowRight") go(indexRef.current + 1);
      if (e.key === "ArrowLeft") go(indexRef.current - 1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  // Zoom in on the tapped point (or the centre), keeping that point in view.
  function zoomIn(clientX?: number, clientY?: number) {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img || !img.naturalWidth) return;
    const box = stage.getBoundingClientRect();
    const fit = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
    const w = img.naturalWidth * fit * ZOOM;
    const h = img.naturalHeight * fit * ZOOM;
    const shown = img.getBoundingClientRect();
    const fx = clientX === undefined ? 0.5 : Math.min(1, Math.max(0, (clientX - shown.left) / shown.width));
    const fy = clientY === undefined ? 0.5 : Math.min(1, Math.max(0, (clientY - shown.top) / shown.height));
    setZoomSize({ w, h });
    setZoomed(true);
    requestAnimationFrame(() => {
      stage.scrollLeft = fx * w - box.width / 2;
      stage.scrollTop = fy * h - box.height / 2;
    });
  }

  function toggleZoom(e: React.MouseEvent) {
    if (zoomed) setZoomed(false);
    else zoomIn(e.clientX, e.clientY);
  }

  // Desktop: while zoomed, the view follows the mouse.
  function onMouseMove(e: React.MouseEvent) {
    const stage = stageRef.current;
    if (!zoomed || !stage || !window.matchMedia("(hover: hover)").matches) return;
    const rect = stage.getBoundingClientRect();
    stage.scrollLeft = ((e.clientX - rect.left) / rect.width) * (stage.scrollWidth - rect.width);
    stage.scrollTop = ((e.clientY - rect.top) / rect.height) * (stage.scrollHeight - rect.height);
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex flex-col text-white"
      style={{ background: "#181320" }} role="dialog" aria-modal="true" aria-label={`${name} photos`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-semibold">
          {index + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (zoomed ? setZoomed(false) : zoomIn())}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20"
          >
            {zoomed ? <FiZoomOut /> : <FiZoomIn />}
          </button>
          <button type="button" onClick={() => onClose(index)} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20">
            <FiX />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={stageRef}
          onClick={toggleZoom}
          onMouseMove={onMouseMove}
          onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={(e) => {
            const s = touch.current;
            touch.current = null;
            if (!s || zoomed) return;
            const dx = e.changedTouches[0].clientX - s.x;
            const dy = e.changedTouches[0].clientY - s.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) go(index + (dx < 0 ? 1 : -1));
          }}
          className={`no-scrollbar absolute inset-0 ${zoomed ? "cursor-zoom-out overflow-auto" : "cursor-zoom-in overflow-hidden"}`}
        >
          {/* Full-resolution original so zoomed detail stays sharp. */}
          <div
            className={`flex min-h-full min-w-full items-center justify-center ${zoomed ? "" : "h-full w-full"}`}
            style={zoomed && zoomSize ? { width: zoomSize.w, height: zoomSize.h } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              key={photos[index]}
              src={photos[index]}
              alt={`${name}, photo ${index + 1} of ${photos.length}`}
              draggable={false}
              className="block select-none object-contain"
              style={
                zoomed && zoomSize
                  ? { width: zoomSize.w, height: zoomSize.h, maxWidth: "none" }
                  : { maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto" }
              }
            />
          </div>
        </div>

        {photos.length > 1 && !zoomed && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              disabled={index === 0}
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl hover:bg-white/25 disabled:opacity-0"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              disabled={index === photos.length - 1}
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl hover:bg-white/25 disabled:opacity-0"
            >
              <FiChevronRight />
            </button>
          </>
        )}
      </div>

      <p className="px-4 py-3 text-center text-xs text-white/60">
        {zoomed ? "Drag to look around · tap to zoom out" : photos.length > 1 ? "Swipe or use the arrows · tap to zoom" : "Tap to zoom"}
      </p>
    </div>,
    document.body,
  );
}
