import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ReturnsExchangesContent from "@/components/returns/ReturnsExchangesContent";
import ContactCta from "@/components/contact/ContactCta";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "FunkyKidz's 7-day return and exchange policy, and how to start a return.",
};

export default function ReturnsExchangesPage() {
  return (
    <>
      <PageHeader
        title="Returns & Exchanges"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Returns & Exchanges" }]}
      />
      <Reveal>
        <ReturnsExchangesContent />
      </Reveal>
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  );
}
