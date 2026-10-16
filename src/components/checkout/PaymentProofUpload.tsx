"use client";

import { useRef, useState } from "react";
import { FiUpload, FiImage } from "react-icons/fi";

export default function PaymentProofUpload({
  onSubmit,
  submitting = false,
  submitError,
}: {
  onSubmit: (dataUrl: string) => void;
  submitting?: boolean;
  submitError?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [processing, setProcessing] = useState(false);

  // Phone screenshots are often 2–5 MB PNGs (or HEIC on iPhone). Re-encode to a JPEG no
  // larger than 2000px on the long side: still readable for verification, ~200–400 KB to upload.
  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
      setError("Please choose an image of your payment screenshot.");
      return;
    }
    setError("");
    setProcessing(true);
    try {
      setPreview(await compressImage(file));
    } catch {
      setError("We couldn't read that image. Please take a normal screenshot (PNG or JPG) and try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-8">
      <h3 className="font-serif-display text-xl font-bold text-plum">Upload Payment Screenshot</h3>
      <p className="mt-1 text-sm text-ink/50">
        Upload a screenshot of your UPI transaction so we can verify and confirm your order.
      </p>

      <div className="mt-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
        {preview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative mx-auto block h-56 w-full max-w-xs overflow-hidden rounded-xl border border-plum/15"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Payment proof preview" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-plum/70 py-1.5 text-xs font-semibold text-white">
              Tap to change
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mx-auto flex h-40 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-plum/20 text-ink/50 transition-colors hover:border-rose-dark hover:text-rose-dark"
          >
            <FiImage className="text-2xl" />
            <span className="text-sm font-semibold">{processing ? "Preparing image…" : "Tap to upload screenshot"}</span>
            <span className="text-xs text-ink/40">From your gallery or photos</span>
          </button>
        )}
      </div>

      {(error || submitError) && (
        <p className="mt-3 text-center text-sm font-medium text-rose-dark">{error || submitError}</p>
      )}

      <button
        type="button"
        disabled={!preview || submitting || processing}
        onClick={() => preview && !submitting && onSubmit(preview)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        <FiUpload /> {submitting ? "Placing order…" : "Submit Order"}
      </button>
    </div>
  );
}

const MAX_SIDE = 2000;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error("no canvas"));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}
