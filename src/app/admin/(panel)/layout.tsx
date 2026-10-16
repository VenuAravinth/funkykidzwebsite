import { requireAdminPage } from "@/server/adminAuth";
import { listOrders } from "@/server/orderStore";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Each page re-checks too; this guard keeps the shell itself from rendering for strangers.
  const { admin } = await requireAdminPage({ allowMustChange: true });
  const pending = (await listOrders()).filter((o) => o.paymentStatus === "Pending Verification" && o.status !== "Cancelled").length;

  return (
    <div className="lg:flex">
      <AdminNav username={admin.username} pendingCount={pending} />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</div>
    </div>
  );
}
