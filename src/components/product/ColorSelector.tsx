"use client";

import { productStock, type Product } from "@/lib/products";

type Props = {
  product: Product;
  selected: string;
  onSelect: (color: string) => void;
};

export default function ColorSelector({ product, selected, onSelect }: Props) {
  if (product.colorways.length < 2) {
    return (
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
        Colour: <span className="text-plum">{selected}</span>
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
        Colour: <span className="text-plum">{selected}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
        {product.colorways.map((c) => {
          const out = productStock(product, c.name).status === "out";
          const active = c.name === selected;
          return (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={out ? `${c.name}, sold out` : c.name}
              onClick={() => onSelect(c.name)}
              className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-colors ${
                active ? "border-plum bg-plum text-white" : "border-plum/20 text-plum hover:bg-rose-light"
              } ${out ? "opacity-50" : ""}`}
            >
              <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: c.swatchHex }} aria-hidden />
              <span className={out ? "line-through" : ""}>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
