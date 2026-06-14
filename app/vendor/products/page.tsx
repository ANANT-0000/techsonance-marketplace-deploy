"use client";

import Link from "next/link";
import { Edit, Plus, Download, Package, Eye, MoveRight } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import {
  fetchVendorProducts,
  fetchVendorsProductsCategory,
} from "@/utils/vendorApiClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteBtn } from "@/components/vendor/DeleteBtn";
import { DynamicIcon } from "lucide-react/dynamic";
import { TableRowSkeleton } from "@/components/common/skeletons";
import { Product } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useReducer } from "react";
import { PRODUCTS_LIST_TEXT } from "@/constants/vendorText";

export const PRODUCT_TABLE_HEAD = [
  PRODUCTS_LIST_TEXT.TABLE_HEADERS.PRODUCT,
  PRODUCTS_LIST_TEXT.TABLE_HEADERS.CATEGORY,
  PRODUCTS_LIST_TEXT.TABLE_HEADERS.VARIANT,
  PRODUCTS_LIST_TEXT.TABLE_HEADERS.SKU,
  PRODUCTS_LIST_TEXT.TABLE_HEADERS.STOCK,
  PRODUCTS_LIST_TEXT.TABLE_HEADERS.PRICE,
  PRODUCTS_LIST_TEXT.TABLE_HEADERS.ACTION,
];

// ─── useReducer Action Types & State ─────────────────────────────────────────
enum ProductsActionType {
  SET_PRODUCT_LIST = "SET_PRODUCT_LIST",
  SET_CATEGORY_OPTIONS = "SET_CATEGORY_OPTIONS",
  SET_SEARCH_TERM = "SET_SEARCH_TERM",
  SET_DEBOUNCED_SEARCH_TERM = "SET_DEBOUNCED_SEARCH_TERM",
  SET_SELECTED_STATUS = "SET_SELECTED_STATUS",
  SET_SELECTED_CATEGORY = "SET_SELECTED_CATEGORY",
  SET_TOTAL_PRODUCTS = "SET_TOTAL_PRODUCTS",
  SET_TOTAL_PAGES = "SET_TOTAL_PAGES",
  SET_CURRENT_PAGE = "SET_CURRENT_PAGE",
  SET_IS_LOADING_PRODUCTS = "SET_IS_LOADING_PRODUCTS",
  SET_IS_LOADING_CATEGORIES = "SET_IS_LOADING_CATEGORIES",
}

interface ProductsState {
  productList: Product[];
  categoryOptions: { value: string; label: string }[];
  searchTerm: string;
  debouncedSearchTerm: string;
  selectedStatus: string | null;
  selectedCategory: string | null;
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  itemsPerPage: number;
}

const initialState: ProductsState = {
  productList: [],
  categoryOptions: [],
  searchTerm: "",
  debouncedSearchTerm: "",
  selectedStatus: null,
  selectedCategory: null,
  totalProducts: 0,
  totalPages: 1,
  currentPage: 1,
  isLoadingProducts: true,
  isLoadingCategories: false,
  itemsPerPage: 10,
};

type ProductsAction =
  | { type: ProductsActionType.SET_PRODUCT_LIST; payload: Product[] }
  | {
      type: ProductsActionType.SET_CATEGORY_OPTIONS;
      payload: { value: string; label: string }[];
    }
  | { type: ProductsActionType.SET_SEARCH_TERM; payload: string }
  | { type: ProductsActionType.SET_DEBOUNCED_SEARCH_TERM; payload: string }
  | { type: ProductsActionType.SET_SELECTED_STATUS; payload: string | null }
  | { type: ProductsActionType.SET_SELECTED_CATEGORY; payload: string | null }
  | { type: ProductsActionType.SET_TOTAL_PRODUCTS; payload: number }
  | { type: ProductsActionType.SET_TOTAL_PAGES; payload: number }
  | { type: ProductsActionType.SET_CURRENT_PAGE; payload: number }
  | { type: ProductsActionType.SET_IS_LOADING_PRODUCTS; payload: boolean }
  | { type: ProductsActionType.SET_IS_LOADING_CATEGORIES; payload: boolean };

