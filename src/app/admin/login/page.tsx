import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/adminAuth";
import AdminLoginFlow from "@/components/admin/AdminLoginFlow";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin/dashboard");
  return <AdminLoginFlow />;
}
