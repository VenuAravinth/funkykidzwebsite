import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-blush to-cream px-6 text-center">
      <div>
        <p className="font-serif-display text-7xl font-bold text-rose-dark">404</p>
        <h1 className="mt-4 font-serif-display text-3xl font-bold text-plum">This page took a little detour</h1>
        <p className="mt-3 text-ink/60">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-rose px-7 py-3 font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-105"
        >
          Back to FunkyKidz
        </Link>
      </div>
    </main>
  );
}