function productsReducer(
  state: ProductsState,
  action: ProductsAction,
): ProductsState {
  switch (action.type) {
    case ProductsActionType.SET_PRODUCT_LIST:
      return { ...state, productList: action.payload };
    case ProductsActionType.SET_CATEGORY_OPTIONS:
      return { ...state, categoryOptions: action.payload };
    case ProductsActionType.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    case ProductsActionType.SET_DEBOUNCED_SEARCH_TERM:
      return { ...state, debouncedSearchTerm: action.payload };
    case ProductsActionType.SET_SELECTED_STATUS:
      return { ...state, selectedStatus: action.payload };
    case ProductsActionType.SET_SELECTED_CATEGORY:
      return { ...state, selectedCategory: action.payload };
    case ProductsActionType.SET_TOTAL_PRODUCTS:
      return { ...state, totalProducts: action.payload };
    case ProductsActionType.SET_TOTAL_PAGES:
      return { ...state, totalPages: action.payload };
    case ProductsActionType.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case ProductsActionType.SET_IS_LOADING_PRODUCTS:
      return { ...state, isLoadingProducts: action.payload };
    case ProductsActionType.SET_IS_LOADING_CATEGORIES:
      return { ...state, isLoadingCategories: action.payload };
    default:
      return state;
  }
}

