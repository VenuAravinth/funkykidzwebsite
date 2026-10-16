import Link from "next/link";
import { FiTruck, FiRefreshCw, FiShield } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { DELIVERY_DAYS, FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/cartPricing";
import { formatPrice } from "@/lib/format";

const FEATURES = [
  {
    icon: FiTruck,
    title: `Free shipping over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
    desc: `Delivered in ${DELIVERY_DAYS.min}–${DELIVERY_DAYS.max} business days`,
    href: "/shipping-info",
  },
  {
    icon: FiRefreshCw,
    title: `${RETURN_WINDOW_DAYS}-day returns`,
    desc: "Unworn, with tags attached",
    href: "/returns-exchanges",
  },
  { icon: FiShield, title: "Secure UPI payment", desc: "GPay, PhonePe, Paytm & more", href: "/payment-methods" },
  { icon: FaWhatsapp, title: "WhatsApp support", desc: "Help with sizes & orders", href: "/contact" },
];

export default function FeaturesStrip() {
  return (
    <section aria-label="Why shop with us" className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:pl-24 md:pr-12">
      <ul className="grid grid-cols-2 gap-4 rounded-2xl bg-white px-4 py-5 shadow-sm sm:px-8 md:grid-cols-4">
        {FEATURES.map((f) => (
          <li key={f.title}>
            <Link href={f.href} className="group flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-light text-lg text-rose-dark">
                <f.icon />
              </span>
              <span>
                <span className="block text-sm font-semibold text-plum group-hover:underline">{f.title}</span>
                <span className="block text-xs text-ink/55">{f.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
