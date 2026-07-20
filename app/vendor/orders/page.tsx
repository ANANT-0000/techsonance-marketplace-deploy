"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useReducer, useCallback, useState } from "react";
import { Printer, Package, PackageX } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Pagination } from "@/components/common/Pagination";
import { TableRowSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchBulkInvoiceUrls,
  fetchVendorOrderList,
} from "@/utils/vendorApiClient";
import Link from "next/link";
import {
  OrderStatus as OrderStatusType,
  OrderStatus,
  ReturnType,
  UserStatus,
} from "@/utils/Types";
import { useRouter } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { UiText } from "@/constants/ui-text";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { SessionErrorCard } from "@/components/vendor/SessionErrorCard";

interface OrderAddressType {
  name: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface OrderPaymentType {
  id: string;
  payment_method: string;
  payment_status: string;
  transaction_ref: string;
  amount: string;
  created_at: string;
  updated_at: string;
  order_id: string;
  company_id: string;
}

interface OrderItemType {
  quantity: number;
  order_status: OrderStatusType;
  return_request?: {
    type: ReturnType;
  };
}

interface OrderType {
  id: string;
  total_amount: string;
  order_status: OrderStatusType;
  created_at: string;
  items: OrderItemType[];
  address: OrderAddressType;
  payment: OrderPaymentType;
}

const getStatusBadges = (statuses: string | string[]) => {
  const statusArray = (Array.isArray(statuses) ? statuses : [statuses]).filter(
    Boolean,
  );
  const uniqueStatuses = Array.from(
    new Set(statusArray.map((s) => s.toLowerCase())),
  );
  const renderBadge = (status: string, index: number) => {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide shadow-sm hover:bg-amber-100/50 transition-colors"
          >
            ● {UiText.ORDERS.PENDING}
          </span>
        );

      case OrderStatus.DELIVERED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide shadow-sm hover:bg-emerald-100/50 transition-colors"
          >
            ● {UiText.ORDERS.DELIVERED}
          </span>
        );

      case UserStatus.ACTIVE:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide shadow-sm hover:bg-indigo-100/50 transition-colors"
          >
            ● {UiText.ORDERS.ACTIVE}
          </span>
        );

      case OrderStatus.CANCELLED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide capitalize shadow-sm hover:bg-rose-100/50 transition-colors"
          >
            ● {UiText.ORDERS.CANCELLED}
          </span>
        );

      case OrderStatus.SHIPPED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide shadow-sm hover:bg-violet-100/50 transition-colors"
          >
            ● {UiText.ORDERS.SHIPPED}
          </span>
        );

      case ReturnType.RETURN:
      case ReturnType.REPLACEMENT:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide capitalize shadow-sm hover:bg-purple-100/50 transition-colors"
          >
            ● {status}
          </span>
        );

      default:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 border border-slate-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide capitalize shadow-sm hover:bg-slate-100/50 transition-colors"
          >
            ● {status}
          </span>
        );
    }
  };

  if (uniqueStatuses.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 border border-slate-100 py-1 px-3 rounded-full text-[12px] font-medium tracking-wide shadow-sm">
        ● {UiText.ORDERS.NA || "Unknown"}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {uniqueStatuses.map((status, index) => renderBadge(status, index))}
    </div>
  );
};

const getPaymentBadge = (method: string, status: string) => {
  const isPaid = status === "Paid" || status === "success";
  return (
    <span
      className={`inline-flex items-center py-1 px-3 rounded-full text-[12px] font-medium tracking-wide shadow-sm hover:bg-opacity-80 transition-colors border ${isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50" : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50"}`}
    >
      {method || UiText.ORDERS.NA}
    </span>
  );
};

