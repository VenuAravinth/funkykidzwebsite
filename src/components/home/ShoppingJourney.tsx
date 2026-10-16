"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiSearch, FiShoppingBag, FiSmartphone, FiPackage, FiSmile } from "react-icons/fi";
import SectionHeading from "@/components/SectionHeading";

const STEPS = [
  { icon: FiSearch, title: "Discover", desc: "Filter by age, size, colour and occasion across our Korean kids range." },
  { icon: FiShoppingBag, title: "Add to bag", desc: "Pick sizes with our 0–15 years size guide and save favourites to your wishlist." },
  { icon: FiSmartphone, title: "Pay by UPI", desc: "GPay, PhonePe, Paytm or any UPI app — upload the payment proof in one tap." },
  { icon: FiPackage, title: "Packed in Karur", desc: "Every piece is quality-checked and packed with care at our Karur store." },
  { icon: FiSmile, title: "Delivered", desc: "Track your parcel live; delivered in 3–5 days with 7-day easy returns." },
];

export default function ShoppingJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="bg-gradient-to-b from-cream via-blush/60 to-cream py-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-24">
        <SectionHeading
          eyebrow="HOW ONLINE ORDERS WORK"
          title="From our Karur store to your doorstep"
          subtitle="A simple, transparent e-commerce journey — every order is handled personally by our team."
        />

        <div ref={ref} className="relative mt-16">
          <div aria-hidden className="absolute left-0 right-0 top-8 hidden h-[3px] rounded-full bg-plum/10 md:block" />
          <motion.div
            aria-hidden
            style={{ scaleX: lineScale }}
            className="absolute left-0 right-0 top-8 hidden h-[3px] origin-left rounded-full bg-gradient-to-r from-rose via-rose-dark to-gold md:block"
          />
          <ol className="relative grid gap-10 md:grid-cols-5 md:gap-6">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-4 md:flex-col md:items-center md:text-center"
              >
                <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white text-2xl text-rose-dark shadow-lg ring-4 ring-cream">
                  <s.icon />
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-plum text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="font-semibold text-plum md:mt-5">{s.title}</h3>
                  <p className="mt-1 text-sm text-ink/60">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
