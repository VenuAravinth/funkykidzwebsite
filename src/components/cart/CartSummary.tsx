"use client";

import { useRouter } from "next/navigation";
import { FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS, calcDelivery } from "@/lib/cartPricing";
import { formatPrice } from "@/lib/format";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import Link from "next/link";

export default function CartSummary({ subtotal }: { subtotal: number }) {
  const router = useRouter();
  const delivery = calcDelivery(subtotal);
  const total = subtotal + delivery;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="h-fit rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-8">
      <h3 className="font-serif-display text-xl font-bold text-plum">Order Summary</h3>

      {amountToFreeShipping > 0 && (
        <p className="mt-3 rounded-lg bg-blush/50 px-3 py-2 text-xs font-medium text-rose-dark">
          Add {formatPrice(amountToFreeShipping)} more to unlock free shipping!
        </p>
      )}

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>Subtotal</span>
          <span className="font-semibold text-plum">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/60">
          <span>Delivery</span>
          <span className="font-semibold text-plum">{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
        </div>
      </div>

      <div className="mt-5 flex justify-between border-t border-rose-light/60 pt-5 text-base font-bold text-plum">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <p className="mt-4 text-xs text-ink/60">
        <DeliveryEstimate prefix="Estimated delivery:" />
      </p>

      <button
        disabled={subtotal === 0}
        title={subtotal === 0 ? "Your bag is empty" : undefined}
        onClick={() => router.push("/checkout?mode=cart")}
        className="mt-6 w-full rounded-full bg-rose px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        Proceed to Checkout
      </button>
      <p className="mt-3 text-center text-[11px] text-ink/45">
        Pay securely by UPI · {RETURN_WINDOW_DAYS}-day returns ·{" "}
        <Link href="/returns-exchanges" className="underline underline-offset-2">
          policy
        </Link>
      </p>
    </div>
  );
}
