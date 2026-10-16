import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Testimonials from "@/components/Testimonials";
import FaqAccordion from "@/components/faq/FaqAccordion";
import ContactCta from "@/components/contact/ContactCta";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "FAQ — Shipping, Returns, Sizing & Payments",
  description: "Answers on FunkyKidz shipping, delivery times, 7-day returns, kids' sizing (0–15 years) and UPI payments.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <PageHeader title="Frequently Asked Questions" breadcrumb={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <Reveal>
        <FaqAccordion />
      </Reveal>
      <Testimonials title="Reviews from verified buyers" limit={9} />
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  );
}
