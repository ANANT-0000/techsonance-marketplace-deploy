"use client";
// @ts-ignore
import "./index.css";
import { Pagination } from "@/components/common/Pagination";
import { useEffect, useState, useReducer } from "react";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  Clock,
  Package,
  ArrowUpRight,
  Printer,
} from "lucide-react";
import {
  fetchBulkInvoiceUrls,
  fetchLowStockAlerts,
  fetchTopProducts,
  fetchVendorActiveProducts,
  fetchVendorOrderList,
  fetchVendorPendingOrders,
} from "@/utils/vendorApiClient";
import {
  OrderStatus as OrderStatusType,
  OrderStatusEnum,
  ReturnType,
} from "@/utils/Types";
import { redirect, useRouter } from "next/navigation";
import { authToken } from "@/utils/authToken";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchRevenueAnalytics } from "@/utils/vendorApiClient";
import AxiosAPI from "@/lib/axios";
import {
  TableRowSkeleton,
  MetricsSkeleton,
} from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { UiText } from "@/constants/ui-text";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { stopPageLoading } from "@/lib/features/pageLoading";

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
  order_status: string;
  return_request?: {
    type: string;
  };
}

interface OrderType {
  id: string;
  total_amount: string;
  order_status: string;
  created_at: string;
  items: OrderItemType[];
  address: OrderAddressType;
  payment: OrderPaymentType;
}

export const orderTableHeader = [
  "Order ID",
  "Total Amount",
  "Qty",
  "Status",
  "Customer",
  "Payment",
  "Location",
  "Date",
  "Actions",
];

const getStatusBadges = (statuses: string | string[]) => {
  const statusArray = (Array.isArray(statuses) ? statuses : [statuses]).filter(
    Boolean,
  );
  const uniqueStatuses = Array.from(
    new Set(statusArray.map((s) => s.toLowerCase())),
  );
  const renderBadge = (status: string, index: number) => {
    switch (status) {
      case OrderStatusEnum.PENDING:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● Pending
          </span>
        );
      case OrderStatusEnum.DELIVERED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● Delivered
          </span>
        );
      case "active":
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● Active
          </span>
        );
      case OrderStatusEnum.CANCELLED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize"
          >
            ● {status}
          </span>
        );
      case OrderStatusEnum.SHIPPED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 py-1 px-3 rounded-full text-theme-caption font-semibold"
          >
            ● Shipped
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
      {method || "N/A"}
    </span>
  );
};

