"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiCamera, FiCheckCircle, FiImage, FiRefreshCw, FiUploadCloud, FiX } from "react-icons/fi";
import { api } from "@/lib/api";
import { useProducts } from "@/context/ProductsContext";
import { trackSearch } from "@/lib/analytics";
import ProductCard from "@/components/collections/ProductCard";
import type { Product } from "@/lib/products";

type Match = { slug: string; colorway: string; score: number; match: "exact" | "similar" };
type Result = { matches: Match[]; looksLikeClothing: boolean; usedPhotos: boolean };
type State =
  | { step: "pick" }
  | { step: "analysing"; preview: string }
  | { step: "done"; preview: string; result: Result }
  | { step: "error"; preview?: string; message: string };

const MAX_SIDE = 512;
const noopSubscribe = () => () => {};

/** Downscales to ≤512px JPEG in the browser: fast upload, and enough detail for matching. */
async function prepare(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// "Search by photo": upload / paste / drop a screenshot (e.g. from our Instagram) or take a
// photo, and see the matching product first, then the closest-looking styles.
export default function VisualSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  // Picking a product navigates away — close the dialog when the page changes.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (open) onClose();
  }, [pathname, open, onClose]);

  // Rendered into <body>: the sticky header's backdrop blur would otherwise trap this
  // "fixed" overlay inside the 72px header.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<AnimatePresence>{open && <Body key="visual" onClose={onClose} />}</AnimatePresence>, document.body);
}

function Body({ onClose }: { onClose: () => void }) {
  const { getProduct } = useProducts();
  const [state, setState] = useState<State>({ step: "pick" });
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const run = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setState({ step: "error", message: "That isn't an image. Please choose a photo or screenshot." });
      return;
    }
    let preview: string;
    try {
      preview = await prepare(file);
    } catch {
      setState({ step: "error", message: "We couldn't open that image. Try a screenshot (PNG or JPG)." });
      return;
    }
    setState({ step: "analysing", preview });
    trackSearch("[photo search]");
    const res = await api<Result>("/api/visual-search", { body: { image: preview } });
    if (!res.ok) setState({ step: "error", preview, message: res.error });
    else setState({ step: "done", preview, result: res.data });
  }, []);

  // Esc, scroll lock, and paste-a-screenshot (Ctrl/Cmd+V).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onPaste = (e: ClipboardEvent) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        void run(file);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("paste", onPaste);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("paste", onPaste);
      document.body.style.overflow = overflow;
    };
  }, [onClose, run]);

  const products =
    state.step === "done"
      ? state.result.matches
          .map((m) => ({ m, p: getProduct(m.slug) }))
          .filter((x): x is { m: Match; p: Product } => Boolean(x.p))
      : [];
  const exact = products.filter((x) => x.m.match === "exact");
  const similar = products.filter((x) => x.m.match !== "exact");

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[80] bg-ink/50 backdrop-blur-[2px]"
      />
      {/* Bottom sheet on phones, centred panel from sm up. The wrapper does the positioning so the
          entrance animation (transform) never fights the centring. */}
      <div className="pointer-events-none fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="visual-search-title"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:max-h-[88dvh] sm:w-[min(920px,100%)] sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-plum/10 px-5 py-4">
          <div>
            <h2 id="visual-search-title" className="font-serif-display text-xl font-bold text-plum">
              Search by photo
            </h2>
            <p className="text-xs text-ink/55">Upload a screenshot or photo — we&apos;ll find it in our shop.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full text-plum hover:bg-rose-light">
            <FiX className="text-xl" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => run(e.target.files?.[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => run(e.target.files?.[0])} />

          {state.step === "pick" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void run(e.dataTransfer.files?.[0]);
              }}
              className={`flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? "border-rose-dark bg-rose-light/40" : "border-plum/20 bg-white"
              }`}
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-rose-light/70 text-3xl text-rose-dark">
                <FiImage />
              </span>
              <p className="mt-4 font-semibold text-plum">Drop a screenshot here, or choose one</p>
              <p className="mt-1 max-w-sm text-sm text-ink/55">
                Saw an outfit on our Instagram? Screenshot it and upload it here. You can also paste (Ctrl/⌘ + V).
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-full bg-plum px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-plum-light"
                >
                  <FiUploadCloud /> Upload photo
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="hidden items-center gap-2 rounded-full border border-plum/20 bg-white px-6 py-3 text-sm font-bold text-plum [@media(pointer:coarse)]:flex"
                >
                  <FiCamera /> Take photo
                </button>
              </div>
              <p className="mt-6 text-xs text-ink/45">Tip: crop to just the outfit for the best results. Your photo isn&apos;t saved.</p>
            </div>
          )}

          {(state.step === "analysing" || state.step === "done" || (state.step === "error" && state.preview)) && (
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm sm:h-28 sm:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.preview} alt="Your photo" className="h-full w-full object-cover" />
                {state.step === "analysing" && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-rose/50 to-transparent"
                    initial={{ top: "-33%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {state.step === "analysing" && (
                  <>
                    <p className="font-semibold text-plum">Looking for matching styles…</p>
                    <p className="text-sm text-ink/55">Comparing your photo with our collection.</p>
                  </>
                )}
                {state.step === "done" && (
                  <>
                    <p className="font-semibold text-plum">
                      {exact.length ? "We found this in our shop!" : state.result.looksLikeClothing ? "Closest matches from our shop" : "We couldn't spot an outfit"}
                    </p>
                    <p className="text-sm text-ink/55">
                      {exact.length
                        ? "Exact match first, then similar styles."
                        : state.result.looksLikeClothing
                          ? "No exact match — here are the most similar styles."
                          : "Try a photo where the outfit fills more of the picture. Meanwhile, here are popular styles."}
                    </p>
                  </>
                )}
                {state.step === "error" && <p className="text-sm font-medium text-rose-dark">{state.message}</p>}
                {state.step !== "analysing" && (
                  <button
                    type="button"
                    onClick={() => setState({ step: "pick" })}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-dark hover:underline"
                  >
                    <FiRefreshCw /> Try another photo
                  </button>
                )}
              </div>
            </div>
          )}

          {state.step === "error" && !state.preview && (
            <div className="rounded-2xl bg-white p-6 text-center">
              <p className="text-sm font-medium text-rose-dark">{state.message}</p>
              <button type="button" onClick={() => setState({ step: "pick" })} className="mt-3 text-sm font-semibold text-plum underline">
                Try again
              </button>
            </div>
          )}

          {state.step === "analysing" && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          )}

          {state.step === "done" && exact.length > 0 && (
            <section className="mt-6" aria-labelledby="vs-exact">
              <h3 id="vs-exact" className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                <FiCheckCircle /> Exact match
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {exact.map(({ p }) => (
                  <div key={p.slug} className="rounded-3xl ring-2 ring-emerald-500 ring-offset-4 ring-offset-cream">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {state.step === "done" && similar.length > 0 && (
            <section className="mt-8" aria-labelledby="vs-similar">
              <h3 id="vs-similar" className="mb-3 text-sm font-bold uppercase tracking-wide text-plum/70">
                {exact.length ? "Similar styles" : "Visually similar"}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {similar.slice(0, 8).map(({ p }) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
      </div>
    </>
  );
}
