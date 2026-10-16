import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | FunkyKidz Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Always rendered per request — admin pages must never be cached or prerendered.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f6f3f8] text-ink">{children}</div>;
}
