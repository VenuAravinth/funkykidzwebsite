import type { NextRequest } from "next/server";
import { guardMutation, verifyOtp } from "@/server/customerAuth";
import { readBody } from "@/server/http";

export async function POST(req: NextRequest) {
  return guardMutation(req) ?? verifyOtp(req, await readBody(req));
}
