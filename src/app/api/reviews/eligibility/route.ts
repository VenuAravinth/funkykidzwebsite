import type { NextRequest } from "next/server";
import { currentUser } from "@/server/customerAuth";
import { reviewEligibility } from "@/server/reviews";
import { json } from "@/server/adminAuth";

// Can the signed-in customer review this product? "login" when signed out.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("product") ?? "";
  const user = await currentUser();
  if (!user) return json({ status: "login" });
  return json({ status: slug ? await reviewEligibility(user, slug) : "not-purchased" });
}
