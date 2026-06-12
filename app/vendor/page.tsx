'use client';
// @ts-ignore
import './index.css';
import { Pagination } from "@/components/common/Pagination";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, Clock, Package, ArrowUpRight, Printer, FileText } from "lucide-react";
import { fetchBulkInvoiceUrls, fetchLowStockAlerts, fetchTopProducts, fetchVendorActiveProducts, fetchVendorOrderList, fetchVendorPendingOrders } from '@/utils/vendorApiClient';
import { OrderStatus as OrderStatusType, OrderStatusEnum } from '@/utils/Types';
import { redirect, useRouter } from 'next/navigation';
import { authToken } from '@/utils/authToken';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchRevenueAnalytics } from '@/utils/vendorApiClient';
import AxiosAPI from '@/lib/axios';
import { exportDashboardToPDF } from '@/lib/exportPdf';
import { ListSkeleton, MetricsSkeleton, TableRowSkeleton } from '@/components/common/skeletons';
import { set } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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
"Actions"];

const getStatusBadges = (statuses: string | string[]) => {
  const statusArray = (Array.isArray(statuses) ? statuses : [statuses]).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(statusArray.map((s) => s.toLowerCase())));
  const renderBadge = (status: string, index: number) => {
    switch (status) {
      case "pending":
        return <span key={index} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">● Pending</span>;
      case "delivered":
        return <span key={index} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">● Delivered</span>;
      case "active":
        return <span key={index} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-xs font-semibold">● Active</span>;
      case "cancelled":
        return <span key={index} className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">● {status}</span>;
      case "shipped":
        return <span key={index} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 py-1 px-3 rounded-full text-xs font-semibold">● Shipped</span>;
      case "return":
      case "replacement":
        return <span key={index} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">● {status}</span>;
      default:
        return <span key={index} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">● {status}</span>;
    }
  };

  if (uniqueStatuses.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
            {uniqueStatuses.map((status, index) => renderBadge(status, index))}
        </div>);

};

