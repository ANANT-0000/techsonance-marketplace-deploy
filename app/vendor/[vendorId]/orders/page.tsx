'use client';

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import Navbar from "@/components/vendor/Navbar";
import { ChevronDown, ChevronUp } from "lucide-react";
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
    // id: string;
    // product_name: string;
    quantity: number;
    order_status: string;
    // price: string;
    // total_price: string;
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
export default function OrdersPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(1);
    const [orders, setOrders] = useState<OrderType[]>([]);
    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    }
    useEffect(() => {
        const getOrderList = async () => {
            await fetchVendorOrderList().then((res) => {
                console.log("Vendor Orders List:", res);
                setOrders(res.data);
            }
            ).catch((err) => {
                console.error("Error fetching vendor orders list:", err);
            })
        }
        getOrderList();
    }, [])

    // const pageSize = 5;
    // const totalPages = Math.ceil(VENDOR_ORDERS_DETAIL.length / pageSize);
    // const startIndex = (count - 1) * pageSize;
    // const endIndex = startIndex + pageSize;
    // const currentData = VENDOR_ORDERS_DETAIL.slice(startIndex, endIndex);

    return (
        <>
            {/* <Navbar title={"Orders"} /> */}
            <main className="w-full">
                <header className="flex justify-end items-center my-6">
                    <button className="font-medium text-xl bg-blue-500 text-white rounded-xl px-6 py-2">Export CSV</button>
                </header>
                <div className="justify-between rounded-lg flex border-gray-300 items-center py-2 gap-4 bg-white filter">
                    <span className="border-2 flex flex-3 items-center justify-between gap-0 border-gray-300 py-1 px-4 rounded-2xl">
                        <button className="rounded-full w-8 h-8"><img className="w-6 h-6" src={searchImgDark} alt="search icon" /></button>
                        <input type="text" className="text-xl py-2 px-4 w-full" placeholder="Search by name, email or domain" />
                    </span>
                    <span className="flex gap-4">
                        <select className="vendor_filter rounded-2xl" name="status" id="status">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <select className="vendor_filter rounded-2xl" name="sort_by" id="sort_by">
                            <option value="date_newest">Newest</option>
                            <option value="date_oldest">Oldest</option>
                        </select>
                        {isOpen ? (
                            <button onClick={() => setIsOpen(false)} className="vendor_filter rounded-3xl bg-blue-100 text-blue-600">{date ? date.toDateString() : "Select Date"}<ChevronUp size={40} strokeWidth={3} absoluteStrokeWidth /></button>
                        ) : (
                            <button onClick={() => setIsOpen(true)} className="vendor_filter rounded-2xl">{date ? date.toDateString() : "Select Date"}<ChevronDown size={40} strokeWidth={3} absoluteStrokeWidth /></button>
                        )}
                        {isOpen && (
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                className="rounded-md border shadow-sm absolute right-64 z-20"
                                captionLayout='dropdown'
                            />
                        )}
                    </span>
                </div>

                <table className="w-full table-auto min-w-max border-collapse border border-gray-500 rounded-xl overflow-x-scroll my-2">
                    <thead>
                        <tr className="text-center bg-gray-200">
                            <th className="p-4 border-b border-gray-400">
                                <input type="checkbox" name="" id="" />
                            </th>
                            <th className="p-4 border-b border-gray-400">ORDER DETAILS</th>
                            <th className="p-4 border-b border-gray-400">TOTAL AMOUNT</th>
                            <th className="p-4 border-b border-gray-400">QTY</th>
                            <th className="p-4 border-b border-gray-400">STATUS</th>
                            <th className="p-4 border-b border-gray-400">CUSTOMER</th>
                            <th className="p-4 border-b border-gray-400">PAYMENT</th>
                            <th className="p-4 border-b border-gray-400">LOCATION</th>
                            <th className="p-4 border-b border-gray-400">DATE</th>
                            <th className="p-4 border-b border-gray-400">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="p-8 text-gray-500">No orders found.</td>
                            </tr>
                        ) : (
                            orders.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-gray-50 ${index === orders.length - 1 ? 'border-b-0' : 'border-b border-gray-200'}`}>
                                    <th className="p-4  border-gray-400">
                                        <input type="checkbox" name="" id="" />
                                    </th>
                                    <td className="p-4 font-medium text-gray-900">
                                        #{item.id.split('-')[0].toUpperCase()}
                                    </td>

                                    {/* TOTAL AMOUNT */}
                                    <td className="p-4">
                                        ₹{Number(item.total_amount).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {item.items && item.items.reduce((total, current) => total + current.quantity, 0)}
                                    </td>
                                    {/* STATUS */}
                                    <td className="p-4 capitalize">
                                        {item.items[0]?.order_status === "pending" ? (
                                            <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-lg text-sm">Pending</span>
                                        ) : item.items[0]?.order_status === "active" || item.items[0]?.order_status === "delivered" ? (
                                            <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">{item.items[0]?.order_status}</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-lg text-sm">{item.items[0]?.order_status}</span>
                                        )}
                                    </td>

                                    {/* CUSTOMER */}
                                    <td className="p-4 text-gray-700">
                                        {item.address?.name || "N/A"}
                                    </td>

                                    {/* PAYMENT */}
                                    <td className="p-4">
                                        <span className={`py-1 px-3 rounded-lg text-sm ${item.payment?.payment_status === 'Paid' || item.payment?.payment_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {item.payment?.payment_method || "N/A"}
                                        </span>
                                    </td>

                                    {/* LOCATION */}
                                    <td className="p-4 text-gray-600">
                                        {item.address?.city || "N/A"} , {item.address?.state || "N/A"} , {item.address?.country || "N/A"}, {item.address?.postal_code || "N/A"}
                                    </td>
                                    {/* DATE */}
                                    <td className="p-4 text-gray-600">
                                        {new Date(item.created_at).toLocaleDateString('en-GB')}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-4">
                                        <Link href={`orders/${item.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
                <span className="flex justify-end">
                    {/* <Pagination setCount={setCount} count={count} totalPages={totalPages ?? 0} style="relative right-0 w-54" /> */}
                </span>
            </main>
        </>
    )
}
