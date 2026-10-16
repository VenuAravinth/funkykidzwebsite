import Link from "next/link";
import { FiRefreshCw, FiPackage, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { SITE, whatsappLink } from "@/lib/site";

const STEPS = [
  { title: "Contact Us", desc: `WhatsApp ${SITE.phone} or email ${SITE.supportEmail} within 7 days of delivery with your order number and reason.` },
  { title: "Pack It Up", desc: "Repack the item unworn, with all original tags still attached." },
  { title: "Ship It Back", desc: "We'll send you return instructions and an address to ship to." },
  { title: "Refund or Exchange", desc: "Once received and inspected, we'll process your refund or send your exchange." },
];

const ELIGIBLE = [
  "Unworn items with original tags attached",
  "Returned within 7 days of the delivery date",
  "Original packaging included where possible",
];

const NOT_ELIGIBLE = ["Worn, washed, or altered items", "Items without their original tags", "Final sale or clearance items"];

export default function ReturnsExchangesContent() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
      <div className="rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm md:p-10">
        <div className="flex items-center gap-2">
          <FiRefreshCw className="text-xl text-rose-dark" />
          <h2 className="font-serif-display text-2xl font-bold text-plum">Our 7-Day Return Policy</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
          Not the right fit? You can return or exchange unworn items with tags attached within 7 days of
          delivery. Here&apos;s how it works.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-plum text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold text-plum">{step.title}</h3>
              <p className="mt-1 text-xs text-ink/55">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappLink("Hi FunkyKidz, I'd like to return/exchange an item from order #")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
          >
            Start a Return on WhatsApp
          </a>
          <Link
            href="/contact"
            className="inline-block rounded-full border border-plum/15 px-7 py-3 text-sm font-semibold text-plum hover:border-rose-dark"
          >
            Other ways to contact us
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-xl text-emerald-600" />
            <h3 className="font-serif-display text-xl font-bold text-plum">Eligible for Return</h3>
          </div>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-ink/60">
            {ELIGIBLE.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2">
            <FiXCircle className="text-xl text-rose-dark" />
            <h3 className="font-serif-display text-xl font-bold text-plum">Not Eligible</h3>
          </div>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-ink/60">
            {NOT_ELIGIBLE.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <FiXCircle className="mt-0.5 shrink-0 text-rose-dark" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm md:p-10">
        <div className="flex items-center gap-2">
          <FiPackage className="text-xl text-rose-dark" />
          <h2 className="font-serif-display text-2xl font-bold text-plum">Refunds & Exchanges</h2>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold text-plum">How will I be refunded?</h3>
            <p className="mt-1 text-sm text-ink/60">
              Since orders are paid via UPI, refunds are sent back to the original UPI ID once your return is
              received and inspected.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-plum">Need a different size instead?</h3>
            <p className="mt-1 text-sm text-ink/60">
              Let us know when you contact us — we&apos;ll arrange an exchange as soon as your original item is on
              its way back.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-plum">How long does a refund take?</h3>
            <p className="mt-1 text-sm text-ink/60">
              Refunds are typically processed within 5–7 business days of us receiving your returned item.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-plum">Who pays for return shipping?</h3>
            <p className="mt-1 text-sm text-ink/60">
              Return shipping is covered by the customer unless the item arrived damaged or incorrect.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
