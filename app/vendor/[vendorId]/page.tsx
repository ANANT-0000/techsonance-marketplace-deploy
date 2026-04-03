'use client';
import Navbar from "@/components/vendor/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { VENDOR_DASHBOARD_STATS, VENDOR_ORDER_DATA } from "@/constants/vendor";
import { useState } from "react";
import Link from "next/link";
import './index.css';
import { formatCurrency, formatNumber,   } from "@/lib/utils";
const tableHeaders = ["Order ID", "Customer Name", "Status", "Amount", "Action"];
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
            <main>
                <div className="stats justify-evenly">
                    <div className="stat">
                        <div className="stat_title">Total Revenue</div>
                        <div className="stat_value">₹{formatCurrency(VENDOR_DASHBOARD_STATS.totalRevenue)}</div>
                        <div className="stat_desc text-green-600">↗︎ {VENDOR_DASHBOARD_STATS.revenueGrowth}% v last month</div>
                    </div>
                    <div className="stat">
                        <div className="stat_title">Pending Orders</div>
                        <div className="stat_value">{formatNumber(VENDOR_DASHBOARD_STATS.pendingOrder)}</div>
                        <div className="stat_desc">Requires immediate shipping</div>
                    </div>
                    <div className="stat">
                        <div className="stat_title">Active Products</div>
                        <div className="stat_value">{formatNumber(VENDOR_DASHBOARD_STATS.totalProducts)}</div>
                        <div className="stat_desc">{VENDOR_DASHBOARD_STATS.lowStock} Products low on stock</div>
                    </div>
                </div>

                <div className="my-6 relative flex flex-col w-full h-full overflow-scroll bg-white border rounded-xl bg-clip-border">
                    <div className="flex justify-between border-b border-gray-400">
                        <h2 className="font-bold text-xl p-4">Recent Orders</h2>
                        <Link href="/vendor/orders" className="text-xl p-4 text-blue-600 cursor-pointer underline">View All</Link>
                    </div>
                    <table className="w-full table-auto min-w-max">
                        <thead className="bg-gray-200">
                            <tr>
                                {tableHeaders.map((header, index) => (
                                    <th key={index} className="p-4 border-b border-gray-400">
                                        {header}
                                    </th>
                                ))}

                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {currentData.map((order, index) => (
                                <tr key={order.orderId} className={`hover:bg-gray-100 ${index === currentData.length - 1 ? 'border-b-0' : 'border-b border-gray-400'}`}>
                                    <td className="p-4">{order.orderId}</td>
                                    <td className="p-4">{order.customerName}</td>
                                    <td className="p-4">
                                        {order.status === "Pending" ? (
                                            <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-lg text-sm">Pending</span>
                                        ) : order.status === "Shipped" ? (
                                            <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">Shipped</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-lg text-sm">Delivered</span>
                                        )}
                                    </td>
                                    <td className="p-4">₹ {order.amount}</td>
                                    <td className="p-4">
                                        {order.action === "Ship Now" ? (
                                            <button className="text-blue-500 underline py-1 px-3 rounded-lg hover:bg-blue-100">Ship Now</button>
                                        ) : (
                                            <button className="text-gray-500 underline py-1 px-3 rounded-lg hover:bg-gray-100">View</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <span className="flex justify-end">
                    <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" />
                </span>
            </main>
        </>
    );
}
