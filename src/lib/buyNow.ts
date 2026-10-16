"use client";

import { useSyncExternalStore } from "react";
import { createStore } from "./createStore";

export type BuyNowItem = {
  slug: string;
  colorwayName: string;
  size: string;
  quantity: number;
};

const buyNowStore = createStore<BuyNowItem | null>("funkykidz:buynow:v1", null);

export function useBuyNowItem() {
  const buyNowItem = useSyncExternalStore(
    buyNowStore.subscribe,
    buyNowStore.getSnapshot,
    buyNowStore.getServerSnapshot
  );

  return {
    buyNowItem,
    setBuyNowItem: (item: BuyNowItem) => buyNowStore.setState(() => item),
    clearBuyNowItem: () => buyNowStore.setState(() => null),
  };
}
