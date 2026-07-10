"use client";

import { useEffect, useReducer, useCallback } from "react";
import { Printer, Package } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { TableRowSkeleton } from "@/components/common/skeletons";
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
import { redirect } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { UiText } from "@/constants/ui-text";

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
            className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● {UiText.ORDERS.PENDING}
          </span>
        );

      case OrderStatus.DELIVERED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● {UiText.ORDERS.DELIVERED}
          </span>
        );

      case UserStatus.ACTIVE:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● {UiText.ORDERS.ACTIVE}
          </span>
        );

      case OrderStatus.CANCELLED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize"
          >
            ● {UiText.ORDERS.CANCELLED}
          </span>
        );

      case OrderStatus.SHIPPED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● {UiText.ORDERS.SHIPPED}
          </span>
        );

      case ReturnType.RETURN:
      case ReturnType.REPLACEMENT:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize"
          >
            ● {status}
          </span>
        );

      default:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize"
          >
            ● {status}
          </span>
        );
    }
  };

  if (uniqueStatuses.length === 0) return null;

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
      className={`inline-flex items-center py-1 px-3 rounded-full text-theme-caption font-semibold border ${isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {method || UiText.ORDERS.NA}
    </span>
  );
};

export enum ActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ORDER_STATUS = 'SET_ORDER_STATUS',
  SET_SORT_BY = 'SET_SORT_BY',
  SET_ORDERS = 'SET_ORDERS',
  SET_PAGINATION = 'SET_PAGINATION',
  SET_CURRENT_PAGE = 'SET_CURRENT_PAGE',
  TOGGLE_ORDER_SELECTION = 'TOGGLE_ORDER_SELECTION',
  SET_ALL_ORDERS_SELECTION = 'SET_ALL_ORDERS_SELECTION',
  SET_IS_DOWNLOADING = 'SET_IS_DOWNLOADING',
  SET_ERROR = 'SET_ERROR',
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
    case ActionType.SET_LOADING: return { ...state, loading: action.payload };
    case ActionType.SET_ORDER_STATUS: return { ...state, orderStatus: action.payload, currentPage: 1, selectedOrders: [] };
    case ActionType.SET_SORT_BY: return { ...state, sortBy: action.payload, currentPage: 1, selectedOrders: [] };
    case ActionType.SET_ORDERS: return { ...state, orders: action.payload };
    case ActionType.SET_PAGINATION: return { ...state, totalPages: action.payload.totalPages };
    case ActionType.SET_CURRENT_PAGE: return { ...state, currentPage: action.payload, selectedOrders: [] };
    case ActionType.TOGGLE_ORDER_SELECTION: {
      const isSelected = state.selectedOrders.includes(action.payload);
      return {
        ...state,
        selectedOrders: isSelected
          ? state.selectedOrders.filter(id => id !== action.payload)
          : [...state.selectedOrders, action.payload]
      };
    }
    case ActionType.SET_ALL_ORDERS_SELECTION: return { ...state, selectedOrders: action.payload };
    case ActionType.SET_IS_DOWNLOADING: return { ...state, isDownloading: action.payload };
    case ActionType.SET_ERROR: return { ...state, error: action.payload };
    default: return state;
  }
}

export default function OrdersPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
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
    if (!token) {
      redirect("/auth/vendorLogin");
      return;
    }
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    dispatch({ type: ActionType.SET_ERROR, payload: null });
    await fetchVendorOrderList(
      offset,
      state.itemsPerPage,
      token,
      state.orderStatus,
      state.sortBy,
    )
      .then((res) => {
        dispatch({ type: ActionType.SET_ORDERS, payload: res.data.orders || [] });
        dispatch({ type: ActionType.SET_PAGINATION, payload: { totalPages: Math.ceil(res.data.totalCount / state.itemsPerPage) || 1 } });
      })
      .catch((err) => {
        dispatch({ type: ActionType.SET_ERROR, payload: err?.message || "Failed to load orders" });
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
      dispatch({ type: ActionType.SET_ALL_ORDERS_SELECTION, payload: state.orders.map((o) => o.id) });
    } else {
      dispatch({ type: ActionType.SET_ALL_ORDERS_SELECTION, payload: [] });
    }
  };

  const handleBulkDownload = async () => {
    if (state.selectedOrders.length === 0) return;
    dispatch({ type: ActionType.SET_IS_DOWNLOADING, payload: true });

    try {
      const res = await fetchBulkInvoiceUrls(state.selectedOrders, token as string);
      const invoices = res.data;

      if (!invoices || invoices.length === 0) {
        alert(UiText.ORDERS.NO_INVOICES_WARNING);
        return;
      }

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
        }
      }

      dispatch({ type: ActionType.SET_ALL_ORDERS_SELECTION, payload: [] });
    } catch {
      alert(UiText.ORDERS.FAILED_DOWNLOAD_INVOICES);
    } finally {
      dispatch({ type: ActionType.SET_IS_DOWNLOADING, payload: false });
    }
  };

  return (
    <main className="w-full px-1 min-h-screen max-h-screen overflow-y-scroll">
      {/* Header */}
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Package size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {UiText.ORDERS.TITLE}
          </h1>
          {state.orders && state.orders.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
              {state.orders.length}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {/* SHOW DOWNLOAD BUTTON ONLY IF ORDERS ARE SELECTED */}
          {state.selectedOrders.length > 0 && (
            <button
              onClick={handleBulkDownload}
              disabled={state.isDownloading}
              className="flex items-center gap-2 font-semibold text-theme-body-sm bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Printer size={16} />
              {state.isDownloading
                ? UiText.ORDERS.DOWNLOADING
                : `${UiText.ORDERS.PRINT_INVOICES} (${state.selectedOrders.length})`}
            </button>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center">
          <select
            name=""
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            id=""
            onChange={(e) => dispatch({ type: ActionType.SET_ORDER_STATUS, payload: e.target.value as OrderStatusType })}
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
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            value={state.sortBy}
            onChange={(e) => dispatch({ type: ActionType.SET_SORT_BY, payload: e.target.value })}
            name="sort_by"
          >
            <option value="desc">{UiText.ORDERS.NEWEST_FIRST}</option>
            <option value="asc">{UiText.ORDERS.OLDEST_FIRST}</option>
          </select>
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
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
                  className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {state.loading ? (
              <TableRowSkeleton columns={9} rows={5} />
            ) : state.error ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-16 text-center text-theme-body-sm"
                >
                  <p className="text-red-500 font-semibold mb-3">⚠️ {state.error}</p>
                  <button
                    onClick={() => getOrderList()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm font-medium cursor-pointer"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : state.orders && state.orders?.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-16 text-center text-gray-400 text-theme-body-sm"
                >
                  <Package size={36} className="mx-auto mb-3 opacity-30" />
                  {UiText.ORDERS.NO_ORDERS}
                </td>
              </tr>
            ) : (
              state.orders &&
              state.orders?.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                      checked={state.selectedOrders.includes(item.id)}
                      onChange={() => dispatch({ type: ActionType.TOGGLE_ORDER_SELECTION, payload: item.id })}
                    />
                  </td>

                  {/* ORDER ID */}
                  <td className="p-4">
                    <span className="font-mono text-theme-body-sm font-semibold text-gray-800">
                      #{item.id.split("-")[0].toUpperCase()}
                    </span>
                  </td>

                  {/* TOTAL AMOUNT */}
                  <td className="p-4">
                    <span className="font-semibold text-gray-800">
                      ₹{Number(item.total_amount).toLocaleString()}
                    </span>
                  </td>

                  {/* QTY */}
                  <td className="p-4 text-gray-600 text-theme-body-sm">
                    {item.items?.reduce(
                      (total, cur) => total + cur.quantity,
                      0,
                    ) ?? 0}
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    {getStatusBadges(
                      item.items.map((x) =>
                        x.return_request
                          ? x.return_request.type
                          : x.order_status,
                      ),
                    )}
                  </td>

                  {/* CUSTOMER */}
                  <td className="p-4 text-theme-body-sm text-gray-700 font-medium whitespace-nowrap">
                    {item.address?.name || UiText.ORDERS.NA}
                  </td>

                  {/* PAYMENT */}
                  <td className="p-4">
                    {getPaymentBadge(
                      item.payment?.payment_method,
                      item.payment?.payment_status,
                    )}
                  </td>

                  {/* LOCATION */}
                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap max-w-[200px] truncate">
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
                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("en-GB")}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <Link
                      href={`orders/${item.id}`}
                      className="text-theme-caption font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {UiText.ORDERS.VIEW_ARROW}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <span className="flex justify-end mt-4">
        <Pagination
          setCount={(val) => dispatch({ type: ActionType.SET_CURRENT_PAGE, payload: typeof val === 'function' ? val(state.currentPage) : val })}
          count={state.currentPage}
          totalPages={state.totalPages}
          style="relative right-0 w-54"
        />
      </span>
    </main>
  );
}
