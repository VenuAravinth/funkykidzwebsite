import { DELIVERY_DAYS, DELIVERY_FEE, FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/cartPricing";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

export type PolicySection = { id: string; title: string; body: string[] };

const SECTIONS: PolicySection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using the FunkyKidz website, creating an account, or placing an order, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this site.",
    ],
  },
  {
    id: "accounts",
    title: "2. Guest Checkout & Accounts",
    body: [
      "You can order as a guest with your name, mobile number and delivery address, or create an account to save addresses and see your orders in one place.",
      "If you create an account, keep your password confidential and let us know right away if you suspect unauthorised use.",
    ],
  },
  {
    id: "products",
    title: "3. Products & Pricing",
    body: [
      "We do our best to display product colors, sizes, and details accurately, but slight variations may occur. Prices are listed in Indian Rupees (₹) and may change without notice; the price shown at the time of order confirmation applies. A crossed-out price is only shown when the item was previously sold at that price.",
    ],
  },
  {
    id: "orders-payment",
    title: "4. Orders & Payment",
    body: [
      "Orders are currently completed via UPI. At checkout, you'll scan a QR code or pay directly to our UPI ID, then upload a screenshot of the transaction as proof of payment.",
      'Every order is marked "Pending Verification" until our team confirms the payment, after which it moves into processing. We may contact you if we\'re unable to verify a payment.',
    ],
  },
  {
    id: "shipping",
    title: "5. Shipping & Delivery",
    body: [
      `Orders of ${formatPrice(FREE_SHIPPING_THRESHOLD)} or more ship free; a flat ${formatPrice(DELIVERY_FEE)} delivery fee applies below that. We ship within India only. Delivery usually takes ${DELIVERY_DAYS.min}–${DELIVERY_DAYS.max} business days; dates shown on the site are estimates, not guarantees.`,
    ],
  },
  {
    id: "returns",
    title: "6. Returns & Exchanges",
    body: [
      `Unworn items with tags attached can be returned or exchanged within ${RETURN_WINDOW_DAYS} days of delivery. See our Returns & Exchanges page for the steps.`,
    ],
  },
  {
    id: "conduct",
    title: "7. Acceptable Use",
    body: [
      "Please don't use the site for any unlawful purpose, attempt to disrupt its operation, or misuse another customer's account or information.",
    ],
  },
  {
    id: "ip",
    title: "8. Intellectual Property",
    body: [
      "All content on this site — including designs, illustrations, logos, and text — belongs to FunkyKidz or its licensors and may not be reused without permission.",
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    body: [
      "FunkyKidz is not liable for indirect or incidental damages arising from your use of the site or products, to the fullest extent permitted by law.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Continued use of the site after changes are posted means you accept the updated Terms.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact Us",
    body: [`Questions about these Terms? Email ${SITE.supportEmail}, WhatsApp ${SITE.phone}, or use our Contact page.`],
  },
];

export default function TermsContent({
  sections = SECTIONS,
  updated = "October 3, 2026",
  intro = "Welcome to FunkyKidz. These Terms & Conditions govern your use of our website and any purchases you make. Please read them carefully before placing an order.",
}: {
  sections?: PolicySection[];
  updated?: string;
  intro?: string;
}) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">On This Page</p>
          <nav className="mt-3 flex flex-col gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-cream/60 hover:text-rose-dark"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-10">
          <p className="text-sm text-ink/50">Last updated: {updated}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">{intro}</p>

          <div className="mt-8 flex flex-col gap-8">
            {sections.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-serif-display text-xl font-bold text-plum">{s.title}</h2>
                <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-ink/60">
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
