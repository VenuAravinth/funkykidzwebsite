import { useProducts } from "@/context/ProductsContext";
import ProductPhoto from "@/components/product/ProductPhoto";
import { productImage } from "@/lib/products";
import { calcDelivery } from "@/lib/cartPricing";
import { formatPrice } from "@/lib/format";
import type { AppliedCoupon } from "@/lib/coupons";

export type CheckoutItem = { slug: string; colorwayName: string; size: string; quantity: number };

export default function OrderBillSummary({ items, coupon = null }: { items: CheckoutItem[]; coupon?: AppliedCoupon | null }) {
  const { getProduct: getProductBySlug } = useProducts();
  const subtotal = items.reduce((sum, item) => {
    const product = getProductBySlug(item.slug);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const delivery = calcDelivery(subtotal);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = subtotal - discount + delivery;

  return (
    <div className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-8">
      <h3 className="font-serif-display text-xl font-bold text-plum">Order Summary</h3>

      <div className="mt-5 flex flex-col gap-4">
        {items.map((item, i) => {
          const product = getProductBySlug(item.slug);
          if (!product) return null;
          return (
            <div key={`${item.slug}-${item.size}-${i}`} className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush/60">
                <ProductPhoto src={productImage(product)} alt="" label={false} width={56} height={70} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-plum">{product.name}</p>
                <p className="text-xs text-ink/50">
                  Size {item.size} &middot; Qty {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-ink">{formatPrice(product.price * item.quantity)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-2 border-t border-rose-light/60 pt-5 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>Subtotal</span>
          <span className="font-semibold text-plum">{formatPrice(subtotal)}</span>
        </div>
        {coupon && (
          <div className="flex justify-between text-emerald-700">
            <span>
              Redeem code <span className="font-mono text-xs">({coupon.code})</span>
            </span>
            <span className="font-semibold">−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink/60">
          <span>Delivery</span>
          <span className="font-semibold text-plum">{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-rose-light/60 pt-4 text-base font-bold text-plum">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
