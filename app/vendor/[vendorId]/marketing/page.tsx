"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/vendor/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X, AlertCircle, TrendingUp, ShoppingCart, Target, AlertTriangle, Download } from "lucide-react";
import { REVIEW_DATA } from "@/constants/vendor";
import { couponSchema, CouponFormData } from "@/utils/validation";
import { CouponDiscountTypeEum, CouponStatusEnum } from "@/utils/Types";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";

// --- API Function ---
export const fetchConversionMetrics = async (token: string) => {
    return await AxiosAPI.get(`/v1/orders/analytics/conversion`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
export const exportAnalyticsCsv = async (token: string) => {
    return await AxiosAPI.get(`/v1/orders/analytics/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Critical for file downloads
    });
};
// --- Interfaces ---
interface OverallMetrics {
    totalCarts: number;
    totalOrders: number;
    conversionRate: number;
    abandonmentRate: number;
}

interface ProductConversion {
    variantId: string;
    variantName: string;
    sku: string;
    cartAdditions: number;
    orderCompletions: number;
    conversionRate: number;
}

export default function MarketingPage() {
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Analytics State
    const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
    const [productConversions, setProductConversions] = useState<ProductConversion[]>([]);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
const [isExporting, setIsExporting] = useState(false);
    const token = authToken();

    // Fetch Analytics Data
    useEffect(() => {
        if (!token) {
            redirect("/auth/vendorLogin");
        }

        const loadMetrics = async () => {
            try {
                const res = await fetchConversionMetrics(token as string);
                setOverallMetrics(res.data.overall);
                setProductConversions(res.data.productConversions);
            } catch (error) {
                console.error("Error fetching conversion metrics:", error);
            } finally {
                setIsLoadingMetrics(false);
            }
        };

        loadMetrics();
    }, [token]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CouponFormData>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            type: CouponDiscountTypeEum.PERCENTAGE,
            code: "",
            value: 0,
            rules: [{ rule_type: "Min Purchase", rule_value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rules",
    });

    const onSubmit = (data: CouponFormData) => {
        console.log("Coupon Created: ", data);
        setIsModalOpen(false);
        reset();
    };

    // Close modal on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setIsModalOpen(false);
                reset();
            }
        };
        if (isModalOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isModalOpen, reset]);

    // Pagination logic for reviews (kept as is)
    const [count, setCount] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(REVIEW_DATA.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const currentData = REVIEW_DATA.slice(startIndex, startIndex + pageSize);
const handleExport = async () => {
    if (!token) return;
    setIsExporting(true);
    
    try {
        const response = await exportAnalyticsCsv(token as string);
        
        // 1. Create a blob from the response
        const blob = new Blob([response.data], { type: 'text/csv' });
        
        // 2. Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // 3. Create a temporary <a> tag to trigger the download
        const link = document.createElement('a');
        link.href = url;
        
        // Dynamically name the file with the current date
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `store_analytics_${dateStr}.csv`);
        
        // 4. Append, click, and cleanup
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Failed to export analytics:", error);
    } finally {
        setIsExporting(false);
    }
};
    return (
        <div className="relative min-h-screen bg-slate-50">
            <Navbar title={"Marketing & Analytics"} />
            
            {/* Modal remains unchanged */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div ref={modalRef} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">New Promo Code</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {/* Form fields remain exactly as you provided... */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Type</label>
                                    <select {...register("type")} className="border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                                        <option value={CouponStatusEnum.ACTIVE}>Active</option>
                                        <option value={CouponStatusEnum.INACTIVE}>Inactive</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Value</label>
                                    <input type="number" {...register("value")} className="border border-gray-300 rounded-xl p-2.5 text-sm" placeholder="0" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Coupon Code</label>
                                <input type="text" {...register("code")} className="border border-gray-300 rounded-xl p-2.5 text-sm uppercase placeholder:normal-case" placeholder="e.g. SUMMER50" />
                            </div>
                            <div className="pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-800">Usage Rules</label>
                                    <button type="button" onClick={() => append({ rule_type: "Min Purchase", rule_value: "" })} className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700">
                                        <Plus size={14} /> Add Rule
                                    </button>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-left-2 duration-200">
                                        <select {...register(`rules.${index}.rule_type`)} className="flex-1 border border-gray-300 rounded-xl p-2 text-xs">
                                            <option value="Min Purchase">Min Purchase</option>
                                            <option value="Max Discount">Max Discount</option>
                                            <option value="User Limit">User Limit</option>
                                        </select>
                                        <input {...register(`rules.${index}.rule_value`)} placeholder="Value" className="flex-1 border border-gray-300 rounded-xl p-2 text-xs" />
                                        <button type="button" onClick={() => remove(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 pb-10">
                <header className="flex justify-between items-center py-6">
    <div>
        <h1 className="text-2xl font-bold text-gray-800">Marketing & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Track conversions and manage promotions.</p>
    </div>
    
    <div className="flex gap-3">
        {/* NEW EXPORT BUTTON */}
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
        >
            <Download size={18} />
            {isExporting ? "Exporting..." : "Export CSV"}
        </button>

        <button
            className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
        >
            <Plus size={18} /> Add New Promo
        </button>
    </div>
</header>

                {/* --- OVERALL METRICS CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Conversion</span>
                            <span className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><Target size={18} /></span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {isLoadingMetrics ? "..." : `${overallMetrics?.conversionRate || 0}%`}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Orders / Total Carts</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Abandonment Rate</span>
                            <span className="bg-red-50 text-red-600 p-2 rounded-lg"><AlertTriangle size={18} /></span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {isLoadingMetrics ? "..." : `${overallMetrics?.abandonmentRate || 0}%`}
                        </h3>
                        <p className="text-xs text-red-500 mt-1 font-medium">Missed checkout opportunities</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Carts</span>
                            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg"><ShoppingCart size={18} /></span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {isLoadingMetrics ? "..." : overallMetrics?.totalCarts || 0}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Total intent to buy</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Orders</span>
                            <span className="bg-purple-50 text-purple-600 p-2 rounded-lg"><TrendingUp size={18} /></span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {isLoadingMetrics ? "..." : overallMetrics?.totalOrders || 0}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Successfully processed</p>
                    </div>
                </div>

                {/* --- PRODUCT CONVERSION FUNNEL TABLE --- */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-lg text-gray-800">Product Funnel Analytics</h2>
                        <p className="text-xs text-gray-500 mt-1">Identify which products are being abandoned at checkout to optimize pricing.</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4">Product Variant</th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4 text-center">Cart Additions</th>
                                    <th className="p-4 text-center">Purchased</th>
                                    <th className="p-4">Conversion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoadingMetrics ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">Loading analytics data...</td>
                                    </tr>
                                ) : productConversions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">No conversion data available yet.</td>
                                    </tr>
                                ) : (
                                    productConversions.map((product) => (
                                        <tr key={product.variantId} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-semibold text-sm text-gray-800">
                                                {product.variantName}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500 font-mono">
                                                {product.sku}
                                            </td>
                                            <td className="p-4 text-center font-medium text-gray-600">
                                                {product.cartAdditions}
                                            </td>
                                            <td className="p-4 text-center font-medium text-gray-600">
                                                {product.orderCompletions}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-bold ${
                                                        product.conversionRate >= 50 ? 'text-emerald-600' :
                                                        product.conversionRate >= 20 ? 'text-amber-500' : 'text-red-500'
                                                    }`}>
                                                        {product.conversionRate}%
                                                    </span>
                                                    {/* Progress Bar Indicator */}
                                                    <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${
                                                                product.conversionRate >= 50 ? 'bg-emerald-500' :
                                                                product.conversionRate >= 20 ? 'bg-amber-400' : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${Math.min(product.conversionRate, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- EXISTING REVIEWS SECTION --- */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                     <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-gray-800">Customer Reviews</h2>
                    </div>
                    {/* Your existing reviews mapping would go here using `currentData` */}
                    <div className="p-8 text-center text-gray-400 text-sm">
                         Review mapping logic here...
                    </div>
                    <span className="flex justify-end p-4 border-t border-gray-100">
                        <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative" />
                    </span>
                </div>

            </main>
        </div>
    );
}