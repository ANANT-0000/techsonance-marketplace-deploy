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
  OrderStatus,
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
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { stopPageLoading } from "@/lib/features/pageLoading";
import { useVendorTour } from "@/components/vendor/VendorTourProvider";

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
    const displayStatus = UiText.DASHBOARD.STATUS_LABELS[status.toUpperCase() as keyof typeof UiText.DASHBOARD.STATUS_LABELS] || status;

    switch (status.toLowerCase()) {
      case OrderStatus.PENDING:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-amber-50/80 text-amber-600 py-1 px-3 rounded-full text-[12px] font-medium border border-amber-100/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {displayStatus}
          </span>
        );
      case OrderStatus.DELIVERED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-emerald-50/80 text-emerald-600 py-1 px-3 rounded-full text-[12px] font-medium border border-emerald-100/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {displayStatus}
          </span>
        );
      case "active":
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-indigo-50/80 text-indigo-600 py-1 px-3 rounded-full text-[12px] font-medium border border-indigo-100/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            {displayStatus}
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-rose-50/80 text-rose-600 py-1 px-3 rounded-full text-[12px] font-medium border border-rose-100/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {displayStatus}
          </span>
        );
      case OrderStatus.SHIPPED:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-violet-50/80 text-violet-600 py-1 px-3 rounded-full text-[12px] font-medium border border-violet-100/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
            {displayStatus}
          </span>
        );
      case ReturnType.RETURN:
      case ReturnType.REPLACEMENT:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-fuchsia-50/80 text-fuchsia-600 py-1 px-3 rounded-full text-[12px] font-medium border border-fuchsia-100/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></span>
            {displayStatus}
          </span>
        );
      default:
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 py-1 px-3 rounded-full text-[12px] font-medium border border-slate-100"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {displayStatus}
          </span>
        );
    }
  };

  if (uniqueStatuses.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {uniqueStatuses.map((status, index) => renderBadge(status, index))}
    </div>
  );
};

