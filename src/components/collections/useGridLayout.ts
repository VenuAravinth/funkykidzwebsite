import { useSyncExternalStore } from "react";
import { createStore } from "@/lib/createStore";
import { DEFAULT_GRID_LAYOUT, GRID_LAYOUTS, type GridLayout } from "./gridLayout";

// Remembered per browser so the shopper's choice survives page loads.
const store = createStore<GridLayout>("fk-grid-layout", DEFAULT_GRID_LAYOUT);

export function useGridLayout(): [GridLayout, (value: GridLayout) => void] {
  const stored = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  // Guard against stale or hand-edited storage values.
  const layout = GRID_LAYOUTS.some((o) => o.value === stored) ? stored : DEFAULT_GRID_LAYOUT;
  return [layout, (value) => store.setState(() => value)];
}
