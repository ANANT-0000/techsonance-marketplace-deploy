'use client';
// @ts-ignore
import './index.css';
import Navbar from "@/components/vendor/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, Clock, Package, ArrowUpRight, Printer } from "lucide-react";
import { fetchBulkInvoiceUrls, fetchVendorActiveProducts, fetchVendorOrderList, fetchVendorPendingOrders } from '@/utils/vendorApiClient';
import { OrderStatus as OrderStatusType, OrderStatusEnum } from '@/utils/Types';
import { redirect, useParams, useRouter } from 'next/navigation';
import { authToken } from '@/utils/authToken';


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
        type: string
    }
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
    "Actions"
]
const getStatusBadges = (statuses: string | string[]) => {
    const statusArray = (Array.isArray(statuses) ? statuses : [statuses]).filter(Boolean);
    const uniqueStatuses = Array.from(new Set(statusArray.map(s => s.toLowerCase())));
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
        </div>
    );
};

const getPaymentBadge = (method: string, status: string) => {
    const isPaid = status === "Paid" || status === "success";
    return (
        <span className={`inline-flex items-center py-1 px-3 rounded-full text-xs font-semibold border ${isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {method || "N/A"}
        </span>
    );
};


export default function DashboardPage() {
    const [count, setCount] = useState(1);
    const { vendorId } = useParams<{ vendorId: string }>();
    const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0)
    const [activeProducts, setActiveProducts] = useState(0)
    const [lowStock, setLowStock] = useState(0)
    const [revenueGrowth, setRevenueGrowth] = useState(0)
    const router = useRouter()
        const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(0);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const token = authToken();

    useEffect(() => {
        if (!token) {
            redirect("/auth/vendorLogin")
        }
        const loadData = async () => {
            await fetchVendorOrderList(0, pageSize, OrderStatusEnum.PROCESSING)
                .then((res) => {
                    setRecentOrders(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching vendor orders list:", err);
                });
            await fetchVendorPendingOrders(token)
                .then((res) => {
                    setPendingOrders(res.data ? res.data.length : 0);
                })
                .catch((err) => {
                    console.error("Error fetching vendor pending orders:", err);
                });
            await fetchVendorActiveProducts(token)
                .then((res) => {
                    setActiveProducts(res.data.length || 0);
                })
                .catch((err) => {
                    console.error("Error fetching vendor active products:", err);
                });
        };
        loadData();
    }, []);

    const handleOrderFilter = async (orderStatus: OrderStatusType) => {
        if (token) {

            await fetchVendorOrderList(0, pageSize, token, orderStatus)
                .then((res) => {
                    setRecentOrders(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching vendor orders list:", err);
                });
        }
    }

const toggleOrderSelection = (orderId: string) => {
        setSelectedOrders(prev => 
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked && recentOrders) {
            setSelectedOrders(recentOrders.map(o => o.id));
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
            console.log("Bulk Invoice URLs:", res);            const invoices = res.data;

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
                    await new Promise(resolve => setTimeout(resolve, 300)); 
                }
            }
            
            setSelectedOrders([]); // Clear selection on success
        } catch (error) {
            console.error("Error downloading invoices", error);
            alert("Failed to download invoices.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Navbar title="Dashboard" />
            <main className="px-1">

                {/* Stats Cards */}
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
                        <span className="bg-emerald-50 p-3 rounded-xl">
                            <TrendingUp size={20} className="text-emerald-500" />
                        </span>
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

                {/* Recent Orders Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden my-6">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-lg text-gray-800">Recent Orders</h2>
                        <span className='flex gap-4 items-center justify-between'>
                                     {/* SHOW DOWNLOAD BUTTON ONLY IF ORDERS ARE SELECTED */}
                    {selectedOrders.length > 0 && (
                        <button 
                            onClick={handleBulkDownload}
                            disabled={isDownloading}
                            className="flex items-center gap-2 font-semibold text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Printer size={16} />
                            {isDownloading ? "Downloading..." : `Print Invoices (${selectedOrders.length})`}
                        </button>
                    )}
                            <select name="" className='text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors' id="" onChange={(e) => handleOrderFilter(e.target.value as OrderStatusType)}>
                                <option value="">Select Status</option>
                                {
                                    Object.values(OrderStatusEnum).map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))
                                }
                            </select>
                            <button
                                onClick={() => router.push(`/vendor/${vendorId}/orders`)}
                                className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
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
                                    onChange={toggleAllOrders}
                                />
                                    </th>
                                    {orderTableHeader.map((header) => (
                                        <th key={header} className="p-4 text-xs Rent-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders && recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                            <Package size={36} className="mx-auto mb-3 opacity-30" />
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders && recentOrders.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
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
                                                    item.items.map(x => x.return_request ? x.return_request.type : x.order_status)
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
                                                {[item.address?.city, item.address?.state, item.address?.country, item.address?.postal_code]
                                                    .filter(Boolean)
                                                    .join(", ") || "N/A"}
                                            </td>

                                            {/* DATE */}
                                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString("en-GB")}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="p-4">
                                                <Link
                                                    href={`/vendor/${vendorId}/orders/${item.id}`}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    View →
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
                <span className="flex justify-end mt-2 mb-6">
                    <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" />
                </span>
            </main>
        </>
    );
}