import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { json, requireAdminApi } from "@/server/adminAuth";
import { getOrder, readProof } from "@/server/orderStore";

// Payment screenshots are private files served only to a signed-in admin.
export async function GET(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const guard = await requireAdminApi(req);
  if ("error" in guard) return guard.error;
  const order = await getOrder((await params).orderNumber);
  const proof = order ? await readProof(order) : null;
  if (!proof) return json({ error: "Not found" }, 404);
  return new NextResponse(new Uint8Array(proof.data), {
    headers: {
      "Content-Type": proof.type,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
