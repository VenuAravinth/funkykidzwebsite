// How many products sit in a row on wide screens. Narrower screens scale each option down
// (see `columns`) so cards never get cramped, while keeping the relative size the shopper chose.
export type GridLayout = 3 | 4 | 6;
export type CardDensity = "large" | "default" | "compact";

export const DEFAULT_GRID_LAYOUT: GridLayout = 4;

// The shop shows this many products at first and adds this many more on each scroll.
export const BATCH_SIZE = 30;

type LayoutOption = {
  value: GridLayout;
  density: CardDensity;
  gridClass: string;
  // Columns actually shown per breakpoint, so the switch can label itself honestly.
  columns: { base: number; sm: number; md: number; lg: number; xl: number };
  imageSizes: string;
};

// The products use the full page width (filters are in a drawer), so every option gets
// roomier cards than before; narrow screens still step down so cards never get cramped.
export const GRID_LAYOUTS: LayoutOption[] = [
  {
    value: 3,
    density: "large",
    gridClass: "grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-8 xl:gap-x-10",
    columns: { base: 1, sm: 2, md: 2, lg: 2, xl: 3 },
    imageSizes: "(min-width: 1280px) 400px, (min-width: 480px) 48vw, 100vw",
  },
  {
    value: 4,
    density: "default",
    gridClass: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-9 sm:gap-x-6 xl:gap-x-8",
    columns: { base: 2, sm: 2, md: 3, lg: 3, xl: 4 },
    imageSizes: "(min-width: 1280px) 310px, (min-width: 768px) 32vw, 50vw",
  },
  {
    value: 6,
    density: "compact",
    gridClass: "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-6 sm:gap-x-4",
    columns: { base: 3, sm: 3, md: 4, lg: 5, xl: 6 },
    imageSizes: "(min-width: 1280px) 200px, (min-width: 768px) 24vw, 33vw",
  },
];

export function gridLayoutOption(value: GridLayout): LayoutOption {
  return GRID_LAYOUTS.find((o) => o.value === value) ?? GRID_LAYOUTS[1];
}
