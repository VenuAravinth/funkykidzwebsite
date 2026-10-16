"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useProducts } from "./ProductsContext";

type WishlistContextValue = {
  wishlist: string[];
  wishlistCount: number;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Saved per customer in MongoDB.
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { getProduct } = useProducts();
  const userId = currentUser?.id ?? null;
  const [loaded, setLoaded] = useState<{ userId: string | null; slugs: string[] }>({ userId: null, slugs: [] });
  const slugs = useMemo(() => (loaded.userId === userId ? loaded.slugs : []), [loaded, userId]);
  const setSlugs = (next: string[] | ((prev: string[]) => string[])) =>
    setLoaded((prev) => ({ userId: prev.userId, slugs: typeof next === "function" ? next(prev.slugs) : next }));

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    api<{ slugs: string[] }>("/api/wishlist").then((res) => alive && setLoaded({ userId, slugs: res.ok ? res.data.slugs : [] }));
    return () => {
      alive = false;
    };
  }, [userId]);

  const value = useMemo<WishlistContextValue>(() => {
    const wishlist = slugs.filter((s) => getProduct(s));
    return {
      wishlist,
      wishlistCount: wishlist.length,
      toggleWishlist: (slug) => {
        const before = slugs;
        setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
        api<{ slugs: string[] }>("/api/wishlist", { body: { slug } }).then((res) => setSlugs(res.ok ? res.data.slugs : before));
      },
      isWishlisted: (slug) => wishlist.includes(slug),
    };
  }, [slugs, getProduct]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
