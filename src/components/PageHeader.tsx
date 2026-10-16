import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import PetalField from "./LazyPetalField";

type Crumb = { label: string; href?: string };

export default function PageHeader({ title, breadcrumb }: { title: string; breadcrumb: Crumb[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush via-rose-light/50 to-cream">
      <PetalField />
      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col items-center px-4 py-8 text-center sm:px-6 md:px-24 md:py-16">
        <h1 className="font-serif-display text-3xl font-bold text-plum md:text-5xl">{title}</h1>
        <nav aria-label="Breadcrumb" className="mt-2 flex flex-wrap items-center justify-center gap-x-2 text-sm font-medium text-ink/60 md:mt-4">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {i > 0 && <FiChevronRight className="text-ink/30" />}
              {crumb.href ? (
                <Link href={crumb.href} className="inline-block py-2 transition-colors hover:text-rose-dark">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-rose-dark">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
