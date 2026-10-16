import { productStock, type Product } from "./products";
import { DELIVERY_DAYS, DELIVERY_FEE, FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "./cartPricing";
import { SITE, SITE_URL, absoluteUrl } from "./site";

// schema.org builders. Rendered through <JsonLd /> so Google can show rich results
// (store map pack, product price/rating, FAQ snippets, breadcrumbs).

const STORE_ID = `${SITE_URL}/#store`;

export function storeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": STORE_ID,
    name: SITE.name,
    alternateName: [SITE.legalName, "Funky Kidz Karur", "FunkyKidz Korean Kids Fashion"],
    description: SITE.description,
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    image: absoluteUrl("/opengraph-image"),
    telephone: SITE.phone,
    email: SITE.supportEmail,
    priceRange: SITE.priceRange,
    currenciesAccepted: "INR",
    // Online checkout is UPI only; cash and cards are accepted in the Karur store.
    paymentAccepted: "Cash, UPI, Google Pay, PhonePe, Paytm",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    hasMap: `https://www.google.com/maps?q=${encodeURIComponent(`Funky Kidz Wear, Jawahar Bazaar, Karur ${SITE.address.postalCode}`)}`,
    openingHoursSpecification: SITE.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: SITE.areasServed.map((name) => ({ "@type": "Place", name })),
    knowsAbout: ["Korean kids fashion", "Kids dresses", "Hanbok for kids", "Girls party wear", "Boys ethnic wear", "Clothing for ages 0–15"],
    sameAs: SITE.socials,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE.name,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: { "@id": STORE_ID },
  };
}

export function productSchema(product: Product, rating: { average: number; count: number } | null = null) {
  const url = absoluteUrl(`/product/${product.slug}`);
  // Offers valid for a year from build time; Google flags offers without priceValidUntil.
  const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    url,
    image: absoluteUrl(`/product/${product.slug}/opengraph-image`),
    category: `Kids > ${product.gender} > ${product.category}`,
    brand: { "@type": "Brand", name: SITE.name },
    color: product.colorways.map((c) => c.name).join(", "),
    size: product.sizes.join(", "),
    audience: { "@type": "PeopleAudience", suggestedMinAge: 0, suggestedMaxAge: 15 },
    // Only real reviews from src/lib/reviews.ts — Google penalises invented ratings.
    aggregateRating: rating
      ? { "@type": "AggregateRating", ratingValue: rating.average.toFixed(1), reviewCount: rating.count }
      : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: validUntil,
      availability: productStock(product).status === "out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": STORE_ID },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        shippingRate: {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: product.price >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE,
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: DELIVERY_DAYS.min, maxValue: DELIVERY_DAYS.max, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: RETURN_WINDOW_DAYS,
      },
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
