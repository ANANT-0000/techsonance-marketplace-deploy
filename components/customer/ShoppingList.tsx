"use client";
import { useReducer, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { ChevronDown, Loader2, PackageSearch } from "lucide-react";

import { ProductCard } from "./ProductCard";
import { useStoreFrontCmsData } from "@/hooks/useStoreFrontCmsData";
import { Pagination } from "../common/Pagination";
import { FilterSidebar, FilterState } from "./FilterSidebar";
import { ProductSkeleton } from "../common/ProductSkeleton";
import { SearchBar } from "./SearchBar";
import { Product, Category } from "@/utils/Types";
import { ShoppingPageSkeleton } from "./ShoppingPageSkeleton";

import {
  fetchProducts,
  fetchCategories,
  SortBy,
} from "@/utils/commonAPiClient";
import { SHOPPING_LIST_TEXT } from "@/constants/customerText";
import toast from "react-hot-toast";
import { ShoppingListConfig } from "@/constants";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: SHOPPING_LIST_TEXT.SORT_NEWEST, value: "newest" },
  { label: SHOPPING_LIST_TEXT.SORT_PRICE_ASC, value: "price_asc" },
  { label: SHOPPING_LIST_TEXT.SORT_PRICE_DESC, value: "price_desc" },
  { label: SHOPPING_LIST_TEXT.SORT_POPULAR, value: "discount" },
];

const DEFAULT_FILTERS: FilterState = {
  minPrice: ShoppingListConfig.DEFAULT_MIN_PRICE,
  maxPrice: ShoppingListConfig.DEFAULT_MAX_PRICE,
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
  pageIsLoading: boolean;
}

enum ActionType {
  SET_PRODUCTS_DATA = "SET_PRODUCTS_DATA",
  SET_LOADING = "SET_LOADING",
  SET_SORT_OPEN = "SET_SORT_OPEN",
  SET_PAGE_LOADING = "SET_PAGE_LOADING",
  SET_CATEGORIES = "SET_CATEGORIES",
}