export enum ActionType {
  SET_LOADING = "SET_LOADING",
  SET_ORDER_STATUS = "SET_ORDER_STATUS",
  SET_SORT_BY = "SET_SORT_BY",
  SET_ORDERS = "SET_ORDERS",
  SET_PAGINATION = "SET_PAGINATION",
  SET_CURRENT_PAGE = "SET_CURRENT_PAGE",
  TOGGLE_ORDER_SELECTION = "TOGGLE_ORDER_SELECTION",
  SET_ALL_ORDERS_SELECTION = "SET_ALL_ORDERS_SELECTION",
  SET_IS_DOWNLOADING = "SET_IS_DOWNLOADING",
  SET_ERROR = "SET_ERROR",
}

interface State {
  loading: boolean;
  orderStatus: OrderStatusType | "";
  sortBy: string;
  orders: OrderType[];
  selectedOrders: string[];
  totalPages: number;
  itemsPerPage: number;
  currentPage: number;
  isDownloading: boolean;
  error: string | null;
}

const initialState: State = {
  loading: false,
  orderStatus: "",
  sortBy: "desc",
  orders: [],
  selectedOrders: [],
  totalPages: 1,
  itemsPerPage: 10,
  currentPage: 1,
  isDownloading: false,
  error: null,
};

type Action =
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_ORDER_STATUS; payload: OrderStatusType | "" }
  | { type: ActionType.SET_SORT_BY; payload: string }
  | { type: ActionType.SET_ORDERS; payload: OrderType[] }
  | { type: ActionType.SET_PAGINATION; payload: { totalPages: number } }
  | { type: ActionType.SET_CURRENT_PAGE; payload: number }
  | { type: ActionType.TOGGLE_ORDER_SELECTION; payload: string }
  | { type: ActionType.SET_ALL_ORDERS_SELECTION; payload: string[] }
  | { type: ActionType.SET_IS_DOWNLOADING; payload: boolean }
  | { type: ActionType.SET_ERROR; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionType.SET_ORDER_STATUS:
      return {
        ...state,
        orderStatus: action.payload,
        currentPage: 1,
        selectedOrders: [],
      };
    case ActionType.SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload,
        currentPage: 1,
        selectedOrders: [],
      };
    case ActionType.SET_ORDERS:
      return { ...state, orders: action.payload };
    case ActionType.SET_PAGINATION:
      return { ...state, totalPages: action.payload.totalPages };
    case ActionType.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload, selectedOrders: [] };
    case ActionType.TOGGLE_ORDER_SELECTION: {
      const isSelected = state.selectedOrders.includes(action.payload);
      return {
        ...state,
        selectedOrders: isSelected
          ? state.selectedOrders.filter((id) => id !== action.payload)
          : [...state.selectedOrders, action.payload],
      };
    }
    case ActionType.SET_ALL_ORDERS_SELECTION:
      return { ...state, selectedOrders: action.payload };
    case ActionType.SET_IS_DOWNLOADING:
      return { ...state, isDownloading: action.payload };
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default function OrdersPage() {
  const companyId = getClientCompanyId();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const offset = (state.currentPage - 1) * state.itemsPerPage;

  const orderTableHeader = [
    UiText.ORDERS.TABLE_HEADERS.ORDER_ID,
    UiText.ORDERS.TABLE_HEADERS.TOTAL_AMOUNT,
    UiText.ORDERS.TABLE_HEADERS.QTY,
    UiText.ORDERS.TABLE_HEADERS.STATUS,
    UiText.ORDERS.TABLE_HEADERS.CUSTOMER,
    UiText.ORDERS.TABLE_HEADERS.PAYMENT,
    UiText.ORDERS.TABLE_HEADERS.LOCATION,
    UiText.ORDERS.TABLE_HEADERS.DATE,
    UiText.ORDERS.TABLE_HEADERS.ACTIONS,
  ];

  const token = authToken();

  const getOrderList = useCallback(async () => {
    if (!token || !companyId) {
      setSessionError(true);
      router.push(VEDNOR_LOGIN_PATH);
      return;
    }
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    dispatch({ type: ActionType.SET_ERROR, payload: null });
    await fetchVendorOrderList(
      token,
      companyId,
      offset,
      state.itemsPerPage,
      state.orderStatus,
      state.sortBy,
    )
      .then((res) => {
        dispatch({
          type: ActionType.SET_ORDERS,
          payload: res.data.orders || [],
        });

        dispatch({
          type: ActionType.SET_PAGINATION,
          payload: {
            totalPages:
              Math.ceil(res.data.totalCount / state.itemsPerPage) || 1,
          },
        });
      })
      .catch((err) => {
        dispatch({
          type: ActionType.SET_ERROR,
          payload: err?.message || "Failed to load orders",
        });
        dispatch({ type: ActionType.SET_ORDERS, payload: [] });
      })
      .finally(() => {
        dispatch({ type: ActionType.SET_LOADING, payload: false });
      });
  }, [offset, state.itemsPerPage, token, state.orderStatus, state.sortBy]);

  useEffect(() => {
    getOrderList();
  }, [getOrderList]);

  const toggleAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && state.orders) {
      dispatch({
        type: ActionType.SET_ALL_ORDERS_SELECTION,
        payload: state.orders.map((o) => o.id),
      });
    } else {
      dispatch({ type: ActionType.SET_ALL_ORDERS_SELECTION, payload: [] });
    }
  };

  const handleBulkDownload = async () => {
    if (!token || !companyId) {
      setSessionError(true);
      return;
    }
    if (state.selectedOrders.length === 0) {
      toast.error("Please select at least one order to download invoices.", {
        style: { borderRadius: "12px", background: "#333", color: "#fff" },
      });
      return;
    }
    dispatch({ type: ActionType.SET_IS_DOWNLOADING, payload: true });

    try {
      const res = await fetchBulkInvoiceUrls(
        state.selectedOrders,
        token,
        companyId,
      );
      const invoices = res.data;

      if (!invoices || invoices.length === 0) {
        toast.error(UiText.ORDERS.NO_INVOICES_WARNING, {
          style: { borderRadius: "12px", background: "#333", color: "#fff" },
        });
        return;
      }

      let skippedCount = 0;
      for (const invoice of invoices) {
        if (invoice.invoice_url) {
          const response = await fetch(invoice.invoice_url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = `Invoice_${invoice.invoice_number}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();

          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          skippedCount++;
        }
      }

      if (skippedCount > 0) {
        toast.error(`${skippedCount} invoice(s) could not be downloaded as they are not yet generated.`, {
          style: { borderRadius: "12px", background: "#333", color: "#fff" },
        });
      }

      dispatch({ type: ActionType.SET_ALL_ORDERS_SELECTION, payload: [] });
    } catch {
      toast.error(UiText.ORDERS.FAILED_DOWNLOAD_INVOICES, {
        style: { borderRadius: "12px", background: "#333", color: "#fff" },
      });
    } finally {
      dispatch({ type: ActionType.SET_IS_DOWNLOADING, payload: false });
    }
  };

  if (sessionError || !token || !companyId) {
    return <SessionErrorCard />;
  }

  if (!mounted) {
    return (
      <main className="w-full px-4 py-8 min-h-screen">
        <table className="w-full">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50/50">
                <td colSpan={10} className="p-4 pl-6">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <Skeleton className="h-4 w-4 rounded bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-4 w-16 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-4 w-24 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-4 w-8 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-4 w-32 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-4 w-24 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-4 w-20 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                    <Skeleton className="h-8 w-12 rounded-xl bg-slate-100/80 animate-pulse shrink-0" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }

  return (
    <main className="w-full px-2 py-4 min-h-screen max-h-screen overflow-y-scroll scroll-smooth">
      {/* Header */}
      <header className="flex justify-between items-center my-8">
        <div className="flex items-center gap-4 text-slate-800">
          <div className="p-2.5 bg-indigo-50/80 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100/50">
            <Package size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
            {UiText.ORDERS.TITLE}
          </h1>
          {state.orders && state.orders.length > 0 && (
            <span className="ml-1 bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-[13px] font-medium px-3 py-1 rounded-full shadow-sm">
              {state.orders.length}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {/* SHOW DOWNLOAD BUTTON ONLY IF ORDERS ARE SELECTED */}
          {state.selectedOrders.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={handleBulkDownload}
              disabled={state.isDownloading}
              className="flex items-center gap-2.5 font-medium text-[14px] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 py-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 hover:-translate-y-0.5"
            >
              <Printer size={18} strokeWidth={1.75} />
              {state.isDownloading
                ? UiText.ORDERS.DOWNLOADING
                : `${UiText.ORDERS.PRINT_INVOICES} (${state.selectedOrders.length})`}
            </motion.button>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-3xl items-center p-4 gap-4 bg-white border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] mb-8 transition-all">
        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <select
            className="text-[14px] font-medium border border-slate-200 bg-white rounded-2xl px-5 py-3 text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat pr-10"
            onChange={(e) =>
              dispatch({
                type: ActionType.SET_ORDER_STATUS,
                payload: e.target.value as OrderStatusType,
              })
            }
            value={state.orderStatus}
          >
            <option value="">{UiText.ORDERS.ALL}</option>
            <option value={OrderStatus.PENDING}>{UiText.ORDERS.PENDING}</option>
            <option value={OrderStatus.PROCESSING}>
              {UiText.ORDERS.PROCESSING}
            </option>
            <option value={OrderStatus.SHIPPED}>{UiText.ORDERS.SHIPPED}</option>
            <option value={OrderStatus.DELIVERED}>
              {UiText.ORDERS.DELIVERED}
            </option>
            <option value={OrderStatus.CANCELLED}>
              {UiText.ORDERS.CANCELLED}
            </option>
          </select>

          <select
            className="text-[14px] font-medium border border-slate-200 bg-white rounded-2xl px-5 py-3 text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat pr-10"
            value={state.sortBy}
            onChange={(e) =>
              dispatch({
                type: ActionType.SET_SORT_BY,
                payload: e.target.value,
              })
            }
            name="sort_by"
          >
            <option value="desc">{UiText.ORDERS.NEWEST_FIRST}</option>
            <option value="asc">{UiText.ORDERS.OLDEST_FIRST}</option>
          </select>
        </span>
      </div>

      {state.error ? (
        <div className="w-full rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white py-32 flex flex-col items-center justify-center transition-all">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center max-w-md mx-auto text-center"
          >
            <div className="h-20 w-20 bg-rose-50/80 text-rose-500 border border-rose-100/50 shadow-sm rounded-full flex items-center justify-center mb-6">
              <PackageX
                size={32}
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
              {UiText.ORDERS.ERROR_TITLE}
            </h3>
            <p className="text-[15px] text-slate-500 mb-8 text-balance leading-relaxed">
              {state.error === "fetch failed" ? UiText.ORDERS.ERROR_FETCH_FAILED : state.error || UiText.ORDERS.ERROR_GENERIC}
            </p>
            <button
              onClick={() => getOrderList()}
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-[14px] font-medium rounded-2xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100/50 transition-all shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5"
            >
              {UiText.ORDERS.TRY_AGAIN}
            </button>
          </motion.div>
        </div>
      ) : state.orders && state.orders?.length === 0 && !state.loading ? (
        <div className="w-full rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white py-32 flex flex-col items-center justify-center transition-all">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center max-w-md mx-auto text-center"
          >
            <div className="h-20 w-20 bg-indigo-50/50 text-indigo-400 border border-indigo-100/50 shadow-sm rounded-full flex items-center justify-center mb-6">
              <Package
                size={32}
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
              {UiText.ORDERS.WAITING_FOR_ORDER}
            </h3>
            <p className="text-[15px] text-slate-500 mb-8 text-balance leading-relaxed">
              {UiText.ORDERS.WAITING_FOR_ORDER_DESC}
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white pb-4 transition-all">
          <table className="w-full table-auto min-w-[950px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                <th className="p-5 pl-8 w-14">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm transition-colors"
                    checked={
                      state.orders?.length > 0 &&
                      state.orders.every((o) =>
                        state.selectedOrders.includes(o.id),
                      )
                    }
                    onChange={toggleAllOrders}
                  />
                </th>
                {orderTableHeader.map((header) => (
                  <th
                    key={header}
                    className="p-5 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50/50">
                    <td colSpan={10} className="p-5 pl-7">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <Skeleton className="h-4 w-4 rounded bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-4 w-16 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-4 w-24 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-4 w-8 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-6 w-20 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-4 w-32 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-6 w-20 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-4 w-24 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-4 w-20 rounded-full bg-slate-100/80 animate-pulse shrink-0" />
                        <Skeleton className="h-8 w-12 rounded-xl bg-slate-100/80 animate-pulse shrink-0" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
              state.orders &&
              state.orders?.map((item, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.05,
                    ease: "easeOut",
                  }}
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50/80 last:border-0"
                >
                  <td className="p-5 pl-8">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors shadow-sm"
                      checked={state.selectedOrders.includes(item.id)}
                      onChange={() =>
                        dispatch({
                          type: ActionType.TOGGLE_ORDER_SELECTION,
                          payload: item.id,
                        })
                      }
                    />
                  </td>

                  {/* ORDER ID */}
                  <td className="p-5">
                    <span className="font-semibold text-[14px] text-slate-900 tracking-wide">
                      #{item.id.split("-")[0].toUpperCase()}
                    </span>
                  </td>

                  {/* TOTAL AMOUNT */}
                  <td className="p-5">
                    <span className="font-medium text-slate-700 text-[14px]">
                      ₹{Number(item.total_amount).toLocaleString()}
                    </span>
                  </td>

                  {/* QTY */}
                  <td className="p-5 text-slate-600 text-[14px] font-medium">
                    {item.items?.reduce(
                      (total, cur) => total + cur.quantity,
                      0,
                    ) ?? 0}
                  </td>

                  {/* STATUS */}
                  <td className="p-5">
                    {getStatusBadges(
                      item.items.map((x) =>
                        x.return_request
                          ? x.return_request.type
                          : x.order_status,
                      ),
                    )}
                  </td>

                  {/* CUSTOMER */}
                  <td className="p-5 text-[14px] text-slate-700 font-medium whitespace-nowrap">
                    {item.address?.name || UiText.ORDERS.NA}
                  </td>

                  {/* PAYMENT */}
                  <td className="p-5">
                    {getPaymentBadge(
                      item.payment?.payment_method,
                      item.payment?.payment_status,
                    )}
                  </td>

                  {/* LOCATION */}
                  <td className="p-5 text-[14px] text-slate-500 whitespace-nowrap max-w-[200px] truncate">
                    {[
                      item.address?.city,
                      item.address?.state,
                      item.address?.country,
                      item.address?.postal_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || UiText.ORDERS.NA}
                  </td>

                  {/* DATE */}
                  <td className="p-5 text-[14px] text-slate-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("en-GB")}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-5">
                    <Link
                      href={`/vendor/orders/${item.id}`}
                      className="inline-flex items-center justify-center text-[13px] font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow hover:-translate-y-0.5"
                    >
                      {UiText.ORDERS.VIEW_ARROW}
                    </Link>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}
      <span className="flex justify-end mt-4">
        <Pagination
          setCount={(val) =>
            dispatch({
              type: ActionType.SET_CURRENT_PAGE,
              payload: typeof val === "function" ? val(state.currentPage) : val,
            })
          }
          count={state.currentPage}
          totalPages={state.totalPages}
          style="relative right-0 w-54"
        />
      </span>
    </main>
  );
}
