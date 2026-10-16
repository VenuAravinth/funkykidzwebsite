"use client";

import type { IconType } from "react-icons";
import { useLoginModal } from "@/context/LoginModalContext";

// Shown in place of user-only content (cart, wishlist, checkout) for signed-out shoppers.
export default function LoginPrompt({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) {
  const { openLogin } = useLoginModal();
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-plum/15 bg-white p-8 text-center sm:p-10">
      <Icon className="mx-auto text-3xl text-rose-dark" />
      <h3 className="mt-4 font-serif-display text-xl font-bold text-plum">{title}</h3>
      <p className="mt-2 text-sm text-ink/60">{text}</p>
      <button
        type="button"
        onClick={() => openLogin()}
        className="mt-6 rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30"
      >
        Log in with mobile number
      </button>
    </div>
  );
}
