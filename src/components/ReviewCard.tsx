import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import type { Review } from "@/lib/reviews";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-rose-light/60 bg-white p-5 shadow-sm">
      <p className="flex gap-0.5 text-sm text-gold" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar key={i} className={i < review.rating ? "" : "text-ink/15"} />
        ))}
      </p>
      <p className="text-sm leading-relaxed text-ink/70">{review.quote}</p>
      {review.photo && (
        <div className="relative aspect-square w-24 overflow-hidden rounded-lg">
          <Image src={review.photo} alt={`Photo shared by ${review.name}`} fill sizes="96px" className="object-cover" unoptimized />
        </div>
      )}
      <div className="mt-auto pt-1 text-xs">
        <p className="font-semibold text-plum">
          {review.name}
          {review.city ? <span className="font-normal text-ink/50"> · {review.city}</span> : null}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-ink/45">
          <FiCheckCircle className="text-rose-dark" /> Verified buyer ·{" "}
          {new Date(review.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </p>
      </div>
    </article>
  );
}