export const exportAnalyticsCsv = async (token: string) => {
  return await AxiosAPI.get(`/v1/orders/analytics/export`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
};

export enum DashboardActionType {
  SET_RECENT_ORDERS = "SET_RECENT_ORDERS",
  SET_LOADING_RECENT_ORDERS = "SET_LOADING_RECENT_ORDERS",
  SET_CURRENT_PAGE = "SET_CURRENT_PAGE",
  SET_METRICS = "SET_METRICS",
  SET_LOADING_METRICS = "SET_LOADING_METRICS",
  SET_REVENUE_ANALYTICS = "SET_REVENUE_ANALYTICS",
  SET_LOADING_CHART = "SET_LOADING_CHART",
  SET_TOP_PRODUCTS = "SET_TOP_PRODUCTS",
  SET_LOADING_PRODUCTS = "SET_LOADING_PRODUCTS",
  TOGGLE_ORDER_SELECTION = "TOGGLE_ORDER_SELECTION",
  TOGGLE_ALL_ORDERS = "TOGGLE_ALL_ORDERS",
  SET_SELECTED_ORDERS = "SET_SELECTED_ORDERS",
  SET_IS_DOWNLOADING = "SET_IS_DOWNLOADING",
}

export interface DashboardState {
  recentOrders: OrderType[];
  loadingRecentOrders: boolean;
  totalPages: number;
  currentPage: number;
  totalRevenue: number;
  pendingOrders: number;
  activeProducts: number;
  lowStock: number;
  topProducts: any[];
  chartData: any[];
  selectedOrders: string[];
  isDownloading: boolean;
  isLoadingMetrics: boolean;
  isLoadingChart: boolean;
  isLoadingProducts: boolean;
}

export type DashboardAction =
  | {
      type: DashboardActionType.SET_RECENT_ORDERS;
      payload: { orders: OrderType[]; totalPages: number };
    }
  | { type: DashboardActionType.SET_LOADING_RECENT_ORDERS; payload: boolean }
  | { type: DashboardActionType.SET_CURRENT_PAGE; payload: number }
  | {
      type: DashboardActionType.SET_METRICS;
      payload: {
        pendingOrders: number;
        activeProducts: number;
        lowStock: number;
      };
    }
  | { type: DashboardActionType.SET_LOADING_METRICS; payload: boolean }
  | {
      type: DashboardActionType.SET_REVENUE_ANALYTICS;
      payload: { chartData: any[]; totalRevenue: number };
    }
  | { type: DashboardActionType.SET_LOADING_CHART; payload: boolean }
  | { type: DashboardActionType.SET_TOP_PRODUCTS; payload: any[] }
  | { type: DashboardActionType.SET_LOADING_PRODUCTS; payload: boolean }
  | { type: DashboardActionType.TOGGLE_ORDER_SELECTION; payload: string }
  | { type: DashboardActionType.TOGGLE_ALL_ORDERS; payload: boolean }
  | { type: DashboardActionType.SET_SELECTED_ORDERS; payload: string[] }
  | { type: DashboardActionType.SET_IS_DOWNLOADING; payload: boolean };

export const initialDashboardState: DashboardState = {
  recentOrders: [],
  loadingRecentOrders: false,
  totalPages: 1,
  currentPage: 1,
  totalRevenue: 0,
  pendingOrders: 0,
  activeProducts: 0,
  lowStock: 0,
  topProducts: [],
  chartData: [],
  selectedOrders: [],
  isDownloading: false,
  isLoadingMetrics: true,
  isLoadingChart: true,
  isLoadingProducts: true,
};

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case DashboardActionType.SET_RECENT_ORDERS:
      return {
        ...state,
        recentOrders: action.payload.orders,
        totalPages: action.payload.totalPages,
      };
    case DashboardActionType.SET_LOADING_RECENT_ORDERS:
      return { ...state, loadingRecentOrders: action.payload };
    case DashboardActionType.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case DashboardActionType.SET_METRICS:
      return {
        ...state,
        pendingOrders: action.payload.pendingOrders,
        activeProducts: action.payload.activeProducts,
        lowStock: action.payload.lowStock,
      };
    case DashboardActionType.SET_LOADING_METRICS:
      return { ...state, isLoadingMetrics: action.payload };
    case DashboardActionType.SET_REVENUE_ANALYTICS:
      return {
        ...state,
        chartData: action.payload.chartData,
        totalRevenue: action.payload.totalRevenue,
      };
    case DashboardActionType.SET_LOADING_CHART:
      return { ...state, isLoadingChart: action.payload };
    case DashboardActionType.SET_TOP_PRODUCTS:
      return { ...state, topProducts: action.payload };
    case DashboardActionType.SET_LOADING_PRODUCTS:
      return { ...state, isLoadingProducts: action.payload };
    case DashboardActionType.TOGGLE_ORDER_SELECTION: {
      const orderId = action.payload;
      const selected = state.selectedOrders.includes(orderId)
        ? state.selectedOrders.filter((id) => id !== orderId)
        : [...state.selectedOrders, orderId];
      return { ...state, selectedOrders: selected };
    }
    case DashboardActionType.TOGGLE_ALL_ORDERS:
      return {
        ...state,
        selectedOrders: action.payload
          ? state.recentOrders.map((o) => o.id)
          : [],
      };
    case DashboardActionType.SET_SELECTED_ORDERS:
      return { ...state, selectedOrders: action.payload };
    case DashboardActionType.SET_IS_DOWNLOADING:
      return { ...state, isDownloading: action.payload };
    default:
      return state;
  }
}

