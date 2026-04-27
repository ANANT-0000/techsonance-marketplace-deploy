'use client';

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, Package } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Pagination } from "@/components/common/Pagination";
import { fetchVendorOrderList } from "@/utils/vendorApiClient";
import Link from "next/link";

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
export const ReturnTableHeader = [
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
export default function OrdersPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(1);
    const [orders, setOrders] = useState<OrderType[]>([]);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    };

    useEffect(() => {
        const getOrderList = async () => {
            await fetchVendorOrderList()
                .then((res) => {
                    console.log("Vendor Orders List:", res);
                    setOrders(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching vendor orders list:", err);
                });
        };
        getOrderList();
    }, []);

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase();
        if (s === "pending")
            return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">● Pending</span>;
        if (s === "delivered")
            return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">● Delivered</span>;
        if (s === "active")
            return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-xs font-semibold">● Active</span>;
        if (s === "cancelled")
            return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-xs font-semibold">● Cancelled</span>;
        return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">● {status}</span>;
    };

    const getPaymentBadge = (method: string, status: string) => {
        const isPaid = status === "Paid" || status === "success";
        return (
            <span className={`inline-flex items-center py-1 px-3 rounded-full text-xs font-semibold border ${isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {method || "N/A"}
            </span>
        );
    };

    return (
        <main className="w-full px-1">
            {/* Header */}
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Package size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    {orders.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {orders.length}
                        </span>
                    )}
                </div>
                <button className="flex items-center gap-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                    <Download size={16} />
                    Export CSV
                </button>
            </header>

            {/* Filter Bar */}
            <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
                {/* Search */}
                <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search icon" />
                    <input
                        type="text"
                        className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by name, email or domain"
                    />
                </span>

                {/* Filters */}
                <span className="flex flex-wrap gap-3 items-center">
                    <select className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors" name="status">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors" name="sort_by">
                        <option value="date_newest">Newest First</option>
                        <option value="date_oldest">Oldest First</option>
                    </select>

                    {isOpen ? (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
                        >
                            {date ? date.toDateString() : "Select Date"}
                            <ChevronUp size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 text-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
                        >
                            {date ? date.toDateString() : "Select Date"}
                            <ChevronDown size={16} />
                        </button>
                    )}

                    {isOpen && (
                        <div className="absolute right-4 top-full mt-2 z-20 shadow-lg rounded-xl overflow-hidden border border-gray-200">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                className="rounded-xl bg-white"
                                captionLayout="dropdown"
                            />
                        </div>
                    )}
                </span>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full table-auto min-w-[900px] border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left">
                            <th className="p-4 w-10">
                                <input type="checkbox" className="rounded" />
                            </th>
                            {ReturnTableHeader.map((header) => (
                                <th key={header} className="p-4 text-xs Rent-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                    <Package size={36} className="mx-auto mb-3 opacity-30" />
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <input type="checkbox" className="rounded" />
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
                                        {getStatusBadge(item.items[0]?.order_status)}
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
                                            href={`orders/${item.id}`}
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
            <span className="flex justify-end mt-4">
                {/* <Pagination setCount={setCount} count={count} totalPages={totalPages ?? 0} style="relative right-0 w-54" /> */}
            </span>
        </main>
    );
}