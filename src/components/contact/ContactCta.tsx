import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";

export default function ContactCta() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-10 sm:px-6 md:px-12 md:pb-20">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-plum via-plum-light to-rose-dark px-8 py-14 text-center shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <svg viewBox="0 0 400 200" className="h-full w-full" fill="none">
            <circle cx="40" cy="30" r="4" fill="white" />
            <circle cx="90" cy="150" r="3" fill="white" />
            <circle cx="340" cy="40" r="3" fill="white" />
            <circle cx="370" cy="140" r="5" fill="white" />
            <circle cx="200" cy="20" r="3" fill="white" />
            <circle cx="150" cy="170" r="4" fill="white" />
          </svg>
        </div>
        <span className="relative inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
          We&apos;re Here To Help <HiSparkles className="text-gold" />
        </span>
        <h2 className="relative mt-4 font-serif-display text-3xl font-bold text-white md:text-4xl">
          Ready To Find Their Next Favorite Outfit?
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm text-white/70">
          Discover stylish outfits and accessories made for every occasion - reach out and let us help you pick the perfect piece.
        </p>
        <Link
          href="/collections"
          className="relative mt-7 inline-flex items-center gap-1 rounded-full bg-white px-7 py-3 text-sm font-semibold text-plum shadow-lg transition-transform hover:scale-105"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
