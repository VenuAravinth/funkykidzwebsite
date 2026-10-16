import Link from "next/link";
import { FiClock, FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import Reveal from "@/components/Reveal";
import { SITE, fullAddress, whatsappLink } from "@/lib/site";

const MAP_SRC =
  "https://www.google.com/maps?q=Funky%20Kidz%20Wear,%20Shiva%20Textiles,%20Jawahar%20Bazaar,%20Karur,%20Tamil%20Nadu%20639001&output=embed";

export default function StoreSpotlight() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-24 md:py-20">
      <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rose-light/40 lg:grid-cols-2">
        <Reveal className="p-8 md:p-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-rose-dark">VISIT US IN KARUR</span>
          <h2 className="mt-3 font-serif-display text-3xl font-bold text-plum md:text-4xl">
            Karur&apos;s home of Korean kids fashion
          </h2>
          <p className="mt-4 text-ink/60">
            Looking for a kids dress shop in Karur? Walk into FunkyKidz at Jawahar Bazaar for party frocks, hanbok sets,
            birthday outfits and everyday wear for babies to 12-year-olds — with friendly sizing help from our team.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3">
              <FiMapPin className="mt-0.5 shrink-0 text-lg text-rose-dark" />
              <address className="not-italic text-ink/70">{fullAddress()}</address>
            </li>
            <li className="flex gap-3">
              <FiClock className="mt-0.5 shrink-0 text-lg text-rose-dark" />
              <span className="text-ink/70">
                {SITE.openingHours.map((h) => (
                  <span key={h.days.join()} className="block">
                    {h.days.length > 1 ? `${h.days[0].slice(0, 3)} – ${h.days[h.days.length - 1].slice(0, 3)}` : h.days[0]}:{" "}
                    {h.opens} – {h.closes}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <FiPhone className="mt-0.5 shrink-0 text-lg text-rose-dark" />
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="text-ink/70 hover:text-rose-dark">
                {SITE.phone}
              </a>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kids-dresses-karur"
              className="rounded-full bg-plum px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Store details →
            </Link>
            <a
              href={whatsappLink("Hi FunkyKidz! Is this dress available in the Karur store?")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-plum/15 px-6 py-3 text-sm font-semibold text-plum transition-colors hover:bg-blush"
            >
              <FaWhatsapp className="text-[#25d366]" /> Check stock
            </a>
          </div>
        </Reveal>
        <div className="relative min-h-[320px]">
          <iframe
            title="FunkyKidz kids fashion store location in Jawahar Bazaar, Karur"
            src={MAP_SRC}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
