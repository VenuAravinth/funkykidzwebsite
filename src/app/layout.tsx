import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { SEO_KEYWORDS, SITE, SITE_URL } from "@/lib/site";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FunkyKidz | Korean-Style Kids' Clothing for Ages 0–15 — Shop Online",
    template: "%s | FunkyKidz Karur",
  },
  description: SITE.description,
  keywords: SEO_KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE.name,
    title: "FunkyKidz | Korean-Style Kids' Clothing, Ages 0–15",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "FunkyKidz | Korean-Style Kids' Clothing, Ages 0–15",
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Local-search signals for Karur, Tamil Nadu.
  other: {
    "geo.region": `IN-${SITE.address.regionCode}`,
    "geo.placename": SITE.address.locality,
    "geo.position": `${SITE.geo.lat};${SITE.geo.lng}`,
    ICBM: `${SITE.geo.lat}, ${SITE.geo.lng}`,
  },
  // Paste the code from Google Search Console here once the domain is verified.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#d9647c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
