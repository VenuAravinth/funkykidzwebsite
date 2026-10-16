"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCamera, FiMic, FiSearch, FiX } from "react-icons/fi";
import { trackSearch } from "@/lib/analytics";
import { useSpeechSearch } from "@/lib/useSpeechSearch";
import VisualSearchDialog from "./VisualSearchDialog";

const EASE = [0.16, 1, 0.3, 1] as const;

// Minimal header search: an icon (pill on wide screens) that smoothly expands into a text
// field. Enter or the search icon opens the Shop page with the results — no dropdown.
// On phones the open field spans the header row; on desktop it grows in place.
export default function HeaderSearch({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [visualOpen, setVisualOpen] = useState(false);

  // Voice: spoken words appear in the box as they're recognised; when speech ends the text
  // stays there to edit, and Enter / the search icon runs the search as usual.
  const voice = useSpeechSearch((text, final) => {
    setQuery(text);
    if (final) {
      requestAnimationFrame(() => {
        const el = inputRef.current;
        el?.focus();
        el?.setSelectionRange(el.value.length, el.value.length);
      });
    }
  });

  function expand() {
    // Start from the current search when already on a results page.
    const current = new URLSearchParams(window.location.search).get("q");
    if (window.location.pathname === "/collections" && current) setQuery(current);
    setOpen(true);
    onOpenChange?.(true);
  }

  function collapse() {
    voice.stop();
    voice.clearError();
    setOpen(false);
    onOpenChange?.(false);
  }

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && collapse();
    // Clicking anywhere outside an empty field closes it again.
    const onDown = (e: PointerEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node) && !inputRef.current?.value) collapse();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    trackSearch(q);
    router.push(`/collections?q=${encodeURIComponent(q)}`);
    inputRef.current?.blur();
    collapse();
  }

  const spring = reduce ? { duration: 0 } : { duration: 0.35, ease: EASE };

  return (
    // Desktop: the field is anchored to this wrapper (grows leftwards from the pill).
    // Phones/tablets: no positioning here, so it overlays the whole header row instead.
    <span className="flex items-center md:relative">
      {/* Collapsed: icon on phones/tablets, a quiet pill on wide screens. */}
      <button
        type="button"
        onClick={expand}
        aria-label="Search products"
        aria-expanded={open}
        className={`grid h-10 w-10 place-items-center rounded-full text-ink/80 transition-colors hover:bg-rose-light/50 hover:text-rose-dark xl:mr-2 xl:flex xl:w-64 xl:justify-start xl:gap-2 xl:border xl:border-plum/15 xl:px-4 xl:text-sm xl:text-ink/50 xl:hover:border-plum/40 ${
          open ? "invisible" : ""
        }`}
      >
        <FiSearch className="text-lg" />
        <span className="hidden xl:inline">Search products…</span>
      </button>
      <button
        type="button"
        onClick={() => setVisualOpen(true)}
        aria-label="Search by photo"
        title="Search by photo"
        className={`grid h-10 w-10 place-items-center rounded-full text-ink/80 transition-colors hover:bg-rose-light/50 hover:text-rose-dark xl:absolute xl:right-3 xl:top-1/2 xl:h-8 xl:w-8 xl:-translate-y-1/2 xl:text-base xl:text-ink/50 ${
          open ? "invisible" : ""
        }`}
      >
        <FiCamera />
      </button>
      <VisualSearchDialog open={visualOpen} onClose={() => setVisualOpen(false)} />

      <AnimatePresence>
        {open && (
          <motion.form
            ref={formRef}
            role="search"
            onSubmit={submit}
            key="search"
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.6 }}
            transition={spring}
            style={{ transformOrigin: "right center" }}
            className="absolute inset-x-3 top-1/2 z-10 -translate-y-1/2 sm:inset-x-6 md:inset-x-auto md:right-0 md:w-[min(420px,55vw)] xl:right-2"
          >
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <div className="flex h-11 items-center gap-1 rounded-full bg-white pl-4 pr-1 shadow-[0_6px_24px_-10px_rgba(54,42,69,0.35)] ring-1 ring-plum/10 focus-within:ring-2 focus-within:ring-rose/40">
              <input
                ref={inputRef}
                id="header-search"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={voice.listening ? "Listening… speak now" : voice.error ?? "Search dresses, hanbok, sizes…"}
                className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent text-base text-ink shadow-none outline-none ring-0 placeholder:text-ink/40 focus:outline-none focus-visible:outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/40 hover:text-plum"
                >
                  <FiX />
                </button>
              )}
              {voice.supported && (
                <button
                  type="button"
                  onClick={() => (voice.listening ? voice.stop() : voice.start())}
                  aria-label={voice.listening ? "Stop voice search" : "Search by voice"}
                  aria-pressed={voice.listening}
                  title={voice.listening ? "Stop listening" : "Search by voice"}
                  className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
                    voice.listening ? "bg-rose-light text-rose-dark" : "text-ink/50 hover:bg-plum/5 hover:text-plum"
                  }`}
                >
                  {voice.listening && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-rose/30" />}
                  <FiMic className="relative" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  collapse();
                  setVisualOpen(true);
                }}
                aria-label="Search by photo"
                title="Search by photo"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-plum/5 hover:text-plum"
              >
                <FiCamera />
              </button>
              <button
                type="submit"
                aria-label="Search"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose text-white transition-colors hover:bg-rose-dark"
              >
                <FiSearch />
              </button>
              <button
                type="button"
                onClick={collapse}
                aria-label="Close search"
                className="h-9 shrink-0 rounded-full px-2.5 text-sm font-semibold text-plum/70 hover:text-plum md:hidden"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </span>
  );
}
