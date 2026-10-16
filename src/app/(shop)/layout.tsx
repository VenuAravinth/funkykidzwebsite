import AppProviders from "@/components/providers/AppProviders";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SideIconRail from "@/components/SideIconRail";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import FloatingActions from "@/components/FloatingActions";
import MobileBottomNav from "@/components/MobileBottomNav";
import { NavigationTracker } from "@/components/BackButton";
import JsonLd from "@/components/seo/JsonLd";
import { storeSchema, websiteSchema } from "@/lib/structuredData";
import { CatalogUnavailable } from "@/components/CatalogStatus";
import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { getProducts } from "@/server/catalog";
import type { Product } from "@/lib/products";

// Storefront chrome. The admin area has its own layout and never renders any of this.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  // Pages render per request (catalogue, stock and prices come from MongoDB); the product
  // list itself is cached for a minute in src/server/catalog.ts.
  await connection();
  // If the ERP Backend can't be reached (and there's no cached catalogue), keep the shop chrome
  // and show a retry message instead of the page — never an empty or stand-in product list.
  let products: Product[] = [];
  let catalogFailed = false;
  try {
    products = await getProducts();
  } catch (err) {
    unstable_rethrow(err);
    console.error("[catalog] Could not load products from the ERP Backend:", err);
    catalogFailed = true;
  }
  return (
    <>
      <JsonLd data={[storeSchema(), websiteSchema()]} />
      <AppProviders products={products}>
        <ScrollProgress />
        <NavigationTracker />
        {/* Bottom padding on phones = height of the fixed bottom nav, so nothing hides behind it. */}
        <div className="relative min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <AnnouncementBar />
          <Header />
          <SideIconRail />
          <main>{catalogFailed ? <CatalogUnavailable /> : children}</main>
          <Footer />
        </div>
        <FloatingActions />
        <MobileBottomNav />
      </AppProviders>
    </>
  );
}
