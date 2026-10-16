import type { Metadata } from "next";
import Link from "next/link";
import { FiCreditCard, FiTruck, FiRefreshCw, FiMapPin, FiLock, FiMessageCircle } from "react-icons/fi";
import LandingHero from "@/components/LandingHero";
import SectionHeading from "@/components/SectionHeading";
import ShoppingJourney from "@/components/home/ShoppingJourney";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { FREE_SHIPPING_THRESHOLD, DELIVERY_FEE } from "@/lib/cartPricing";
import { formatPrice } from "@/lib/format";
import { breadcrumbSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "How We Sell Online — Payments, Shipping & Returns",
  description:
    "How FunkyKidz handles online kids fashion orders: secure UPI payments, packing in Karur, 3–5 day delivery across India, live order tracking and 7-day returns.",
  alternates: { canonical: "/how-we-sell" },
};

const PILLARS = [
  {
    icon: FiCreditCard,
    title: "Secure UPI payments",
    desc: "Pay with GPay, PhonePe, Paytm or any UPI app. Upload your payment screenshot and we verify it before dispatch.",
    href: "/payment-methods",
  },
  {
    icon: FiTruck,
    title: "Shipping across India",
    desc: `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}; a flat ${formatPrice(DELIVERY_FEE)} below that. Delivered in 3–5 business days.`,
    href: "/shipping-info",
  },
  {
    icon: FiMapPin,
    title: "Live order tracking",
    desc: "Follow every stage — confirmed, packed, shipped, delivered — from the Track Order page.",
    href: "/track-order",
  },
  {
    icon: FiRefreshCw,
    title: "7-day returns",
    desc: "Unworn items with tags can be returned or exchanged within 7 days, online or at our Karur store.",
    href: "/returns-exchanges",
  },
  {
    icon: FiLock,
    title: "Your data, protected",
    desc: "We only use your details to deliver your order and never sell them to anyone.",
    href: "/terms-conditions",
  },
  {
    icon: FiMessageCircle,
    title: "Human support",
    desc: "Questions about sizes or an order? Our Karur team answers on WhatsApp, phone and email.",
    href: "/contact",
  },
];

export default function HowWeSellPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "How We Sell", path: "/how-we-sell" }])} />
      <LandingHero
        tone="dark"
        eyebrow="E-COMMERCE AT FUNKYKIDZ"
        title="How we handle your online order"
        intro="A clear, reliable shopping experience — from the moment you add to bag to the day your parcel arrives. Here's exactly how FunkyKidz runs online sales."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "How We Sell" }]}
        primary={{ label: "Start shopping", href: "/collections" }}
        secondary={{ label: "Track an order", href: "/track-order" }}
      />

      <ShoppingJourney />

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-20">
        <SectionHeading eyebrow="OUR PROMISES" title="Built for peace of mind" />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <StaggerItem key={p.title}>
              <Link href={p.href} className="lift group block h-full rounded-3xl bg-white p-8 ring-1 ring-plum/5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-light text-xl text-rose-dark transition-colors group-hover:bg-rose-dark group-hover:text-white">
                  <p.icon />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-plum">{p.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{p.desc}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-rose-dark transition-transform group-hover:translate-x-1">
                  Learn more →
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Reveal>
        <section className="mx-auto max-w-[1000px] px-6 pb-24 text-center">
          <h2 className="font-serif-display text-3xl font-bold text-plum">Prefer to shop in person?</h2>
          <p className="mt-3 text-ink/60">Everything online is also available at our store in Jawahar Bazaar, Karur.</p>
          <Link
            href="/kids-dresses-karur"
            className="mt-7 inline-block rounded-full bg-plum px-7 py-3 font-semibold text-white transition-transform hover:scale-105"
          >
            Visit the Karur store →
          </Link>
        </section>
      </Reveal>
    </>
  );
}
