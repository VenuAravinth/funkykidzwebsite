import type { NextRequest } from "next/server";
import { changeCredentials } from "@/server/adminAuth";

export async function POST(req: NextRequest) {
  return changeCredentials(req);
}
