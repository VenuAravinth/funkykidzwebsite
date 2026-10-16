import type { Metadata } from "next";
import Link from "next/link";
import { FiHeart, FiFeather, FiShield, FiUsers } from "react-icons/fi";
import LandingHero from "@/components/LandingHero";
import SectionHeading from "@/components/SectionHeading";
import StatsBand from "@/components/home/StatsBand";
import Omnichannel from "@/components/home/Omnichannel";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { breadcrumbSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "About Us — Karur's Korean Kids Fashion Brand",
  description:
    "FunkyKidz is a Karur, Tamil Nadu kids fashion brand bringing Korean-style dresses and hanbok to Indian families — in store at Jawahar Bazaar and online across India.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: FiFeather, title: "Comfort first", desc: "Soft, breathable fabrics chosen for little bodies and Tamil Nadu summers." },
  { icon: FiHeart, title: "Designed with love", desc: "Korean-inspired details — ribbons, pastels, hanbok silhouettes — picked piece by piece." },
  { icon: FiShield, title: "Honest quality", desc: "Every item is checked by hand in Karur before it reaches your child." },
  { icon: FiUsers, title: "Family service", desc: "Real people on WhatsApp and in store, helping with sizes, gifts and exchanges." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <LandingHero
        eyebrow="OUR STORY"
        title={
          <>
            Korean style for <span className="text-shimmer">little stars</span>, from Karur
          </>
        }
        intro="FunkyKidz is a homegrown kids fashion brand from Karur, Tamil Nadu. We bring the gentle colours and playful elegance of Korean kidswear to Indian families — in our Jawahar Bazaar store and online across the country."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        primary={{ label: "Explore the collection", href: "/collections" }}
        secondary={{ label: "Visit the store", href: "/kids-dresses-karur" }}
      />

      <section className="mx-auto grid max-w-[1400px] gap-8 px-6 py-20 md:grid-cols-2 md:px-24">
        <Reveal>
          <div className="lift h-full rounded-3xl bg-white p-10 ring-1 ring-plum/5">
            <span className="text-xs font-semibold tracking-[0.2em] text-rose-dark">OUR MISSION</span>
            <p className="mt-4 font-serif-display text-2xl font-bold leading-snug text-plum">
              Make premium, Korean-inspired kids fashion accessible to every family in Tamil Nadu and beyond.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="lift h-full rounded-3xl bg-plum p-10 text-white">
            <span className="text-xs font-semibold tracking-[0.2em] text-rose-light">OUR VISION</span>
            <p className="mt-4 font-serif-display text-2xl font-bold leading-snug">
              To be South India&apos;s most-loved destination for stylish, comfortable kidswear — online and in store.
            </p>
          </div>
        </Reveal>
      </section>

      <StatsBand />

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-20">
        <SectionHeading eyebrow="WHAT WE STAND FOR" title="Our values" />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <StaggerItem key={v.title}>
              <div className="lift group h-full rounded-3xl bg-white p-7 text-center ring-1 ring-plum/5">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-light text-2xl text-rose-dark transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <v.icon />
                </span>
                <h3 className="mt-5 font-semibold text-plum">{v.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{v.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Omnichannel />

      <Reveal>
        <section className="mx-auto max-w-[1000px] px-6 pb-24 text-center">
          <h2 className="font-serif-display text-3xl font-bold text-plum">Want to know how online orders work?</h2>
          <p className="mt-3 text-ink/60">From payment to packing to delivery — see exactly how we handle every order.</p>
          <Link
            href="/how-we-sell"
            className="mt-7 inline-block rounded-full bg-rose px-7 py-3 font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-105"
          >
            How we sell online →
          </Link>
        </section>
      </Reveal>
    </>
  );
}
