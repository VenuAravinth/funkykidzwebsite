"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { FiCamera, FiCheckCircle, FiChevronLeft, FiChevronRight, FiEdit3, FiPlay, FiVideo, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useLoginModal } from "@/context/LoginModalContext";
import { api } from "@/lib/api";
import { resizeImage, uploadRaw } from "@/lib/imageResize";
import { reviewMedia, REVIEW_LIMITS, REVIEW_PAGE_SIZE, type Review, type ReviewMedia, type ReviewStats } from "@/lib/reviews";
import PhotoViewer from "./PhotoViewer";

type Eligibility = "loading" | "login" | "ok" | "not-purchased" | "reviewed";

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`flex gap-0.5 text-gold ${className}`} aria-label={`${value.toFixed(1).replace(/\.0$/, "")} out of 5 stars`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className={i < Math.round(value) ? "" : "text-ink/15"} />
      ))}
    </span>
  );
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Customer reviews for one product: rating summary across all reviews, a swipeable row of
// review cards that fetches 10 more whenever the shopper nears the end, and a form for
// customers who bought it.
export default function ProductReviews({
  productSlug,
  productName,
  initialReviews,
  initialStats,
}: {
  productSlug: string;
  productName: string;
  initialReviews: Review[]; // first page
  initialStats: ReviewStats;
}) {
  const { currentUser, ready } = useAuth();
  const { openLogin } = useLoginModal();
  const [reviews, setReviews] = useState(initialReviews);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [eligibility, setEligibility] = useState<Eligibility>("loading");
  const [writing, setWriting] = useState(false);
  const [viewer, setViewer] = useState<{ photos: string[]; start: number } | null>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });
  const trackRef = useRef<HTMLUListElement>(null);
  const loadingRef = useRef(false);
  // Where the next page starts. Kept in a ref so two quick triggers can't request the same page.
  const nextOffsetRef = useRef(initialReviews.length);

  const userId = currentUser?.id ?? null;
  const hasMore = reviews.length < stats.count;

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    api<{ status: Eligibility }>(`/api/reviews/eligibility?product=${encodeURIComponent(productSlug)}`).then((res) => {
      if (alive) setEligibility(res.ok ? res.data.status : "not-purchased");
    });
    return () => {
      alive = false;
    };
  }, [ready, userId, productSlug]);

  /** Fetches the next 10 reviews after the ones already shown. */
  const loadMore = useCallback(async () => {
    if (loadingRef.current) return false;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(false);
    const res = await api<{ reviews: Review[]; total: number }>(
      `/api/reviews?product=${encodeURIComponent(productSlug)}&offset=${nextOffsetRef.current}&limit=${REVIEW_PAGE_SIZE}`,
    );
    if (res.ok) nextOffsetRef.current += res.data.reviews.length;
    loadingRef.current = false;
    setLoading(false);
    if (!res.ok) {
      setLoadError(true);
      return false;
    }
    setReviews((prev) => {
      const seen = new Set(prev.map((r) => r.id));
      return [...prev, ...res.data.reviews.filter((r) => !seen.has(r.id))];
    });
    setStats((s) => (res.data.total > s.count ? { ...s, count: res.data.total } : s));
    return res.data.reviews.length > 0;
  }, [productSlug]);

  // Arrow states, plus: when the shopper swipes or scrolls close to the last loaded card,
  // quietly fetch the next batch so the row never runs dry.
  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setEdges({ atStart: el.scrollLeft < 8, atEnd: remaining < 8 });
    if (hasMore && remaining < el.clientWidth * 0.75) void loadMore();
  }, [hasMore, loadMore]);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateEdges, reviews.length]);

  async function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // At the end of what's loaded: fetch the next 10 first, then move on to them.
    if (dir === 1 && edges.atEnd && hasMore) {
      const added = await loadMore();
      if (!added) return;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth;
    const perView = Math.max(1, Math.floor((el.clientWidth + 16) / step));
    el.scrollBy({ left: dir * step * perView, behavior: "smooth" });
  }

  function handleSubmitted(review: Review) {
    nextOffsetRef.current += 1; // the new review sits at the top of the server's list too
    setReviews((prev) => [review, ...prev]);
    setStats((s) => {
      const count = s.count + 1;
      return {
        count,
        average: (s.average * s.count + review.rating) / count,
        breakdown: s.breakdown.map((b) => (b.stars === review.rating ? { ...b, count: b.count + 1 } : b)),
      };
    });
    setWriting(false);
    setEligibility("reviewed");
    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }

  const arrow =
    "grid h-11 w-11 place-items-center rounded-full border border-plum/15 bg-white text-xl text-plum shadow-sm transition-colors hover:bg-plum hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-plum";

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24 border-t border-plum/10 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-heading" className="font-serif-display text-2xl font-bold text-plum md:text-3xl">
          Customer Reviews
        </h2>
        {reviews.length > 0 && (
          <div className="flex gap-2">
            <button type="button" aria-label="Previous reviews" onClick={() => scrollByPage(-1)} disabled={edges.atStart} className={arrow}>
              <FiChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Next reviews"
              onClick={() => scrollByPage(1)}
              disabled={(edges.atEnd && !hasMore) || loading}
              className={arrow}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Summary + write a review */}
      <div className="mt-6 grid gap-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-10 lg:grid-cols-[auto_1fr_auto]">
        {stats.count > 0 ? (
          <>
            <div className="flex items-end gap-3">
              <p className="font-serif-display text-5xl font-bold leading-none text-plum">{stats.average.toFixed(1)}</p>
              <div className="pb-1">
                <Stars value={stats.average} className="text-lg" />
                <p className="mt-1 text-xs text-ink/55">
                  Based on {stats.count} {stats.count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 md:max-w-md">
              {stats.breakdown.map(({ stars, count }) => (
                <li key={stars} className="flex items-center gap-2 text-xs text-ink/60">
                  <span className="flex w-8 shrink-0 items-center gap-0.5 font-semibold">
                    {stars} <FaStar className="text-gold" />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                    <span className="block h-full rounded-full bg-gold" style={{ width: `${(count / stats.count) * 100}%` }} />
                  </span>
                  <span className="w-6 shrink-0 text-right">{count}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-ink/60 md:col-span-2">No reviews yet. Bought this? Be the first to share how it fits and feels.</p>
        )}

        <div className="border-t border-plum/10 pt-5 md:col-span-2 lg:col-span-1 lg:w-64 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {eligibility === "ok" && !writing && (
            <button
              type="button"
              onClick={() => setWriting(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-plum px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <FiEdit3 /> Write a review
            </button>
          )}
          {eligibility === "ok" && writing && <p className="text-sm text-ink/55">Writing your review below…</p>}
          {eligibility === "login" && (
            <>
              <p className="text-sm text-ink/60">Bought this? Log in to review it.</p>
              <button
                type="button"
                onClick={() => openLogin("Log in to review a product you've bought.")}
                className="mt-3 w-full rounded-full border border-plum/20 px-6 py-3 text-sm font-semibold text-plum hover:border-rose-dark"
              >
                Log in to write a review
              </button>
            </>
          )}
          {eligibility === "not-purchased" && (
            <p className="text-sm text-ink/55">Reviews are from verified buyers only. Once you&apos;ve bought this, you can review it here.</p>
          )}
          {eligibility === "reviewed" && (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <FiCheckCircle /> Thanks for reviewing this product!
            </p>
          )}
        </div>
      </div>

      {writing && (
        <div className="mt-6">
          <ReviewForm productSlug={productSlug} productName={productName} onCancel={() => setWriting(false)} onSubmitted={handleSubmitted} />
        </div>
      )}

      {reviews.length > 0 && (
        <div className="relative mt-6">
          <ul
            ref={trackRef}
            onScroll={updateEdges}
            aria-label="Customer reviews"
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
          >
            {reviews.map((r, i) => (
              <ReviewCard key={r.id ?? `${r.name}-${r.date}-${i}`} review={r} onOpenPhoto={(photos, start) => setViewer({ photos, start })} />
            ))}
            {hasMore && (
              <li className={`${CARD_WIDTH} flex shrink-0 snap-start items-center justify-center rounded-2xl border-2 border-dashed border-plum/10`} aria-hidden={!loading}>
                {loadError ? (
                  <button type="button" onClick={() => loadMore()} className="rounded-full border border-plum/20 px-5 py-2.5 text-sm font-semibold text-plum">
                    Couldn&apos;t load more — retry
                  </button>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-ink/50" role="status">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark" aria-hidden />
                    Loading more reviews…
                  </span>
                )}
              </li>
            )}
          </ul>
          <p className="mt-2 text-center text-xs text-ink/45 sm:hidden">
            Swipe or use the arrows · {reviews.length} of {stats.count} loaded
          </p>
        </div>
      )}

      {viewer && <PhotoViewer photos={viewer.photos} start={viewer.start} name={`Customer photo of ${productName}`} onClose={() => setViewer(null)} />}
    </section>
  );
}

// Card widths: most of the screen on phones (the next card peeks in), 2 across on tablets,
// 3 on laptops and 4 on wide screens.
const CARD_WIDTH = "w-[85%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] 2xl:w-[calc((100%-3rem)/4)]";

function ReviewCard({ review, onOpenPhoto }: { review: Review; onOpenPhoto: (photos: string[], start: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const media = reviewMedia(review);
  const photos = media.filter((m) => m.type === "image").map((m) => m.url);
  const videos = media.filter((m) => m.type === "video");
  const long = review.quote.length > 220;

  return (
    <li className={`${CARD_WIDTH} flex shrink-0 snap-start flex-col rounded-2xl bg-white p-5 shadow-sm`}>
      <div className="flex items-center gap-3">
        <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-rose-light/60 font-serif-display font-bold text-rose-dark">
          {review.avatarUrl ? <Image src={review.avatarUrl} alt="" fill sizes="40px" className="object-cover" /> : review.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-plum">
            {review.name}
            {review.city && <span className="font-normal text-ink/50"> · {review.city}</span>}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink/50">
            {review.verified !== false && (
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <FiCheckCircle /> Verified buyer
              </span>
            )}
            <time dateTime={review.date}>{formatDate(review.date)}</time>
          </p>
        </div>
      </div>
      <Stars value={review.rating} className="mt-3 text-sm" />
      <p className={`mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/75 ${long && !expanded ? "line-clamp-5" : ""}`}>{review.quote}</p>
      {long && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-1 self-start text-xs font-semibold text-rose-dark hover:underline">
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {(photos.length > 0 || videos.length > 0) && (
        <div className="no-scrollbar mt-auto flex gap-2 overflow-x-auto pt-4">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onOpenPhoto(photos, i)}
              aria-label={`Open customer photo ${i + 1}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream"
            >
              <Image src={src} alt={`Photo from ${review.name}`} fill sizes="80px" className="object-cover transition-transform hover:scale-105" />
            </button>
          ))}
          {videos.map((v) => (
            <video
              key={v.url}
              src={v.url}
              controls
              playsInline
              preload="metadata"
              className="h-20 w-32 shrink-0 rounded-xl bg-ink object-cover"
              aria-label={`Video from ${review.name}`}
            />
          ))}
        </div>
      )}
    </li>
  );
}

type Attachment = ReviewMedia & { preview: string };

function ReviewForm({
  productSlug,
  productName,
  onCancel,
  onSubmitted,
}: {
  productSlug: string;
  productName: string;
  onCancel: () => void;
  onSubmitted: (review: Review) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const photoCount = attachments.filter((a) => a.type === "image").length;
  const hasVideo = attachments.some((a) => a.type === "video");
  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  async function addPhotos(files: File[]) {
    setError("");
    const room = REVIEW_LIMITS.maxImages - photoCount;
    for (const [i, file] of files.slice(0, room).entries()) {
      setUploading(`Uploading photo ${i + 1} of ${Math.min(files.length, room)}…`);
      let blob: Blob;
      try {
        blob = await resizeImage(file, 1600);
      } catch {
        setError(`Couldn't read “${file.name}”. Try a JPG or PNG photo.`);
        continue;
      }
      const res = await uploadRaw<{ media: ReviewMedia }>("/api/reviews/media", blob, "image/jpeg");
      if (!res.ok) {
        setError(res.error);
        break;
      }
      setAttachments((prev) => [...prev, { ...res.data.media, preview: res.data.media.url }]);
    }
    if (files.length > room) setError(`You can add up to ${REVIEW_LIMITS.maxImages} photos.`);
    setUploading(null);
    if (photoRef.current) photoRef.current.value = "";
  }

  async function addVideo(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > REVIEW_LIMITS.maxVideoMb * 1024 * 1024) {
      setError(`That video is over ${REVIEW_LIMITS.maxVideoMb} MB. Please trim it or choose a shorter clip.`);
      return;
    }
    const type = file.type || "video/mp4";
    setUploading("Uploading video… this can take a minute on mobile data.");
    const res = await uploadRaw<{ media: ReviewMedia }>("/api/reviews/media", file, type);
    setUploading(null);
    if (videoRef.current) videoRef.current.value = "";
    if (!res.ok) return setError(res.error);
    setAttachments((prev) => [...prev, { ...res.data.media, preview: res.data.media.url }]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (rating === 0) return setError("Please choose a star rating.");
    if (text.trim().length < REVIEW_LIMITS.minText) return setError(`Please write at least ${REVIEW_LIMITS.minText} characters.`);
    setBusy(true);
    const res = await api<{ review: Review }>("/api/reviews", {
      body: { productSlug, rating, text, media: attachments.map(({ type, url }) => ({ type, url })) },
    });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    onSubmitted(res.data.review);
  }

  const shownRating = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-rose-light bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif-display text-xl font-bold text-plum">Write a review</h3>
          <p className="mt-0.5 text-xs text-ink/50">{productName}</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Cancel review" className="grid h-9 w-9 place-items-center rounded-full text-ink/50 hover:bg-cream">
          <FiX />
        </button>
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-wide text-ink/50">Your rating</legend>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex gap-1" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className="p-0.5 text-3xl transition-transform hover:scale-110"
              >
                <FaStar className={n <= shownRating ? "text-gold" : "text-ink/15"} />
              </button>
            ))}
          </div>
          <span className="text-sm font-semibold text-plum">{labels[shownRating]}</span>
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="review-text" className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Your review
        </label>
        <textarea
          id="review-text"
          rows={4}
          maxLength={REVIEW_LIMITS.maxText}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How was the fit, fabric and quality? Did your little one love it?"
          className="mt-2 w-full rounded-xl border border-plum/15 bg-cream/40 px-4 py-3 text-base text-ink outline-none focus:border-rose-dark sm:text-sm"
        />
        <p className="mt-1 text-right text-[11px] text-ink/40">
          {text.length}/{REVIEW_LIMITS.maxText}
        </p>
      </div>

      <div className="mt-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Photos &amp; video (optional)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.url} className="relative h-20 w-20 overflow-hidden rounded-xl bg-ink">
              {a.type === "image" ? (
                // Draft uploads are private to this customer, so skip the public image optimiser.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <video src={a.preview} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  <FiPlay className="absolute inset-0 m-auto text-2xl text-white" />
                </>
              )}
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((x) => x.url !== a.url))}
                aria-label="Remove attachment"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs text-ink shadow"
              >
                <FiX />
              </button>
            </div>
          ))}
          {photoCount < REVIEW_LIMITS.maxImages && (
            <button
              type="button"
              disabled={Boolean(uploading)}
              onClick={() => photoRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-plum/20 text-xs font-semibold text-plum hover:border-rose-dark disabled:opacity-50"
            >
              <FiCamera className="text-lg" /> Photos
            </button>
          )}
          {!hasVideo && (
            <button
              type="button"
              disabled={Boolean(uploading)}
              onClick={() => videoRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-plum/20 text-xs font-semibold text-plum hover:border-rose-dark disabled:opacity-50"
            >
              <FiVideo className="text-lg" /> Video
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-ink/45">
          Up to {REVIEW_LIMITS.maxImages} photos and 1 video (max {REVIEW_LIMITS.maxVideoMb} MB).
        </p>
        {uploading && (
          <p className="mt-2 text-sm font-medium text-plum" role="status">
            {uploading}
          </p>
        )}
        <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => addPhotos(Array.from(e.target.files ?? []))} />
        <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => addVideo(e.target.files?.[0])} />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-rose-dark">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-full border border-plum/15 px-6 py-3 text-sm font-semibold text-ink/70 hover:border-rose-dark">
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || Boolean(uploading)}
          className="rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {busy ? "Posting…" : "Post review"}
        </button>
      </div>
    </form>
  );
}
