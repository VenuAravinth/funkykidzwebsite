import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import ProductGrid from "@/components/collections/ProductGrid";
import type { Product } from "@/lib/products";

// A titled row of real catalogue products: 2 per row on phones, 4 across on desktop.
export default function ProductShelf({
  id,
  title,
  subtitle,
  products,
  viewAllHref,
  priority = false,
}: {
  id: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  priority?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:pl-24 md:pr-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id={id} className="font-serif-display text-2xl font-bold text-plum md:text-3xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="flex shrink-0 items-center gap-1 py-2.5 text-sm font-semibold text-rose-dark hover:underline"
        >
          View all <FiArrowRight />
        </Link>
      </div>
      <ProductGrid products={products} className="grid-cols-2 md:grid-cols-4" priorityCount={priority ? 2 : 0} />
    </section>
  );
}
