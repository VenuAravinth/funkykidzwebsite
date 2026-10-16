"use client";

import Link from "next/link";
import { sizesFor, sizeStock, type Product } from "@/lib/products";

type Props = {
  product: Product;
  color: string;
  selected: string | null;
  onSelect: (size: string) => void;
};

export default function SizeSelector({ product, color, selected, onSelect }: Props) {
  const selectedStock = selected ? sizeStock(product, color, selected) : null;

  return (
    <div id="size-selector" className="scroll-mt-28">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Size{selected ? <span className="text-plum">: {selected}</span> : null}
        </p>
        <Link href="#size-chart" className="inline-block py-2.5 text-xs font-semibold text-rose-dark underline underline-offset-2">
          Size chart
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizesFor(product, color).map((size) => {
          const stock = sizeStock(product, color, size);
          const out = stock.status === "out";
          return (
            <button
              key={size}
              type="button"
              disabled={out}
              aria-pressed={selected === size}
              aria-label={out ? `${size}, sold out` : size}
              onClick={() => onSelect(size)}
              className={`relative min-w-[3.5rem] rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                out
                  ? "cursor-not-allowed border-ink/10 text-ink/30 line-through"
                  : selected === size
                    ? "border-plum bg-plum text-white"
                    : "border-plum/20 text-plum hover:bg-rose-light"
              }`}
            >
              {size}
              {stock.status === "low" && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-gold" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
      {selectedStock?.status === "low" && selectedStock.units !== undefined && (
        <p className="mt-2 text-xs font-semibold text-rose-dark">Only {selectedStock.units} left in {selected}</p>
      )}
    </div>
  );
}
