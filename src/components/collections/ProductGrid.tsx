import type { Product } from "@/lib/products";
import ProductCard from "./ProductCard";
import { gridLayoutOption, type GridLayout } from "./gridLayout";

// 2 per row on phones, 4 on wide screens. Pass `className` to change the column count, or
// `layout` to use one of the shopper-selectable layouts (columns, spacing and card size together).
export default function ProductGrid({
  products,
  className = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  layout,
  priorityCount = 0,
  emptyMessage = "No products match these filters.",
}: {
  products: Product[];
  className?: string;
  layout?: GridLayout;
  priorityCount?: number;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-ink/50">{emptyMessage}</p>;
  }

  const option = layout ? gridLayoutOption(layout) : null;

  return (
    <div className={`grid ${option ? option.gridClass : `gap-x-3 gap-y-8 sm:gap-x-6 ${className}`}`}>
      {products.map((product, i) => (
        <ProductCard
          key={product.slug}
          product={product}
          priority={i < priorityCount}
          density={option?.density}
          imageSizes={option?.imageSizes}
        />
      ))}
    </div>
  );
}
