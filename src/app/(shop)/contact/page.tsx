import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactCta from "@/components/contact/ContactCta";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact & Store Location — Jawahar Bazaar, Karur",
  description: "Visit FunkyKidz kids fashion store at Jawahar Bazaar, Karur 639001 or call / WhatsApp +91 9342422170 for sizes, orders and custom hanbok requests.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact Us" breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={0.1}>
            <ContactInfo />
          </Reveal>
        </div>
      </section>

      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  );
}
