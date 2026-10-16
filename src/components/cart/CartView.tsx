"use client";

import { useProducts } from "@/context/ProductsContext";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import { useAuth } from "@/context/AuthContext";
import LoginPrompt from "@/components/auth/LoginPrompt";

export default function CartView() {
  const { getProduct: getProductBySlug } = useProducts();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt icon={FiShoppingBag} title="Log in to see your bag" text="Your bag is saved to your account so it's ready on every visit." />;
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-plum/15 bg-cream/40 p-10 text-center">
        <FiShoppingBag className="mx-auto text-3xl text-rose-dark" />
        <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">Your bag is empty</h3>
        <p className="mt-2 text-sm text-ink/60">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/collections"
          className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
        >
          Browse the Shop
        </Link>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, line) => {
    const product = getProductBySlug(line.slug);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      <div className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-8">
        {cart.map((line) => (
          <CartLineItem key={line.lineId} line={line} />
        ))}
      </div>
      <CartSummary subtotal={subtotal} />
    </div>
  );
}
