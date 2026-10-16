"use client";

import { useState } from "react";
import { FiHome, FiBriefcase, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiCheckCircle } from "react-icons/fi";
import { useAddresses } from "@/context/AddressContext";
import { addressLabelText, formatAddress, type Address } from "@/lib/addresses";
import type { User } from "@/lib/auth";
import AddressForm from "./AddressForm";

const LABEL_ICON: Record<Address["label"], typeof FiHome> = {
  Home: FiHome,
  Office: FiBriefcase,
  Other: FiMapPin,
};

export default function AddressList({ user }: { user: User }) {
  const { addressesForUser, removeAddress, setDefaultAddress } = useAddresses();
  const addresses = addressesForUser(user.id);
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  if (editing) {
    return (
      <AddressForm
        userId={user.id}
        fallbackName={user.name}
        fallbackPhone={user.phone}
        existing={editing === "new" ? undefined : editing}
        onSaved={() => setEditing(null)}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif-display text-xl font-bold text-plum">Delivery Addresses</h3>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-105"
        >
          <FiPlus /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-plum/15 bg-cream/40 p-10 text-center">
          <FiMapPin className="mx-auto text-3xl text-rose-dark" />
          <p className="mt-3 text-sm text-ink/60">
            You haven&apos;t saved any delivery addresses yet. Pin one on the map to get started.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => {
            const Icon = LABEL_ICON[address.label];
            return (
              <div
                key={address.id}
                className="relative rounded-2xl border border-rose-light/60 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-light/50 text-rose-dark">
                    <Icon />
                  </span>
                  <span className="text-sm font-bold text-plum">{addressLabelText(address)}</span>
                  {address.isDefault && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                      <FiCheckCircle /> Default
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold text-ink">{address.recipientName}</p>
                <p className="text-sm text-ink/60">{address.phone}</p>
                <p className="mt-1 text-sm text-ink/60">{formatAddress(address)}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-rose-light/60 pt-4 text-sm font-semibold">
                  <button
                    onClick={() => setEditing(address)}
                    className="flex items-center gap-1.5 text-ink/60 hover:text-rose-dark"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => removeAddress(address.id)}
                    className="flex items-center gap-1.5 text-ink/60 hover:text-rose-dark"
                  >
                    <FiTrash2 /> Remove
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(user.id, address.id)}
                      className="ml-auto text-rose-dark hover:underline"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
