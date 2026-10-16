import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PaymentMethodsContent from "@/components/payment-methods/PaymentMethodsContent";
import ContactCta from "@/components/contact/ContactCta";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Payment Methods",
  description: "How payment works at FunkyKidz — pay securely via UPI and track your order verification.",
};

export default function PaymentMethodsPage() {
  return (
    <>
      <PageHeader
        title="Payment Methods"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Payment Methods" }]}
      />
      <Reveal>
        <PaymentMethodsContent />
      </Reveal>
      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  );
}
