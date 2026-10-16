import type { NextRequest } from "next/server";
import { clientIp, json, sameOrigin } from "@/server/adminAuth";
import { rateLimit } from "@/server/rateLimit";
import { visualSearch } from "@/server/visualSearch";
import { readBody } from "@/server/http";

// Visual search: the browser sends a downscaled JPEG (data URL); we return matching products.
// The image is analysed in memory and never stored.
export const maxDuration = 60; // the first request after a restart loads the model

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const limit = rateLimit(`visual:${clientIp(req.headers)}`, 30, 10 * 60_000);
  if (!limit.ok) return json({ error: "Too many image searches. Please wait a few minutes." }, 429);

  const body = await readBody(req, MAX_BYTES * 2);
  const dataUrl = typeof body.image === "string" ? body.image : "";
  const match = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return json({ error: "Please choose a photo (JPG, PNG or WEBP)." }, 400);
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length > MAX_BYTES) return json({ error: "That image is too large. Please try a smaller one." }, 413);

  try {
    return json(await visualSearch(bytes));
  } catch (err) {
    console.error("[visual-search]", err);
    return json({ error: "We couldn't analyse that image. Please try another photo." }, 500);
  }
}
