'use client';

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, Wallet, IndianRupee } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
// import { vendorApiClient } from "@/utils/vendorApiClient";
import Link from "next/link";
import { useParams } from "next/navigation";

// Define the structure for Earning records
interface EarningRecord {
    id: string;
    order_id: string;
    gross_amount: string;
    platform_fee: string;
    net_earning: string;
    status: 'PENDING' | 'CLEARED' | 'WITHDRAWN';
    created_at: string;
}

export const EarningsTableHeader = [
    "Transaction ID",
    "Order Ref",
    "Gross Amount",
    "Platform Fee",
    "Net Earning",
    "Status",
    "Date",
    "Actions"
];

export default function EarningsPage() {
    const params = useParams();
    const vendorId = params.vendorId as string;

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [earnings, setEarnings] = useState<EarningRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    };

    useEffect(() => {
        const fetchEarnings = async () => {
            setLoading(true);
            try {
                // Adjust this endpoint to match your actual finances API route
                // Example: /finances/earnings or /company/earnings
                // const response = await vendorApiClient.get('/finances/earnings');
                setEarnings([]);
            } catch (err) {
                console.error("Error fetching earnings list:", err);
                // Fallback empty state on error
                setEarnings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    const getStatusBadge = (status: string) => {
        const s = status?.toUpperCase();
        if (s === "PENDING")
            return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">● Pending</span>;
        if (s === "CLEARED")
            return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">● Cleared</span>;
        if (s === "WITHDRAWN")
            return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-xs font-semibold">● Withdrawn</span>;

        return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">● {status}</span>;
    };

    const formatCurrency = (amount: string | number) => {
        return Number(amount).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
    };

    return (
        <main className="w-full px-1">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-center my-6 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                    <Wallet size={24} className="text-emerald-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Earnings & Settlements</h1>
                    {earnings.length > 0 && (
                        <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {earnings.length}
                        </span>
                    )}
                </div>
                <button className="flex items-center gap-2 font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                    <Download size={16} />
                    Export CSV
                </button>
            </header>

            {/* Filter Bar */}
            <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
                {/* Search */}
                <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-emerald-400 focus-within:bg-white transition-colors">
                    <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search icon" />
                    <input
                        type="text"
                        className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by Transaction ID or Order Ref"
                    />
                </span>

                {/* Filters */}
                <span className="flex flex-wrap gap-3 items-center">
                    <select className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors" name="status">
                        <option value="all">All Status</option>
                        <option value="cleared">Cleared</option>
                        <option value="pending">Pending</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>

                    <select className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors" name="sort_by">
                        <option value="date_newest">Newest First</option>
                        <option value="date_oldest">Oldest First</option>
                        <option value="amount_highest">Highest Amount</option>
                    </select>

                    {isOpen ? (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-sm border border-emerald-300 bg-emerald-50 text-emerald-600 rounded-xl px-3 py-2 font-medium transition-colors"
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

            {/* Data Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full table-auto min-w-[900px] border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left">
                            <th className="p-4 w-10">
                                <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                            </th>
                            {EarningsTableHeader.map((header) => (
                                <th key={header} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="py-16 text-center text-gray-400">
                                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm">Loading earnings...</p>
                                </td>
                            </tr>
                        ) : earnings.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                    <Wallet size={36} className="mx-auto mb-3 opacity-30" />
                                    No earning records found for this period.
                                </td>
                            </tr>
                        ) : (
                            earnings.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                                    </td>

                                    {/* TRANSACTION ID */}
                                    <td className="p-4">
                                        <span className="font-mono text-sm font-semibold text-gray-800">
                                            TRX-{item.id.split("-")[0].toUpperCase()}
                                        </span>
                                    </td>

                                    {/* ORDER REF */}
                                    <td className="p-4">
                                        <Link href={`/vendor/${vendorId}/orders/${item.order_id}`} className="font-mono text-sm font-semibold text-emerald-600 hover:underline">
                                            ORD-{item.order_id.split("-")[0].toUpperCase()}
                                        </Link>
                                    </td>

                                    {/* GROSS AMOUNT */}
                                    <td className="p-4 text-sm text-gray-600">
                                        ₹{formatCurrency(item.gross_amount)}
                                    </td>

                                    {/* PLATFORM FEE */}
                                    <td className="p-4 text-sm text-red-500 font-medium">
                                        - ₹{formatCurrency(item.platform_fee)}
                                    </td>

                                    {/* NET EARNING */}
                                    <td className="p-4">
                                        <span className="font-bold text-gray-900 flex items-center">
                                            <IndianRupee size={14} className="mr-0.5" />
                                            {formatCurrency(item.net_earning)}
                                        </span>
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-4">
                                        {getStatusBadge(item.status)}
                                    </td>

                                    {/* DATE */}
                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(item.created_at).toLocaleDateString("en-GB", {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-4">
                                        <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                            View Details →
                                        </button>
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