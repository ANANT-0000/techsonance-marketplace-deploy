"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useReducer } from "react";
import {
  PackageSearch,
  ArrowUpDown,
  SlidersHorizontal,
  Package,
  RefreshCw,
  X,
  Check,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authToken } from "@/utils/authToken";
import {
  fetchStockManagerVariants,
  quickUpdateStock,
  updateProductVariantStatus,
} from "@/utils/vendorApiClient";
import { TableRowSkeleton } from "@/components/common/skeletons";
import { useAppSelector } from "@/hooks/reduxHooks";
import { SessionErrorCard } from "@/components/vendor/SessionErrorCard";
import toast from "react-hot-toast";
import { STOCK_MANAGER_TEXT } from "@/constants";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

export const stockTableHeader = [
  STOCK_MANAGER_TEXT.TABLE.HEADERS.PRODUCT_VARIANT,
  STOCK_MANAGER_TEXT.TABLE.HEADERS.SKU,
  STOCK_MANAGER_TEXT.TABLE.HEADERS.WAREHOUSE,
  STOCK_MANAGER_TEXT.TABLE.HEADERS.STOCK,
  STOCK_MANAGER_TEXT.TABLE.HEADERS.STATUS,
  STOCK_MANAGER_TEXT.TABLE.HEADERS.ACTIONS,
];

function stockClass(stock: number): "out" | "low" | "ok" {
  if (stock === 0) return "out";
  if (stock <= 5) return "low";
  return "ok";
}

function barPercent(stock: number): number {
  return Math.min(100, Math.round((stock / 60) * 100));
}

const stockNumColor: Record<"out" | "low" | "ok", string> = {
  out: "text-red-600",
  low: "text-amber-500",
  ok: "text-stone-800",
};

const stockBarColor: Record<"out" | "low" | "ok", string> = {
  out: "bg-red-500",
  low: "bg-amber-400",
  ok: "bg-emerald-500",
};

const STEP_OPTIONS = [2, 5, 10, 25, 50];

enum StockManagerActionType {
  SET_LOADING = "SET_LOADING",
  SET_VARIANTS = "SET_VARIANTS",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
  SET_STATUS_FILTER = "SET_STATUS_FILTER",
  SET_SORT_BY = "SET_SORT_BY",
  OPEN_MODAL = "OPEN_MODAL",
  CLOSE_MODAL = "CLOSE_MODAL",
  SET_EDIT_STOCK_VALUE = "SET_EDIT_STOCK_VALUE",
  SET_IS_SAVING = "SET_IS_SAVING",
  SET_CONFIRM_CONFIG = "SET_CONFIRM_CONFIG",
  SET_IS_STATUS_UPDATING = "SET_IS_STATUS_UPDATING",
  UPDATE_VARIANT_STOCK = "UPDATE_VARIANT_STOCK",
  UPDATE_VARIANT_STATUS = "UPDATE_VARIANT_STATUS",
}

interface StockManagerState {
  loading: boolean;
  variants: any[];
  searchQuery: string;
  statusFilter: string;
  sortBy: string;
  activeModalItem: any | null;
  editStockValue: number;
  adjustmentStep: number;
  isSaving: boolean;
  confirmConfig: {
    isOpen: boolean;
    variantId: string;
    currentStatus: string;
    productName: string;
  } | null;
  isStatusUpdating: boolean;
}

type StockManagerAction =
  | { type: StockManagerActionType.SET_LOADING; payload: boolean }
  | { type: StockManagerActionType.SET_VARIANTS; payload: any[] }
  | { type: StockManagerActionType.SET_SEARCH_QUERY; payload: string }
  | { type: StockManagerActionType.SET_STATUS_FILTER; payload: string }
  | { type: StockManagerActionType.SET_SORT_BY; payload: string }
  | { type: StockManagerActionType.OPEN_MODAL; payload: any }
  | { type: StockManagerActionType.CLOSE_MODAL }
  | { type: StockManagerActionType.SET_EDIT_STOCK_VALUE; payload: number }
  | { type: StockManagerActionType.SET_IS_SAVING; payload: boolean }
  | {
      type: StockManagerActionType.SET_CONFIRM_CONFIG;
      payload: StockManagerState["confirmConfig"];
    }
  | { type: StockManagerActionType.SET_IS_STATUS_UPDATING; payload: boolean }
  | {
      type: StockManagerActionType.UPDATE_VARIANT_STOCK;
      payload: { variantId: string; stock: number };
    }
  | {
      type: StockManagerActionType.UPDATE_VARIANT_STATUS;
      payload: { variantId: string; status: string };
    };

