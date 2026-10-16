import type { NextRequest } from "next/server";
import { json, requireAdminApi } from "@/server/adminAuth";
import { getAnalytics } from "@/server/analytics";

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi(req);
  if ("error" in guard) return guard.error;
  return json(await getAnalytics());
}
