import { Suspense } from "react";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ShopByCollection from "@/components/ShopByCollection";
import { CategoryRailSkeleton } from "@/components/CategoryRail";
import ProductShelf from "@/components/home/ProductShelf";
import FeaturesStrip from "@/components/FeaturesStrip";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import StoreSpotlight from "@/components/home/StoreSpotlight";
import LocalSeoContent from "@/components/home/LocalSeoContent";
import FaqSection from "@/components/seo/FaqSection";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/structuredData";
import { HOME_FAQS } from "@/lib/seoContent";
import { bestSellers as rankBestSellers, newArrivals as rankNewArrivals } from "@/lib/products";
import { getProducts } from "@/server/catalog";
import { ComingSoon } from "@/components/CatalogStatus";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};


// Shopping first: hero → categories → products. Store info and SEO copy sit lower down.
export default async function Home() {
  const products = await getProducts();
  const bestSellers = rankBestSellers(products).slice(0, 4);
  // Don't repeat best sellers in the new-arrivals row.
  const newArrivals = rankNewArrivals(products).filter((p) => !bestSellers.includes(p)).slice(0, 4);
  return (
    <>
      <JsonLd data={faqSchema(HOME_FAQS)} />
      <Hero />
      <Suspense fallback={<CategoryRailSkeleton />}>
        <ShopByCollection />
      </Suspense>
      {products.length === 0 && <ComingSoon />}
      <ProductShelf
        id="best-sellers"
        title="Best Sellers"
        subtitle="Most-ordered styles this season"
        products={bestSellers}
        viewAllHref="/collections?sort=popularity"
        priority
      />
      <ProductShelf
        id="new-arrivals"
        title="New Arrivals"
        subtitle="Just added to the collection"
        products={newArrivals}
        viewAllHref="/collections?new=1&sort=newest"
      />
      <FeaturesStrip />
      <Testimonials />
      <StoreSpotlight />
      <FaqSection faqs={HOME_FAQS} title="Questions parents ask us" />
      <LocalSeoContent />
      <Newsletter />
    </>
  );
}
