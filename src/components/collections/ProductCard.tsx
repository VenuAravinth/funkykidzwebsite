"use client";

import Link from "next/link";
import { FiEye, FiHeart } from "react-icons/fi";
import ProductPhoto from "@/components/product/ProductPhoto";
import {
  discountPercent,
  productImage,
  productStock,
  sizeRangeLabel,
  type Product,
} from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useWishlist } from "@/context/WishlistContext";
import { useLoginModal } from "@/context/LoginModalContext";
import type { CardDensity } from "./gridLayout";

const tagStyle: Record<NonNullable<Product["tag"]>, string> = {
  Bestseller: "bg-plum text-white",
  New: "bg-rose text-white",
};

// Type, spacing and control sizes per card size, so 6-across cards stay tidy and 3-across cards
// make use of the extra room.
const densityStyle: Record<CardDensity, {
  badge: string;
  heart: string;
  cta: string;
  title: string;
  price: string;
  meta: string;
}> = {
  large: {
    badge: "px-3 py-1 text-xs",
    heart: "h-10 w-10 text-lg",
    cta: "inset-x-3 bottom-3 py-2.5 text-sm",
    title: "text-base md:text-lg",
    price: "text-base",
    meta: "text-xs",
  },
  default: {
    badge: "px-2.5 py-1 text-[10px]",
    heart: "h-8 w-8",
    cta: "inset-x-2 bottom-2 py-2 text-xs",
    title: "text-sm",
    price: "text-sm",
    meta: "text-[11px]",
  },
  compact: {
    badge: "px-1.5 py-0.5 text-[9px]",
    heart: "h-7 w-7 text-sm",
    cta: "inset-x-1.5 bottom-1.5 py-1.5 text-[10px]",
    title: "text-xs",
    price: "text-xs",
    meta: "text-[10px]",
  },
};

export default function ProductCard({
  product,
  priority = false,
  density = "default",
  imageSizes = "(min-width: 1280px) 280px, (min-width: 768px) 30vw, 50vw",
}: {
  product: Product;
  priority?: boolean;
  density?: CardDensity;
  imageSizes?: string;
}) {
  const d = densityStyle[density];
  const compact = density === "compact";
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { requireLogin } = useLoginModal();

  const wishlisted = isWishlisted(product.slug);
  const cover = product.colorways[0];
  const photo = productImage(product);
  const stock = productStock(product);
  const soldOut = stock.status === "out";
  const off = discountPercent(product.price, product.oldPrice);
  const href = `/product/${product.slug}`;

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl" style={{ background: cover?.bg }}>
        <Link href={href} aria-label={product.name} className="block">
          <div className="relative aspect-[4/5] w-full">
            <ProductPhoto
              src={photo}
              alt={product.name}
              label={!compact}
              fill
              priority={priority}
              sizes={imageSizes}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {product.tag && (
            <span className={`rounded-full font-bold ${d.badge} ${tagStyle[product.tag]}`}>{product.tag}</span>
          )}
        </div>

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => requireLogin(() => toggleWishlist(product.slug), "Log in to save this to your wishlist.")}
          className={`absolute right-2 top-2 grid ${d.heart} place-items-center rounded-full bg-white/90 shadow transition-colors ${
            wishlisted ? "text-rose-dark" : "text-ink/70"
          }`}
        >
          <FiHeart className={wishlisted ? "fill-current" : ""} />
        </button>

        {soldOut ? (
          <span className={`absolute rounded-full bg-white/90 text-center font-bold uppercase ${d.cta} tracking-wide text-ink/60`}>
            Sold out
          </span>
        ) : (
          // Always visible on touch screens; slides up on hover where there is a mouse.
          <Link
            href={href}
            className={`absolute flex items-center justify-center gap-1.5 rounded-full bg-white/95 font-bold uppercase tracking-wide text-plum shadow backdrop-blur-sm transition-all duration-300 hover:bg-plum hover:text-white [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 ${d.cta}`}
          >
            <FiEye className="shrink-0" /> <span className="whitespace-nowrap">Take a Look</span>
          </Link>
        )}
      </div>

      <Link href={href} className={`block ${compact ? "mt-2" : "mt-3"}`}>
        <h3 className={`line-clamp-2 font-semibold leading-snug text-plum ${d.title}`}>{product.name}</h3>
        <p className={`mt-1 flex flex-wrap items-baseline gap-x-1.5 ${d.price}`}>
          <span className="font-bold text-ink">{formatPrice(product.price)}</span>
          {off > 0 && (
            <>
              <s className={`text-ink/45 ${d.meta}`}>{formatPrice(product.oldPrice!)}</s>
              <span className={`font-bold text-emerald-700 ${d.meta}`}>{off}% off</span>
            </>
          )}
        </p>
      </Link>

      <p className={`mt-1 truncate text-ink/55 ${d.meta}`}>{sizeRangeLabel(product)}</p>
      {stock.status === "low" && stock.units !== undefined && (
        <p className={`mt-1 font-semibold text-rose-dark ${d.meta}`}>Only {stock.units} left</p>
      )}
    </article>
  );
}
