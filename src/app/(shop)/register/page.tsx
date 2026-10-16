import { redirect } from "next/navigation";

// Sign-up and login are the same mobile-number + OTP flow now; keep old links working.
export default function RegisterPage() {
  redirect("/login");
}
