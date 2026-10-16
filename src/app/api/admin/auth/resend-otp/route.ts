import type { NextRequest } from "next/server";
import { resendOtp, json, sameOrigin } from "@/server/adminAuth";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  return resendOtp(req);
}
