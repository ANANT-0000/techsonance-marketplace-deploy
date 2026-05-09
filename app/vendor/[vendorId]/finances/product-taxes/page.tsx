'use client';

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, Tag, CheckCircle2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { redirect, useParams } from "next/navigation";
import { authToken } from "@/utils/authToken";

import Link from "next/link";

interface ProductTaxMappingType {
    id: string;
    product_name: string;
    sku: string;
    tax_rate_name: string;
    tax_value: string;
    is_mapped: boolean;
    updated_at: string;
}

export const productTaxHeader = [
    "Product Name",
    "SKU",
    "Assigned Tax Rate",
    "Total Tax (%)",
    "Mapping Status",
    "Last Updated",
    "Actions"
];

export default function ProductTaxMappingPage() {
    const params = useParams();
    const vendorId = params.vendorId as string;

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [sortBy, setSortBy] = useState<string>("desc");
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [productTaxes, setProductTaxes] = useState<ProductTaxMappingType[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    };
    
    const token = authToken();
    
    useEffect(() => {
        if (!token) redirect("/auth/vendorLogin");
        
        const fetchProductTaxes = async () => {
            setLoading(true);
            try {
                // Fetching the mapping from product_tax table joined with products and tax_rates
                // const res = await vendorApiClient.get('/finances/taxes/product-mapping', {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                // setProductTaxes(res.data?.data || []);
            } catch (err) {
                console.log("Error fetching Product Tax Mapping:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductTaxes();
    }, [sortBy, statusFilter, token]);

    return (
        <main className="w-full px-1">
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Tag size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Product Tax Mapping</h1>
                    {productTaxes && productTaxes.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {productTaxes.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 font-semibold text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        <Download size={16} /> Export Mapping
                    </button>
                    {/* Bulk update button */}
                    <button className="flex items-center gap-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        Assign Rates in Bulk
                    </button>
                </div>
            </header>

            <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
                <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search icon" />
                    <input
                        type="text"
                        className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by Product Name or SKU..."
                    />
                </span>

                <span className="flex flex-wrap gap-3 items-center">
                    <select className='text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors' onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
                        <option value=''>All Statuses</option>
                        <option value='mapped'>Mapped</option>
                        <option value='unmapped'>Unassigned / Missing</option>
                    </select>

                    <select className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors" value={sortBy} onChange={(e) => setSortBy(e.target.value)} name="sort_by">
                        <option value="desc">Recently Updated</option>
                        <option value="asc">Oldest Updated</option>
                    </select>
                </span>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full table-auto min-w-[1000px] border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left">
                            <th className="p-4 w-10"><input type="checkbox" className="rounded" /></th>
                            {productTaxHeader.map((header) => (
                                <th key={header} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm">Loading product mappings...</td></tr>
                        ) : productTaxes && productTaxes?.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                                    <Tag size={36} className="mx-auto mb-3 opacity-30 text-blue-400" />
                                    No products found to map.
                                </td>
                            </tr>
                        ) : (
                            productTaxes && productTaxes?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></td>
                                    
                                    <td className="p-4">
                                        <Link href={`/vendor/${vendorId}/products/${item.id}`} className="font-semibold text-blue-600 hover:underline">
                                            {item.product_name}
                                        </Link>
                                    </td>
                                    
                                    <td className="p-4 text-gray-500 text-sm font-mono">{item.sku}</td>
                                    
                                    <td className="p-4 text-gray-700 text-sm font-medium">
                                        {item.tax_rate_name || "—"}
                                    </td>
                                    
                                    <td className="p-4">
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                                            {item.tax_value ? `${Number(item.tax_value).toFixed(2)}%` : "0.00%"}
                                        </span>
                                    </td>
                                    
                                    <td className="p-4">
                                        {item.is_mapped ? (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">
                                                <CheckCircle2 size={12} /> Assigned
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-xs font-semibold">
                                                Missing Rate
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString("en-GB") : "Never"}
                                    </td>

                                    <td className="p-4">
                                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                            Assign Rate
                                        </button>
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