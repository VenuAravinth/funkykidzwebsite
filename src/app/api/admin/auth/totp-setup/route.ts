import type { NextRequest } from "next/server";
import { startTotpSetup } from "@/server/adminAuth";

export async function GET(req: NextRequest) {
  return startTotpSetup(req);
}
