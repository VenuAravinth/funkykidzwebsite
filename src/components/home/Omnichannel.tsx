import Link from "next/link";
import { FiShoppingCart, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import SectionHeading from "@/components/SectionHeading";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { whatsappLink } from "@/lib/site";

const CHANNELS = [
  {
    icon: FiShoppingCart,
    title: "Shop Online",
    desc: "Browse the full Korean kids collection, pay securely by UPI and get doorstep delivery in 3–5 days anywhere in India.",
    points: ["Secure UPI checkout", "Live order tracking", "7-day easy returns"],
    cta: { label: "Start shopping", href: "/collections" },
    accent: "from-rose to-rose-dark",
  },
  {
    icon: FiMapPin,
    title: "Visit Our Karur Store",
    desc: "Touch the fabrics, try sizes and get styling help at our shop in Jawahar Bazaar, right in the heart of Karur.",
    points: ["Try before you buy", "Personal sizing help", "Festive & birthday styling"],
    cta: { label: "Get directions", href: "/kids-dresses-karur" },
    accent: "from-plum-light to-plum",
  },
  {
    icon: FaWhatsapp,
    title: "Order on WhatsApp",
    desc: "Send us a screenshot, ask for sizes or more photos — we confirm stock and help you place the order.",
    points: ["Quick size advice", "Extra photos on request", "Pickup from Karur store"],
    cta: { label: "Chat now", href: whatsappLink(), external: true },
    accent: "from-[#25d366] to-[#128c7e]",
  },
];

export default function Omnichannel() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-20">
      <SectionHeading
        eyebrow="SHOP YOUR WAY"
        title={
          <>
            Online, in-store or on WhatsApp — <span className="text-rose-dark">one seamless experience</span>
          </>
        }
        subtitle="Whether you're in Karur, Trichy, Coimbatore or anywhere in India, FunkyKidz brings Korean kids fashion to you the way you prefer to shop."
      />
      <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
        {CHANNELS.map((c) => {
          const linkClass = "mt-4 inline-flex py-2.5 items-center gap-1 text-sm font-semibold text-rose-dark group-hover:gap-2 transition-all";
          return (
            <StaggerItem key={c.title}>
              <article className="lift group relative h-full overflow-hidden rounded-3xl bg-white p-8 ring-1 ring-plum/5">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-2xl text-white shadow-lg transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110`}>
                  <c.icon />
                </span>
                <h3 className="mt-6 font-serif-display text-2xl font-bold text-plum">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{c.desc}</p>
                <ul className="mt-5 space-y-2 text-sm text-ink/70">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose" /> {p}
                    </li>
                  ))}
                </ul>
                {c.cta.external ? (
                  <a href={c.cta.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {c.cta.label} →
                  </a>
                ) : (
                  <Link href={c.cta.href} className={linkClass}>
                    {c.cta.label} →
                  </Link>
                )}
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
