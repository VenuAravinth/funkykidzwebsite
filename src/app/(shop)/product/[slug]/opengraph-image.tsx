import { ImageResponse } from "next/og";
import { getProduct } from "@/server/catalog";
import { formatPrice } from "@/lib/format";

export const alt = "FunkyKidz product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const name = product?.name ?? "FunkyKidz";
  const colorway = product?.colorways[0];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: colorway?.bg ?? "#fdf5f0", color: "#362a45" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, flex: 1 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 5, color: "#d9647c", fontWeight: 700 }}>
            FUNKYKIDZ · {product ? `${product.gender.toUpperCase()} ${product.category.toUpperCase()}` : "KARUR"}
          </div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 800, marginTop: 20, lineHeight: 1.1 }}>{name}</div>
          {product && (
            <div style={{ display: "flex", fontSize: 34, marginTop: 20, color: "#4a3a5c" }}>{product.shortDescription}</div>
          )}
          {product && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 40 }}>
              <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#d9647c" }}>{formatPrice(product.price)}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24, paddingRight: 90 }}>
          {(product?.colorways ?? []).slice(0, 4).map((c) => (
            <div key={c.name} style={{ display: "flex", width: 110, height: 110, borderRadius: 999, background: c.swatchHex, border: "8px solid white" }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
