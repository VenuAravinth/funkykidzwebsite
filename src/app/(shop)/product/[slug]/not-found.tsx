import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function ProductNotFound() {
  return (
    <section className="mx-auto flex max-w-[1400px] flex-col items-center px-6 py-24 text-center md:px-12">
      <span className="text-5xl">🐴</span>
      <h1 className="mt-4 font-serif-display text-3xl font-bold text-plum">
        We couldn&apos;t find that product
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        It may have sold out or moved. Let&apos;s get you back to browsing our collections.
      </p>
      <Link
        href="/collections"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-105"
      >
        <FiArrowLeft /> Back to Shop
      </Link>
    </section>
  );
}
