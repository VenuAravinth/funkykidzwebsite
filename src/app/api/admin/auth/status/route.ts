import type { NextRequest } from "next/server";
import { loginStatus } from "@/server/adminAuth";

export async function GET(req: NextRequest) {
  return loginStatus(req);
}
