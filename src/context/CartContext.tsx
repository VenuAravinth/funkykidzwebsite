"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useProducts } from "./ProductsContext";

export type CartLine = { lineId: string; slug: string; colorwayName: string; size: string; quantity: number };

type AddToCartInput = { slug: string; colorwayName: string; size: string; quantity?: number };

type CartContextValue = {
  cart: CartLine[];
  cartCount: number;
  addToCart: (input: AddToCartInput) => Promise<boolean>;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  /** Re-reads the cart from the server (e.g. after an order). */
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

// The cart lives in MongoDB per customer. Changes show instantly (optimistic) and the
// server's answer then replaces the local copy.
export function CartProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { getProduct } = useProducts();
  const userId = currentUser?.id ?? null;
  // Loaded lines are tagged with their owner, so signing out simply hides them.
  const [loaded, setLoaded] = useState<{ userId: string | null; items: CartLine[] }>({ userId: null, items: [] });
  const items = useMemo(() => (loaded.userId === userId ? loaded.items : []), [loaded, userId]);
  const setItems = useCallback(
    (next: CartLine[] | ((prev: CartLine[]) => CartLine[])) =>
      setLoaded((prev) => ({ userId: prev.userId, items: typeof next === "function" ? next(prev.items) : next })),
    []
  );

  const refreshCart = useCallback(async () => {
    const res = await api<{ items: CartLine[] }>("/api/cart");
    setItems(res.ok ? res.data.items : []);
  }, [setItems]);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    api<{ items: CartLine[] }>("/api/cart").then((res) => alive && setLoaded({ userId, items: res.ok ? res.data.items : [] }));
    return () => {
      alive = false;
    };
  }, [userId]);

  const sync = useCallback(
    async (request: Promise<{ ok: boolean; data?: { items: CartLine[] } }>) => {
      const res = await request;
      if (res.ok && res.data) setItems(res.data.items);
      else await refreshCart(); // undo the optimistic change
      return res.ok;
    },
    [refreshCart, setItems]
  );

  const value = useMemo<CartContextValue>(() => {
    const cart = items.filter((l) => getProduct(l.slug)); // hide products no longer sold
    return {
      cart,
      cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
      addToCart: ({ slug, colorwayName, size, quantity = 1 }) => {
        const lineId = `${slug}__${colorwayName}__${size}`;
        setItems((prev) =>
          prev.some((l) => l.lineId === lineId)
            ? prev.map((l) => (l.lineId === lineId ? { ...l, quantity: l.quantity + quantity } : l))
            : [...prev, { lineId, slug, colorwayName, size, quantity }]
        );
        return sync(api("/api/cart", { body: { slug, colorwayName, size, quantity } }));
      },
      removeFromCart: (lineId) => {
        setItems((prev) => prev.filter((l) => l.lineId !== lineId));
        void sync(api(`/api/cart?lineId=${encodeURIComponent(lineId)}`, { method: "DELETE" }));
      },
      updateQuantity: (lineId, quantity) => {
        setItems((prev) => (quantity <= 0 ? prev.filter((l) => l.lineId !== lineId) : prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l))));
        void sync(api("/api/cart", { method: "PATCH", body: { lineId, quantity: Math.max(0, Math.min(20, quantity)) } }));
      },
      refreshCart,
    };
  }, [items, getProduct, sync, refreshCart, setItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
