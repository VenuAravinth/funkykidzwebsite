import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import OrdersView from "@/components/profile/OrdersView";

export const metadata: Metadata = {
  title: "My Orders",
  description: "See your FunkyKidz orders and their live delivery status.",
  robots: { index: false, follow: true },
};

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="My Orders" breadcrumb={[{ label: "Home", href: "/" }, { label: "Orders" }]} />
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
        <OrdersView />
      </section>
    </>
  );
}
