import type { Metadata } from "next";
import Link from "next/link";
import { FiCheckCircle, FiGift, FiHelpCircle, FiShoppingBag, FiTag } from "react-icons/fi";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import ContactCta from "@/components/contact/ContactCta";
import { RETURN_WINDOW_DAYS } from "@/lib/cartPricing";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Use Redeem Codes",
  description: "What FunkyKidz redeem codes are, where to enter them at checkout, and the terms that apply.",
  alternates: { canonical: "/redeem-codes" },
};

const STEPS = [
  { icon: FiShoppingBag, title: "Add your favourites to your bag", text: "Pick a size and tap Add to Bag, or use Buy Now on a product." },
  { icon: FiTag, title: "Open “Have a redeem code?”", text: "At checkout, find it under the Order Summary and tap Apply Code." },
  { icon: FiCheckCircle, title: "Type the code and tap Apply", text: "Letters and numbers only; spaces and lower-case letters are fine. The saving appears in your total straight away." },
  { icon: FiGift, title: "Pay the new total", text: "The UPI amount on the payment step already includes your saving. Upload your payment screenshot to place the order." },
];

const TERMS = [
  "One redeem code per order. Codes can't be combined.",
  "Each code has its own validity dates, minimum order value and number of uses. These are checked when you apply the code and again when you place the order.",
  "The saving applies to the price of the items. Delivery charges are worked out on your order total before the code, so a code never makes you lose free shipping.",
  "Codes are linked to your account. Most can be used once per customer.",
  "Codes have no cash value and can't be exchanged for money, refunded or transferred.",
  "Apply the code before paying. Once your payment screenshot is uploaded, a code can't be added to that order.",
  `If you return items from an order that used a code, the refund is the amount you actually paid for them. Exchanges follow our ${RETURN_WINDOW_DAYS}-day Returns & Exchanges policy.`,
  "If an order is cancelled, the code's use is given back so it can be used again while it's still valid.",
  `${SITE.name} may withdraw a code that is shared publicly against its terms or used fraudulently.`,
];

const FAQS = [
  { q: "Where do I get a redeem code?", a: "We share codes directly with customers — for example with a gift card, at our Karur store, or in a WhatsApp message from us. Codes aren't listed on the website." },
  { q: "My code isn't working. What should I check?", a: "The message under the box tells you why: the spelling, the dates it works between, the minimum order value, or whether you've already used it. If it still won't work, contact us with the code and we'll check it." },
  { q: "Can I use a code in the store?", a: "Codes created for the website are applied at online checkout. Ask our store team about codes given out in the shop." },
];

export default function RedeemCodesPage() {
  return (
    <>
      <PageHeader title="How to Use Redeem Codes" breadcrumb={[{ label: "Home", href: "/" }, { label: "Help", href: "/faq" }, { label: "Redeem Codes" }]} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <Reveal>
          <section aria-labelledby="what">
            <h2 id="what" className="font-serif-display text-2xl font-bold text-plum md:text-3xl">What is a redeem code?</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              A redeem code is a short code of letters and numbers, like <span className="rounded bg-cream px-1.5 py-0.5 font-mono text-sm text-plum">ABC123</span>, that
              takes an amount off your order. You enter it at checkout and the saving shows in your total before you pay.
            </p>
            <p className="mt-3 leading-relaxed text-ink/70">
              <strong className="text-plum">Where and when:</strong> codes work on online orders at checkout, for signed-in customers, while the code is valid. Some
              codes need a minimum order value or work only between certain dates.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="how" className="mt-12">
            <h2 id="how" className="font-serif-display text-2xl font-bold text-plum md:text-3xl">How to apply a code</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-light text-rose-dark">
                    <s.icon />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-dark">Step {i + 1}</p>
                    <h3 className="mt-0.5 font-semibold text-plum">{s.title}</h3>
                    <p className="mt-1 text-sm text-ink/65">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-ink/60">
              Changed your mind? Tap <strong>Remove</strong> next to the applied code to take it off before you pay.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="terms" className="mt-12">
            <h2 id="terms" className="font-serif-display text-2xl font-bold text-plum md:text-3xl">Terms &amp; conditions</h2>
            <ul className="mt-4 space-y-2.5">
              {TERMS.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink/70">
                  <FiCheckCircle className="mt-1 shrink-0 text-rose-dark" /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/60">
              These sit alongside our{" "}
              <Link href="/terms-conditions" className="font-semibold text-rose-dark underline underline-offset-2">Terms &amp; Conditions</Link> and{" "}
              <Link href="/returns-exchanges" className="font-semibold text-rose-dark underline underline-offset-2">Returns &amp; Exchanges</Link> policy.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="questions" className="mt-12">
            <h2 id="questions" className="flex items-center gap-2 font-serif-display text-2xl font-bold text-plum md:text-3xl">
              <FiHelpCircle className="text-rose-dark" /> Common questions
            </h2>
            <dl className="mt-4 space-y-3">
              {FAQS.map((f) => (
                <div key={f.q} className="rounded-2xl bg-white p-5 shadow-sm">
                  <dt className="font-semibold text-plum">{f.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink/70">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
      </div>

      <Reveal>
        <ContactCta />
      </Reveal>
    </>
  );
}
