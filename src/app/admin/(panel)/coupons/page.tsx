import type { Metadata } from "next";
import { requireAdminPage } from "@/server/adminAuth";
import { listCoupons } from "@/server/coupons";
import CouponManager from "@/components/admin/CouponManager";

export const metadata: Metadata = { title: "Redeem codes" };

export default async function CouponsPage() {
  await requireAdminPage();
  const coupons = await listCoupons();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-serif-display text-3xl font-bold text-plum">Redeem codes</h1>
      <p className="mt-1 text-sm text-ink/55">
        Create codes to give to customers. Codes are never shown on the website; customers type them in at checkout.
      </p>
      <CouponManager initialCoupons={coupons} />
    </div>
  );
}
