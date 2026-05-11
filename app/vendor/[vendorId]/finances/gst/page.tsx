'use client';

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, ReceiptText, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { fetchGstRecords } from "@/utils/vendorApiClient";


interface GstRecordType {
    id: string;
    gst_number: string;
    legal_name: string;
    trade_name: string;
    state_code: string;
    registration_type: string;
    effective_from: string;
    is_default: boolean;
    created_at: string;
}

export const gstTableHeader = [
    "GSTIN",
    "Legal Name",
    "State Code",
    "Type",
    "Status",
    "Effective Date",
    "Actions"
]

export default function GstListingPage() {
    const params = useParams();
    const vendorId = params.vendorId as string;

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>("desc");
    const [gstRecords, setGstRecords] = useState<GstRecordType[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    };
    
    const token = authToken();
    
    useEffect(() => {
        if (!token) {
            redirect("/auth/vendorLogin");
        }
        
        const getGstRecords = async () => {
            setLoading(true);
            try {
                const res = await fetchGstRecords(statusFilter, sortBy, token!);
                setGstRecords(res.data?.data || []);
            } catch (err) {
                console.log("Error fetching GST records:", err);
            } finally {
                setLoading(false);
            }
        };
        getGstRecords();
    }, [statusFilter, sortBy, token]);

    return (
        <main className="w-full px-1">
            {/* Header */}
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <ReceiptText size={22} className="text-emerald-500" />
                    <h1 className="text-2xl font-bold text-gray-800">GST Registrations</h1>
                    {gstRecords && gstRecords.length > 0 && (
                        <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {gstRecords.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 font-semibold text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        <Download size={16} />
                        Export CSV
                    </button>
                    <Link href={`/vendor/${vendorId}/finances/gst/new`} className="flex items-center gap-2 font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        <Plus size={16} />
                        Add GST Number
                    </Link>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
                {/* Search */}
                <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-emerald-400 focus-within:bg-white transition-colors">
                    <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search icon" />
                    <input
                        type="text"
                        className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by GSTIN or Legal Name"
                    />
                </span>

                {/* Filters */}
                <span className="flex flex-wrap gap-3 items-center">
                    <select className='text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors' onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
                        <option value=''>All Types</option>
                        <option value='Regular'>Regular</option>
                        <option value='Composition'>Composition</option>
                    </select>

                    <select className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors" value={sortBy} onChange={(e) => setSortBy(e.target.value)} name="sort_by">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
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
                                <input type="checkbox" className="rounded" />
                            </th>
                            {gstTableHeader.map((header) => (
                                <th key={header} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr>
                                 <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                     Loading GST records...
                                 </td>
                             </tr>
                        ) : gstRecords && gstRecords?.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                    <ReceiptText size={36} className="mx-auto mb-3 opacity-30" />
                                    No GST configurations found.
                                </td>
                            </tr>
                        ) : (
                            gstRecords && gstRecords?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                                    </td>

                                    <td className="p-4">
                                        <span className="font-mono text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                                            {item.gst_number}
                                            {item.is_default && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] tracking-wide">DEFAULT</span>}
                                        </span>
                                    </td>

                                    <td className="p-4 text-sm text-gray-700 font-medium">
                                        {item.legal_name}
                                    </td>

                                    <td className="p-4 text-gray-600 text-sm">
                                        {item.state_code}
                                    </td>
                                    
                                    <td className="p-4 text-gray-600 text-sm">
                                        {item.registration_type}
                                    </td>

                                    <td className="p-4">
                                         <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-xs font-semibold">● Active</span>
                                    </td>

                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(item.effective_from).toLocaleDateString("en-GB")}
                                    </td>

                                    <td className="p-4">
                                        <Link href={`gst/${item.id}`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                            Edit →
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