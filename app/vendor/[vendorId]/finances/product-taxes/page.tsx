'use client';

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, Tag, CheckCircle2, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { redirect, useParams } from "next/navigation";
import { authToken } from "@/utils/authToken";
import {  fetchTaxRates, fetchAssignProductTax, fetchProductTaxMappings } from "@/utils/vendorApiClient";
import Link from "next/link";
import { fetch } from "next/dist/compiled/@edge-runtime/primitives";

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

    // --- MODAL STATES ---
    const [availableRates, setAvailableRates] = useState<any[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedTaxRateId, setSelectedTaxRateId] = useState<string>("");
    const [saving, setSaving] = useState(false);

    const token = authToken();
    
    // Fetch Products AND Available Tax Rates
    const fetchData = async () => {
        setLoading(true);
        try {
            const [mappingRes, ratesRes] = await Promise.all([
                fetchProductTaxMappings(0, sortBy, statusFilter, token as string),
                fetchTaxRates(sortBy, date, token as string)
            ]);
            setProductTaxes(mappingRes.data?.data || []);
            setAvailableRates(ratesRes?.data.data || []);
            console.log("Fetched Product Taxes:", mappingRes.data?.data);
            console.log("Fetched Available Tax Rates:", ratesRes?.data.data);
        } catch (err) {
            console.log("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) redirect("/auth/vendorLogin");
        fetchData();
    }, [sortBy, statusFilter, token]);

    // Handle opening modal
    const handleOpenModal = (productId: string) => {
        setSelectedProductId(productId);
        setSelectedTaxRateId(""); // Reset dropdown
        setModalOpen(true);
    };

    // Handle Form Submit
    const handleAssignTax = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !selectedTaxRateId) return alert("Please select a tax rate");

        setSaving(true);
        try {
            await fetchAssignProductTax(
                { product_id: selectedProductId, tax_rate_id: selectedTaxRateId }, 
                vendorId, 
                token as string
            );
            setModalOpen(false);
            fetchData(); // Refresh the table visually
        } catch (error) {
            alert("Failed to assign tax rate.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="w-full px-1">
            {/* --- HEADER & FILTERS CODE REMAINS EXACTLY THE SAME --- */}
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
                    <button className="flex items-center gap-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        Assign Rates in Bulk
                    </button>
                </div>
            </header>

            {/* --- TABLE RENDERING --- */}
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
                        ) : productTaxes.length === 0 ? (
                            <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm">No products found.</td></tr>
                        ) : (
                            productTaxes.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></td>
                                    
                                    <td className="p-4">
                                        <Link href={`/vendor/${vendorId}/products/${item.id}`} className="font-semibold text-blue-600 hover:underline line-clamp-2 text-sm text-wrap max-w-24">
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

                                    {/* ASSIGN RATE BUTTON */}
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleOpenModal(item.id)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                        >
                                            {item.is_mapped ? "Change Rate" : "Assign Rate"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- ASSIGN TAX MODAL --- */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Assign Tax Rate</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAssignTax} className="p-6">
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Select a Tax Rate to apply to this product:</label>
                            <select 
                                required
                                value={selectedTaxRateId}
                                onChange={(e) => setSelectedTaxRateId(e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors"
                            >
                                <option value="" disabled>-- Select from configured rates --</option>
                                {availableRates.map(rate => (
                                    <option key={rate.id} value={rate.id}>
                                        {rate.tax_rate_name} ({Number(rate.tax_rate_value).toFixed(2)}%)
                                    </option>
                                ))}
                            </select>

                            {availableRates.length === 0 && (
                                <p className="text-xs text-amber-600 mt-2">
                                    You have no tax rates configured. <Link href={`/vendor/${vendorId}/finances/tax-rates/new`} className="underline font-bold">Create one here.</Link>
                                </p>
                            )}

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button disabled={saving || availableRates.length === 0} type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                                    {saving ? "Applying..." : "Apply Tax Rate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}