"use client";
import { useReducer, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { ChevronDown, PackageSearch } from "lucide-react";

import { ProductCard } from "./ProductCard";
import { useStoreFrontCmsData } from "@/hooks/useStoreFrontCmsData";
import { Pagination } from "../common/Pagination";
import { FilterSidebar, FilterState } from "./FilterSidebar";
import { ProductSkeleton } from "../common/ProductSkeleton";
import { SearchBar } from "./SearchBar";
import { Product, Category } from "@/utils/Types";

import { fetchProductVendorProducts, SortBy } from "@/utils/commonAPiClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "discount" },
];

const DEFAULT_FILTERS: FilterState = {
  minPrice: 0,
  maxPrice: 50000,
  selectedCategories: [],
};

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  totalPages: number;
  total: number;
  isSortOpen: boolean;
}

enum ActionType {
  SET_PRODUCTS_DATA = "SET_PRODUCTS_DATA",
  SET_LOADING = "SET_LOADING",
  SET_SORT_OPEN = "SET_SORT_OPEN",
}

type Action =
  | {
      type: ActionType.SET_PRODUCTS_DATA;
      payload: {
        products: Product[];
        total: number;
        totalPages: number;
        categories: Category[];
      };
    }
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_SORT_OPEN; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_PRODUCTS_DATA:
      return {
        ...state,
        products: action.payload.products,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        categories: action.payload.categories,
      };
    case ActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionType.SET_SORT_OPEN:
      return { ...state, isSortOpen: action.payload };
    default:
      return state;
  }
}

// ─── URL helpers ──────────────────────────────────────────────────────────────
// These build a new URLSearchParams from the current ones plus a delta,
// so callers only need to pass what changed.

function buildParams(
  current: URLSearchParams,
  delta: Record<string, string | number | undefined | null>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  Object.entries(delta).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") {
      next.delete(k);
    } else {
      next.set(k, String(v));
    }
  });
  return next;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ShoppingListProps {
  styles?: string;
}

