import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getProducts } from "@/server/catalog";
import { absoluteUrl } from "@/lib/site";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/collections", priority: 0.95, changeFrequency: "daily" },
  { path: "/kids-dresses-karur", priority: 0.9, changeFrequency: "weekly" },
  { path: "/korean-kids-fashion", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/how-we-sell", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/redeem-codes", priority: 0.3, changeFrequency: "yearly" },
  { path: "/size-guide", priority: 0.5, changeFrequency: "yearly" },
  { path: "/shipping-info", priority: 0.4, changeFrequency: "yearly" },
  { path: "/returns-exchanges", priority: 0.4, changeFrequency: "yearly" },
  { path: "/payment-methods", priority: 0.4, changeFrequency: "yearly" },
  { path: "/track-order", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-conditions", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
];

// Built per request so new products appear without a redeploy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const products = await getProducts();
  const now = new Date();
  return [
    ...STATIC_ROUTES.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: new Date(p.dateAdded),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