const initialState: StockManagerState = {
  loading: true,
  variants: [],
  searchQuery: "",
  statusFilter: "",
  sortBy: "stock_asc",
  activeModalItem: null,
  editStockValue: 0,
  adjustmentStep: 10,
  isSaving: false,
  confirmConfig: null,
  isStatusUpdating: false,
};

function stockManagerReducer(
  state: StockManagerState,
  action: StockManagerAction,
): StockManagerState {
  switch (action.type) {
    case StockManagerActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case StockManagerActionType.SET_VARIANTS:
      return { ...state, variants: action.payload };
    case StockManagerActionType.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case StockManagerActionType.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload };
    case StockManagerActionType.SET_SORT_BY:
      return { ...state, sortBy: action.payload };
    case StockManagerActionType.OPEN_MODAL:
      return {
        ...state,
        activeModalItem: action.payload,
        editStockValue: action.payload.stock,
      };
    case StockManagerActionType.CLOSE_MODAL:
      return { ...state, activeModalItem: null };
    case StockManagerActionType.SET_EDIT_STOCK_VALUE:
      return { ...state, editStockValue: action.payload };
    case StockManagerActionType.SET_IS_SAVING:
      return { ...state, isSaving: action.payload };
    case StockManagerActionType.SET_CONFIRM_CONFIG:
      return { ...state, confirmConfig: action.payload };
    case StockManagerActionType.SET_IS_STATUS_UPDATING:
      return { ...state, isStatusUpdating: action.payload };
    case StockManagerActionType.UPDATE_VARIANT_STOCK:
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.variantId === action.payload.variantId
            ? { ...v, stock: action.payload.stock }
            : v,
        ),
      };
    case StockManagerActionType.UPDATE_VARIANT_STATUS:
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.variantId === action.payload.variantId
            ? { ...v, status: action.payload.status }
            : v,
        ),
      };
    default:
      return state;
  }
}

