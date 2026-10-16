"use client";

import { useProducts } from "@/context/ProductsContext";
import Link from "next/link";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import ProductPhoto from "@/components/product/ProductPhoto";
import { useCart, type CartLine } from "@/context/CartContext";
import { productImage } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export default function CartLineItem({ line }: { line: CartLine }) {
  const { getProduct: getProductBySlug } = useProducts();
  const { updateQuantity, removeFromCart } = useCart();
  const product = getProductBySlug(line.slug);
  if (!product) return null;

  const lineTotal = product.price * line.quantity;
  const photo = productImage(product);

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-rose-light/60 py-5 last:border-b-0 sm:flex-nowrap">
      <Link href={`/product/${product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-blush/60">
        <ProductPhoto src={photo} alt="" label={false} width={80} height={100} className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-[10rem] flex-1">
        <Link href={`/product/${product.slug}`} className="font-semibold text-plum hover:text-rose-dark">
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-ink/50">
          Size {line.size}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink sm:hidden">{formatPrice(product.price)}</p>
      </div>

      <p className="hidden w-20 text-sm font-semibold text-ink sm:block">{formatPrice(product.price)}</p>

      <div className="flex items-center gap-2 rounded-full border border-plum/15 px-1 py-1">
        <button
          type="button"
          aria-label={line.quantity === 1 ? "Remove item" : "Decrease quantity"}
          onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
          className="grid h-9 w-9 place-items-center rounded-full text-ink/60 transition-colors hover:bg-rose-light hover:text-rose-dark"
        >
          <FiMinus className="text-xs" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-plum">{line.quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
          className="grid h-9 w-9 place-items-center rounded-full text-ink/60 transition-colors hover:bg-rose-light hover:text-rose-dark"
        >
          <FiPlus className="text-xs" />
        </button>
      </div>

      <p className="w-20 text-right text-sm font-bold text-plum">{formatPrice(lineTotal)}</p>

      <button
        type="button"
        aria-label={`Remove ${product.name} from bag`}
        onClick={() => removeFromCart(line.lineId)}
        className="grid h-10 w-10 place-items-center rounded-full text-ink/40 transition-colors hover:bg-rose-light hover:text-rose-dark"
      >
        <FiTrash2 />
      </button>
    </div>
  );
}
