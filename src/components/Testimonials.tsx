import ReviewCard from "./ReviewCard";
import { getReviews } from "@/server/catalog";

// Approved reviews from the MongoDB `reviews` collection; renders nothing until there are some.
export default async function Testimonials({ title = "What parents say", limit = 3 }: { title?: string; limit?: number }) {
  const reviews = await getReviews();
  if (reviews.length === 0) return null;
  const shown = reviews.slice(0, limit);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 md:pl-24 md:pr-12">
      <h2 className="mb-6 font-serif-display text-2xl font-bold text-plum md:text-3xl">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => (
          <ReviewCard key={`${r.name}-${r.date}`} review={r} />
        ))}
      </div>
    </section>
  );
}
