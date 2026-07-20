"use client";
import { useEffect, useReducer } from "react";
import { Pagination } from "@/components/common/Pagination";
import { searchImgDark } from "@/constants/common";
import Image from "next/image";
import {
  AlertTriangle,
  Package,
  RefreshCw,
  XCircle,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { BASE_API_URL, VEDNOR_LOGIN_PATH } from "@/constants";
import { Address } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import { TableRowSkeleton } from "@/components/common/skeletons/TableRowSkeleton";
import { INVENTORY_TEXT, AlertSeverity, StatusFilter } from "@/constants";
import AxiosAPI from "@/lib/axios";
import { getClientCompanyId } from "@/utils/getCompanyId";
import { SessionErrorCard } from "@/components/vendor/SessionErrorCard";

interface InventoryLocation {
  inventory_id: string;
  warehouse_id: string;
  warehouse_name: string | null;
  stock: number;
  address: Address | null;
}
interface InventoryItem {
  isLowStock: boolean;
  isOutOfStock: boolean;
  locations: InventoryLocation[];
  price: string;
  sku: string;
  total_stock: number;
  variant_id: string;
  variant_name: string;
  variant_image: string;
  activeStatus: string;
}
interface LowStockAlert {
  inventoryId: string;
  variantId: string;
  variantName: string;
  sku: string;
  currentStock: number;
  warehouseName: string;
  isOutOfStock: boolean;
  severity: AlertSeverity;
}

export const InventoryStats = ({
  inventory,
}: {
  inventory: InventoryItem[];
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {[
        {
          label: INVENTORY_TEXT.STATS.TOTAL_SKUS,
          value: inventory.length,
          color: "text-slate-800",
          bg: "bg-white border-slate-100 shadow-sm",
        },
        {
          label: INVENTORY_TEXT.STATS.LOW_STOCK,
          value: inventory.filter((i) => i.isLowStock && !i.isOutOfStock)
            .length,
          color: "text-amber-600",
          bg: "bg-amber-50/50 border-amber-100",
        },
        {
          label: INVENTORY_TEXT.STATS.OUT_OF_STOCK,
          value: inventory.filter((i) => i.isOutOfStock).length,
          color: "text-rose-600",
          bg: "bg-rose-50/50 border-rose-100",
        },
        {
          label: INVENTORY_TEXT.STATS.HEALTHY,
          value: inventory.filter((i) => !i.isLowStock && !i.isOutOfStock)
            .length,
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
          <p className={`text-3xl font-extrabold tracking-tight ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};
async function fetchInventory(
  companyId: string,
  token: string,
): Promise<InventoryItem[]> {
  const res = await fetch(`${BASE_API_URL}/v1/inventory`, {
    headers: { "company-id": companyId, Authorization: `Bearer ${token}` },
    cache: "no-cache",
  });
  const json = await res.json();
  return json.data ?? [];
}

async function fetchAlerts(
  companyId: string,
  token: string,
): Promise<LowStockAlert[]> {
  const res = await fetch(`${BASE_API_URL}/v1/inventory/alerts/low-stock`, {
    headers: { "company-id": companyId, Authorization: `Bearer ${token}` },
    cache: "no-cache",
  });
  const json = await res.json();
  return json.data ?? [];
}

async function updateStock(inventoryId: string, quantity: number) {
  const res = await AxiosAPI.patch(
    `/v1/inventory/${inventoryId}`,
    JSON.stringify({ quantity }),
  );
  return res;
}

// ─── useReducer Action Types & State ─────────────────────────────────────────
enum InventoryActionType {
  SET_INVENTORY_DATA = "SET_INVENTORY_DATA",
  SET_LOADING = "SET_LOADING",
  SET_SEARCH = "SET_SEARCH",
  SET_STATUS_FILTER = "SET_STATUS_FILTER",
  SET_EDIT_ID = "SET_EDIT_ID",
  SET_EDIT_QTY = "SET_EDIT_QTY",
  SET_SAVING = "SET_SAVING",
  SET_COUNT = "SET_COUNT",
}

interface InventoryState {
  inventory: InventoryItem[];
  alerts: LowStockAlert[];
  search: string;
  statusFilter: StatusFilter;
  loading: boolean;
  editId: string | null;
  editQty: number;
  saving: boolean;
  count: number;
  sessionError: boolean;
}

const initialState: InventoryState = {
  inventory: [],
  alerts: [],
  search: "",
  statusFilter: StatusFilter.ALL,
  loading: true,
  editId: null,
  editQty: 0,
  saving: false,
  count: 1,
  sessionError: false,
};

type InventoryAction =
  | {
      type: InventoryActionType.SET_INVENTORY_DATA;
      payload: { inventory: InventoryItem[]; alerts: LowStockAlert[] };
    }
  | { type: InventoryActionType.SET_LOADING; payload: boolean }
  | { type: InventoryActionType.SET_SEARCH; payload: string }
  | { type: InventoryActionType.SET_STATUS_FILTER; payload: StatusFilter }
  | { type: InventoryActionType.SET_EDIT_ID; payload: string | null }
  | { type: InventoryActionType.SET_EDIT_QTY; payload: number }
  | { type: InventoryActionType.SET_SAVING; payload: boolean }
  | { type: InventoryActionType.SET_COUNT; payload: number }
  | { type: "SET_SESSION_ERROR"; payload: boolean };

function inventoryReducer(
  state: InventoryState,
  action: InventoryAction,
): InventoryState {
  switch (action.type) {
    case InventoryActionType.SET_INVENTORY_DATA:
      return {
        ...state,
        inventory: action.payload.inventory,
        alerts: action.payload.alerts,
      };
    case InventoryActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case InventoryActionType.SET_SEARCH:
      return { ...state, search: action.payload };
    case InventoryActionType.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload };
    case InventoryActionType.SET_EDIT_ID:
      return { ...state, editId: action.payload };
    case InventoryActionType.SET_EDIT_QTY:
      return { ...state, editQty: action.payload };
    case InventoryActionType.SET_SAVING:
      return { ...state, saving: action.payload };
    case InventoryActionType.SET_COUNT:
      return { ...state, count: action.payload };
    case "SET_SESSION_ERROR":
      return { ...state, sessionError: action.payload };
    default:
      return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const {
    inventory,
    alerts,
    search,
    statusFilter,
    loading,
    editId,
    editQty,
    saving,
    count,
    sessionError,
  } = state;

  const pageSize = 8;
  const token = authToken();

  const reload = async () => {
    const companyId = getClientCompanyId();
    if (!token || !companyId) {
      dispatch({ type: "SET_SESSION_ERROR", payload: true });
      return;
    }
    dispatch({ type: InventoryActionType.SET_LOADING, payload: true });
    try {
      const [inv, alrt] = await Promise.all([
        fetchInventory(companyId, token),
        fetchAlerts(companyId, token),
      ]);
      dispatch({
        type: InventoryActionType.SET_INVENTORY_DATA,
        payload: { inventory: inv, alerts: alrt },
      });
    } catch (error) {
      toast.error(INVENTORY_TEXT.TOASTS.LOAD_FAIL);
    } finally {
      dispatch({ type: InventoryActionType.SET_LOADING, payload: false });
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // ── Filtering ──
  const filtered = inventory.filter((item) => {
    const matchSearch =
      item.variant_name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === StatusFilter.ALL ||
      (statusFilter === StatusFilter.OUT && item.isOutOfStock) ||
      (statusFilter === StatusFilter.LOW &&
        item.isLowStock &&
        !item.isOutOfStock);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((count - 1) * pageSize, count * pageSize);

  // ── Stock update ──
  const handleSave = async (inventoryId: string) => {
    if (!token) {
      toast.error(INVENTORY_TEXT.TOASTS.SESSION_EXPIRED_SAVE, {
        icon: "🔒",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }
    dispatch({ type: InventoryActionType.SET_SAVING, payload: true });
    try {
      await updateStock(inventoryId, editQty);
      toast.success(INVENTORY_TEXT.TOASTS.UPDATE_SUCCESS);
      dispatch({ type: InventoryActionType.SET_EDIT_ID, payload: null });
      await reload();
    } catch (error) {
      toast.error(INVENTORY_TEXT.TOASTS.UPDATE_FAIL);
    } finally {
      dispatch({ type: InventoryActionType.SET_SAVING, payload: false });
    }
  };

  const companyId = getClientCompanyId();
  if (sessionError || !token || !companyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SessionErrorCard />
      </div>
    );
  }

  return (
    <main className="w-full px-4 sm:px-8 py-1 min-h-screen max-h-screen overflow-y-scroll bg-[#fafafa]">
      <div className="mx-auto ">
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-2 border-orange-200/50 bg-orange-50/50 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-orange-500" size={20} />
                <h2 className="font-bold text-orange-700">
                  {INVENTORY_TEXT.ALERTS.TITLE} ({alerts.length} item
                  {alerts.length !== 1 ? "s" : ""})
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 ">
                {alerts.map((alert) => (
                  <div
                    key={alert.inventoryId}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border bg-white shadow-sm ${
                      alert.isOutOfStock
                        ? "border-red-200 text-red-700"
                        : "border-yellow-200 text-yellow-700"
                    }`}
                  >
                    {alert.isOutOfStock ? (
                      <XCircle size={14} />
                    ) : (
                      <AlertTriangle size={14} />
                    )}
                    <span className="max-w-[180px] truncate">
                      {alert.variantName}
                    </span>
                    <span className="font-bold">
                      {alert.isOutOfStock
                        ? INVENTORY_TEXT.ALERTS.OUT_OF_STOCK
                        : `${alert.currentStock} ${INVENTORY_TEXT.ALERTS.LEFT}`}
                    </span>
                    <span className="text-theme-caption opacity-70">
                      · {alert.warehouseName}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <InventoryStats inventory={inventory} />
        {/* ── Filters ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center py-3 px-4 gap-4 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.02)] transition-all">
          <div className="flex flex-1 min-w-[260px] items-center gap-2.5 bg-slate-50/50 py-2.5 px-3.5 rounded-xl border border-slate-100 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
            <div className="relative w-4 h-4 shrink-0 opacity-50">
              <Image src={searchImgDark} alt="search" fill sizes="16px" />
            </div>
            <input
              type="text"
              className="text-sm bg-transparent w-full outline-none text-slate-700 placeholder:text-slate-400"
              placeholder={INVENTORY_TEXT.FILTERS.SEARCH_PLACEHOLDER}
              value={search}
              onChange={(e) => {
                dispatch({
                  type: InventoryActionType.SET_SEARCH,
                  payload: e.target.value,
                });
                dispatch({ type: InventoryActionType.SET_COUNT, payload: 1 });
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[StatusFilter.ALL, StatusFilter.LOW, StatusFilter.OUT].map((f) => (
              <button
                key={f}
                onClick={() => {
                  dispatch({
                    type: InventoryActionType.SET_STATUS_FILTER,
                    payload: f,
                  });
                  dispatch({ type: InventoryActionType.SET_COUNT, payload: 1 });
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === f
                    ? f === StatusFilter.OUT
                      ? "bg-rose-100 text-rose-700 shadow-sm"
                      : f === StatusFilter.LOW
                        ? "bg-amber-100 text-amber-700 shadow-sm"
                        : "bg-slate-900 text-white shadow-sm"
                    : "bg-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f === StatusFilter.ALL
                  ? INVENTORY_TEXT.FILTERS.ALL
                  : f === StatusFilter.LOW
                    ? INVENTORY_TEXT.FILTERS.LOW_STOCK
                    : INVENTORY_TEXT.FILTERS.OUT_OF_STOCK}
              </button>
            ))}
            <button
              onClick={reload}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-600 flex items-center gap-2 hover:bg-slate-50 shadow-sm"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {INVENTORY_TEXT.FILTERS.REFRESH}
            </button>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div className="relative flex flex-col w-full overflow-auto bg-white border border-slate-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <table className="w-full table-auto min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {INVENTORY_TEXT.TABLE.HEADERS.PRODUCT}
                </th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {INVENTORY_TEXT.TABLE.HEADERS.SKU}
                </th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {INVENTORY_TEXT.TABLE.HEADERS.ACTIVE}
                </th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {INVENTORY_TEXT.TABLE.HEADERS.WAREHOUSE}
                </th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {INVENTORY_TEXT.TABLE.HEADERS.STOCK}
                </th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {INVENTORY_TEXT.TABLE.HEADERS.STATUS}
                </th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {INVENTORY_TEXT.TABLE.HEADERS.PRICE}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                <TableRowSkeleton columns={8} rows={5} />
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center py-10">
                      <div className="relative w-20 h-20 bg-gradient-to-tr from-slate-50 to-white rounded-3xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/60 before:z-10">
                        <Package
                          size={36}
                          className="text-slate-400/80 relative z-20"
                          strokeWidth={1.2}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">
                        {INVENTORY_TEXT.TABLE.NO_ITEMS}
                      </h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed text-center max-w-[280px]">
                        {INVENTORY_TEXT.TABLE.EMPTY_SUBTITLE_DETAILED}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.variant_id}
                    className={`hover:bg-slate-50/80 transition-colors duration-200 cursor-default ${
                      item.isOutOfStock
                        ? "bg-rose-50/20"
                        : item.isLowStock
                          ? "bg-amber-50/20"
                          : ""
                    }`}
                  >
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.variant_image ? (
                          <div className="relative w-12 h-12 shrink-0">
                            <Image
                              src={item.variant_image}
                              alt={item.variant_name}
                              className="object-cover rounded-xl border border-slate-100 bg-white"
                              fill
                              sizes="48px"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Package
                              size={18}
                              className="text-slate-400"
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                          {item.variant_name}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-5 py-4 text-sm font-mono text-slate-500 whitespace-nowrap">
                      {item.sku}
                    </td>
                    {/* Active */}
                    <td className={`px-5 py-4`}>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                          item.activeStatus === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.activeStatus}
                      </span>
                    </td>

                    {/* Warehouse */}
                    <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {item.locations
                        ? (item.locations[0]?.warehouse_name ?? "—")
                        : "—"}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      {editId === item.variant_id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={editQty}
                            onChange={(e) =>
                              dispatch({
                                type: InventoryActionType.SET_EDIT_QTY,
                                payload: Number(e.target.value),
                              })
                            }
                            className="w-20 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                          />
                          <button
                            onClick={() => handleSave(item.variant_id)}
                            disabled={saving}
                            className="p-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() =>
                              dispatch({
                                type: InventoryActionType.SET_EDIT_ID,
                                payload: null,
                              })
                            }
                            className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-sm font-bold ${
                            item.isOutOfStock
                              ? "text-rose-600"
                              : item.isLowStock
                                ? "text-amber-600"
                                : "text-slate-800"
                          }`}
                        >
                          {item.total_stock}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {item.isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-medium px-2.5 py-1 rounded-md">
                          <XCircle size={14} />{" "}
                          {INVENTORY_TEXT.TABLE.STATUS_OUT}
                        </span>
                      ) : item.isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-md">
                          <AlertTriangle size={14} />{" "}
                          {INVENTORY_TEXT.TABLE.STATUS_LOW}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md">
                          <CheckCircle size={14} />{" "}
                          {INVENTORY_TEXT.TABLE.STATUS_IN}
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                      ₹{Number(item.price).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 pb-8 px-2">
          <p className="text-sm font-medium text-slate-500 whitespace-nowrap">
            {INVENTORY_TEXT.PAGINATION.SHOWING} {currentData.length}{" "}
            {INVENTORY_TEXT.PAGINATION.OF} {filtered.length}{" "}
            {INVENTORY_TEXT.PAGINATION.RECORDS}
          </p>
          <Pagination
            setCount={(p) =>
              dispatch({
                type: InventoryActionType.SET_COUNT,
                payload: typeof p === "function" ? p(count) : p,
              })
            }
            count={count}
            totalPages={totalPages || 1}
            style=""
          />
        </div>
      </div>
    </main>
  );
}
