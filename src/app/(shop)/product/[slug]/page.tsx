import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { relatedProducts, sizeRangeLabel } from "@/lib/products";
import { getProduct, getProducts, getReviewPage, getReviewStats } from "@/server/catalog";
import { REVIEW_PAGE_SIZE } from "@/lib/reviews";
import { DELIVERY_DAYS, RETURN_WINDOW_DAYS } from "@/lib/cartPricing";
import ProductDetail from "@/components/product/ProductDetail";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/structuredData";
import { formatPrice } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  const title = `${product.name} — ${formatPrice(product.price)}`;
  const description = `${product.shortDescription}. Korean-style ${product.category.toLowerCase()} for ${product.gender.toLowerCase()}, ${sizeRangeLabel(product)}. ${formatPrice(product.price)} with ${DELIVERY_DAYS.min}–${DELIVERY_DAYS.max} day delivery across India and ${RETURN_WINDOW_DAYS}-day returns.`;
  return {
    title,
    description,
    keywords: [
      product.name,
      `Korean ${product.category.toLowerCase()} for ${product.gender.toLowerCase()}`,
      `kids ${product.category.toLowerCase()} Karur`,
      `${product.category.toLowerCase()} online India`,
      "Korean fashion",
      "Karur fashion",
    ],
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { type: "website", title, description, url: `/product/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  // Only the first page of reviews; the carousel fetches more as the shopper browses.
  const [reviews, reviewStats, all] = await Promise.all([getReviewPage(slug, 0, REVIEW_PAGE_SIZE), getReviewStats(slug), getProducts()]);

  return (
    <>
      <JsonLd
        data={[
          productSchema(product, reviewStats.count ? reviewStats : null),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/collections" },
            { name: product.category, path: `/collections?category=${encodeURIComponent(product.category)}` },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
        ]}
      />
      <ProductDetail product={product} reviews={reviews} reviewStats={reviewStats} related={relatedProducts(product, all)} />
    </>
  );
}
