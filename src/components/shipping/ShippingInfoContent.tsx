import Link from "next/link";
import { FiTruck, FiGlobe, FiClock, FiMapPin } from "react-icons/fi";
import { FREE_SHIPPING_THRESHOLD, DELIVERY_FEE, DELIVERY_DAYS } from "@/lib/cartPricing";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import { formatPrice } from "@/lib/format";
import { TRACKING_STEPS } from "@/lib/tracking";

const RATES = [
  {
    price: "Free delivery",
    label: `Orders of ${formatPrice(FREE_SHIPPING_THRESHOLD)} or more`,
    desc: "No code needed — free shipping is applied automatically at checkout.",
  },
  {
    price: formatPrice(DELIVERY_FEE),
    label: `Orders under ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
    desc: "A flat delivery fee anywhere in India, shown in your bag before you pay.",
  },
];

const ESTIMATES = [
  { region: "Tamil Nadu & rest of India", time: `${DELIVERY_DAYS.min}–${DELIVERY_DAYS.max} business days` },
  { region: "Karur store pickup", time: "Message us on WhatsApp to arrange" },
];

export default function ShippingInfoContent() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {RATES.map((rate) => (
          <div key={rate.label} className="rounded-2xl border border-rose-light/60 bg-white p-5 shadow-sm sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-rose-light/50 text-2xl text-rose-dark">
              <FiTruck />
            </span>
            <h2 className="mt-4 font-serif-display text-2xl font-bold text-plum">{rate.price}</h2>
            <p className="text-sm font-semibold text-ink/70">{rate.label}</p>
            <p className="mt-2 text-sm text-ink/60">{rate.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-rose-light/60 bg-white p-5 shadow-sm sm:p-8 md:p-10">
        <div className="flex items-center gap-2">
          <FiClock className="text-xl text-rose-dark" />
          <h2 className="font-serif-display text-2xl font-bold text-plum">Delivery Estimates</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {ESTIMATES.map((e) => (
            <div key={e.region} className="rounded-xl border border-plum/10 bg-cream/40 p-5">
              <p className="text-sm font-bold text-plum">{e.region}</p>
              <p className="mt-1 text-sm text-ink/60">{e.time}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-ink/55">
          <FiGlobe className="shrink-0 text-rose-dark" />
          <span>
            <DeliveryEstimate prefix="Order today and it should arrive" />. We currently ship within India only; remote
            areas can take a little longer.
          </span>
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-rose-light/60 bg-white p-5 shadow-sm sm:p-8 md:p-10">
        <div className="flex items-center gap-2">
          <FiMapPin className="text-xl text-rose-dark" />
          <h2 className="font-serif-display text-2xl font-bold text-plum">Tracking Your Order</h2>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          Every order moves through these stages visible anytime from your order history or the tracking page.
        </p>

        <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TRACKING_STEPS.map(({ label: stage }, i) => (
            <li key={stage} className="flex items-center gap-2 rounded-xl bg-cream/60 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-plum text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-plum">{stage}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/track-order"
            className="rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-105"
          >
            Track an Order
          </Link>
          <Link
            href="/profile"
            className="rounded-full border border-plum/15 px-6 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:border-rose-dark hover:text-rose-dark"
          >
            View Order History
          </Link>
        </div>
      </div>
    </section>
  );
}
