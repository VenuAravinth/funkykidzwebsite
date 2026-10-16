import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { json } from "@/server/adminAuth";

// Called by the FunkyKidz ERP backend after a product is created, edited, published, unpublished
// or deleted, so the shop stops serving its cached catalogue straight away.
// Header: x-revalidate-secret: <REVALIDATE_SECRET>

const ALLOWED_TAGS = new Set(["products"]);
const digest = (s: string) => createHash("sha256").update(s).digest();

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  const given = req.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !timingSafeEqual(digest(given), digest(secret))) return json({ error: "Unauthorized" }, 401);

  const body = (await req.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED_TAGS.has(t)) : ["products"];
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return json({ revalidated: tags });
}