export function ShoppingList({ styles }: ShoppingListProps) {
  useStoreFrontCmsData(); // keeps CMS subscription alive

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Derive all "controlled" state directly from URL ───────────────────────
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("category_id") ?? "";
  const minPrice = Number(searchParams.get("min_price") ?? 0);
  const maxPrice = Number(searchParams.get("max_price") ?? 50000);
  const sortBy = (searchParams.get("sort_by") as SortBy) ?? "newest";
  const page = Number(searchParams.get("page") ?? 1);

  const filters: FilterState = {
    minPrice,
    maxPrice,
    selectedCategories: categoryId ? [categoryId] : [],
  };

  // ── Local UI-only state ───────────────────────────────────────────────────
  const [state, dispatch] = useReducer(reducer, {
    products: [],
    categories: [],
    isLoading: true,
    totalPages: 1,
    total: 0,
    isSortOpen: false,
  });

  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        dispatch({ type: ActionType.SET_SORT_OPEN, payload: false });
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Single source-of-truth fetch: fires whenever URL params change ────────
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      try {
        const response = await fetchProductVendorProducts({
          search: search.replace("...", "") || undefined,
          category_id: categoryId || undefined,
          min_price: minPrice > 0 ? minPrice : undefined,
          max_price: maxPrice < 50000 ? maxPrice : undefined,
          sort_by: sortBy,
          offset: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        });

        if (cancelled) return;

        // Accumulate categories seen across pages for the sidebar
        const seen = new Map<string, Category>();
        (response.data ?? []).forEach((p: Product) => {
          if (p.category && !seen.has(p.category.id))
            seen.set(p.category.id, p.category);
        });
        const merged = new Map<string, Category>(
          state.categories.map((c) => [c.id, c]),
        );
        seen.forEach((v, k) => merged.set(k, v));

        dispatch({
          type: ActionType.SET_PRODUCTS_DATA,
          payload: {
            products: response.data ?? [],
            total: response.total ?? 0,
            totalPages: response.totalPages ?? 1,
            categories: Array.from(merged.values()),
          },
        });
      } catch (e) {
        console.error("Failed to fetch products", e);
        if (!cancelled) {
          dispatch({
            type: ActionType.SET_PRODUCTS_DATA,
            payload: {
              products: [],
              total: 0,
              totalPages: 1,
              categories: state.categories,
            },
          });
        }
      } finally {
        if (!cancelled)
          dispatch({ type: ActionType.SET_LOADING, payload: false });
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
    // searchParams.toString() as the dep: re-runs whenever ANY param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // ── URL-updating handlers ─────────────────────────────────────────────────

  const pushParams = (
    delta: Record<string, string | number | undefined | null>,
  ) => {
    const next = buildParams(searchParams, delta);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const handleSearch = (value: string) => {
    pushParams({ search: value || null, page: 1 });
  };

  const handleSortChange = (value: SortBy) => {
    pushParams({ sort_by: value, page: 1 });
    dispatch({ type: ActionType.SET_SORT_OPEN, payload: false });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    pushParams({
      category_id: newFilters.selectedCategories[0] ?? null,
      min_price: newFilters.minPrice > 0 ? newFilters.minPrice : null,
      max_price: newFilters.maxPrice < 50000 ? newFilters.maxPrice : null,
      page: 1,
    });
  };

  const handlePageChange = (p: number) => {
    pushParams({ page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Adapter so Pagination's (count, setCount) API works with URL state
  const setPageAdapter = (p: number | ((prev: number) => number)) => {
    handlePageChange(typeof p === "function" ? p(page) : p);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Newest";

  return (
    <motion.section
      className={`w-full ${styles ?? ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <LayoutGroup>
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <FilterSidebar
            categories={state.categories}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            totalResults={state.total}
          />

          <motion.div layout="position" className="flex-1 min-w-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              {/* Mobile count */}
              <div className="lg:hidden w-full flex justify-between items-center">
                <p className="text-sm text-gray-500 mt-1">
                  Showing {state.total} items
                </p>
              </div>

              {/* Desktop search + sort */}
              <div className="hidden lg:flex w-full items-center justify-between">
                <div className="text-sm text-gray-500 font-medium">
                  Showing {state.total} products
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-72">
                    <SearchBar
                      value={search}
                      onChange={(val) =>
                        pushParams({ search: val || null, page: 1 })
                      }
                      onSearch={handleSearch}
                      placeholder="Search brands, styles..."
                    />
                  </div>
                  <div ref={sortRef} className="relative">
                    <button
                      onClick={() =>
                        dispatch({
                          type: ActionType.SET_SORT_OPEN,
                          payload: !state.isSortOpen,
                        })
                      }
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white hover:border-gray-300 transition-colors"
                    >
                      Sort by: {currentSortLabel}
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${state.isSortOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {state.isSortOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSortChange(opt.value)}
                              className={`w-full text-left px-4 py-2.5 text-sm ${
                                sortBy === opt.value
                                  ? "bg-gray-50 font-semibold text-black"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
              {state.isLoading ? (
                <motion.ul
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                >
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </motion.ul>
              ) : state.products.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4"
                >
                  <PackageSearch
                    size={48}
                    strokeWidth={1}
                    className="opacity-40"
                  />
                  <div className="text-center">
                    <p className="text-base font-medium text-gray-600">
                      No products found
                    </p>
                    {search && (
                      <p className="text-sm text-gray-400 mt-1">
                        Try a different keyword or clear the filter
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.ul
                  key={`products-${page}-${search}-${sortBy}-${categoryId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                >
                  {state.products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} idx={idx} />
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {!state.isLoading && state.totalPages > 1 && (
              <Pagination
                count={page}
                setCount={setPageAdapter}
                totalPages={state.totalPages}
                onPageChange={() => {}}
              />
            )}
          </motion.div>
        </div>
      </LayoutGroup>
    </motion.section>
  );
}