type Action =
  | {
      type: ActionType.SET_PRODUCTS_DATA;
      payload: {
        products: Product[];
        total: number;
        totalPages: number;
      };
    }
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_SORT_OPEN; payload: boolean }
  | { type: ActionType.SET_PAGE_LOADING; payload: boolean }
  | { type: ActionType.SET_CATEGORIES; payload: Category[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_PAGE_LOADING:
      return { ...state, pageIsLoading: action.payload };
    case ActionType.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    case ActionType.SET_PRODUCTS_DATA:
      return {
        ...state,
        products: action.payload.products,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    case ActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionType.SET_SORT_OPEN:
      return { ...state, isSortOpen: action.payload };
    default: {
      const _exhaustiveCheck: never = action;
      return state;
    }
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

import { Suspense } from "react";

function ShoppingListContent({ styles }: ShoppingListProps) {
  useStoreFrontCmsData(); // keeps CMS subscription alive

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Derive all "controlled" state directly from URL ───────────────────────
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const minPrice = Number(
    searchParams.get("min_price") ?? ShoppingListConfig.DEFAULT_MIN_PRICE,
  );
  const maxPrice = Number(
    searchParams.get("max_price") ?? ShoppingListConfig.DEFAULT_MAX_PRICE,
  );
  const sortBy = (searchParams.get("sort_by") as SortBy) ?? "newest";
  const page = Number(searchParams.get("page") ?? 1);

  const filters: FilterState = {
    minPrice,
    maxPrice,
    selectedCategories: category ? [category] : [],
  };

  // ── Local UI-only state ───────────────────────────────────────────────────
  const [state, dispatch] = useReducer(reducer, {
    pageIsLoading: true,
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

  // Fetch categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesList = await fetchCategories();
        dispatch({
          type: ActionType.SET_CATEGORIES,
          payload: categoriesList,
        });
      } catch (e) {
        toast.error(ShoppingListConfig.ERROR_LOAD_CATEGORIES);
      }
    };
    loadCategories();
  }, []);

  // ── Single source-of-truth fetch: fires whenever URL params change ────────
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      try {
        const response = await fetchProducts({
          search: search.replace("...", "") || undefined,
          category: category || undefined,
          min_price:
            minPrice > ShoppingListConfig.DEFAULT_MIN_PRICE
              ? minPrice
              : undefined,
          max_price:
            maxPrice < ShoppingListConfig.DEFAULT_MAX_PRICE
              ? maxPrice
              : undefined,
          sort_by: sortBy,
          offset: (page - 1) * ShoppingListConfig.PAGE_SIZE,
          limit: ShoppingListConfig.PAGE_SIZE,
        });

        if (cancelled) return;

        dispatch({
          type: ActionType.SET_PRODUCTS_DATA,
          payload: {
            products: response.data ?? [],
            total: response.total ?? 0,
            totalPages: response.totalPages ?? 1,
          },
        });
      } catch (e) {
        toast.error(ShoppingListConfig.ERROR_LOAD_PRODUCTS);

        if (!cancelled) {
          dispatch({
            type: ActionType.SET_PRODUCTS_DATA,
            payload: {
              products: [],
              total: 0,
              totalPages: 1,
            },
          });
        }
      } finally {
        if (!cancelled) {
          dispatch({ type: ActionType.SET_LOADING, payload: false });
          dispatch({ type: ActionType.SET_PAGE_LOADING, payload: false });
        }
      }
    };

    loadProducts();
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
    router.push(`${pathname || ""}?${next.toString()}`, { scroll: false });
  };
  const handleSortChange = (value: SortBy) => {
    pushParams({ sort_by: value, page: 1 });
    dispatch({ type: ActionType.SET_SORT_OPEN, payload: false });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    pushParams({
      category: newFilters.selectedCategories[0] ?? null,
      min_price:
        newFilters.minPrice > ShoppingListConfig.DEFAULT_MIN_PRICE
          ? newFilters.minPrice
          : null,
      max_price:
        newFilters.maxPrice < ShoppingListConfig.DEFAULT_MAX_PRICE
          ? newFilters.maxPrice
          : null,
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
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ??
    SHOPPING_LIST_TEXT.SORT_NEWEST;
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
                <p className="text-xxs sm:text-theme-caption md:text-theme-body-sm text-gray-500 mt-1">
                  {SHOPPING_LIST_TEXT.SHOWING} {state.total}{" "}
                  {SHOPPING_LIST_TEXT.ITEMS}
                </p>
              </div>

              {/* Desktop search + sort */}
              <div className="hidden lg:flex w-full items-center justify-between">
                <div className="text-xxs sm:text-theme-caption md:text-theme-body-sm text-gray-500 font-medium">
                  {SHOPPING_LIST_TEXT.SHOWING} {state.total}{" "}
                  {SHOPPING_LIST_TEXT.PRODUCTS}
                </div>
                <div className="flex items-center gap-4">
                  <div ref={sortRef} className="relative">
                    <button
                      onClick={() =>
                        dispatch({
                          type: ActionType.SET_SORT_OPEN,
                          payload: !state.isSortOpen,
                        })
                      }
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-theme-caption sm:text-theme-body-sm font-medium text-gray-700 bg-white hover:border-gray-300 transition-colors"
                    >
                      {SHOPPING_LIST_TEXT.SORT_BY} {currentSortLabel}
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
                              className={`w-full text-left px-4 py-2.5 text-theme-caption sm:text-theme-body-sm ${
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
                  {Array.from({ length: ShoppingListConfig.PAGE_SIZE }).map(
                    (_, i) => (
                      <ProductSkeleton key={i} />
                    ),
                  )}
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
                    <p className="text-theme-body font-medium text-gray-600">
                      {SHOPPING_LIST_TEXT.NO_PRODUCTS_FOUND}
                    </p>
                    {search && (
                      <p className="text-theme-body-sm text-gray-400 mt-1">
                        {SHOPPING_LIST_TEXT.TRY_DIFFERENT_KEYWORD}
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.ul
                  key={`products-${page}-${search}-${sortBy}-${category}`}
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

export function ShoppingList(props: ShoppingListProps) {
  return (
    <Suspense fallback={<ShoppingPageSkeleton />}>
      <ShoppingListContent {...props} />
    </Suspense>
  );
}
