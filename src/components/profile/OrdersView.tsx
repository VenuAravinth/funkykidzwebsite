"use client";

import { FiPackage } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import LoginPrompt from "@/components/auth/LoginPrompt";
import OrderHistoryList from "./OrderHistoryList";

export default function OrdersView() {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <LoginPrompt icon={FiPackage} title="Log in to see your orders" text="Track every order and its delivery status in one place." />;
  }
  return (
    <div className="mx-auto max-w-3xl">
      <OrderHistoryList user={currentUser} />
    </div>
  );
}
