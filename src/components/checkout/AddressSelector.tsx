"use client";

import { useState } from "react";
import { FiHome, FiBriefcase, FiMapPin, FiPlus, FiCheck } from "react-icons/fi";
import { useAddresses } from "@/context/AddressContext";
import { addressLabelText, formatAddress, type Address } from "@/lib/addresses";
import type { User } from "@/lib/auth";
import AddressForm from "@/components/profile/AddressForm";

const LABEL_ICON: Record<Address["label"], typeof FiHome> = {
  Home: FiHome,
  Office: FiBriefcase,
  Other: FiMapPin,
};

export default function AddressSelector({
  user,
  selectedId,
  onSelect,
}: {
  user: User;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { addressesForUser } = useAddresses();
  const addresses = addressesForUser(user.id);
  const [adding, setAdding] = useState(false);

  if (adding) {
    return (
      <AddressForm
        userId={user.id}
        fallbackName={user.name}
        fallbackPhone={user.phone}
        onSaved={(address) => {
          setAdding(false);
          onSelect(address.id);
        }}
        onCancel={() => setAdding(false)}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif-display text-xl font-bold text-plum">Deliver To</h3>
        {addresses.length > 0 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-rose-dark hover:underline"
          >
            <FiPlus /> Add New Address
          </button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-plum/15 bg-cream/40 p-10 text-center">
          <FiMapPin className="mx-auto text-3xl text-rose-dark" />
          <p className="mt-3 text-sm text-ink/60">Add a delivery address to continue.</p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02]"
          >
            <FiPlus /> Add Address
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const Icon = LABEL_ICON[address.label];
            const selected = address.id === selectedId;
            return (
              <button
                type="button"
                key={address.id}
                onClick={() => onSelect(address.id)}
                className={`relative rounded-2xl border p-4 text-left transition-colors ${
                  selected ? "border-rose-dark bg-rose-light/30" : "border-plum/15 hover:border-rose-dark/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-light/50 text-rose-dark">
                    <Icon />
                  </span>
                  <span className="text-sm font-bold text-plum">{addressLabelText(address)}</span>
                  {selected && <FiCheck className="ml-auto text-rose-dark" />}
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">{address.recipientName}</p>
                <p className="text-xs text-ink/60">{address.phone}</p>
                <p className="mt-1 text-xs text-ink/60">{formatAddress(address)}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
