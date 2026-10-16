import type { NextRequest } from "next/server";
import { loginWithPassword, json, sameOrigin } from "@/server/adminAuth";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  return loginWithPassword(req);
}
