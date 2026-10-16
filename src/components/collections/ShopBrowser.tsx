"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import InfiniteProductGrid from "./InfiniteProductGrid";
import FilterDrawer from "./FilterDrawer";
import { activeFilterCount } from "./FilterPanel";
import CollectionsToolbar from "./CollectionsToolbar";
import SelectedFiltersBar from "./SelectedFiltersBar";
import NoSearchResults from "./NoSearchResults";
import { useProductFilters } from "./useProductFilters";
import { useGridLayout } from "./useGridLayout";

// Products get the full width; filters live in a drawer opened from the toolbar.
export default function ShopBrowser({ products }: { products: Product[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const api = useProductFilters(products);
  const [layout, setLayout] = useGridLayout();

  return (
    <div>
      <CollectionsToolbar
        activeFilters={activeFilterCount(api.filters)}
        sortBy={api.filters.sort}
        onSortChange={(sort) => api.update({ sort })}
        onOpenFilters={() => setDrawerOpen(true)}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <SelectedFiltersBar api={api} />
      {api.filters.q && api.results.length === 0 ? (
        <NoSearchResults
          query={api.filters.q}
          products={products}
          layout={layout}
          hasOtherFilters={activeFilterCount(api.filters) > 0}
          onClearSearch={() => api.update({ q: "" })}
          onClearFilters={() =>
            api.update({ genders: [], categories: [], sizes: [], ages: [], colors: [], price: null, inStock: false, onlyNew: false })
          }
        />
      ) : (
        <InfiniteProductGrid
          key={JSON.stringify(api.filters)}
          products={api.results}
          layout={layout}
          priorityCount={layout === 6 ? 6 : 4}
          emptyMessage="No products match these filters."
        />
      )}
      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} api={api} products={products} />
    </div>
  );
}
