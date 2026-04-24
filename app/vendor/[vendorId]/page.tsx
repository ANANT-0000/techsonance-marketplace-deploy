'use client';
// @ts-ignore
import './index.css';
import Navbar from "@/components/vendor/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { VENDOR_DASHBOARD_STATS } from "@/constants/vendor";
import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, Clock, Package, ArrowUpRight } from "lucide-react";

const tableHeaders = ["Order ID", "Customer Name", "Status", "Amount", "Action"];

const VENDOR_ORDER_DATA = [
    { orderId: "1001", customerName: "John Doe", status: "pending", amount: 2500, action: "Ship Now" },
    { orderId: "1002", customerName: "Jane Smith", status: "shipped", amount: 1500, action: "View" },
];

const getStatusBadge = (status: string) => {
    if (status === "pending")
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">● Pending</span>;
    if (status === "shipped")
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-xs font-semibold">● Shipped</span>;
    return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">● Delivered</span>;
};

export default function DashboardPage() {
    const [count, setCount] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(VENDOR_ORDER_DATA.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = VENDOR_ORDER_DATA.slice(startIndex, endIndex);

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
                                ₹{formatCurrency(VENDOR_DASHBOARD_STATS.totalRevenue)}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-1">
                                <TrendingUp size={13} />
                                {VENDOR_DASHBOARD_STATS.revenueGrowth}% vs last month
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
                                {formatNumber(VENDOR_DASHBOARD_STATS.pendingOrder)}
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
                                {formatNumber(VENDOR_DASHBOARD_STATS.totalProducts)}
                            </span>
                            <span className="text-xs text-red-500 font-medium mt-1">
                                {VENDOR_DASHBOARD_STATS.lowStock} products low on stock
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
                        <Link
                            href="/vendor/orders"
                            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                            View All <ArrowUpRight size={15} />
                        </Link>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full table-auto min-w-[500px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                    {tableHeaders.map((header, index) => (
                                        <th key={index} className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((order) => (
                                        <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 font-mono text-sm font-semibold text-gray-700">
                                                #{order.orderId}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                                                {order.customerName}
                                            </td>
                                            <td className="px-5 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                                                ₹{order.amount.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                {order.action === "Ship Now" ? (
                                                    <button className="text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 py-1.5 px-4 rounded-lg transition-colors">
                                                        Ship Now
                                                    </button>
                                                ) : (
                                                    <button className="text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 py-1.5 px-4 rounded-lg transition-colors">
                                                        View →
                                                    </button>
                                                )}
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