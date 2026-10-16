import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/server/catalog";
import ShopBrowser from "@/components/collections/ShopBrowser";
import ProductGrid from "@/components/collections/ProductGrid";
import CollectionsHeading from "@/components/collections/CollectionsHeading";
import { BATCH_SIZE } from "@/components/collections/gridLayout";
import { ComingSoon } from "@/components/CatalogStatus";

export const metadata: Metadata = {
  title: "Shop All Korean-Style Kids' Clothing (0–15 Years)",
  description:
    "Shop Korean-style kids' clothing online: hanbok sets, party dresses, tops, bottoms and accessories for girls and boys aged 0–15. Filter by size, colour, price and availability. Delivery across India.",
  alternates: { canonical: "/collections" },
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:pl-24 md:pr-12">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 font-serif-display text-3xl font-bold text-plum md:text-4xl">
          <span className="h-7 w-1.5 shrink-0 rounded-full bg-rose-dark" />
          <Suspense fallback="Shop All">
            <CollectionsHeading />
          </Suspense>
        </h1>
        <p className="mt-1 text-sm text-ink/55">Korean-style clothing for girls and boys, ages 0–15.</p>
      </div>

      {products.length === 0 ? (
        <ComingSoon />
      ) : (
        // Filters read the URL on the client; meanwhile the first batch of the catalogue shows.
        <Suspense fallback={<ProductGrid products={products.slice(0, BATCH_SIZE)} layout={4} />}>
          <ShopBrowser products={products} />
        </Suspense>
      )}
    </section>
  );
}
