import type { NextRequest } from "next/server";
import { guardMutation, requireUser } from "@/server/customerAuth";
import { uploadReviewMedia } from "@/server/reviews";
import { json } from "@/server/adminAuth";

// One review photo or video per request: the raw file is the body, its type in Content-Type.
// Excluded from the proxy (see src/proxy.ts) so videos aren't capped by its 10 MB body buffer.
export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const result = await uploadReviewMedia(auth.user, req.body, (req.headers.get("content-type") ?? "").split(";")[0].trim());
  return result.ok ? json({ media: result.media }, 201) : json({ error: result.error }, result.status);
}