const getPaymentBadge = (method: string, status: string) => {
  const isPaid = status === "Paid" || status === "success";
  return (
    <span className={`inline-flex items-center py-1 px-3 rounded-full text-xs font-semibold border ${isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {method || "N/A"}
        </span>);

};
export const exportAnalyticsCsv = async (token: string) => {
  return await AxiosAPI.get(`/v1/orders/analytics/export`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob' // Critical for file downloads
  });
};

export default function DashboardPage() {
  const [count, setCount] = useState(1);
  const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * itemsPerPage;
  const [totalRecentOrders, setTotalRecentOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [lowStock, setLowStock] = useState(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartData, setChartData] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const router = useRouter();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const token = authToken();
  // Granular Loading States
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingRecentOrders, setIsLoadingRecentOrders] = useState(true);
  const loadData = async (token: string) => {
    setLoadingRecentOrders(true);
    await fetchVendorOrderList(offset, itemsPerPage, token, OrderStatusEnum.PROCESSING).
    then((res) => {
      setRecentOrders(res.data.orders);
      setTotalRecentOrders(res.data.totalCount);
      setTotalPages(Math.ceil(res.data.totalCount / itemsPerPage));
      setLoadingRecentOrders(false);
    }).
    catch((err) => {
      void 0;
    });
    setIsLoadingMetrics(true);
    Promise.all([
    fetchVendorPendingOrders(token),
    fetchVendorActiveProducts(token),
    fetchLowStockAlerts(token)]
    ).then(([pending, active, stock]) => {
      setPendingOrders(pending.data?.length || 0);
      setActiveProducts(active.data?.length || 0);
      setLowStock(stock.data?.length || 0);
      setIsLoadingMetrics(false);
    }).catch(console.error);

    // 2. Fetch Chart Data
    setIsLoadingChart(true);
    fetchRevenueAnalytics(token, 30).then((res) => {
      setChartData(res.data?.chartData || []);
      setTotalRevenue(res.data?.totalRevenue || 0);
      setIsLoadingChart(false);
    }).catch(console.error);

    // 3. Fetch Top Products
    setIsLoadingProducts(true);
    fetchTopProducts(token).then((res) => {
      setTopProducts(res.data || []);
      setIsLoadingProducts(false);
    }).catch(console.error);
  };
  useEffect(() => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    loadData(token);
  }, []);
  const handleOrderFilter = async (orderStatus: OrderStatusType) => {
    if (token) {

      await fetchVendorOrderList(offset, itemsPerPage, token, orderStatus).
      then((res) => {
        setRecentOrders(res.data.orders);
        setTotalRecentOrders(res.data.totalCount);
      }).
      catch((err) => {
        void 0;
      });
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
    prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && recentOrders) {
      setSelectedOrders(recentOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // --- THE DOWNLOAD LOOP ---
  const handleBulkDownload = async () => {
    if (selectedOrders.length === 0) return;
    setIsDownloading(true);

    try {
      // 1. Get the Cloudinary URLs from Backend
      const res = await fetchBulkInvoiceUrls(selectedOrders, token as string);
      void 0;const invoices = res.data;

      if (!invoices || invoices.length === 0) {
        alert("No generated invoices found for these orders yet.");
        return;
      }

      // 2. Loop through the URLs and force download
      for (const invoice of invoices) {
        if (invoice.invoice_url) {
          // Fetching the blob forces a direct download rather than opening in a new tab
          const response = await fetch(invoice.invoice_url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `Invoice_${invoice.invoice_number}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();

          // Small delay to prevent browser from blocking multiple rapid downloads
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      setSelectedOrders([]); // Clear selection on success
    } catch (error) {
      void 0;
      alert("Failed to download invoices.");
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <>
            {/* <Navbar title="Dashboard" /> */}
            <main className="px-2">
                <span id='analytics-report-container'>
                    {/* Stats Cards */}
                    {isLoadingMetrics ?
          <MetricsSkeleton count={3} style='my-6 flex justify-between ' subStyle='bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow' /> :

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                                {/* Total Revenue */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
                                        <span className="text-2xl font-bold text-gray-800 mt-1">
                                            ₹{formatCurrency(totalRevenue)}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-1">
                                            <TrendingUp size={13} />
                                            {revenueGrowth}% vs last month
                                        </span>
                                    </div>
                                    {/* <span className="bg-emerald-50 p-3 rounded-xl">
                <TrendingUp size={20} className="text-emerald-500" />
                </span> */}
                                </div>

                                {/* Pending Orders */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Orders</span>
                                        <span className="text-2xl font-bold text-gray-800 mt-1">
                                            {formatNumber(pendingOrders)}
                                        </span>
                                        <span className="text-xs text-amber-600 font-medium mt-1">Requires immediate shipping</span>
                                    </div>
                                    <span className="bg-amber-50 p-3 rounded-xl">
                                        <Clock size={20} className="text-amber-500" />
                                    </span>
                                </div>

                                {/* Active Products */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Products</span>
                                        <span className="text-2xl font-bold text-gray-800 mt-1">
                                            {formatNumber(activeProducts)}
                                        </span>
                                        <span className="text-xs text-red-500 font-medium mt-1">
                                            {lowStock} products low on stock
                                        </span>
                                    </div>
                                    <span className="bg-blue-50 p-3 rounded-xl">
                                        <Package size={20} className="text-blue-500" />
                                    </span>
                                </div>
                            </div>

          }
                    {/* Revenue Chart Section */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 my-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">Revenue Overview</h2>
                                <p className="text-xs text-gray-500">Last 30 Days</p>
                            </div>
                        </div>
                        {isLoadingChart ?
            <Skeleton className="h-64 w-full" /> :

            chartData && chartData.length > 0 ?
            <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    dy={10} />
                  
                                            <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(value) => `₹${value}`} />
                  
                                            <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']} />
                  
                                            <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)" />
                  
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div> :

            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    Not enough data to display chart.
                                </div>
            }

                    </div>
                    {/* Top Selling Products Section */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 my-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg text-gray-800">Top Performing Products</h2>
                        </div>

                        <div className="space-y-4">
                            {isLoadingProducts ? <div>
                                {Array.from({ length: 2 }).map((_, idx) =>
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
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
                )

                }
                            </div> :

              topProducts && topProducts.length > 0 ? topProducts.map((product, idx) =>
              <div key={product.variant_id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                #{idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{product.variant_name}</p>
                                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">₹{product.revenue.toLocaleString()}</p>
                                            <p className="text-xs text-emerald-600 font-medium">{product.total_sold} units sold</p>
                                        </div>
                                    </div>
              ) :
              <div className="text-center py-6 text-gray-400 text-sm">
                                        No sales data available yet.
                                    </div>
              }
                        </div>
                    </div>
                    {/* Recent Orders Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden my-6">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                            <h2 className="font-bold text-lg text-gray-800">Recent Orders</h2>
                            <span className='flex gap-4 items-center justify-between'>

                                {selectedOrders.length > 0 &&
                <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 font-semibold text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm disabled:opacity-50">
                  
                                        <Printer size={16} />
                                        {isDownloading ? "Downloading..." : `Print Invoices (${selectedOrders.length})`}
                                    </button>
                }
                                <select name="" className='text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors' id="" onChange={(e) => handleOrderFilter(e.target.value as OrderStatusType)}>
                                    <option value="">Select Status</option>
                                    {
                  Object.values(OrderStatusEnum).map((status) =>
                  <option key={status} value={status}>{status}</option>
                  )
                  }
                                </select>
                                <button
                  onClick={() => router.push(`/vendor/orders`)}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  
                                    View All <ArrowUpRight size={15} />
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
                        checked={recentOrders?.length > 0 && selectedOrders.length === recentOrders.length}
                        onChange={toggleAllOrders} />
                      
                                        </th>
                                        {orderTableHeader.map((header) =>
                    <th key={header} className="p-4 text-xs Rent-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                    )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingRecentOrders ?

                  <TableRowSkeleton columns={9} rows={5} /> :
                  Array.isArray(recentOrders) && recentOrders.length <= 0 ?
                  <tr>
                                            <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                                <Package size={36} className="mx-auto mb-3 opacity-30" />
                                                No orders found.
                                            </td>
                                        </tr> :

                  Array.isArray(recentOrders) && recentOrders.map((item) =>
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="p-4">
                                                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        checked={selectedOrders.includes(item.id)}
                        onChange={() => toggleOrderSelection(item.id)} />
                      
                                                </td>

                                                {/* ORDER ID */}
                                                <td className="p-4">
                                                    <span className="font-mono text-sm font-semibold text-gray-800">
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
                                                <td className="p-4 text-gray-600 text-sm">
                                                    {item.items?.reduce((total, cur) => total + cur.quantity, 0) ?? 0}
                                                </td>

                                                {/* STATUS */}
                                                <td className="p-4">
                                                    {getStatusBadges(
                        item.items.map((x) => x.return_request ? x.return_request.type : x.order_status)
                      )}
                                                </td>

                                                {/* CUSTOMER */}
                                                <td className="p-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                                                    {item.address?.name || "N/A"}
                                                </td>

                                                {/* PAYMENT */}
                                                <td className="p-4">
                                                    {getPaymentBadge(item.payment?.payment_method, item.payment?.payment_status)}
                                                </td>

                                                {/* LOCATION */}
                                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap max-w-[200px] truncate">
                                                    {[item.address?.city, item.address?.state, item.address?.country, item.address?.postal_code].
                      filter(Boolean).
                      join(", ") || "N/A"}
                                                </td>

                                                {/* DATE */}
                                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(item.created_at).toLocaleDateString("en-GB")}
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="p-4">
                                                    <Link
                        href={`/vendor/orders/${item.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                        
                                                        View →
                                                    </Link>
                                                </td>
                                            </tr>
                  )
                  }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {Array.isArray(recentOrders) && recentOrders.length > 0 && <span className="flex justify-end mt-2 mb-6">
                        <Pagination setCount={setCurrentPage} count={currentPage} totalPages={totalPages} style="relative right-0 w-54" />
                    </span>}
                </span>
            </main>
        </>);

}