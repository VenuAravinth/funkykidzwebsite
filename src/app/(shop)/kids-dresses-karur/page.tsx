import type { Metadata } from "next";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import LandingHero from "@/components/LandingHero";
import SectionHeading from "@/components/SectionHeading";
import StoreSpotlight from "@/components/home/StoreSpotlight";
import ProductGrid from "@/components/collections/ProductGrid";
import FaqSection from "@/components/seo/FaqSection";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { newArrivals } from "@/lib/products";
import { getProducts } from "@/server/catalog";
import { ComingSoon } from "@/components/CatalogStatus";
import { KARUR_FAQS } from "@/lib/seoContent";
import { SITE, whatsappLink } from "@/lib/site";
import { breadcrumbSchema, faqSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "Kids Dress Shop in Karur — Korean Style Kids Wear, Jawahar Bazaar",
  description:
    "Looking for kids dresses in Karur? Visit FunkyKidz at Jawahar Bazaar, Karur 639001 for fashionable Korean-style girls & boys dresses, hanbok, party frocks and baby wear (0–15 yrs). Shop online too.",
  keywords: [
    "kids dresses Karur",
    "kids dress shop in Karur",
    "Karur fashion",
    "kids clothing store Karur",
    "girls party wear Karur",
    "baby dress shop Karur",
    "Jawahar Bazaar kids wear",
    "kids fashion Karur",
  ],
  alternates: { canonical: "/kids-dresses-karur" },
};

const WHY = [
  { title: "Korean designs you won't find elsewhere in Karur", desc: "Pastel palettes, ribbon details and hanbok sets curated for Tamil Nadu families." },
  { title: "Sizes from newborn to 15 years", desc: "Our team helps you find the right fit in store — or by WhatsApp before you visit." },
  { title: "Fair, transparent prices", desc: "Most styles under ₹1,500, with the same prices in store and online." },
  { title: "Easy exchanges in town", desc: "Bought online? Exchange unworn pieces within 7 days at our Jawahar Bazaar store." },
];

const NEARBY = ["Karur Town", "Thanthonimalai", "Vengamedu", "Pasupathipalayam", "Gandhigramam", "Kulithalai", "Aravakurichi", "Krishnarayapuram", "Pugalur", "Velayuthampalayam"];

export default async function KarurLandingPage() {
  const picks = newArrivals(await getProducts()).slice(0, 8);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Kids Dresses in Karur", path: "/kids-dresses-karur" },
          ]),
          faqSchema(KARUR_FAQS),
        ]}
      />
      <LandingHero
        eyebrow="KARUR · TAMIL NADU"
        title={
          <>
            Fashionable <span className="text-shimmer">kids dresses</span> in Karur
          </>
        }
        intro={`FunkyKidz is Karur's Korean kids fashion store at Jawahar Bazaar — party frocks, hanbok sets, birthday outfits and everyday wear for babies to 12-year-olds. Visit us, or order online and we'll deliver.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Kids Dresses in Karur" }]}
        primary={{ label: "Shop online", href: "/collections" }}
        secondary={{ label: "WhatsApp the store", href: whatsappLink("Hi FunkyKidz Karur! I'd like to visit the store."), external: true }}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-20">
        <SectionHeading
          eyebrow="WHY KARUR PARENTS CHOOSE US"
          title="More than a kids dress shop"
          subtitle="FunkyKidz brings the playful, premium look of Korean kidswear to Karur — at prices that work for every family."
        />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
          {WHY.map((w) => (
            <StaggerItem key={w.title}>
              <div className="lift flex h-full gap-4 rounded-3xl bg-white p-7 ring-1 ring-plum/5">
                <FiCheckCircle className="mt-1 shrink-0 text-2xl text-rose-dark" />
                <div>
                  <h3 className="font-semibold text-plum">{w.title}</h3>
                  <p className="mt-2 text-sm text-ink/60">{w.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <StoreSpotlight />

      <Reveal>
        <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif-display text-3xl font-bold text-plum">Popular with Karur families</h2>
              <p className="mt-2 text-sm text-ink/55">Available in store and online.</p>
            </div>
            <Link href="/collections" className="inline-block py-2.5 text-sm font-semibold text-rose-dark hover:underline">
              View all kids wear →
            </Link>
          </div>
          <div className="mt-8">
            {picks.length ? <ProductGrid products={picks} /> : <ComingSoon />}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-[1000px] px-6 py-10 text-center">
          <h2 className="font-serif-display text-2xl font-bold text-plum">Serving Karur and nearby towns</h2>
          <p className="mt-3 text-sm text-ink/60">
            Shop in person or get home delivery across Karur district and {SITE.areasServed.slice(1, 7).join(", ")}.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {NEARBY.map((n) => (
              <li key={n} className="rounded-full bg-white px-4 py-2 text-sm text-plum ring-1 ring-plum/10">
                {n}
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <FaqSection faqs={KARUR_FAQS} title="Visiting our Karur store" eyebrow="STORE FAQ" />
    </>
  );
}
