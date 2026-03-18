'use client';

import { useState } from "react";
import { searchImgDark } from "@/constants/common";
import Navbar from "@/components/vendor/Navbar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Pagination } from "@/components/common/Pagination";
import { VENDOR_ORDERS_DETAIL } from "@/constants/vendor";

export default function OrdersPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(1);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    }

    const pageSize = 5;
    const totalPages = Math.ceil(VENDOR_ORDERS_DETAIL.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = VENDOR_ORDERS_DETAIL.slice(startIndex, endIndex);

    return (
        <>
            <Navbar title={"Orders"} />
            <main>
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
                <div className="my-6 relative flex w-full h-full overflow-scroll bg-white border rounded-2xl bg-clip-border">
                    <table className="w-full table-auto min-w-max">
                        <thead>
                            <tr className="text-center bg-gray-200">
                                <th className="p-4 border-b border-gray-400">ORDER DETAILS</th>
                                <th className="p-4 border-b border-gray-400">CUSTOMER</th>
                                <th className="p-4 border-b border-gray-400">STATUS</th>
                                <th className="p-4 border-b border-gray-400">TOTAL</th>
                                <th className="p-4 border-b border-gray-400">PAYMENT</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {currentData.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-gray-100 ${index === currentData.length - 1 ? 'border-b-0' : 'border-b border-gray-400'}`}>
                                    <td className="p-4 w-56">{item.orderNumber}<br /><span className="text-sm font-light text-gray-500">{item.dateTime}</span></td>
                                    <td className="p-4">{item.customer.name}<br /><span className="text-sm font-light text-gray-500">{item.customer.location}</span></td>
                                    <td className="p-4">
                                        {item.status === "Pending" ? <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-lg text-sm">Pending</span> :
                                            item.status === "Shipped" ? <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">Shipped</span> :
                                                <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-lg text-sm">Delivered</span>}
                                    </td>
                                    <td className="p-4">₹ {item.total}</td>
                                    <td className="p-4">
                                        {item.paymentMethod === "Paid (UPI)" ? <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">{item.paymentMethod}</span> :
                                            <span className="bg-gray-200 text-black py-1 px-3 rounded-lg text-sm">{item.paymentMethod}</span>}
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
    )
}
