import Link from "next/link";
import Reveal from "@/components/Reveal";

const POPULAR = [
  { label: "Kids dresses in Karur", href: "/kids-dresses-karur" },
  { label: "Korean kids fashion", href: "/korean-kids-fashion" },
  { label: "Hanbok for kids", href: "/collections?category=Hanbok+Sets" },
  { label: "Girls party frocks", href: "/collections?gender=Girls&category=Dresses" },
  { label: "Birthday dresses", href: "/collections?category=Dresses" },
  { label: "Boys festive wear", href: "/collections?gender=Boys" },
  { label: "Baby dresses 0–12 months", href: "/collections?age=0-1+Years" },
];

export default function LocalSeoContent() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-16">
      <Reveal className="grid gap-10 rounded-[2rem] border border-plum/5 bg-white/60 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-serif-display text-2xl font-bold text-plum md:text-3xl">
            Fashionable kids dresses in Karur — Korean style, delivered across India
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/65">
            <p>
              FunkyKidz is a Karur-born kids fashion label bringing the soft pastels, clean cuts and playful details of{" "}
              <strong className="text-plum">Korean fashion</strong> to Tamil Nadu. From twirl-ready party frocks and
              princess hanbok dresses to comfy everyday tops and bottoms, every piece is chosen for little ones aged 0–15
              years.
            </p>
            <p>
              Visit our <strong className="text-plum">kids dress shop in Jawahar Bazaar, Karur</strong>, or shop online
              and get delivery to Trichy, Namakkal, Erode, Dindigul, Salem, Coimbatore, Madurai, Chennai and every corner
              of India. Parents love us for birthday dresses, Doljanchi (first birthday) hanboks, festival outfits and
              matching sibling sets.
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-[0.15em] text-rose-dark">POPULAR SEARCHES</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <li key={p.label}>
                <Link
                  href={p.href}
                  className="inline-block rounded-full bg-blush px-4 py-2 text-sm text-plum transition-all hover:-translate-y-0.5 hover:bg-rose hover:text-white"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
