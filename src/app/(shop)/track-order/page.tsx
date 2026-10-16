import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TrackOrderLookup from "@/components/track-order/TrackOrderLookup";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Enter your order number and mobile number to see the live status of your FunkyKidz order.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <>
      <PageHeader title="Track Your Order" breadcrumb={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <TrackOrderLookup />
    </>
  );
}