export default function DashboardPage() {
  const [state, reducerDispatch] = useReducer(
    dashboardReducer,
    initialDashboardState,
  );
  const dispatch = useAppDispatch();
  const {
    recentOrders,
    loadingRecentOrders,
    totalPages,
    currentPage,
    totalRevenue,
    pendingOrders,
    activeProducts,
    lowStock,
    topProducts,
    chartData,
    selectedOrders,
    isDownloading,
    isLoadingMetrics,
    isLoadingChart,
    isLoadingProducts,
  } = state;

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const revenueGrowth = 0;
  const router = useRouter();
  const token = authToken();

  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    const nextPage = typeof page === "function" ? page(currentPage) : page;
    reducerDispatch({
      type: DashboardActionType.SET_CURRENT_PAGE,
      payload: nextPage,
    });
  };

  const loadData = async (token: string) => {
    reducerDispatch({
      type: DashboardActionType.SET_LOADING_RECENT_ORDERS,
      payload: true,
    });
    await fetchVendorOrderList(
      offset,
      itemsPerPage,
      token,
      OrderStatusEnum.PROCESSING,
    )
      .then((res) => {
        reducerDispatch({
          type: DashboardActionType.SET_RECENT_ORDERS,
          payload: {
            orders: res.data.orders,
            totalPages: Math.ceil(res.data.totalCount / itemsPerPage),
          },
        });
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_RECENT_ORDERS,
          payload: false,
        });
      })
      .catch((err) => {
        console.error("Failed to load recent orders:", err);
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_RECENT_ORDERS,
          payload: false,
        });
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_RECENT_ORDERS,
          payload: false,
        });
      });

    reducerDispatch({
      type: DashboardActionType.SET_LOADING_METRICS,
      payload: true,
    });
    Promise.all([
      fetchVendorPendingOrders(token),
      fetchVendorActiveProducts(token),
      fetchLowStockAlerts(token),
    ])
      .then(([pending, active, stock]) => {
        reducerDispatch({
          type: DashboardActionType.SET_METRICS,
          payload: {
            pendingOrders: pending.data?.length || 0,
            activeProducts: active.data?.length || 0,
            lowStock: stock.data?.length || 0,
          },
        });
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_METRICS,
          payload: false,
        });
      })
      .catch(() => {
        dispatch(stopPageLoading());
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_METRICS,
          payload: false,
        });
      });

    reducerDispatch({
      type: DashboardActionType.SET_LOADING_CHART,
      payload: true,
    });
    fetchRevenueAnalytics(token, 30)
      .then((res) => {
        reducerDispatch({
          type: DashboardActionType.SET_REVENUE_ANALYTICS,
          payload: {
            chartData: res.data?.chartData || [],
            totalRevenue: res.data?.totalRevenue || 0,
          },
        });
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_CHART,
          payload: false,
        });
      })
      .catch(() => {
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_CHART,
          payload: false,
        });
      });

    reducerDispatch({
      type: DashboardActionType.SET_LOADING_PRODUCTS,
      payload: true,
    });
    fetchTopProducts(token)
      .then((res) => {
        reducerDispatch({
          type: DashboardActionType.SET_TOP_PRODUCTS,
          payload: res.data || [],
        });
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_PRODUCTS,
          payload: false,
        });
      })
      .catch(() => {
        reducerDispatch({
          type: DashboardActionType.SET_LOADING_PRODUCTS,
          payload: false,
        });
      });
  };

  useEffect(() => {
    if (!token) {
      router.replace("/auth/vendorLogin");
      return;
    }
    dispatch(stopPageLoading());
    loadData(token);
  }, [token, currentPage]);

  const handleOrderFilter = async (orderStatus: OrderStatusType) => {
    if (token) {
      await fetchVendorOrderList(offset, itemsPerPage, token, orderStatus)
        .then((res) => {
          reducerDispatch({
            type: DashboardActionType.SET_RECENT_ORDERS,
            payload: {
              orders: res.data.orders,
              totalPages: Math.ceil(res.data.totalCount / itemsPerPage),
            },
          });
        })
        .catch((err) => {
          console.error("Failed to load metrics:", err);
          reducerDispatch({
            type: DashboardActionType.SET_LOADING_METRICS,
            payload: false,
          });
        });
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    reducerDispatch({
      type: DashboardActionType.TOGGLE_ORDER_SELECTION,
      payload: orderId,
    });
  };

  const toggleAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    reducerDispatch({
      type: DashboardActionType.TOGGLE_ALL_ORDERS,
      payload: e.target.checked,
    });
  };

  const handleBulkDownload = async () => {
    if (selectedOrders.length === 0) return;
    reducerDispatch({
      type: DashboardActionType.SET_IS_DOWNLOADING,
      payload: true,
    });

    try {
      const res = await fetchBulkInvoiceUrls(selectedOrders, token as string);
      const invoices = res.data;

      if (!invoices || invoices.length === 0) {
        alert(UiText.DASHBOARD.INVOICES_NOT_FOUND);
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

      reducerDispatch({
        type: DashboardActionType.SET_SELECTED_ORDERS,
        payload: [],
      });
    } catch {
      alert(UiText.DASHBOARD.INVOICES_FAILED);
    } finally {
      reducerDispatch({
        type: DashboardActionType.SET_IS_DOWNLOADING,
        payload: false,
      });
    }
  };

  return (
    <>
      <main className="px-2 overflow-y-scroll h-screen">
        <span id="analytics-report-container">
          {isLoadingMetrics ? (
            <MetricsSkeleton
              count={3}
              style="my-6 flex justify-between "
              subStyle="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {/* Total Revenue */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-theme-caption font-semibold text-gray-400 uppercase tracking-wider">
                    {UiText.DASHBOARD.TOTAL_REVENUE}
                  </span>
                  <span className="text-theme-h4 font-bold text-gray-800 mt-1">
                    ₹{formatCurrency(totalRevenue)}
                  </span>
                  <span className="flex items-center gap-1 text-theme-caption font-medium text-emerald-600 mt-1">
                    <TrendingUp size={13} />
                    {revenueGrowth}% {UiText.DASHBOARD.VS_LAST_MONTH}
                  </span>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-theme-caption font-semibold text-gray-400 uppercase tracking-wider">
                    {UiText.DASHBOARD.PENDING_ORDERS}
                  </span>
                  <span className="text-theme-h4 font-bold text-gray-800 mt-1">
                    {formatNumber(pendingOrders)}
                  </span>
                  <span className="text-theme-caption text-amber-600 font-medium mt-1">
                    {UiText.DASHBOARD.IMMEDIATE_SHIPPING_REQUIRED}
                  </span>
                </div>
                <span className="bg-amber-50 p-3 rounded-xl">
                  <Clock size={20} className="text-amber-500" />
                </span>
              </div>

              {/* Active Products */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-theme-caption font-semibold text-gray-400 uppercase tracking-wider">
                    {UiText.DASHBOARD.ACTIVE_PRODUCTS}
                  </span>
                  <span className="text-theme-h4 font-bold text-gray-800 mt-1">
                    {formatNumber(activeProducts)}
                  </span>
                  <span className="text-theme-caption text-red-500 font-medium mt-1">
                    {lowStock} {UiText.DASHBOARD.LOW_STOCK_WARNING}
                  </span>
                </div>
                <span className="bg-blue-50 p-3 rounded-xl">
                  <Package size={20} className="text-blue-500" />
                </span>
              </div>
            </div>
          )}

          {/* Revenue Chart Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 my-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-theme-h6 text-gray-800">
                  {UiText.DASHBOARD.REVENUE_OVERVIEW}
                </h2>
                <p className="text-theme-caption text-gray-500">
                  {UiText.DASHBOARD.LAST_30_DAYS}
                </p>
              </div>
            </div>
            {isLoadingChart ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData && chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      tickFormatter={(value) => `₹${value}`}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [`₹${value}`, "Revenue"]}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-theme-body-sm">
                {UiText.DASHBOARD.NOT_ENOUGH_DATA}
              </div>
            )}
          </div>

          {/* Top Selling Products Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 my-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-theme-h6 text-gray-800">
                {UiText.DASHBOARD.TOP_PERFORMING_PRODUCTS}
              </h2>
            </div>

            <div className="space-y-4">
              {isLoadingProducts ? (
                <div>
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topProducts && topProducts.length > 0 ? (
                topProducts.map((product, idx) => (
                  <div
                    key={product.variant_id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-theme-body-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-theme-body-sm">
                          {product.variant_name}
                        </p>
                        <p className="text-theme-caption text-gray-500">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₹{product.revenue.toLocaleString()}
                      </p>
                      <p className="text-theme-caption text-emerald-600 font-medium">
                        {product.total_sold} units sold
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-theme-body-sm">
                  {UiText.DASHBOARD.NO_SALES_DATA}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden my-6">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-theme-h6 text-gray-800">
                {UiText.DASHBOARD.RECENT_ORDERS}
              </h2>
              <span className="flex gap-4 items-center justify-between">
                {selectedOrders.length > 0 && (
                  <button
                    onClick={handleBulkDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 font-semibold text-theme-body-sm bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Printer size={16} />
                    {isDownloading
                      ? UiText.DASHBOARD.DOWNLOADING
                      : `${UiText.DASHBOARD.PRINT_INVOICES} (${selectedOrders.length})`}
                  </button>
                )}
                <select
                  name=""
                  className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
                  id=""
                  onChange={(e) =>
                    handleOrderFilter(e.target.value as OrderStatusType)
                  }
                >
                  <option value="">{UiText.DASHBOARD.SELECT_STATUS}</option>
                  {Object.values(OrderStatusEnum).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => router.push(`/vendor/orders`)}
                  className="flex items-center gap-1 text-theme-body-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {UiText.DASHBOARD.VIEW_ALL} <ArrowUpRight size={15} />
                </button>
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
                          recentOrders?.length > 0 &&
                          selectedOrders.length === recentOrders.length
                        }
                        onChange={toggleAllOrders}
                      />
                    </th>
                    {orderTableHeader.map((header) => (
                      <th
                        key={header}
                        className="p-4 text-theme-caption Rent-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingRecentOrders ? (
                    <TableRowSkeleton columns={9} rows={5} />
                  ) : Array.isArray(recentOrders) &&
                    recentOrders.length <= 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-16 text-center text-gray-400 text-theme-body-sm"
                      >
                        <Package
                          size={36}
                          className="mx-auto mb-3 opacity-30"
                        />
                        {UiText.DASHBOARD.NO_ORDERS_FOUND}
                      </td>
                    </tr>
                  ) : (
                    Array.isArray(recentOrders) &&
                    recentOrders.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                            checked={selectedOrders.includes(item.id)}
                            onChange={() => toggleOrderSelection(item.id)}
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
                          {item.address?.name || "N/A"}
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
                            .join(", ") || "N/A"}
                        </td>

                        {/* DATE */}
                        <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4">
                          <Link
                            href={`/vendor/orders/${item.id}`}
                            className="text-theme-caption font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            {UiText.DASHBOARD.VIEW_ARROW}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {Array.isArray(recentOrders) && recentOrders.length > 0 && (
            <span className="flex justify-end mt-2 mb-6">
              <Pagination
                setCount={setCurrentPage}
                count={currentPage}
                totalPages={totalPages}
                style="relative right-0 w-54"
              />
            </span>
          )}
        </span>
      </main>
    </>
  );
}
