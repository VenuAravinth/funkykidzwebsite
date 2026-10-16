import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ShippingInfoContent from "@/components/shipping/ShippingInfoContent";
import ContactCta from "@/components/contact/ContactCta";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Shipping Info",
  description: "Shipping rates, delivery estimates, and order tracking for FunkyKidz orders.",
};

export default function ShippingInfoPage() {
  return (
    <>
      <PageHeader title="Shipping Info" breadcrumb={[{ label: "Home", href: "/" }, { label: "Shipping Info" }]} />
      <Reveal>
        <ShippingInfoContent />
      </Reveal>
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  );
}
