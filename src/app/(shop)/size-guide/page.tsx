import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SizeGuideTabs from "@/components/size-guide/SizeGuideTabs";
import HowToMeasure from "@/components/size-guide/HowToMeasure";
import ContactCta from "@/components/contact/ContactCta";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Kids Size Guide (0–15 Years)",
  description: "Find the perfect fit with FunkyKidz's kids, women's, and men's size charts and measuring tips.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <>
      <PageHeader title="Size Guide" breadcrumb={[{ label: "Home", href: "/" }, { label: "Size Guide" }]} />
      <Reveal>
        <SizeGuideTabs />
      </Reveal>
      <Reveal>
        <HowToMeasure />
      </Reveal>
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  );
}
