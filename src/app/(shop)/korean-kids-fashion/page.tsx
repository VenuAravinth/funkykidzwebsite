import type { Metadata } from "next";
import Link from "next/link";
import LandingHero from "@/components/LandingHero";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/collections/ProductGrid";
import FaqSection from "@/components/seo/FaqSection";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { bestSellers } from "@/lib/products";
import { getProducts } from "@/server/catalog";
import { ComingSoon } from "@/components/CatalogStatus";
import { KOREAN_FAQS } from "@/lib/seoContent";
import { breadcrumbSchema, faqSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "Korean Kids Fashion Online India — Korean Style Dresses & Hanbok",
  description:
    "Shop Korean fashion for kids online in India: Korean-style girls dresses, kids hanbok sets, pastel tops and bottoms for 0–15 years. Designed for Indian weather, shipped from Karur, Tamil Nadu.",
  keywords: [
    "Korean fashion",
    "Korean kids fashion",
    "Korean kids clothes online India",
    "Korean style kids dresses",
    "kids hanbok India",
    "Korean baby clothes",
    "K-fashion for kids",
    "Korean dress for girl kids",
  ],
  alternates: { canonical: "/korean-kids-fashion" },
};

const TRENDS = [
  { title: "Soft pastel palettes", desc: "Blush rose, mint, butter yellow and sky blue — the signature K-fashion colour story.", color: "#f7e2df" },
  { title: "Modern hanbok", desc: "Traditional jeogori and chima silhouettes reimagined for birthdays and festivals.", color: "#e9f2ef" },
  { title: "Ribbons & puff sleeves", desc: "Playful details that make every outfit photo-ready without sacrificing comfort.", color: "#f4ede0" },
  { title: "Clean, minimal layers", desc: "Vests, pleated trousers and wide-leg pants that mix and match all year.", color: "#eef0f7" },
];

export default async function KoreanFashionPage() {
  const hanbok = bestSellers(await getProducts()).slice(0, 8);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Korean Kids Fashion", path: "/korean-kids-fashion" },
          ]),
          faqSchema(KOREAN_FAQS),
        ]}
      />
      <LandingHero
        eyebrow="K-FASHION FOR LITTLE ONES"
        title={
          <>
            <span className="text-shimmer">Korean fashion</span> for kids, made for India
          </>
        }
        intro="Pastel party dresses, modern hanbok sets and minimal everyday layers — the Korean kidswear look, in breathable fabrics for Indian weather and sizes from newborn to 15 years."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Korean Kids Fashion" }]}
        primary={{ label: "Shop Korean styles", href: "/collections" }}
        secondary={{ label: "Size guide", href: "/size-guide" }}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-20">
        <SectionHeading
          eyebrow="THE LOOK"
          title="What makes Korean kids fashion special?"
          subtitle="Korean kidswear is loved worldwide for being cute without being loud — gentle colours, thoughtful details and comfortable cuts."
        />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRENDS.map((t) => (
            <StaggerItem key={t.title}>
              <div className="lift h-full rounded-3xl p-7" style={{ background: t.color }}>
                <h3 className="font-serif-display text-xl font-bold text-plum">{t.title}</h3>
                <p className="mt-3 text-sm text-ink/65">{t.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Reveal>
        <section className="mx-auto max-w-[1400px] px-6 pb-16 md:px-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif-display text-3xl font-bold text-plum">Shop the Korean kids edit</h2>
            <Link href="/collections" className="inline-block py-2.5 text-sm font-semibold text-rose-dark hover:underline">
              See everything →
            </Link>
          </div>
          <div className="mt-8">
            {hanbok.length ? <ProductGrid products={hanbok} /> : <ComingSoon />}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-[900px] px-6 py-10 text-[15px] leading-relaxed text-ink/65">
          <h2 className="font-serif-display text-2xl font-bold text-plum">Korean style, Tamil Nadu heart</h2>
          <p className="mt-4">
            FunkyKidz began in Karur with one idea: Indian kids deserve the same playful, premium Korean fashion that
            parents see on Instagram and K-dramas — without import prices or long waits. Every design is selected for
            comfort in our climate and finished with care.
          </p>
          <p className="mt-4">
            Order online for delivery anywhere in India, or{" "}
            <Link href="/kids-dresses-karur" className="font-semibold text-rose-dark hover:underline">
              visit our kids dress shop in Karur
            </Link>{" "}
            to see the collection in person.
          </p>
        </section>
      </Reveal>

      <FaqSection faqs={KOREAN_FAQS} title="Korean kids fashion — your questions" />
    </>
  );
}
