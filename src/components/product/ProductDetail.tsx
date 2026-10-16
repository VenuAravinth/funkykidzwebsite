"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiRefreshCw, FiTruck } from "react-icons/fi";
import { availableSizes, discountPercent, productStock, sizeStock, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { DELIVERY_DAYS, FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/cartPricing";
import { KIDS_SIZE_CHART } from "@/lib/sizeChart";
import type { Review, ReviewStats } from "@/lib/reviews";
import { trackViewItem } from "@/lib/analytics";
import { setProductSelection } from "@/lib/productSelection";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import ProductGrid from "@/components/collections/ProductGrid";
import BackButton from "@/components/BackButton";
import ProductGallery from "./ProductGallery";
import SizeSelector from "./SizeSelector";
import ColorSelector from "./ColorSelector";
import AddToCartBar from "./AddToCartBar";
import ProductAccordion from "./ProductAccordion";
import ProductReviews from "./ProductReviews";

const tagStyle: Record<NonNullable<Product["tag"]>, string> = {
  Bestseller: "bg-plum text-white",
  New: "bg-rose text-white",
};

export default function ProductDetail({
  product,
  reviews,
  reviewStats,
  related,
}: {
  product: Product;
  reviews: Review[]; // first page only
  reviewStats: ReviewStats;
  related: Product[];
}) {
  // Start on the first colour that can still be bought; its name travels with cart lines and orders.
  const [colorwayName, setColorwayName] = useState(
    () => (product.colorways.find((c) => productStock(product, c.name).status !== "out") ?? product.colorways[0]).name,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    const sizes = availableSizes(product, colorwayName);
    return sizes.length === 1 ? sizes[0] : null;
  });

  const selectColor = (name: string) => {
    setColorwayName(name);
    const sizes = availableSizes(product, name);
    setSelectedSize((size) => (size && sizes.includes(size) ? size : sizes.length === 1 ? sizes[0] : null));
  };

  useEffect(() => {
    trackViewItem({ product });
  }, [product]);

  // Share the current choice with the mobile bottom bar's Buy Now; clear it when leaving.
  useEffect(() => {
    setProductSelection({ slug: product.slug, colorwayName, size: selectedSize });
  }, [product.slug, colorwayName, selectedSize]);
  useEffect(() => () => setProductSelection(null), []);

  const stock = productStock(product, colorwayName);
  const off = discountPercent(product.price, product.oldPrice);
  const rating = reviewStats.count > 0 ? reviewStats : null;
  const chartRows = KIDS_SIZE_CHART.filter((r) => product.sizes.includes(r.size));
  const categoryHref = `/collections?category=${encodeURIComponent(product.category)}`;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:pl-24 md:pr-12 md:py-10">
      <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1">
        <BackButton fallbackHref={categoryHref} fallbackLabel={`Shop ${product.category}`} />
        <nav aria-label="Breadcrumb" className="text-xs text-ink/50 [&_a]:inline-block [&_a]:py-2.5">
        <Link href="/" className="hover:text-rose-dark">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/collections" className="hover:text-rose-dark">Shop</Link>
        <span className="mx-1.5">/</span>
        <Link href={categoryHref} className="hover:text-rose-dark">{product.category}</Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery product={product} colorwayName={colorwayName} />

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-dark">
            {product.gender} · {product.category}
          </p>
          <h1 className="mt-1 font-serif-display text-2xl font-bold leading-tight text-plum md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {product.tag && <span className={`rounded-full px-2.5 py-1 font-bold ${tagStyle[product.tag]}`}>{product.tag}</span>}
            {rating && (
              <a href="#reviews" className="font-semibold text-plum underline-offset-2 hover:underline">
                ★ {rating.average.toFixed(1)} · {rating.count} {rating.count === 1 ? "review" : "reviews"}
              </a>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-bold text-ink">{formatPrice(product.price)}</p>
            {off > 0 && (
              <>
                <s className="text-base text-ink/45">MRP {formatPrice(product.oldPrice!)}</s>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">{off}% off</span>
              </>
            )}
          </div>
          <p
            className={`mt-1 text-xs font-semibold ${
              stock.status === "out" ? "text-ink/50" : stock.status === "low" ? "text-rose-dark" : "text-emerald-700"
            }`}
          >
            {stock.status === "out"
              ? product.colorways.length > 1
                ? `Sold out in ${colorwayName}`
                : "Sold out"
              : stock.status === "low" && stock.units !== undefined
                ? `Only ${stock.units} left`
                : "In stock"}
          </p>

          <p className="mt-3 text-sm text-ink/65">{product.shortDescription}</p>

          <div className="mt-5 flex flex-col gap-5">
            <ColorSelector product={product} selected={colorwayName} onSelect={selectColor} />
            {stock.status !== "out" && (
              <>
                <SizeSelector product={product} color={colorwayName} selected={selectedSize} onSelect={setSelectedSize} />
                <AddToCartBar product={product} selectedColorway={colorwayName} selectedSize={selectedSize} />
              </>
            )}
          </div>

          <ul className="mt-5 space-y-2 rounded-2xl bg-white p-4 text-sm text-ink/65 shadow-sm">
            <li className="flex items-start gap-2">
              <FiTruck className="mt-0.5 shrink-0 text-rose-dark" />
              <span>
                <DeliveryEstimate prefix="Order today, delivered" />
                <span className="block text-xs text-ink/50">
                  Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)} · {DELIVERY_DAYS.min}–{DELIVERY_DAYS.max} business
                  days across India
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FiRefreshCw className="mt-0.5 shrink-0 text-rose-dark" />
              <span>
                {RETURN_WINDOW_DAYS}-day returns &amp; exchanges on unworn items with tags.{" "}
                <Link href="/returns-exchanges" className="font-semibold text-rose-dark underline underline-offset-2">
                  Details
                </Link>
              </span>
            </li>
          </ul>

          <div className="mt-6">
            <ProductAccordion
              sections={[
                { title: "Description", content: <p className="leading-relaxed">{product.description}</p> },
                {
                  title: "Fabric & fit",
                  content: (
                    <dl className="space-y-2">
                      <div>
                        <dt className="font-semibold text-plum">Fabric</dt>
                        <dd>{product.fabric}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-plum">Fit</dt>
                        <dd>{product.fit}</dd>
                      </div>
                    </dl>
                  ),
                },
                ...(chartRows.length > 0
                  ? [
                      {
                        id: "size-chart",
                        title: "Size chart",
                        content: (
                          <div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-left text-xs">
                                <thead className="text-plum">
                                  <tr>
                                    <th className="py-1.5 pr-3">Size</th>
                                    <th className="py-1.5 pr-3">Height (cm)</th>
                                    <th className="py-1.5 pr-3">Chest (cm)</th>
                                    <th className="py-1.5">Waist (cm)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {chartRows.map((r) => (
                                    <tr
                                      key={r.size}
                                      className={`border-t border-plum/5 ${sizeStock(product, colorwayName, r.size).status === "out" ? "text-ink/30" : ""}`}
                                    >
                                      <td className="py-1.5 pr-3 font-semibold">{r.size}</td>
                                      <td className="py-1.5 pr-3">{r.heightCm}</td>
                                      <td className="py-1.5 pr-3">{r.chestCm}</td>
                                      <td className="py-1.5">{r.waistCm}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="mt-2">
                              Between sizes? Go one size up.{" "}
                              <Link href="/size-guide" className="font-semibold text-rose-dark underline underline-offset-2">
                                How to measure
                              </Link>
                            </p>
                          </div>
                        ),
                      },
                    ]
                  : []),
                { title: "Care instructions", content: <p>{product.care}</p> },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-14">
        <ProductReviews productSlug={product.slug} productName={product.name} initialReviews={reviews} initialStats={reviewStats} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14 border-t border-plum/10 pt-10">
          <h2 id="related-heading" className="font-serif-display text-2xl font-bold text-plum md:text-3xl">
            You May Also Like
          </h2>
          <p className="mt-1 text-sm text-ink/55">More {product.gender === "Unisex" ? "" : `${product.gender.toLowerCase()}' `}styles picked to go with this one.</p>
          <div className="mt-6">
            <ProductGrid products={related} className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4" />
          </div>
        </section>
      )}
    </section>
  );
}
