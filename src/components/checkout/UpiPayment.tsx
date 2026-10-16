"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { FiCopy, FiCheck, FiSmartphone } from "react-icons/fi";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

const UPI_ID = SITE.upiId;
const PAYEE_NAME = SITE.upiPayeeName;

export default function UpiPayment({ amount, onPaid }: { amount: number; onPaid: () => void }) {
  const [copied, setCopied] = useState(false);

  const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent("FunkyKidz Order")}`;
  // Generated in the browser so the payment details never go to a third-party QR service.
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiUri, { width: 220, margin: 1 }).then((url) => !cancelled && setQrSrc(url));
    return () => {
      cancelled = true;
    };
  }, [upiUri]);

  function handleCopy() {
    navigator.clipboard?.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl border border-rose-light/60 bg-white p-6 text-center shadow-sm md:p-8">
      <h3 className="font-serif-display text-xl font-bold text-plum">Pay with UPI</h3>
      <p className="mt-1 text-sm text-ink/50">Scan the QR code or pay directly to the UPI ID below</p>

      <p className="mt-6 text-3xl font-bold text-plum">{formatPrice(amount)}</p>

      {/* On a phone you can't scan your own screen, so open the UPI app directly. */}
      <a
        href={upiUri}
        className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-full bg-plum px-6 py-3 text-sm font-bold text-white md:hidden"
      >
        <FiSmartphone /> Pay with UPI app
      </a>
      <p className="mt-3 text-xs text-ink/40 md:hidden">or scan from another phone</p>

      <div className="mx-auto mt-3 w-fit rounded-2xl border border-plum/10 bg-cream/40 p-3 md:mt-5">
        {qrSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrSrc} alt="UPI payment QR code" width={200} height={200} className="h-[200px] w-[200px]" />
        ) : (
          <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-plum/5" />
        )}
      </div>

      <div className="mx-auto mt-5 flex max-w-xs items-center justify-between gap-3 rounded-full border border-plum/15 bg-cream/40 px-4 py-2.5">
        <span className="truncate text-sm font-semibold text-plum">{UPI_ID}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-rose-dark"
        >
          {copied ? (
            <>
              <FiCheck /> Copied
            </>
          ) : (
            <>
              <FiCopy /> Copy
            </>
          )}
        </button>
      </div>

      <p className="mx-auto mt-4 max-w-sm text-xs text-ink/45">
        Open any UPI app (GPay, PhonePe, Paytm...), scan the code or pay to the ID above, then confirm below.
      </p>

      <button
        type="button"
        onClick={onPaid}
        className="mt-6 w-full rounded-full bg-rose px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
      >
        I&apos;ve Paid
      </button>
    </div>
  );
}
