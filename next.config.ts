import type { NextConfig } from "next";

// Product photos are served by the FunkyKidz ERP Backend (ERP_API_URL): its image route redirects
// to a short-lived signed Cloudflare R2 URL, which next/image follows. Only that path is allowed.
const erp = new URL(process.env.ERP_API_URL?.trim() || "http://localhost:4000");
const erpIsLocal = ["localhost", "127.0.0.1", "[::1]"].includes(erp.hostname);

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF where supported (smallest), WebP otherwise. Source PNGs are 2 MB+, so this
    // is the biggest single win for mobile load time.
    formats: ["image/avif", "image/webp"],
    // Product and banner images rarely change; keep optimised copies for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: erp.protocol.replace(":", "") as "http" | "https",
        hostname: erp.hostname,
        port: erp.port,
        pathname: "/api/v1/public/product-images/**",
      },
    ],
    // Only during local development, when the ERP Backend runs on this machine.
    dangerouslyAllowLocalIP: erpIsLocal,
  },
};

export default nextConfig;