const getPaymentBadge = (method: string, status: string) => {
  const isPaid = status === "Paid" || status === "success";
  return (
    <span
      className={`inline-flex items-center py-1 px-3 rounded-full text-[12px] font-medium border ${isPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"}`}
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
  loadingRecentOrders: true,
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
  
  const { startVendorTour } = useVendorTour();
  const user = useAppSelector((state) => state.auth.user) as import("@/utils/Types").VendorUser | null;

  useEffect(() => {
    // Only trigger if we have a user and they haven't completed the dashboard tour
    if (user && user.preferences && Array.isArray(user.preferences.completed_tours)) {
      if (!user.preferences.completed_tours.includes("dashboard")) {
        // slight delay to let the UI mount properly
        setTimeout(() => startVendorTour("dashboard"), 500);
      }
    } else if (user && !user.preferences) {
      // If preferences object doesn't exist yet, it means they haven't completed any tours
      setTimeout(() => startVendorTour("dashboard"), 500);
    }
  }, [user, startVendorTour]);

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
      OrderStatus.PROCESSING,
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
      .catch((err) => {
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
      .catch((err) => {
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
      .catch((err) => {
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
      <main className="px-2 overflow-y-scroll h-screen" id="tour-dashboard-welcome">
        <div id="tour-analytics-overview">
          {isLoadingMetrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 flex flex-col justify-between h-[120px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100"
                >
                  <Skeleton className="h-4 w-24 bg-slate-100/80 rounded-full animate-pulse" />
                  <div className="flex justify-between items-end mt-4">
                    <Skeleton className="h-8 w-24 bg-slate-100/80 rounded-xl animate-pulse" />
                    <Skeleton className="h-10 w-10 bg-slate-100/80 rounded-2xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div id="tour-analytics-overview" className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
              {/* Total Revenue */}
              <div className="bg-white rounded-3xl p-6 flex items-start justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 ease-out group">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-slate-500 uppercase tracking-widest">
                    {UiText.DASHBOARD.TOTAL_REVENUE}
                  </span>
                  <span className="text-3xl font-light tracking-tight text-slate-900 mt-1">
                    ₹{formatCurrency(totalRevenue)}
                  </span>
                  <span className="flex items-center gap-1 text-[13px] font-medium text-emerald-600 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                    <TrendingUp size={14} strokeWidth={2.5} />
                    {revenueGrowth}% {UiText.DASHBOARD.VS_LAST_MONTH}
                  </span>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white rounded-3xl p-6 flex items-start justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 ease-out group">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-slate-500 uppercase tracking-widest">
                    {UiText.DASHBOARD.PENDING_ORDERS}
                  </span>
                  <span className="text-3xl font-light tracking-tight text-slate-900 mt-1">
                    {formatNumber(pendingOrders)}
                  </span>
                  <span className="text-[13px] text-amber-600 font-medium mt-2 bg-amber-50 w-fit px-2 py-0.5 rounded-full">
                    {UiText.DASHBOARD.IMMEDIATE_SHIPPING_REQUIRED}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl group-hover:bg-amber-50 group-hover:scale-110 transition-all duration-300 ease-out">
                  <Clock
                    size={22}
                    className="text-slate-400 group-hover:text-amber-500 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Active Products */}
              <div className="bg-white rounded-3xl p-6 flex items-start justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 ease-out group">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-slate-500 uppercase tracking-widest">
                    {UiText.DASHBOARD.ACTIVE_PRODUCTS}
                  </span>
                  <span className="text-3xl font-light tracking-tight text-slate-900 mt-1">
                    {formatNumber(activeProducts)}
                  </span>
                  <span className="text-[13px] text-rose-500 font-medium mt-2 bg-rose-50 w-fit px-2 py-0.5 rounded-full">
                    {lowStock} {UiText.DASHBOARD.LOW_STOCK_WARNING}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl group-hover:bg-indigo-50 group-hover:scale-110 transition-all duration-300 ease-out">
                  <Package
                    size={22}
                    className="text-slate-400 group-hover:text-indigo-500 transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Chart Section */}
          <div id="tour-revenue-chart" className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 p-8 my-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                  {UiText.DASHBOARD.REVENUE_OVERVIEW}
                </h2>
                <p className="text-[13px] font-medium text-slate-500 mt-1">
                  {UiText.DASHBOARD.LAST_30_DAYS}
                </p>
              </div>
            </div>
            {isLoadingChart ? (
              <div className="h-[300px] w-full flex flex-col gap-4 relative z-10">
                <Skeleton className="h-[250px] w-full bg-slate-100/80 rounded-2xl animate-pulse" />
                <div className="flex justify-between px-4">
                  <Skeleton className="h-3 w-12 bg-slate-100/80 rounded-full animate-pulse" />
                  <Skeleton className="h-3 w-12 bg-slate-100/80 rounded-full animate-pulse" />
                  <Skeleton className="h-3 w-12 bg-slate-100/80 rounded-full animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="relative h-[300px] w-full z-10">
                {(!chartData || chartData.length === 0) && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-indigo-50/80 backdrop-blur-sm border border-indigo-100/50 px-4 py-2 rounded-xl shadow-sm">
                    <TrendingUp
                      className="w-4 h-4 text-indigo-500"
                      strokeWidth={2}
                    />
                    <p className="text-[13px] font-medium text-indigo-700">
                      Analytics will appear after your first sale
                    </p>
                  </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      !chartData || chartData.length === 0
                        ? Array.from({ length: 7 }).map((_, i) => ({
                            date: `Day ${i + 1}`,
                            revenue: 0,
                          }))
                        : chartData
                    }
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                          stopColor="#6366f1"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                      tickFormatter={(value) => `₹${value}`}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 10px 40px -10px rgb(0 0 0 / 0.1)",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(8px)",
                      }}
                      formatter={(value: number) => [`₹${value}`, "Revenue"]}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{
                        r: 6,
                        fill: "#6366f1",
                        stroke: "#fff",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Selling Products Section */}
          <div id="tour-top-products" className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 p-8 my-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                {UiText.DASHBOARD.TOP_PERFORMING_PRODUCTS}
              </h2>
            </div>

            <div className="space-y-3">
              {isLoadingProducts ? (
                <div>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl mb-3 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 bg-slate-100/80 rounded-full animate-pulse" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 bg-slate-100/80 rounded-full animate-pulse" />
                          <Skeleton className="h-3 w-20 bg-slate-100/80 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end space-y-2">
                        <Skeleton className="h-4 w-16 bg-slate-100/80 rounded-full animate-pulse" />
                        <Skeleton className="h-5 w-20 bg-slate-100/80 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topProducts && topProducts.length > 0 ? (
                topProducts.map((product, idx) => (
                  <div
                    key={product.variant_id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out bg-white group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 rounded-full flex items-center justify-center font-medium text-sm transition-colors duration-300">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {product.variant_name}
                        </p>
                        <p className="text-[13px] text-slate-500 mt-0.5">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        ₹{product.revenue.toLocaleString()}
                      </p>
                      <p className="text-[13px] text-emerald-600 font-medium mt-0.5 bg-emerald-50 w-fit px-2 py-0.5 rounded-full ml-auto">
                        {product.total_sold} units sold
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Package
                      className="w-6 h-6 text-slate-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 mb-1">
                    No products performing yet
                  </h3>
                  <p className="text-[13px] text-slate-500 max-w-sm mx-auto text-balance">
                    When your products start selling, your top performers will
                    be ranked here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders Table */}
          <div id="tour-recent-orders" className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden my-8">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                {UiText.DASHBOARD.RECENT_ORDERS}
              </h2>
              <span className="flex gap-4 items-center justify-between">
                {selectedOrders.length > 0 && (
                  <button
                    onClick={handleBulkDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 font-medium text-[13px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                  >
                    <Printer size={16} />
                    {isDownloading
                      ? UiText.DASHBOARD.DOWNLOADING
                      : `${UiText.DASHBOARD.PRINT_INVOICES} (${selectedOrders.length})`}
                  </button>
                )}
                <select
                  name=""
                  className="text-[13px] font-medium border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 cursor-pointer transition-all shadow-sm"
                  id=""
                  onChange={(e) =>
                    handleOrderFilter(e.target.value as OrderStatusType)
                  }
                >
                  <option value="">{UiText.DASHBOARD.SELECT_STATUS}</option>
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>
                      {UiText.DASHBOARD.STATUS_LABELS[status.toUpperCase() as keyof typeof UiText.DASHBOARD.STATUS_LABELS] || status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => router.push(`/vendor/orders`)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors ml-2"
                >
                  {UiText.DASHBOARD.VIEW_ALL}{" "}
                  <ArrowUpRight size={15} strokeWidth={2} />
                </button>
              </span>
            </div>

            <div className="w-full overflow-x-auto bg-white px-2 pb-2">
              <table className="w-full table-auto min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="p-4 pl-6 w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
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
                        className="p-4 text-[12px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingRecentOrders ? (
                    Array.from({ length: 5 }).map((_, i) => (
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
                    ))
                  ) : Array.isArray(recentOrders) &&
                    recentOrders.length <= 0 ? (
                    <tr>
                      <td colSpan={10} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="h-14 w-14 bg-slate-50 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-full flex items-center justify-center mb-5">
                            <Package
                              size={24}
                              className="text-slate-400"
                              strokeWidth={1.5}
                            />
                          </div>
                          <h3 className="text-sm font-medium text-slate-900 mb-1.5">
                            No orders found
                          </h3>
                          <p className="text-[13px] text-slate-500 mb-6 text-balance">
                            You don't have any orders matching your criteria.
                            Try adjusting the status filter or wait for new
                            customers.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    Array.isArray(recentOrders) &&
                    recentOrders.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="p-4 pl-6">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer transition-colors"
                            checked={selectedOrders.includes(item.id)}
                            onChange={() => toggleOrderSelection(item.id)}
                          />
                        </td>

                        {/* ORDER ID */}
                        <td className="p-4">
                          <span className="font-medium text-[13px] text-slate-900 tracking-wide">
                            #{item.id.split("-")[0].toUpperCase()}
                          </span>
                        </td>

                        {/* TOTAL AMOUNT */}
                        <td className="p-4">
                          <span className="font-medium text-slate-700">
                            ₹{Number(item.total_amount).toLocaleString()}
                          </span>
                        </td>

                        {/* QTY */}
                        <td className="p-4 text-slate-600 text-[13px] font-medium">
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
                        <td className="p-4 text-[13px] text-slate-700 font-medium whitespace-nowrap">
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
                        <td className="p-4 text-[13px] text-slate-500 whitespace-nowrap max-w-[200px] truncate">
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
                        <td className="p-4 text-[13px] text-slate-500 whitespace-nowrap font-medium">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4">
                          <Link
                            href={`/vendor/orders/${item.id}`}
                            className="inline-flex items-center justify-center text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
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
      </main>
    </>
  );
}
