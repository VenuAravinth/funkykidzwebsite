import Link from "next/link";
import { FiCheckCircle, FiSmartphone, FiShield, FiMapPin } from "react-icons/fi";

const STEPS = [
  { title: "Add to Bag or Buy Now", desc: "Pick your favorites and head to checkout." },
  { title: "Enter Delivery Details", desc: "Name, mobile and address — no account needed." },
  { title: "Scan & Pay via UPI", desc: "Scan the QR code or pay directly to our UPI ID in any UPI app." },
  { title: "Upload Your Screenshot", desc: "Attach proof of payment so our team can verify it." },
  { title: "We Confirm Your Order", desc: "Once verified, your order moves into processing." },
];


const FAQS = [
  {
    q: "Is my payment secure?",
    a: "We never see or store your card, bank, or UPI PIN details — payments happen entirely inside your own UPI app.",
  },
  {
    q: "How long does verification take?",
    a: "Our team reviews uploaded screenshots and confirms orders shortly after. You can check your order status anytime in My Account.",
  },
  {
    q: "What if I upload the wrong screenshot?",
    a: "Contact us right away with your order number and we'll help sort it out before it's verified.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Not currently — UPI is the only payment method supported at checkout for now.",
  },
];

export default function PaymentMethodsContent() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600">
            <FiCheckCircle /> Currently Accepted
          </span>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rose-light/50 text-2xl text-rose-dark">
              <FiSmartphone />
            </span>
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-plum">UPI</h2>
              <p className="text-sm text-ink/50">Google Pay, PhonePe, Paytm, and any other UPI app</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ink/60">
            Every FunkyKidz order is completed via UPI. Scan a QR code or pay to our UPI ID directly from your
            banking app, then upload a screenshot of the transaction — no card details ever touch our servers.
          </p>
          <Link
            href="/collections"
            className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
          >
            Start Shopping
          </Link>
        </div>

        <div className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 text-xs font-semibold text-plum">
            <FiMapPin /> In our Karur store
          </span>
          <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">Cash or UPI</h3>
          <p className="mt-2 text-sm text-ink/60">
            Shopping at Jawahar Bazaar? Pay by cash or any UPI app at the counter. Card and wallet payments are not
            available online at the moment.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm md:p-10">
        <h2 className="font-serif-display text-2xl font-bold text-plum">How UPI Checkout Works</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
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
      </div>

      <div className="mt-8 rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm md:p-10">
        <div className="flex items-center gap-2">
          <FiShield className="text-xl text-rose-dark" />
          <h2 className="font-serif-display text-2xl font-bold text-plum">Payment Security & Verification</h2>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FAQS.map((item) => (
            <div key={item.q}>
              <h3 className="text-sm font-bold text-plum">{item.q}</h3>
              <p className="mt-1 text-sm text-ink/60">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
