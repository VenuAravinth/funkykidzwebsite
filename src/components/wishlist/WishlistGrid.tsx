"use client";

import { useProducts } from "@/context/ProductsContext";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";
import ProductGrid from "@/components/collections/ProductGrid";
import { useAuth } from "@/context/AuthContext";
import LoginPrompt from "@/components/auth/LoginPrompt";

export default function WishlistGrid() {
  const { getProduct: getProductBySlug } = useProducts();
  const { wishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const products = wishlist
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  if (!isAuthenticated) {
    return <LoginPrompt icon={FiHeart} title="Log in to see your wishlist" text="Tap the heart on any product to save it — your favourites are kept in your account." />;
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-plum/15 bg-cream/40 p-10 text-center">
        <FiHeart className="mx-auto text-3xl text-rose-dark" />
        <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">Your wishlist is empty</h3>
        <p className="mt-2 text-sm text-ink/60">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          href="/collections"
          className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
        >
          Browse the Shop
        </Link>
      </div>
    );
  }

  return <ProductGrid products={products} />;
}
