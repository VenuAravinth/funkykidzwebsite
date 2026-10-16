"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Address } from "@/lib/addresses";
import { useAuth } from "./AuthContext";

type AddressInput = Omit<Address, "id" | "userId" | "isDefault">;
type Saved = { ok: true; address: Address } | { ok: false; error: string };

type AddressContextValue = {
  /** The signed-in customer's saved addresses (default first). */
  addressesForUser: (userId: string) => Address[];
  loaded: boolean;
  addAddress: (userId: string, input: AddressInput) => Promise<Saved>;
  updateAddress: (id: string, input: AddressInput) => Promise<Saved>;
  removeAddress: (id: string) => void;
  setDefaultAddress: (userId: string, id: string) => void;
};

const AddressContext = createContext<AddressContextValue | null>(null);

// Delivery addresses are stored per customer in MongoDB.
export function AddressProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? null;
  const [state, setState] = useState<{ userId: string | null; addresses: Address[] }>({ userId: null, addresses: [] });
  const loaded = state.userId === userId && userId !== null;
  const addresses = useMemo(() => (loaded ? state.addresses : []), [loaded, state.addresses]);
  const setAddresses = useCallback(
    (next: (prev: Address[]) => Address[]) => setState((prev) => ({ ...prev, addresses: next(prev.addresses) })),
    []
  );

  const reload = useCallback(async () => {
    const res = await api<{ addresses: Address[] }>("/api/addresses");
    setState((prev) => ({ ...prev, addresses: res.ok ? res.data.addresses : [] }));
  }, []);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    api<{ addresses: Address[] }>("/api/addresses").then((res) => {
      if (alive) setState({ userId, addresses: res.ok ? res.data.addresses : [] });
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  const value = useMemo<AddressContextValue>(
    () => ({
      addressesForUser: () => addresses,
      loaded,
      addAddress: async (_userId, input) => {
        const res = await api<{ address: Address }>("/api/addresses", { body: input });
        if (!res.ok) return { ok: false, error: res.error };
        await reload();
        return { ok: true, address: res.data.address };
      },
      updateAddress: async (id, input) => {
        const res = await api<{ address: Address }>(`/api/addresses/${id}`, { method: "PATCH", body: input });
        if (!res.ok) return { ok: false, error: res.error };
        await reload();
        return { ok: true, address: res.data.address };
      },
      removeAddress: (id) => {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        void api(`/api/addresses/${id}`, { method: "DELETE" }).then(reload);
      },
      setDefaultAddress: (_userId, id) => {
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
        void api(`/api/addresses/${id}/default`, { method: "POST", body: {} }).then(reload);
      },
    }),
    [addresses, loaded, reload, setAddresses]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddresses(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within an AddressProvider");
  return ctx;
}
