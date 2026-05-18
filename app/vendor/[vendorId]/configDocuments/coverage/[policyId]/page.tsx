'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { authToken } from '@/utils/authToken';
import {
    ShieldCheck, Tag, Box, Loader2, AlertCircle, 
    ArrowLeft, Calendar, FileText, Activity, 
    Edit, ExternalLink, GitMerge
} from 'lucide-react';
import Link from 'next/link';
import { fetchPolicyCoverageDetails } from '@/utils/vendorApiClient';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PolicyCoverageItem {
    policy: {
        id: string;
        policy_name: string;
        policy_type: string;
        duration_value: number | null;
        duration_unit: string | null;
        is_active: boolean;
        generates_document: boolean;
    };
    categories: {
        id: string;
        assignment_id: string;
        name: string;
        priority: number;
    }[];
    products: {
        id: string;
        override_id: string;
        name: string;
        overrides_category: boolean;
    }[];
    inherited_products: {
        id: string;
        name: string;
        category_name: string;
    }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_PALETTE: Record<string, { badge: string; icon: string; bg: string }> = {
    warranty: { badge: 'bg-blue-50 text-blue-700', icon: '🛡️', bg: 'bg-blue-500' },
    guarantee: { badge: 'bg-emerald-50 text-emerald-700', icon: '✅', bg: 'bg-emerald-500' },
    exchange_only: { badge: 'bg-amber-50 text-amber-700', icon: '🔄', bg: 'bg-amber-500' },
    no_return: { badge: 'bg-red-50 text-red-700', icon: '🚫', bg: 'bg-red-500' },
    extended_support: { badge: 'bg-purple-50 text-purple-700', icon: '🔧', bg: 'bg-purple-500' },
    none: { badge: 'bg-gray-50 text-gray-600', icon: '➖', bg: 'bg-gray-400' },
};

function TypeBadge({ type }: { type: string }) {
    const p = TYPE_PALETTE[type] ?? TYPE_PALETTE.none;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${p.badge}`}>
            {p.icon} {type.replace(/_/g, ' ')}
        </span>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PolicyCoverageDetailPage() {
    const params = useParams();
    const vendorId = params.vendorId as string;
    const policyId = params.policyId as string;
    const token = authToken();

    const [data, setData] = useState<PolicyCoverageItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !policyId) return;
        const loadCoverageDetail = async () => {
            setLoading(true);
            try {
                const res = await fetchPolicyCoverageDetails(policyId, token);
                if (res?.data) {
                    setData(res.data[0]);
                    console.log(res)
                } else {
                    setError('Policy coverage details not found.');
                }
            } catch (err) {
                setError('Failed to load policy coverage details.');
            } finally {
                setLoading(false);
            }
        };
        loadCoverageDetail();
    }, [token, policyId]);

    if (loading) return (
                   <div className=" absolute top-0 bottom-0 left-0 right-0 w-full h-full flex justify-center items-center   text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );

    if (error || !data) return (
      <div className=" absolute top-0 bottom-0 left-0 right-0 w-full h-full flex flex-col items-center justify-center   gap-3 text-red-500">
            <AlertCircle className="w-10 h-10" />
            <p className="font-medium text-lg">{error || 'Something went wrong'}</p>
        </div>
    );

    const p = TYPE_PALETTE[data.policy.policy_type] ?? TYPE_PALETTE.none;

    return (
        <main className="w-full mx-auto py-6 px-1">
            {/* ── Header ── */}
            <div className="mb-8">
                <Link
                    href={`/vendor/${vendorId}/configDocuments/coverage`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-5 group transition-colors"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Coverage Map
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 p-3 rounded-xl text-white ${p.bg} shadow-sm`}>
                            <ShieldCheck size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                                {data.policy.policy_name}
                            </h1>
                            <TypeBadge type={data.policy.policy_type} />
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link
                            href={`/vendor/${vendorId}/configDocuments/assignments`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <ExternalLink size={16} /> Manage Assignments
                        </Link>
                        <Link
                            href={`/vendor/${vendorId}/configDocuments?editId=${data.policy.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Edit size={16} /> Edit Policy
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left Column: Config Summary ── */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">Policy Configuration</h2>
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Duration</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {data.policy.duration_value ? `${data.policy.duration_value} ${data.policy.duration_unit}` : 'Lifetime / No Expiry'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${data.policy.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
                                    <p className={`text-sm font-bold ${data.policy.is_active ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {data.policy.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Documentation</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {data.policy.generates_document ? 'Generates PDF for Orders' : 'No PDF Generated'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column: The Coverage Breakdown ── */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* EXPLICIT CATEGORIES */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
                                    <Tag size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Linked Categories</h2>
                            </div>
                            <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
                                {data.categories.length} Assigned
                            </span>
                        </div>
                        <div className="p-5">
                            {data.categories.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Not assigned to any categories.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.categories.map(cat => (
                                        <div key={cat.assignment_id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                                            <span className="font-medium text-sm text-gray-800">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* INHERITED PRODUCTS */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                            <div className="flex items-start gap-2">
                                <div className="p-1.5 bg-sky-100 text-sky-600 rounded-md mt-0.5">
                                    <GitMerge size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Inherited Product Coverage</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Products automatically covered because they belong to the linked categories above.</p>
                                </div>
                            </div>
                            <span className="bg-sky-100 text-sky-700 py-1 px-3 rounded-full text-xs font-bold shrink-0">
                                {data.inherited_products.length} Covered
                            </span>
                        </div>
                        <div className="p-5">
                            {data.inherited_products.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No products found in the assigned categories.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.inherited_products.map(prod => (
                                        <div key={prod.id} className="flex flex-col p-3 rounded-xl border border-sky-100 bg-sky-50/30">
                                            <span className="font-medium text-sm text-gray-800 truncate">{prod.name}</span>
                                            <span className="text-xs text-sky-600 font-medium">Via: {prod.category_name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* EXPLICIT PRODUCT OVERRIDES */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md">
                                    <Box size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Direct Product Overrides</h2>
                            </div>
                            <span className="bg-orange-100 text-orange-700 py-1 px-3 rounded-full text-xs font-bold">
                                {data.products.length} Overrides
                            </span>
                        </div>
                        <div className="p-5">
                            {data.products.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No direct overrides applied.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.products.map(prod => (
                                        <div key={prod.override_id} className="flex items-center justify-between p-3 rounded-xl border border-orange-200 bg-orange-50/30">
                                            <span className="font-medium text-sm text-gray-800">{prod.name}</span>
                                            <span className="shrink-0 text-orange-600 text-[10px] font-bold uppercase tracking-wider bg-orange-100 px-2 py-1 rounded">
                                                Direct Override
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}