import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your FunkyKidz profile, order history, and delivery addresses.",
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="My Account" breadcrumb={[{ label: "Home", href: "/" }, { label: "Account" }]} />
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
        <ProfileTabs />
      </section>
    </>
  );
}
