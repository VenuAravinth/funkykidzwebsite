"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@/lib/products";

// The catalogue, loaded from MongoDB by the shop layout on the server and handed to client
// components (cart, search, checkout…) so they never import product data directly.
type ProductsValue = { products: Product[]; getProduct: (slug: string) => Product | undefined };

const ProductsContext = createContext<ProductsValue | null>(null);

export function ProductsProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const value = useMemo(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return { products, getProduct: (slug: string) => bySlug.get(slug) };
  }, [products]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
