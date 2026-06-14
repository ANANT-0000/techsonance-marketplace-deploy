"use client";
import { useEffect, useReducer } from "react";
import { Pagination } from "@/components/common/Pagination";
import { searchImgDark } from "@/constants/common";
import {
  AlertTriangle,
  Package,
  RefreshCw,
  XCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BASE_API_URL } from "@/constants";
import { Address } from "@/utils/Types";
import { getCompanyDomain } from "@/lib/get-domain";
import { authToken } from "@/utils/authToken";
import { TableRowSkeleton } from "@/components/common/skeletons/TableRowSkeleton";
import { INVENTORY_TEXT, AlertSeverity, StatusFilter } from "@/constants";
import AxiosAPI from "@/lib/axios";

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
    <div className="flex gap-4 my-6 flex-wrap">
      {[
        {
          label: INVENTORY_TEXT.STATS.TOTAL_SKUS,
          value: inventory.length,
          color: "text-blue-600",
          bg: "bg-blue-50 border-blue-200",
        },
        {
          label: INVENTORY_TEXT.STATS.LOW_STOCK,
          value: inventory.filter((i) => i.isLowStock && !i.isOutOfStock)
            .length,
          color: "text-yellow-600",
          bg: "bg-yellow-50 border-yellow-200",
        },
        {
          label: INVENTORY_TEXT.STATS.OUT_OF_STOCK,
          value: inventory.filter((i) => i.isOutOfStock).length,
          color: "text-red-600",
          bg: "bg-red-50 border-red-200",
        },
        {
          label: INVENTORY_TEXT.STATS.HEALTHY,
          value: inventory.filter((i) => !i.isLowStock && !i.isOutOfStock)
            .length,
          color: "text-green-600",
          bg: "bg-green-50 border-green-200",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className={`border rounded-2xl px-6 py-4 flex flex-col gap-1 ${stat.bg}`}
        >
          <p className="text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className={`text-theme-h3 font-extrabold ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};
async function fetchInventory(
  domain: string,
  token: string,
): Promise<InventoryItem[]> {
  const res = await fetch(`${BASE_API_URL}/v1/inventory`, {
    headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
    cache: "no-cache",
  });
  const json = await res.json();
  return json.data ?? [];
}

async function fetchAlerts(
  domain: string,
  token: string,
): Promise<LowStockAlert[]> {
  const res = await fetch(`${BASE_API_URL}/v1/inventory/alerts/low-stock`, {
    headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
  | { type: InventoryActionType.SET_COUNT; payload: number };

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
  } = state;

  const pageSize = 8;
  const token = authToken();

  const reload = async () => {
    const domain = await getCompanyDomain();
    dispatch({ type: InventoryActionType.SET_LOADING, payload: true });
    if (!token) {
      return;
    }
    const [inv, alrt] = await Promise.all([
      fetchInventory(domain, token),
      fetchAlerts(domain, token),
    ]);
    dispatch({
      type: InventoryActionType.SET_INVENTORY_DATA,
      payload: { inventory: inv, alerts: alrt },
    });
    dispatch({ type: InventoryActionType.SET_LOADING, payload: false });
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
    dispatch({ type: InventoryActionType.SET_SAVING, payload: true });
    if (!token) {
      return;
    }
    await updateStock(inventoryId, editQty);
    dispatch({ type: InventoryActionType.SET_SAVING, payload: false });
    dispatch({ type: InventoryActionType.SET_EDIT_ID, payload: null });
    await reload();
  };

  return (
    <>
      <main className="px-2 w-full">
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 border-2 border-orange-300 bg-orange-50 rounded-2xl p-4 mt-2"
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-theme-body-sm font-medium border ${
                      alert.isOutOfStock
                        ? "bg-red-100 border-red-300 text-red-700"
                        : "bg-yellow-100 border-yellow-300 text-yellow-700"
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
        <div className="flex gap-3 mb-4 flex-wrap items-center justify-between">
          <span className="border-2 flex items-center gap-0 border-gray-300 px-4 rounded-2xl bg-white">
            <img className="w-5 h-5" src={searchImgDark} alt="search" />
            <input
              type="text"
              className="py-2 px-3 w-64 text-theme-body-sm outline-none bg-transparent"
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
          </span>

          <div className="flex gap-2">
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
                className={`px-4 py-2 rounded-xl text-theme-body-sm font-semibold border-2 transition-colors ${
                  statusFilter === f
                    ? f === StatusFilter.OUT
                      ? "bg-red-100 border-red-400 text-red-700"
                      : f === StatusFilter.LOW
                        ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                        : "bg-blue-100 border-blue-400 text-blue-700"
                    : "bg-white border-gray-300 text-gray-600"
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
              className="px-4 py-2 rounded-xl text-theme-body-sm font-semibold border-2 border-gray-300 bg-white text-gray-600 flex items-center gap-2 hover:bg-gray-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {INVENTORY_TEXT.FILTERS.REFRESH}
            </button>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div className="relative flex flex-col w-full overflow-auto bg-white border-2 border-gray-200 rounded-2xl">
          <table className="w-full table-auto min-w-max text-theme-body-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">
                  {INVENTORY_TEXT.TABLE.HEADERS.PRODUCT}
                </th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">
                  {INVENTORY_TEXT.TABLE.HEADERS.SKU}
                </th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">
                  {INVENTORY_TEXT.TABLE.HEADERS.ACTIVE}
                </th>

                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">
                  {INVENTORY_TEXT.TABLE.HEADERS.WAREHOUSE}
                </th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">
                  {INVENTORY_TEXT.TABLE.HEADERS.STOCK}
                </th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">
                  {INVENTORY_TEXT.TABLE.HEADERS.STATUS}
                </th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">
                  {INVENTORY_TEXT.TABLE.HEADERS.PRICE}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton columns={8} rows={5} />
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    {INVENTORY_TEXT.TABLE.NO_ITEMS}
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.variant_id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      item.isOutOfStock
                        ? "bg-red-50/30"
                        : item.isLowStock
                          ? "bg-yellow-50/30"
                          : ""
                    }`}
                  >
                    {/* Product */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.variant_image ? (
                          <img
                            src={item.variant_image}
                            alt={item.variant_name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800 max-w-[200px] truncate">
                          {item.variant_name}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="p-4 font-mono text-gray-500 text-theme-caption">
                      {item.sku}
                    </td>
                    {/* Active */}
                    <td
                      className={`p-4 font-mono text-gray-500 text-theme-caption `}
                    >
                      <span
                        className={`inline-flex items-center gap-1 text-theme-caption font-semibold px-2.5 py-0.5 rounded-full border ${
                          item.activeStatus === "active"
                            ? "bg-green-100 text-green-700  border-green-400"
                            : "text-gray-600 bg-gray-100  border-gray-400"
                        }`}
                      >
                        {item.activeStatus}
                      </span>
                    </td>

                    {/* Warehouse */}
                    <td className="p-4 text-gray-600">
                      {item.locations
                        ? (item.locations[0]?.warehouse_name ?? "—")
                        : "—"}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
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
                            className="w-20 border-2 border-blue-400 rounded-lg px-2 py-1 text-theme-body-sm outline-none focus:ring-2 focus:ring-blue-200"
                          />
                          <button
                            onClick={() => handleSave(item.variant_id)}
                            disabled={saving}
                            className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
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
                            className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`font-bold text-theme-h6 ${
                            item.isOutOfStock
                              ? "text-red-600"
                              : item.isLowStock
                                ? "text-yellow-600"
                                : "text-gray-800"
                          }`}
                        >
                          {item.total_stock}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {item.isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 text-theme-caption font-bold px-2.5 py-1 rounded-full">
                          <XCircle size={12} />{" "}
                          {INVENTORY_TEXT.TABLE.STATUS_OUT}
                        </span>
                      ) : item.isLowStock ? (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 border border-yellow-300 text-theme-caption font-bold px-2.5 py-1 rounded-full">
                          <AlertTriangle size={12} />{" "}
                          {INVENTORY_TEXT.TABLE.STATUS_LOW}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-300 text-theme-caption font-bold px-2.5 py-1 rounded-full">
                          <CheckCircle size={12} />{" "}
                          {INVENTORY_TEXT.TABLE.STATUS_IN}
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-semibold text-gray-700">
                      ₹{Number(item.price).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────── */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-theme-body-sm text-gray-500">
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
      </main>
    </>
  );
}
