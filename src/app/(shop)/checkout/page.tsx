import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Select a delivery address and pay via UPI to complete your FunkyKidz order.",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" breadcrumb={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
          <Suspense fallback={null}>
            <CheckoutFlow />
          </Suspense>
      </section>
    </>
  );
}
