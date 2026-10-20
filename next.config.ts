import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Product photos are served by the FunkyKidz ERP Backend (ERP_API_URL): its image route redirects
// to a short-lived signed Cloudflare R2 URL, which next/image follows. Only that path is allowed.
const erp = new URL(process.env.ERP_API_URL?.trim() || "http://localhost:4000");
const erpIsLocal = ["localhost", "127.0.0.1", "[::1]"].includes(erp.hostname);

export default function nextConfig(phase: string): NextConfig {
  return {
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
      // Local development only: the ERP Backend may run on this machine, and NAT64 networks
      // (64:ff9b::/96, e.g. mobile hotspots) make public hosts like R2 look like private IPs.
      dangerouslyAllowLocalIP: erpIsLocal || phase === PHASE_DEVELOPMENT_SERVER,
    },
  };
}
