import type { NextRequest } from "next/server";
import { guardMutation, logout } from "@/server/customerAuth";

export async function POST(req: NextRequest) {
  return guardMutation(req) ?? logout();
}
