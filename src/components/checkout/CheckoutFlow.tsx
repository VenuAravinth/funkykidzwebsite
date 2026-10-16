"use client";

import { useProducts } from "@/context/ProductsContext";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle, FiShoppingBag, FiUser } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useAddresses } from "@/context/AddressContext";
import { api } from "@/lib/api";
import { useBuyNowItem } from "@/lib/buyNow";
import { calcDelivery } from "@/lib/cartPricing";
import AddressSelector from "./AddressSelector";
import OrderBillSummary, { type CheckoutItem } from "./OrderBillSummary";
import RedeemCodeBox from "./RedeemCodeBox";
import type { AppliedCoupon } from "@/lib/coupons";
import UpiPayment from "./UpiPayment";
import CheckoutSteps, { type CheckoutStep } from "./CheckoutSteps";
import PaymentProofUpload from "./PaymentProofUpload";
import { useLoginModal } from "@/context/LoginModalContext";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import { trackBeginCheckout, trackPurchase, type TrackedItem } from "@/lib/analytics";

type Step = CheckoutStep;

export default function CheckoutFlow() {
  const { getProduct: getProductBySlug } = useProducts();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "buynow" ? "buynow" : "cart";

  const { currentUser, isAuthenticated } = useAuth();
  const { cart, refreshCart } = useCart();
  const { buyNowItem, clearBuyNowItem } = useBuyNowItem();
  const { addressesForUser } = useAddresses();

  const [step, setStep] = useState<Step>("address");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [placedPhone, setPlacedPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const { openLogin } = useLoginModal();

  const items: CheckoutItem[] =
    mode === "buynow"
      ? buyNowItem
        ? [buyNowItem]
        : []
      : cart.map((line) => ({
          slug: line.slug,
          colorwayName: line.colorwayName,
          size: line.size,
          quantity: line.quantity,
        }));

  const subtotal = items.reduce((sum, item) => {
    const product = getProductBySlug(item.slug);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  // Delivery is based on the subtotal before any redeem code (same rule as the server).
  const total = subtotal - discount + calcDelivery(subtotal);
  const isMember = isAuthenticated && currentUser !== null;

  const trackedItems: TrackedItem[] = items.flatMap((item) => {
    const product = getProductBySlug(item.slug);
    return product ? [{ product, size: item.size, colorwayName: item.colorwayName, quantity: item.quantity }] : [];
  });

  // Fire begin_checkout once per visit (Buy Now already reports it from the product page).
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || mode === "buynow" || trackedItems.length === 0) return;
    checkoutTracked.current = true;
    trackBeginCheckout(trackedItems);
  }, [mode, trackedItems]);

  // Purchases need an account: ask signed-out shoppers to log in right away.
  useEffect(() => {
    if (!isMember) openLogin("Log in to complete your purchase.");
  }, [isMember, openLogin]);

  if (!isMember && step !== "success") {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm sm:p-10">
        <FiUser className="mx-auto text-4xl text-rose-dark" />
        <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">Log in to check out</h3>
        <p className="mt-2 text-sm text-ink/60">Your bag and Buy Now item are saved — you&apos;ll continue right here.</p>
        <button
          type="button"
          onClick={() => openLogin("Log in to complete your purchase.")}
          className="mt-6 rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30"
        >
          Log in or create account
        </button>
      </div>
    );
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
        <FiShoppingBag className="mx-auto text-4xl text-rose-dark" />
        <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">Nothing to check out</h3>
        <p className="mt-2 text-sm text-ink/60">Add something to your bag or use Buy Now on a product first.</p>
        <Link
          href="/collections"
          className="mt-6 inline-block rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
        >
          Browse the Shop
        </Link>
      </div>
    );
  }

  if (step === "success" && placedOrderNumber) {
    return (
      <div>
        <CheckoutSteps current="success" />
        <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
          <FiCheckCircle className="mx-auto text-4xl text-rose-dark" />
          <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">Order Placed!</h3>
          <p className="mt-2 text-sm text-ink/60">
            We&apos;re verifying your UPI payment. Track the order below to see when it&apos;s confirmed.
          </p>
          <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-ink/60">
            Your order number
            <span className="mt-1 block font-serif-display text-2xl font-bold tracking-wide text-plum">#{placedOrderNumber}</span>
            <span className="text-xs">Screenshot or note it to track your order.</span>
          </p>
          <p className="mt-3 text-sm text-ink/60">
            <DeliveryEstimate prefix="Expected delivery:" />
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/track-order?order=${placedOrderNumber}&phone=${encodeURIComponent(placedPhone)}`}
              className="rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
            >
              Track this order
            </Link>
            <Link
              href="/collections"
              className="rounded-full border border-plum/15 px-7 py-3 text-sm font-semibold text-ink/70 transition-colors hover:border-rose-dark hover:text-rose-dark"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;
  const addresses = addressesForUser(currentUser.id);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  async function handleSubmitOrder(proofDataUrl: string) {
    if (!selectedAddress || !currentUser) return;

    // The server is the source of truth: it re-prices the items, checks stock, loads the
    // address from the database, stores the payment proof privately and issues the order number.
    setSubmitting(true);
    setSubmitError(null);
    const res = await api<{ orderNumber: string }>("/api/orders", {
      body: { items, addressId: selectedAddress.id, proofDataUrl, couponCode: coupon?.code },
    });
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error);
      return;
    }

    const { orderNumber } = res.data;
    trackPurchase(orderNumber, trackedItems, calcDelivery(subtotal));
    if (mode === "buynow") clearBuyNowItem();
    await refreshCart(); // the server removed the bought items
    setPlacedOrderNumber(orderNumber);
    setPlacedPhone(currentUser.phone);
    setStep("success");
    // Bring the confirmation (and the finished progress bar) into view.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <CheckoutSteps current={step} />

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          {step === "address" && (
            <>
              <AddressSelector user={currentUser} selectedId={selectedAddressId} onSelect={setSelectedAddressId} />
              <button
                type="button"
                disabled={!selectedAddressId}
                onClick={() => setStep("payment")}
                className="mt-6 w-full rounded-full bg-rose px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                Continue to Payment
              </button>
            </>
          )}

          {step === "payment" && (
            <>
              <UpiPayment amount={total} onPaid={() => setStep("proof")} />
              <button
                type="button"
                onClick={() => setStep("address")}
                className="mt-4 text-sm font-semibold text-ink/60 hover:text-rose-dark"
              >
                &larr; Back to address
              </button>
            </>
          )}

          {step === "proof" && (
            <>
              <PaymentProofUpload onSubmit={handleSubmitOrder} submitting={submitting} submitError={submitError} />
              <button
                type="button"
                onClick={() => setStep("payment")}
                className="mt-4 text-sm font-semibold text-ink/60 hover:text-rose-dark"
              >
                &larr; Back to payment
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <OrderBillSummary items={items} coupon={coupon} />
          <RedeemCodeBox items={items} applied={coupon} onChange={setCoupon} locked={step === "proof"} />
          <p className="rounded-xl bg-white px-4 py-3 text-xs text-ink/60 shadow-sm">
            <DeliveryEstimate prefix="Estimated delivery:" />
          </p>
        </div>
      </div>
    </div>
  );
}
