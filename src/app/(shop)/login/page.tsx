import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import LoginForm from "@/components/auth/LoginForm";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to FunkyKidz with your mobile number and a one-time code.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <>
      <PageHeader title="Login" breadcrumb={[{ label: "Home", href: "/" }, { label: "Login" }]} />
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 lg:grid-cols-2">
          <Reveal>
            <LoginForm />
          </Reveal>
          <Reveal delay={0.1}>
            <AuthSidePanel
              eyebrow="Funky Family"
              title="One number, no passwords"
              description="Log in with your mobile number to track orders, save favourites and breeze through checkout. First time? Your account is created automatically."
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
