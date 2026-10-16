"use client";

import type { ReactNode } from "react";
import type { Product } from "@/lib/products";
import { ProductsProvider } from "@/context/ProductsContext";
import { AuthProvider } from "@/context/AuthContext";
import { AddressProvider } from "@/context/AddressContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LoginModalProvider } from "@/context/LoginModalContext";

export default function AppProviders({ products, children }: { products: Product[]; children: ReactNode }) {
  return (
    <ProductsProvider products={products}>
      <AuthProvider>
        <AddressProvider>
          <CartProvider>
            <WishlistProvider>
              <LoginModalProvider>{children}</LoginModalProvider>
            </WishlistProvider>
          </CartProvider>
        </AddressProvider>
      </AuthProvider>
    </ProductsProvider>
  );
}
