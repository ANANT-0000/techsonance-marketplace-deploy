'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVendorReturnRequests } from '@/utils/vendorApiClient';
import { toast } from 'react-hot-toast';
import { LoaderSpinner } from '@/components/common/LoaderSpinner';
import { searchImgDark } from '@/constants/common';
import { ChevronDown, ChevronUp, Download, RotateCcw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

interface ReturnVariant {
    images: any[];
    price: string;
    sku: string;
    variant_name: string;
}

interface ReturnOrderAddress {
    country: string;
    id: string;
    postal_code: string;
    state: string;
}

interface ReturnOrder {
    address: ReturnOrderAddress;
    id: string;
}

interface ReturnOrderItem {
    company_id: string;
    created_at: string;
    id: string;
    order: ReturnOrder;
    order_id: string;
    order_status: string;
    price: string;
    product_variant_id: string;
    quantity: number;
    updated_at: string;
    variant: ReturnVariant;
}

interface ReturnUser {
    email: string;
    first_name: string;
    id: string;
    last_name: string;
    phone_number: string | null;
}

interface EvidenceImage {
    url: string;
}

interface ReturnRequest {
    company_id: string;
    created_at: string;
    customer_note: string;
    evidence_images: EvidenceImage[];
    id: string;
    orderItem: ReturnOrderItem;
    order_item_id: string;
    reason: string;
    status: string;
    store_owner_note: string | null;
    tracking_id: string | null;
    type: string;
    updated_at: string;
    user: ReturnUser;
    user_id: string;
}
export const ReturnTableHeader = [
    "Request ID",
    "Type",
    "Product",
    "Price",
    "Reason",
    "Status",
    "Location",
    "Date",
    "Actions"
]
export default function BackOrdersListPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    };

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                setLoading(true);
                const res = await getVendorReturnRequests();
                setReturns(res.data);
            } catch (error) {
                toast.error('Failed to load return requests');
            } finally {
                setLoading(false);
            }
        };
        fetchReturns();
    }, []);

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'pending')
            return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">● Pending</span>;
        if (s === 'approved')
            return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">● Approved</span>;
        if (s === 'rejected')
            return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-xs font-semibold">● Rejected</span>;
        if (s === 'processing')
            return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-xs font-semibold">● Processing</span>;
        return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">● {status}</span>;
    };

    const getTypeBadge = (type: string) => {
        const t = type?.toLowerCase();
        if (t === 'replacement')
            return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">↺ Replacement</span>;
        if (t === 'return')
            return <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">← Return</span>;
        return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">{type}</span>;
    };

    const filteredReturns = returns.filter((req) => {
        const fullName = `${req.user?.first_name ?? ''} ${req.user?.last_name ?? ''}`.toLowerCase();
        const email = req.user?.email?.toLowerCase() ?? '';
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query || fullName.includes(query) || email.includes(query) || req.reason?.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || req.status?.toLowerCase() === statusFilter;
        const matchesType = typeFilter === 'all' || req.type?.toLowerCase() === typeFilter;
        const matchesDate = !date || new Date(req.created_at).toDateString() === date.toDateString();
        return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    if (loading) return <div className="p-8 flex justify-center"><LoaderSpinner /></div>;

    return (
        <main className="w-full px-1">
            {/* Header */}
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <RotateCcw size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Back Orders</h1>
                    {returns.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {returns.length}
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by name, email or reason"
                    />
                </span>

                {/* Filters */}
                <span className="flex flex-wrap gap-3 items-center">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="processing">Processing</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
                    >
                        <option value="all">All Types</option>
                        <option value="return">Return</option>
                        <option value="replacement">Replacement</option>
                    </select>

                    {isOpen ? (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
                        >
                            {date ? date.toDateString() : 'Select Date'}
                            <ChevronUp size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 text-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
                        >
                            {date ? date.toDateString() : 'Select Date'}
                            <ChevronDown size={16} />
                        </button>
                    )}

                    {date && (
                        <button
                            onClick={() => setDate(undefined)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Clear
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

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full table-auto overflow-x-scroll min-w-[1000px] border-collapse">
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
                        {filteredReturns.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="py-16 text-center text-gray-400 text-sm">
                                    <RotateCcw size={36} className="mx-auto mb-3 opacity-30" />
                                    No back orders found.
                                </td>
                            </tr>
                        ) : (
                            filteredReturns.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <input type="checkbox" className="rounded" />
                                    </td>

                                    {/* REQUEST ID */}
                                    <td className="p-4">
                                        <span className="font-mono text-sm font-semibold text-gray-800">
                                            #{req.id.split('-')[0].toUpperCase()}
                                        </span>
                                    </td>

                                    {/* TYPE */}
                                    <td className="p-4">
                                        {getTypeBadge(req.type)}
                                    </td>
                                    {/* PRODUCT */}
                                    <td className="p-4">
                                        <div className="text-xs text-gray-700 max-w-[200px] line-clamp-2 leading-snug">
                                            {req.orderItem?.variant?.variant_name || 'N/A'}
                                        </div>
                                        {req.orderItem?.variant?.sku && (
                                            <div className="text-xs text-gray-400 mt-0.5 font-mono">
                                                SKU: {req.orderItem.variant.sku}
                                            </div>
                                        )}
                                    </td>

                                    {/* PRICE */}
                                    <td className="p-4">
                                        <span className="font-semibold text-gray-800">
                                            ₹{Number(req.orderItem?.price).toLocaleString()}
                                        </span>
                                        <div className="text-xs text-gray-400">
                                            Qty: {req.orderItem?.quantity ?? 1}
                                        </div>
                                    </td>

                                    {/* REASON */}
                                    <td className="p-4 text-sm text-gray-600 max-w-[160px]">
                                        <span className="line-clamp-2">{req.reason || 'N/A'}</span>
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-4">
                                        {getStatusBadge(req.status)}
                                    </td>

                                    {/* LOCATION */}
                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {[
                                            req.orderItem?.order?.address?.state,
                                            req.orderItem?.order?.address?.country,
                                            req.orderItem?.order?.address?.postal_code,
                                        ]
                                            .filter(Boolean)
                                            .join(', ') || 'N/A'}
                                    </td>

                                    {/* DATE */}
                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(req.created_at).toLocaleDateString('en-GB')}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-4">
                                        <Link
                                            href={`backOrder/${req.id}`}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                        >
                                            Review →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}