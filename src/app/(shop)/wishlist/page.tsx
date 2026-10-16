import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WishlistGrid from "@/components/wishlist/WishlistGrid";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved FunkyKidz favorites, all in one place.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <>
      <PageHeader title="My Wishlist" breadcrumb={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
        <WishlistGrid />
      </section>
    </>
  );
}