export default function Products() {
  const router = useRouter();
  const token = authToken();

  const [state, dispatch] = useReducer(productsReducer, initialState);
  const {
    productList,
    categoryOptions,
    searchTerm,
    debouncedSearchTerm,
    selectedStatus,
    selectedCategory,
    totalPages,
    currentPage,
    isLoadingProducts,
    itemsPerPage,
  } = state;

  const offset = (currentPage - 1) * itemsPerPage;

  const loadProduct = async () => {
    dispatch({
      type: ProductsActionType.SET_IS_LOADING_PRODUCTS,
      payload: true,
    });
    const response = await fetchVendorProducts(
      offset,
      itemsPerPage,
      selectedStatus,
      debouncedSearchTerm,
      selectedCategory,
      token ?? "",
    );
    if (response.status !== 200) {
      dispatch({ type: ProductsActionType.SET_PRODUCT_LIST, payload: [] });
      dispatch({ type: ProductsActionType.SET_TOTAL_PAGES, payload: 1 });
      dispatch({
        type: ProductsActionType.SET_IS_LOADING_PRODUCTS,
        payload: false,
      });
      return;
    }
    const products = response?.data.data || [];
    dispatch({ type: ProductsActionType.SET_PRODUCT_LIST, payload: products });
    dispatch({
      type: ProductsActionType.SET_TOTAL_PRODUCTS,
      payload: response?.data.total_products || 0,
    });
    dispatch({
      type: ProductsActionType.SET_TOTAL_PAGES,
      payload: Math.ceil((response?.data.total_products || 0) / itemsPerPage),
    });
    dispatch({
      type: ProductsActionType.SET_IS_LOADING_PRODUCTS,
      payload: false,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      if (!token) {
        redirect("/auth/vendorLogin");
      }
    }, 1500);

    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    debouncedSearchTerm,
    selectedStatus,
    selectedCategory,
    currentPage,
  ]);

  useEffect(() => {
    if (!token) return;
    dispatch({
      type: ProductsActionType.SET_IS_LOADING_CATEGORIES,
      payload: true,
    });
    fetchVendorsProductsCategory(token)
      .then((res) => {
        const categories = res?.data || [];
        dispatch({
          type: ProductsActionType.SET_CATEGORY_OPTIONS,
          payload: categories.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
          })),
        });
      })
      .catch(() => {
        dispatch({
          type: ProductsActionType.SET_CATEGORY_OPTIONS,
          payload: [],
        });
      })
      .finally(() => {
        dispatch({
          type: ProductsActionType.SET_IS_LOADING_CATEGORIES,
          payload: false,
        });
      });
  }, [token]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      dispatch({
        type: ProductsActionType.SET_DEBOUNCED_SEARCH_TERM,
        payload: searchTerm,
      });
    }, 500); // Adjust the debounce delay as needed
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <main className="w-full px-2">
      {/* Header */}
      <div className="flex gap-3 my-6 justify-between items-center">
        <div className="flex items-center gap-2">
          <Package size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {PRODUCTS_LIST_TEXT.TITLE}
          </h1>
          {productList.length > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
              {productList.length}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            className="flex items-center gap-2 rounded-xl bg-gray-900 hover:bg-black text-white text-theme-body-sm font-semibold px-4 py-2.5 transition-colors shadow-sm"
            href="products/productForm"
          >
            <Plus size={16} />
            {PRODUCTS_LIST_TEXT.ADD_PRODUCT}
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        {/* Search */}
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
          <DynamicIcon
            name="search"
            size={18}
            className="text-gray-400 shrink-0"
          />

          <input
            type="text"
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder={PRODUCTS_LIST_TEXT.SEARCH_PLACEHOLDER}
            onChange={(e) =>
              dispatch({
                type: ProductsActionType.SET_SEARCH_TERM,
                payload: e.target.value,
              })
            }
          />
        </span>

        {/* Filters */}
        <span className="flex flex-wrap gap-3">
          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            name="status"
            onChange={(e) =>
              dispatch({
                type: ProductsActionType.SET_SELECTED_STATUS,
                payload: e.target.value,
              })
            }
          >
            <option value="all">{PRODUCTS_LIST_TEXT.ALL_STATUS}</option>
            <option value="active">{PRODUCTS_LIST_TEXT.ACTIVE}</option>
            <option value="inactive">{PRODUCTS_LIST_TEXT.INACTIVE}</option>
          </select>

          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            name="category"
            value={selectedCategory ?? ""}
            onChange={(e) =>
              dispatch({
                type: ProductsActionType.SET_SELECTED_CATEGORY,
                payload: e.target.value,
              })
            }
          >
            <option value="">{PRODUCTS_LIST_TEXT.ALL_CATEGORIES}</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </span>
      </div>

      {/* Table — horizontally scrollable */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <Table className="w-full table-auto min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-100 hover:bg-gray-50">
              {PRODUCT_TABLE_HEAD.map((head, index) => (
                <TableHead
                  key={index}
                  className="px-4 py-3 text-theme-caption font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {isLoadingProducts ? (
              <TableRowSkeleton columns={7} rows={5} />
            ) : productList && productList.length > 0 ? (
              productList &&
              Array.isArray(productList) &&
              productList.map((item: Product, index: number) => {
                const firstVariant = item.variants?.[0];
                const stockQty = firstVariant?.inventory?.stock_quantity;
                const isLowStock = stockQty !== undefined && stockQty < 20;
                return (
                  <TableRow
                    key={item.id ?? index}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      router.push(`/vendor/products/${item.id}/productVariants`)
                    }
                  >
                    {/* Product Image + Name */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[220px] max-w-[320px]">
                        <img
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                          src={firstVariant?.images?.[0]?.image_url}
                          alt={item.name}
                        />

                        <span className="text-theme-body-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                          {item.name.trimStart()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-theme-body-sm text-gray-500">
                        {item.category?.name || (
                          <span className="text-gray-300">—</span>
                        )}
                      </span>
                    </TableCell>
                    {/* Variant */}
                    <TableCell className="px-4 py-3">
                      {item.variants && item.variants.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-theme-caption font-semibold text-emerald-700 py-1.5 px-3 rounded-full transition-colors whitespace-nowrap"
                          title="View Variants"
                        >
                          <DynamicIcon name="tag" size={13} />
                          {item.variants.length}{" "}
                          {item.variants.length > 1
                            ? PRODUCTS_LIST_TEXT.VARIANT_PLURAL
                            : PRODUCTS_LIST_TEXT.VARIANT_SINGULAR}
                        </span>
                      ) : (
                        <Link
                          onClick={(e) => e.stopPropagation()}
                          href={`/vendor/products/variantForm/${item.id}`}
                          className="inline-flex items-center gap-1.5 text-theme-caption font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 py-1.5 px-3 rounded-full transition-colors whitespace-nowrap"
                          title="Add Variant"
                        >
                          <Plus size={13} />
                          {PRODUCTS_LIST_TEXT.ADD_VARIANT}
                        </Link>
                      )}
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="px-4 py-3 text-theme-body-sm text-gray-500 font-mono whitespace-nowrap">
                      {firstVariant?.sku || (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="px-4 py-3">
                      {stockQty !== undefined ? (
                        <span
                          className={`inline-flex items-center text-theme-caption font-semibold py-1 px-3 rounded-full border ${
                            isLowStock
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isLowStock ? "⚠ " : ""}
                          {stockQty}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-theme-body-sm">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="px-4 py-3 text-theme-body-sm font-semibold text-gray-800 whitespace-nowrap">
                      ₹{Number(item.base_price).toLocaleString()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3 cursor-pointer">
                      <span
                        className={`flex text-sky-600 items-center gap-2 justify-center  text-theme-caption font-semibold  px-3 rounded-lg transition-colors underline`}
                      >
                        {PRODUCTS_LIST_TEXT.VIEW_VARIANTS}
                        <MoveRight size={18} />
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-16 text-center text-gray-400 text-theme-body-sm"
                >
                  <Package size={36} className="mx-auto mb-3 opacity-30" />
                  {PRODUCTS_LIST_TEXT.NO_PRODUCTS}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <span className="flex justify-end mt-4 mb-6">
        <Pagination
          setCount={(page) =>
            dispatch({
              type: ProductsActionType.SET_CURRENT_PAGE,
              payload: typeof page === "function" ? page(currentPage) : page,
            })
          }
          count={currentPage}
          totalPages={totalPages}
          style="relative right-0 w-54"
        />
      </span>
    </main>
  );
}