export default function StockManagerPage() {
  const companyId = getClientCompanyId();

  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";
  const token = authToken();

  const [state, dispatch] = useReducer(stockManagerReducer, initialState);
  const {
    loading,
    variants,
    searchQuery,
    statusFilter,
    sortBy,
    activeModalItem,
    editStockValue,
    isSaving,
    confirmConfig,
    isStatusUpdating,
  } = state;

  const loadVariants = async () => {
    if (!token || !companyId) return;
    dispatch({ type: StockManagerActionType.SET_LOADING, payload: true });
    try {
      const res = await fetchStockManagerVariants(token as string, companyId);
      dispatch({
        type: StockManagerActionType.SET_VARIANTS,
        payload: res.data || [],
      });
    } catch {
      toast.error(STOCK_MANAGER_TEXT.TOASTS.LOAD_FAIL);
    } finally {
      dispatch({ type: StockManagerActionType.SET_LOADING, payload: false });
    }
  };

  useEffect(() => {
    if (!token || !companyId) return;
    loadVariants();
  }, [token, companyId]);

  // Triggers the confirmation modal instead of executing immediately
  const handleStatusToggleClick = (
    variantId: string,
    currentStatus: string,
    productName: string,
  ) => {
    dispatch({
      type: StockManagerActionType.SET_CONFIRM_CONFIG,
      payload: {
        isOpen: true,
        variantId,
        currentStatus,
        productName,
      },
    });
  };

  // Executes after confirmation
  const executeStatusToggle = async () => {
    if (!confirmConfig || !companyId || !token) {
      toast.error(STOCK_MANAGER_TEXT.TOASTS.SESSION_EXPIRED, {
        icon: "🔒",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }
    const { variantId, currentStatus } = confirmConfig;
    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    dispatch({
      type: StockManagerActionType.SET_IS_STATUS_UPDATING,
      payload: true,
    });

    // Optimistic UI update
    dispatch({
      type: StockManagerActionType.UPDATE_VARIANT_STATUS,
      payload: { variantId, status: nextStatus },
    });

    try {
      await updateProductVariantStatus(
        variantId,
        nextStatus,
        token as string,
        companyId,
      );
      dispatch({
        type: StockManagerActionType.SET_CONFIRM_CONFIG,
        payload: null,
      });
      toast.success(STOCK_MANAGER_TEXT.TOASTS.UPDATE_STOCK_SUCCESS);
    } catch {
      toast.error(STOCK_MANAGER_TEXT.TOASTS.UPDATE_STATUS_FAIL);
      // Revert if API fails
      dispatch({
        type: StockManagerActionType.UPDATE_VARIANT_STATUS,
        payload: { variantId, status: currentStatus },
      });
    } finally {
      dispatch({
        type: StockManagerActionType.SET_IS_STATUS_UPDATING,
        payload: false,
      });
    }
  };

  const handleSaveStock = async () => {
    if (!activeModalItem || !companyId || !token) {
      toast.error(STOCK_MANAGER_TEXT.TOASTS.SESSION_EXPIRED, {
        icon: "🔒",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }
    if (editStockValue < 0) {
      toast.error(STOCK_MANAGER_TEXT.TOASTS.STOCK_MIN_ERR);
      return;
    }
    dispatch({ type: StockManagerActionType.SET_IS_SAVING, payload: true });
    try {
      await quickUpdateStock(
        activeModalItem.variantId,
        editStockValue,
        token as string,
        companyId,
      );
      dispatch({
        type: StockManagerActionType.UPDATE_VARIANT_STOCK,
        payload: {
          variantId: activeModalItem.variantId,
          stock: editStockValue,
        },
      });
      toast.success(STOCK_MANAGER_TEXT.TOASTS.UPDATE_STOCK_SUCCESS);
      dispatch({ type: StockManagerActionType.CLOSE_MODAL });
    } catch {
      toast.error(STOCK_MANAGER_TEXT.TOASTS.UPDATE_STOCK_FAIL);
    } finally {
      dispatch({ type: StockManagerActionType.SET_IS_SAVING, payload: false });
    }
  };

  const openModal = (item: any) => {
    dispatch({ type: StockManagerActionType.OPEN_MODAL, payload: item });
  };

  const filteredAndSorted = variants
    .filter((v) => {
      const matchesSearch =
        v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.sku && v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "stock_asc") return a.stock - b.stock;
      if (sortBy === "stock_desc") return b.stock - a.stock;
      if (sortBy === "name_asc")
        return a.productName.localeCompare(b.productName);
      return 0;
    });

  const totalVariants = variants.length;
  const lowStockCount = variants.filter(
    (v) => v.stock > 0 && v.stock <= 5,
  ).length;
  const outOfStockCount = variants.filter((v) => v.stock === 0).length;
  const healthyCount = variants.filter((v) => v.stock > 5).length;

  // Live diff values
  const originalStock = activeModalItem?.stock ?? 0;
  const delta = editStockValue - originalStock;

  // Config variables for the confirmation modal
  const isActivating = confirmConfig?.currentStatus !== "active";

  if (!token || !companyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50/30">
        <SessionErrorCard />
      </div>
    );
  }

  return (
    <main className="w-full px-4 sm:px-8 py-2 min-h-screen max-h-screen overflow-y-scroll bg-slate-50/30">
      <div className="mx-auto space-y-3">
        {/* ── Page Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4  ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center shrink-0">
              <Package size={18} className="text-stone-500" />
            </div>
            <div>
              <h1 className="text-theme-h5 font-semibold text-stone-800 tracking-tight leading-none">
                {STOCK_MANAGER_TEXT.HEADER.TITLE}
              </h1>
              <p className="text-theme-caption text-stone-400 mt-1">
                {STOCK_MANAGER_TEXT.HEADER.SUBTITLE}
              </p>
            </div>
          </div>
          <button
            onClick={loadVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-stone-200 text-theme-body-sm font-semibold text-stone-600 shadow-sm hover:bg-stone-50 transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {STOCK_MANAGER_TEXT.HEADER.REFRESH}
          </button>
        </header>

        {/* ── Summary Cards ── */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: STOCK_MANAGER_TEXT.STATS.TOTAL_SKUS,
                value: totalVariants,
                color: "text-slate-800",
                bg: "bg-white border-slate-100 shadow-sm",
              },
              {
                label: STOCK_MANAGER_TEXT.STATS.LOW_STOCK,
                value: lowStockCount,
                color: "text-amber-600",
                bg: "bg-amber-50/50 border-amber-100",
              },
              {
                label: STOCK_MANAGER_TEXT.STATS.OUT_OF_STOCK,
                value: outOfStockCount,
                color: "text-rose-600",
                bg: "bg-rose-50/50 border-rose-100",
              },
              {
                label: STOCK_MANAGER_TEXT.STATS.HEALTHY,
                value: healthyCount,
                color: "text-emerald-600",
                bg: "bg-emerald-50/50 border-emerald-100",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`border rounded-3xl px-6 py-6 flex flex-col gap-1.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${stat.bg}`}
              >
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-80">
                  {stat.label}
                </p>
                <p
                  className={`text-3xl font-extrabold tracking-tight ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2.5 items-center flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md min-w-[240px]">
              <PackageSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder={STOCK_MANAGER_TEXT.FILTERS.SEARCH_PLACEHOLDER}
                value={searchQuery}
                onChange={(e) =>
                  dispatch({
                    type: StockManagerActionType.SET_SEARCH_QUERY,
                    payload: e.target.value,
                  })
                }
                className="w-full pl-9 pr-3 py-2 text-theme-body-sm bg-white border-2 border-stone-200 rounded-xl shadow-sm placeholder-stone-400 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  dispatch({
                    type: StockManagerActionType.SET_STATUS_FILTER,
                    payload: e.target.value,
                  })
                }
                className="pl-8 pr-4 py-2 text-theme-body-sm bg-white border-2 border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
              >
                <option value="">
                  {STOCK_MANAGER_TEXT.FILTERS.ALL_STATUSES}
                </option>
                <option value="active">
                  {STOCK_MANAGER_TEXT.FILTERS.STATUS_ACTIVE}
                </option>
                <option value="inactive">
                  {STOCK_MANAGER_TEXT.FILTERS.STATUS_INACTIVE}
                </option>
              </select>
            </div>
            <div className="relative">
              <ArrowUpDown
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <select
                value={sortBy}
                onChange={(e) =>
                  dispatch({
                    type: StockManagerActionType.SET_SORT_BY,
                    payload: e.target.value,
                  })
                }
                className="pl-8 pr-4 py-2 text-theme-body-sm bg-white border-2 border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
              >
                <option value="stock_asc">
                  {STOCK_MANAGER_TEXT.FILTERS.SORT_STOCK_ASC}
                </option>
                <option value="stock_desc">
                  {STOCK_MANAGER_TEXT.FILTERS.SORT_STOCK_DESC}
                </option>
                <option value="name_asc">
                  {STOCK_MANAGER_TEXT.FILTERS.SORT_NAME_ASC}
                </option>
              </select>
            </div>
          </div>
          {!loading && (
            <span className="text-theme-body-sm font-medium text-stone-500">
              {filteredAndSorted.length}{" "}
              {STOCK_MANAGER_TEXT.FILTERS.RECORDS_MATCHING}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="w-full overflow-x-auto rounded-2xl border-2 border-stone-200 shadow-sm bg-white">
          <table className="w-full table-auto min-w-[860px] border-collapse text-theme-body-sm">
            <thead>
              <tr className="bg-stone-50/80 text-left border-b border-stone-200">
                {stockTableHeader.map((col) => (
                  <th
                    key={col}
                    className="p-4 text-theme-caption font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <TableRowSkeleton columns={6} rows={6} />
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center py-10">
                      <div className="relative w-20 h-20 bg-gradient-to-tr from-slate-50 to-white rounded-3xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/60 before:z-10">
                        <Package
                          size={36}
                          className="text-slate-400/80 relative z-20"
                          strokeWidth={1.2}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">
                        {STOCK_MANAGER_TEXT.TABLE.NO_DATA}
                      </h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed text-center max-w-[280px]">
                        {STOCK_MANAGER_TEXT.TABLE.EMPTY_SUBTITLE_DETAILED}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item) => {
                  const sc = stockClass(item.stock);

                  return (
                    <tr
                      key={item.variantId}
                      onClick={() => openModal(item)} // Extended to entire row
                      className={`group hover:bg-stone-50/60 bg-white transition-colors cursor-pointer ${
                        sc === "out"
                          ? "bg-red-50/30"
                          : sc === "low"
                            ? "bg-amber-50/20"
                            : ""
                      }`}
                    >
                      {/* Product / Variant */}
                      <td className="p-4 max-w-[240px]">
                        {/* stopPropagation on Link prevents navigating + opening modal simultaneously if it bubbles */}
                        <span className="block font-semibold text-stone-800  truncate transition-colors leading-snug ">
                          {item.productName}
                        </span>
                        <span className="inline-block text-theme-body font-medium text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md mt-1.5 font-mono">
                          <span className="font-bold text-black/90">
                            {" "}
                            {item.attributes?.[0]?.name ?? ""} :
                          </span>
                          <span className="text-black/70">
                            {" "}
                            {item.attributes?.[0]?.value || ""}
                          </span>
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="py-4 pl-4 font-mono text-theme-caption text-stone-500">
                        {item.sku || "—"}
                      </td>

                      {/* Warehouse */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                          {item.warehouseName ||
                            STOCK_MANAGER_TEXT.TABLE.PRIMARY_FACILITY}
                        </div>
                      </td>

                      {/* Stock — framed data + tactile button */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Data Display Box */}
                          <div
                            className={`flex items-center justify-center min-w-[44px] h-8 px-2 rounded-lg bg-white border shadow-sm ${
                              sc === "out"
                                ? "border-red-200 text-red-600"
                                : sc === "low"
                                  ? "border-amber-200 text-amber-600"
                                  : "border-stone-200 text-stone-800"
                            }`}
                          >
                            <span className="text-theme-body-sm font-bold tabular-nums leading-none">
                              {item.stock}
                            </span>
                          </div>

                          {/* Proper Action Button */}
                          <button
                            type="button"
                            className="inline-flex items-center justify-center h-8 gap-1.5 px-3 rounded-lg border border-stone-200 bg-white text-theme-caption font-bold text-stone-600 shadow-sm hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900 active:bg-stone-100 transition-all group/btn"
                          >
                            <Edit
                              size={14}
                              strokeWidth={2.5}
                              className="text-stone-400 group-hover/btn:text-stone-600 transition-colors"
                            />
                            {STOCK_MANAGER_TEXT.TABLE.BTN_ADJUST}
                          </button>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-theme-caption font-semibold px-2.5 py-1 rounded-full border ${
                            item.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-stone-100 text-stone-500 border-stone-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "active"
                                ? "bg-emerald-500"
                                : "bg-stone-400"
                            }`}
                          />

                          {item.status === "active"
                            ? STOCK_MANAGER_TEXT.TABLE.STATUS_ACTIVE
                            : STOCK_MANAGER_TEXT.TABLE.STATUS_INACTIVE}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          {/* Toggle */}
                          <button
                            onClick={() =>
                              handleStatusToggleClick(
                                item.variantId,
                                item.status,
                                item.productName,
                              )
                            }
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                              item.status === "active"
                                ? "bg-emerald-500"
                                : "bg-stone-300"
                            }`}
                            aria-label={`Toggle ${item.productName} status`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                                item.status === "active"
                                  ? "translate-x-4"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer hint ── */}
        {!loading && filteredAndSorted.length > 0 && (
          <p className="text-center text-theme-caption text-stone-400 mt-5">
            {STOCK_MANAGER_TEXT.FOOTER.SHOWING}{" "}
            <span className="font-semibold text-stone-600">
              {filteredAndSorted.length}
            </span>{" "}
            {STOCK_MANAGER_TEXT.FOOTER.OF} {totalVariants}{" "}
            {STOCK_MANAGER_TEXT.FOOTER.ITEMS_CLICK_ANY}{" "}
            <span className="font-semibold text-stone-600">
              {STOCK_MANAGER_TEXT.FOOTER.ROW}
            </span>{" "}
            {STOCK_MANAGER_TEXT.FOOTER.TO_EDIT_QUANTITY}
          </p>
        )}

        {/* ── Stock Update Modal ── */}
        {/* ── Stock Update Modal ── */}
        <AnimatePresence>
          {activeModalItem && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.18 }}
                className="bg-white border border-stone-200 rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-theme-tiny font-bold text-stone-400 uppercase tracking-widest block mb-0.5">
                      {STOCK_MANAGER_TEXT.MODAL.TITLE}
                    </span>
                    <h3 className="text-theme-body font-bold text-stone-800 line-clamp-1">
                      {activeModalItem.productName}
                    </h3>
                    {activeModalItem.sku && (
                      <p className="text-theme-caption text-stone-400 font-mono mt-0.5">
                        SKU: {activeModalItem.sku}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      dispatch({ type: StockManagerActionType.CLOSE_MODAL })
                    }
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors shrink-0"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Live Diff Bar */}
                <div className="flex items-center justify-between px-5 py-4 bg-stone-50/50 border-b border-stone-100">
                  {/* Current */}
                  <div className="flex-1 text-center">
                    <p className="text-theme-tiny font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      {STOCK_MANAGER_TEXT.MODAL.CURRENT_STOCK}
                    </p>
                    <p className="text-theme-h4 font-bold text-stone-400 tabular-nums">
                      {originalStock}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center justify-center shrink-0 px-2">
                    <svg
                      width="20"
                      height="14"
                      viewBox="0 0 20 14"
                      fill="none"
                      className="text-stone-300"
                    >
                      <path
                        d="M1 7h18M13 1l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* New value */}
                  <div className="flex-1 text-center">
                    <p className="text-theme-tiny font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      {STOCK_MANAGER_TEXT.MODAL.NEW_VALUE}
                    </p>
                    <p
                      className={`text-theme-h4 font-bold tabular-nums ${
                        delta === 0
                          ? "text-stone-800"
                          : delta > 0
                            ? "text-emerald-600"
                            : "text-red-500"
                      }`}
                    >
                      {editStockValue}
                    </p>
                  </div>
                </div>

                {/* Direct Input Section */}
                <div className="px-5 py-6">
                  <label
                    htmlFor="stock-input"
                    className="block text-theme-xxs font-bold text-stone-400 uppercase tracking-wider mb-2.5"
                  >
                    {STOCK_MANAGER_TEXT.MODAL.SET_EXACT_QUANTITY}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      id="stock-input"
                      type="number"
                      min={0}
                      value={editStockValue}
                      onChange={(e) =>
                        dispatch({
                          type: StockManagerActionType.SET_EDIT_STOCK_VALUE,
                          payload:
                            e.target.value === ""
                              ? 0
                              : Math.max(0, parseInt(e.target.value, 10)),
                        })
                      }
                      className="w-full border-2 border-stone-200 rounded-xl pl-4 pr-16 py-3 text-theme-h5 font-bold text-stone-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all tabular-nums"
                      autoFocus
                    />

                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-theme-tiny font-bold text-stone-500 bg-stone-100 border border-stone-200/60 px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
                        {STOCK_MANAGER_TEXT.MODAL.UNITS}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-stone-100 bg-stone-50/50">
                  {/* Dynamic Delta Badge */}
                  <div className="flex-1 min-w-0">
                    {delta === 0 ? (
                      <span className="text-theme-caption font-medium text-stone-400 block">
                        {STOCK_MANAGER_TEXT.MODAL.NO_CHANGES}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 text-theme-caption font-bold px-2.5 py-1 rounded-md ${
                          delta > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {delta > 0
                          ? `${STOCK_MANAGER_TEXT.MODAL.STOCKING_UP}${delta}`
                          : `${STOCK_MANAGER_TEXT.MODAL.REDUCING_BY}${delta}`}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        dispatch({ type: StockManagerActionType.CLOSE_MODAL })
                      }
                      className="px-4 py-2.5 rounded-xl border border-stone-200 text-theme-caption font-bold text-stone-600 bg-white hover:bg-stone-50 active:bg-stone-100 transition-colors"
                    >
                      {STOCK_MANAGER_TEXT.MODAL.CANCEL}
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={handleSaveStock}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 text-theme-caption font-bold shadow-sm transition-colors"
                    >
                      <Check size={16} strokeWidth={2.5} />
                      {isSaving
                        ? STOCK_MANAGER_TEXT.MODAL.SAVING
                        : STOCK_MANAGER_TEXT.MODAL.COMMIT}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Status Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={!!confirmConfig?.isOpen}
          onClose={() =>
            dispatch({
              type: StockManagerActionType.SET_CONFIRM_CONFIG,
              payload: null,
            })
          }
          onConfirm={executeStatusToggle}
          isLoading={isStatusUpdating}
          title={
            isActivating
              ? STOCK_MANAGER_TEXT.CONFIRM.PUBLISH_TITLE
              : STOCK_MANAGER_TEXT.CONFIRM.DEACTIVATE_TITLE
          }
          message={
            isActivating
              ? STOCK_MANAGER_TEXT.CONFIRM.PUBLISH_MSG(
                  confirmConfig?.productName
                    .trim()
                    .split(" ")
                    .slice(0, 2)
                    .join(" ") ?? "",
                )
              : STOCK_MANAGER_TEXT.CONFIRM.DEACTIVATE_MSG(
                  confirmConfig?.productName
                    .trim()
                    .split(" ")
                    .slice(0, 2)
                    .join(" ") ?? "",
                )
          }
          actionType={isActivating ? "activate" : "deactivate"}
          confirmText={
            isActivating
              ? STOCK_MANAGER_TEXT.CONFIRM.PUBLISH_BTN
              : STOCK_MANAGER_TEXT.CONFIRM.DEACTIVATE_BTN
          }
        />
      </div>
    </main>
  );
}
