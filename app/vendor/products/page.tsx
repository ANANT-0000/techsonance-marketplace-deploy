"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import Link from "next/link";
import Image from "next/image";
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
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

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
  const companyId = getClientCompanyId();

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
    if (!token || !companyId) {
      redirect(VEDNOR_LOGIN_PATH);
    }
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
      token,
      companyId,
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
        redirect(VEDNOR_LOGIN_PATH);
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
    if (!token || !companyId) return;
    dispatch({
      type: ProductsActionType.SET_IS_LOADING_CATEGORIES,
      payload: true,
    });
    fetchVendorsProductsCategory(token, companyId)
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
    <main className="w-full px-4 sm:px-8 py-1 min-h-screen max-h-screen overflow-y-scroll  ">
      <div className="  mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
              <Package size={22} className="text-slate-700" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                {PRODUCTS_LIST_TEXT.TITLE}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your inventory, pricing, and variants
              </p>
            </div>
            {productList.length > 0 && (
              <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                {productList.length}
              </span>
            )}
          </div>
          <Link
            className="group flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 transition-all duration-200 shadow-sm hover:shadow-md"
            href="products/productForm"
          >
            <Plus
              size={16}
              className="transition-transform group-hover:scale-110"
            />
            {PRODUCTS_LIST_TEXT.ADD_PRODUCT}
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center py-3 px-4 gap-4 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.02)] transition-all">
          {/* Search */}
          <div className="flex flex-1 min-w-[260px] items-center gap-2.5 bg-slate-50/50 py-2.5 px-3.5 rounded-xl border border-slate-100 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
            <DynamicIcon
              name="search"
              size={18}
              className="text-slate-400 shrink-0"
            />
            <input
              type="text"
              className="text-sm bg-transparent w-full outline-none text-slate-700 placeholder:text-slate-400"
              placeholder={PRODUCTS_LIST_TEXT.SEARCH_PLACEHOLDER}
              onChange={(e) =>
                dispatch({
                  type: ProductsActionType.SET_SEARCH_TERM,
                  payload: e.target.value,
                })
              }
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              className="text-sm border border-slate-100 bg-slate-50/50 rounded-xl px-4 py-2.5 text-slate-600 outline-none focus:border-slate-300 focus:bg-white focus:shadow-sm cursor-pointer transition-all duration-200 appearance-none min-w-[140px]"
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
              className="text-sm border border-slate-100 bg-slate-50/50 rounded-xl px-4 py-2.5 text-slate-600 outline-none focus:border-slate-300 focus:bg-white focus:shadow-sm cursor-pointer transition-all duration-200 appearance-none min-w-[160px]"
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
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <Table className="w-full table-auto min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                {PRODUCT_TABLE_HEAD.map((head, index) => (
                  <TableHead
                    key={index}
                    className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100/60">
              {isLoadingProducts ? (
                <TableRowSkeleton columns={7} rows={5} />
              ) : productList && productList.length > 0 ? (
                productList.map((item: Product, index: number) => {
                  const firstVariant = item.variants?.[0];
                  const stockQty = firstVariant?.inventory?.stock_quantity;
                  const isLowStock = stockQty !== undefined && stockQty < 20;
                  return (
                    <TableRow
                      key={item.id ?? index}
                      className="hover:bg-slate-50/80 transition-colors duration-200 cursor-pointer group"
                      onClick={() =>
                        router.push(
                          `/vendor/products/${item.id}/productVariants`,
                        )
                      }
                    >
                      {/* Product Image + Name */}
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-4 min-w-[240px] max-w-[340px]">
                          <div className="relative w-12 h-12 shrink-0">
                            <Image
                              className="rounded-xl object-cover border border-slate-100 bg-white"
                              src={
                                firstVariant?.images?.[0]?.image_url ||
                                "https://res.cloudinary.com/dxv3xtahf/image/upload/v1781174571/file_mc1spf.png"
                              }
                              alt={item.name || "Product"}
                              loading="lazy"
                              fill
                              sizes="48px"
                              style={{ objectFit: "contain" }}
                            />
                          </div>

                          <span className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-slate-900 transition-colors">
                            {item.name.trimStart()}
                          </span>
                        </div>
                      </TableCell>
                      {/* Category */}
                      <TableCell className="px-5 py-4">
                        <span className="text-sm text-slate-500">
                          {item.category?.name || (
                            <span className="text-slate-300">—</span>
                          )}
                        </span>
                      </TableCell>
                      {/* Variant */}
                      <TableCell className="px-5 py-4">
                        {item.variants && item.variants.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50/80 py-1 px-2.5 rounded-md transition-colors whitespace-nowrap"
                            title="View Variants"
                          >
                            <DynamicIcon name="tag" size={12} />
                            {item.variants.length}{" "}
                            {item.variants.length > 1
                              ? PRODUCTS_LIST_TEXT.VARIANT_PLURAL
                              : PRODUCTS_LIST_TEXT.VARIANT_SINGULAR}
                          </span>
                        ) : (
                          <Link
                            onClick={(e) => e.stopPropagation()}
                            href={`/vendor/products/variantForm/${item.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 py-1 px-2.5 rounded-md transition-all whitespace-nowrap shadow-sm"
                            title="Add Variant"
                          >
                            <Plus size={12} />
                            {PRODUCTS_LIST_TEXT.ADD_VARIANT}
                          </Link>
                        )}
                      </TableCell>

                      {/* SKU */}
                      <TableCell className="px-5 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">
                        {firstVariant?.sku || (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>

                      {/* Stock */}
                      <TableCell className="px-5 py-4">
                        {stockQty !== undefined ? (
                          <span
                            className={`inline-flex items-center text-xs font-medium py-1 px-2.5 rounded-md ${
                              isLowStock
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {stockQty} in stock
                          </span>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Price */}
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                        ₹{Number(item.base_price).toLocaleString()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-4">
                        <span className="inline-flex text-slate-400 group-hover:text-slate-900 items-center gap-1.5 text-sm font-medium transition-colors">
                          {PRODUCTS_LIST_TEXT.VIEW_VARIANTS}
                          <MoveRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-24 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <Package
                          size={32}
                          className="text-slate-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 mb-2">
                        {PRODUCTS_LIST_TEXT.NO_PRODUCTS}
                      </h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Your catalog is currently empty. Add your first product
                        to start managing inventory, pricing, and variants here.
                      </p>
                      <Link
                        href="products/productForm"
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
                      >
                        <Plus size={16} />
                        {PRODUCTS_LIST_TEXT.ADD_PRODUCT}
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end pt-2 pb-8">
          <Pagination
            setCount={(page) =>
              dispatch({
                type: ProductsActionType.SET_CURRENT_PAGE,
                payload: typeof page === "function" ? page(currentPage) : page,
              })
            }
            count={currentPage}
            totalPages={totalPages}
            style="w-auto"
          />
        </div>
      </div>
    </main>
  );
}
