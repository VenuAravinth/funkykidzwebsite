import { FaWhatsapp } from "react-icons/fa6";
import KidIllustration from "./KidIllustration";
import { whatsappLink } from "@/lib/site";

// There is no email list behind the site, so instead of a signup form that goes nowhere,
// parents join new-arrival updates on WhatsApp — the channel the store already answers.
export default function Newsletter() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 md:pl-24 md:pr-12">
      <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-rose-light via-blush to-rose-light px-5 py-10 sm:px-6 sm:py-14">
        <div className="absolute bottom-0 left-0 hidden h-40 w-32 overflow-hidden rounded-tr-full md:block">
          <KidIllustration variant="boy" outfit="#7fb6c9" bg="transparent" className="h-full w-full opacity-90" />
        </div>
        <div className="absolute bottom-0 right-0 hidden h-40 w-32 overflow-hidden rounded-tl-full md:block">
          <KidIllustration variant="girl" outfit="#e8a6b8" bg="transparent" className="h-full w-full opacity-90" />
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <h2 className="font-serif-display text-2xl font-bold text-plum sm:text-3xl">Get new arrivals first</h2>
          <p className="mt-2 text-sm text-ink/60">
            Message us on WhatsApp and we&apos;ll send you new styles and restock alerts. Reply STOP anytime.
          </p>
          <a
            href={whatsappLink("Hi FunkyKidz! Please add me to your new arrivals updates.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25d366]/30"
          >
            <FaWhatsapp className="text-lg" /> Get updates on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
