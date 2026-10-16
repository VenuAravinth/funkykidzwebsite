import type { NextRequest } from "next/server";
import { guardMutation, sendOtp } from "@/server/customerAuth";
import { readBody } from "@/server/http";

export async function POST(req: NextRequest) {
  return guardMutation(req) ?? sendOtp(req, await readBody(req));
}
