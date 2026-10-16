import type { Product } from "./products";

// GA4 e-commerce events. Calls are no-ops until NEXT_PUBLIC_GA_ID is set and gtag has loaded,
// so tracking never blocks or breaks shopping.

type Gtag = (command: "event", name: string, params: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export type TrackedItem = { product: Product; size?: string; colorwayName?: string; quantity?: number };

const toGaItem = ({ product, size, colorwayName, quantity = 1 }: TrackedItem) => ({
  item_id: product.slug,
  item_name: product.name,
  item_category: product.category,
  item_category2: product.gender,
  item_variant: [colorwayName, size].filter(Boolean).join(" / ") || undefined,
  price: product.price,
  quantity,
});

const valueOf = (items: TrackedItem[]) => items.reduce((s, i) => s + i.product.price * (i.quantity ?? 1), 0);

function send(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export const trackViewItem = (item: TrackedItem) =>
  send("view_item", { currency: "INR", value: valueOf([item]), items: [toGaItem(item)] });

export const trackAddToCart = (item: TrackedItem) =>
  send("add_to_cart", { currency: "INR", value: valueOf([item]), items: [toGaItem(item)] });

export const trackBeginCheckout = (items: TrackedItem[]) =>
  send("begin_checkout", { currency: "INR", value: valueOf(items), items: items.map(toGaItem) });

export const trackPurchase = (orderNumber: string, items: TrackedItem[], shipping: number) =>
  send("purchase", {
    transaction_id: orderNumber,
    currency: "INR",
    value: valueOf(items) + shipping,
    shipping,
    items: items.map(toGaItem),
  });

export const trackSearch = (term: string) => send("search", { search_term: term });
