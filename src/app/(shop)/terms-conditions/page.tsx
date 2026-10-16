import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TermsContent from "@/components/terms/TermsContent";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions governing your use of the FunkyKidz website and orders.",
  alternates: { canonical: "/terms-conditions" },
};

export default function TermsConditionsPage() {
  return (
    <>
      <PageHeader
        title="Terms & Conditions"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]}
      />
      <Reveal>
        <TermsContent />
      </Reveal>
    </>
  );
}
