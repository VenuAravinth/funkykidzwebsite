"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHeart, FiShoppingBag, FiZap } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useBuyNowItem } from "@/lib/buyNow";
import type { Product } from "@/lib/products";
import { trackAddToCart, trackBeginCheckout } from "@/lib/analytics";
import MobileBuyBar from "./MobileBuyBar";
import { useLoginModal } from "@/context/LoginModalContext";

type Props = {
  product: Product;
  selectedColorway: string;
  selectedSize: string | null;
};

export default function AddToCartBar({ product, selectedColorway, selectedSize }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { setBuyNowItem } = useBuyNowItem();
  const { requireLogin } = useLoginModal();
  const [justAdded, setJustAdded] = useState(false);
  const [addedOnce, setAddedOnce] = useState(false);
  const wishlisted = isWishlisted(product.slug);

  // With no size picked, jump to the size picker instead of a dead button.
  const promptForSize = () => document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const handleAddToCart = () => {
    if (!selectedSize) return promptForSize();
    const size = selectedSize;
    requireLogin(() => {
      addToCart({ slug: product.slug, colorwayName: selectedColorway, size });
      trackAddToCart({ product, size, colorwayName: selectedColorway });
      setJustAdded(true);
      setAddedOnce(true);
      setTimeout(() => setJustAdded(false), 1800);
    }, "Log in to add this to your bag — your size is saved.");
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    const size = selectedSize;
    requireLogin(() => {
      trackBeginCheckout([{ product, size, colorwayName: selectedColorway }]);
      setBuyNowItem({ slug: product.slug, colorwayName: selectedColorway, size, quantity: 1 });
      router.push("/checkout?mode=buynow");
    }, "Log in to buy now — your size is saved.");
  };

  const mainLabel = justAdded ? "Added to Bag ✓" : selectedSize ? "Add to Bag" : "Select a Size";

  return (
    <div className="flex flex-col gap-3">
      <MobileBuyBar targetId="main-add-to-cart" price={product.price} label={mainLabel} onAdd={handleAddToCart} />
      <div id="main-add-to-cart" className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
        >
          <FiShoppingBag />
          {mainLabel}
        </button>
        <button
          aria-label="Add to wishlist"
          onClick={() => requireLogin(() => toggleWishlist(product.slug), "Log in to save this to your wishlist.")}
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-lg transition-colors ${
            wishlisted ? "border-rose-dark bg-rose-light text-rose-dark" : "border-plum/20 text-plum hover:bg-rose-light"
          }`}
        >
          <FiHeart className={wishlisted ? "fill-current" : ""} />
        </button>
      </div>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={!selectedSize}
        title={selectedSize ? undefined : "Select a size first"}
        className="flex items-center justify-center gap-2 rounded-full border-2 border-plum px-6 py-3 text-sm font-bold uppercase tracking-wide text-plum transition-colors hover:bg-plum hover:text-white disabled:cursor-not-allowed disabled:border-ink/15 disabled:text-ink/30 disabled:hover:bg-transparent"
      >
        <FiZap /> Buy Now
      </button>
      {addedOnce && (
        <Link href="/cart" className="text-center text-sm font-semibold text-rose-dark underline underline-offset-2">
          View bag &amp; check out →
        </Link>
      )}
    </div>
  );
}
