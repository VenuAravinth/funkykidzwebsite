"use client";

import { useState } from "react";
import LoginPrompt from "@/components/auth/LoginPrompt";
import { FiUser, FiPackage, FiMapPin, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import ProfileInfoForm from "./ProfileInfoForm";
import Avatar from "./Avatar";
import { formatPhone } from "@/lib/auth";
import OrderHistoryList from "./OrderHistoryList";
import AddressList from "./AddressList";

const TABS = [
  { id: "info", label: "Profile Info", icon: FiUser },
  { id: "orders", label: "Order History", icon: FiPackage },
  { id: "addresses", label: "Addresses", icon: FiMapPin },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProfileTabs() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [tab, setTab] = useState<TabId>("info");

  if (!isAuthenticated || !currentUser) {
    return (
      <LoginPrompt
        icon={FiUser}
        title="Log in to view your account"
        text="Sign in to see your profile, order history and saved delivery addresses."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar user={currentUser} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-plum">{currentUser.name}</p>
            <p className="truncate text-xs text-ink/50">{formatPhone(currentUser.phone)}</p>
          </div>
        </div>

        <nav className="mt-6 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:flex lg:flex-col">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                tab === id ? "bg-rose-light/50 text-rose-dark" : "text-ink/60 hover:bg-cream/60"
              }`}
            >
              <Icon /> {label}
            </button>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-ink/60 lg:mt-2 transition-colors hover:bg-cream/60 hover:text-rose-dark"
          >
            <FiLogOut /> Log Out
          </button>
        </nav>
      </aside>

      <div>
        {tab === "info" && (
          <ProfileInfoForm user={currentUser} />
        )}
        {tab === "orders" && <OrderHistoryList user={currentUser} />}
        {tab === "addresses" && <AddressList user={currentUser} />}
      </div>
    </div>
  );
}
