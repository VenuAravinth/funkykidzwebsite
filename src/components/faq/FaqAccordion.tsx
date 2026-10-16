"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiPlus } from "react-icons/fi";
import { DELIVERY_DAYS, DELIVERY_FEE, FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/cartPricing";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: `Orders arrive in ${DELIVERY_DAYS.min}–${DELIVERY_DAYS.max} business days anywhere in India. Shipping is free on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD)} or more; below that a flat ${formatPrice(DELIVERY_FEE)} fee applies.`,
  },
  {
    q: "How can I contact customer support?",
    a: `Message us on WhatsApp at ${SITE.phone}, call the same number, or email ${SITE.supportEmail}. You can also use the form on our Contact page.`,
  },
  {
    q: "Can I change the size or colour after placing my order?",
    a: `Usually yes, if the order hasn't shipped yet. Message us on WhatsApp or email ${SITE.ordersEmail} with your order number as soon as possible.`,
  },
  {
    q: "How do I use a redeem code?",
    a: "At checkout, tap “Have a redeem code?” under the Order Summary, type your code and tap Apply. The saving shows in your total before you pay. One code per order — see How to Use Redeem Codes for the full terms.",
  },
  {
    q: "What is your return policy?",
    a: `Unworn items with tags attached can be returned or exchanged within ${RETURN_WINDOW_DAYS} days of delivery. See our Returns & Exchanges page for the steps.`,
  },
  {
    q: "Which sizes do you carry?",
    a: "Sizes run from 0–3 months up to 14–15 years. Each product page has a size chart, and our Size Guide explains how to measure.",
  },
  {
    q: "How do I pay?",
    a: "Online orders are paid by UPI (Google Pay, PhonePe, Paytm or any UPI app). In our Karur store we also accept cash.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-dark shadow-sm">
            FAQ
          </span>
          <h2 className="mt-4 font-serif-display text-3xl font-bold leading-tight text-plum md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-ink/60">If you have any other questions, please email us.</p>
          <Link
            href="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-105"
          >
            Contact us <FiMail />
          </Link>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen ? "border-rose-light bg-blush/60" : "border-rose-light/60 bg-white"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-plum md:text-base">{item.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-light text-rose-dark transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <FiPlus />
                  </span>
                </button>
                {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-ink/60">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
