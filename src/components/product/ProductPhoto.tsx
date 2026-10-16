"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { FiImage } from "react-icons/fi";

// A product photo uploaded from the ERP admin. When the product has no photo, or the photo fails
// to load, a plain neutral tile takes its place — never a stand-in picture of another product.
export default function ProductPhoto({
  src,
  alt,
  label = true,
  ...rest
}: Omit<ImageProps, "src"> & { src?: string; label?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);

  if (!src || failed === src) {
    return (
      <span
        role="img"
        aria-label={alt ? `${alt} (photo unavailable)` : "Photo unavailable"}
        className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-blush/70 text-ink/30"
      >
        <FiImage className="text-2xl" aria-hidden />
        {label && <span className="text-[11px] font-semibold uppercase tracking-wide">Photo coming soon</span>}
      </span>
    );
  }

  return <Image src={src} alt={alt} onError={() => setFailed(src)} {...rest} />;
}
