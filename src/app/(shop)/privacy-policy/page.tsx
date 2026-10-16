import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TermsContent, { type PolicySection } from "@/components/terms/TermsContent";
import { SITE, fullAddress } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information FunkyKidz collects, why, how it is stored and the choices you have.",
  alternates: { canonical: "/privacy-policy" },
};

// Describes what this website actually does today. Review it if you add new tools
// (e.g. a payment gateway, Meta Pixel or email marketing) and update the date below.
const SECTIONS: PolicySection[] = [
  {
    id: "collect",
    title: "1. Information we collect",
    body: [
      "Account details: your name, email address and phone number when you register.",
      "Delivery details: the addresses you save, including an optional map pin, so we can deliver your order.",
      "Order details: the items you buy, order totals and the UPI payment screenshot you upload so we can verify payment.",
      "Messages: anything you send us through the contact form, email or WhatsApp.",
    ],
  },
  {
    id: "use",
    title: "2. How we use it",
    body: [
      "To process, deliver and support your orders, verify payments, and handle returns and exchanges.",
      "To reply to your questions and send order updates.",
      "To understand how the site is used (for example which products are viewed or added to the bag) so we can improve it.",
      "We do not sell your personal information.",
    ],
  },
  {
    id: "storage",
    title: "3. Where it is stored",
    body: [
      "Your bag, wishlist, saved addresses and sign-in session are kept in your own browser's local storage.",
      "Placed orders and payment screenshots are stored securely on our server and are only visible to the FunkyKidz team.",
    ],
  },
  {
    id: "third-parties",
    title: "4. Services we use",
    body: [
      "Google Analytics (when enabled) uses cookies to measure visits, product views, add-to-cart and purchases. It does not receive your name, phone or address.",
      "OpenStreetMap shows the map and looks up the address when you pin a delivery location.",
      "Couriers receive your name, phone number and delivery address to deliver your parcel.",
      "UPI payments happen inside your own UPI app — we never see your bank details or UPI PIN.",
    ],
  },
  {
    id: "children",
    title: "5. Children",
    body: [
      "Our clothes are for children, but this website is meant to be used by parents and guardians. We don't knowingly collect personal information from children.",
    ],
  },
  {
    id: "rights",
    title: "6. Your choices",
    body: [
      "You can view and edit your profile and addresses from your account page, and clear your browser data at any time.",
      `To ask for a copy of your data or to have it deleted, email ${SITE.supportEmail}. We keep order records as long as needed for accounting and legal requirements.`,
    ],
  },
  {
    id: "contact",
    title: "7. Contact",
    body: [`${SITE.legalName}, ${fullAddress()}. Email ${SITE.supportEmail} or WhatsApp ${SITE.phone}.`],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" breadcrumb={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <TermsContent
        sections={SECTIONS}
        updated="October 3, 2026"
        intro="This policy explains what information FunkyKidz collects when you shop on our website, why we collect it and how we look after it."
      />
    </>
  );
}
