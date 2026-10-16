"use client";

import { useProducts } from "@/context/ProductsContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiHeart, FiLogIn, FiPackage, FiShoppingBag, FiUser, FiZap } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLoginModal } from "@/context/LoginModalContext";
import { useProductSelection } from "@/lib/productSelection";
import { useBuyNowItem } from "@/lib/buyNow";
import { trackBeginCheckout } from "@/lib/analytics";

// Phones only (hidden from md up, so desktop is unchanged). The shop layout reserves
// matching bottom padding so this bar never covers page content or checkout buttons.
export const MOBILE_NAV_HEIGHT = "4rem";

const Badge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-dark px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

export default function MobileBottomNav() {
  const { getProduct: getProductBySlug } = useProducts();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { openLogin } = useLoginModal();
  const selection = useProductSelection();
  const { setBuyNowItem } = useBuyNowItem();

  // Buy Now is live only on a product page once a size (and colour) is chosen.
  const product = selection ? getProductBySlug(selection.slug) : undefined;
  const canBuy = Boolean(product && selection?.size && selection.colorwayName);

  function buyNow() {
    if (!product || !selection?.size) return;
    trackBeginCheckout([{ product, size: selection.size, colorwayName: selection.colorwayName }]);
    setBuyNowItem({ slug: product.slug, colorwayName: selection.colorwayName, size: selection.size, quantity: 1 });
    router.push("/checkout?mode=buynow");
  }

  const shell =
    "fixed inset-x-0 bottom-0 z-50 border-t border-plum/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-12px_rgba(54,42,69,0.3)] backdrop-blur md:hidden";

  if (!isAuthenticated) {
    return (
      <nav aria-label="Account" className={shell}>
        <div className="flex h-16 items-center px-4">
          <button
            type="button"
            onClick={() => openLogin()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-plum text-sm font-bold text-white"
          >
            <FiLogIn className="text-base" /> Login
          </button>
        </div>
      </nav>
    );
  }

  const item = (href: string, label: string, Icon: typeof FiUser, count = 0) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active ? "text-rose-dark" : "text-ink/60"}`}
      >
        <span className="relative text-xl">
          <Icon />
          <Badge count={count} />
        </span>
        {label}
      </Link>
    );
  };

  return (
    <nav aria-label="Shortcuts" className={shell}>
      <div className="flex h-16 items-stretch">
        {item("/orders", "Orders", FiPackage)}
        {item("/wishlist", "Wishlist", FiHeart, wishlistCount)}
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={buyNow}
            disabled={!canBuy}
            title={canBuy ? "Buy now" : "Open a product and pick a size to buy now"}
            className="-mt-6 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-rose text-white shadow-lg shadow-rose/40 ring-4 ring-white transition-colors disabled:bg-ink/20 disabled:shadow-none"
          >
            <FiZap className="text-lg" />
            <span className="text-[9px] font-bold uppercase leading-none">Buy now</span>
          </button>
        </div>
        {item("/cart", "Bag", FiShoppingBag, cartCount)}
        {item("/profile", currentUser?.name.split(" ")[0] || "Account", FiUser)}
      </div>
    </nav>
  );
}
