import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "My Bag",
  description: "Review the items in your FunkyKidz shopping cart.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader title="My Bag" breadcrumb={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
          <CartView />
      </section>
    </>
  );
}
