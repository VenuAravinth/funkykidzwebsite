import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "FunkyKidz — Korean style kids dresses, Karur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fbe2e6 0%, #fdf5f0 55%, #f8e9e6 100%)",
          color: "#362a45",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#d9647c", fontWeight: 700 }}>
          KOREAN KIDS FASHION · KARUR
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, marginTop: 24 }}>{SITE.name}</div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 16, maxWidth: 900, color: "#4a3a5c" }}>
          Fashionable kids dresses, hanbok sets &amp; party wear — in store at Jawahar Bazaar and online across India.
        </div>
        <div style={{ display: "flex", marginTop: 48, gap: 16 }}>
          {["Shop Online", "Free Shipping ₹1,999+", "7-Day Returns"].map((t) => (
            <div
              key={t}
              style={{ display: "flex", padding: "12px 28px", borderRadius: 999, background: "#d9647c", color: "white", fontSize: 26 }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
