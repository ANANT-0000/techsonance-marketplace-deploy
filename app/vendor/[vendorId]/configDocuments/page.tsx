'use client';
import { Pagination } from "@/components/common/Pagination";
import { searchImgDark } from "@/constants/common";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { ShieldCheck, Plus, Edit, Trash2, Link as LinkIcon, LayoutGrid, Eye, Tag, Box, ChevronRight, Layers } from "lucide-react";
import { deleteProductPolicy, fetchProductPolicies } from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { ActionType, ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useParams } from "next/navigation";

export interface ProductPolicy {
    id: string;
    policy_name: string;
    policy_type: string;
    duration_value?: number;
    duration_unit?: string;
    is_active: boolean;
}

const POLICY_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    warranty: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    guarantee: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    exchange_only: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    no_return: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    extended_support: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    none: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function PoliciesPage() {
    const { theme } = useAppSelector((state) => state.adminTheme);
    const params = useParams();
    const vendorId = params.vendorId as string;

    const [policies, setPolicies] = useState<ProductPolicy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
       const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * itemsPerPage;

    const [activeView, setActiveView] = useState<'list' | 'grid'>('list');
    const token = authToken();

    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: "",
        message: "",
        actionType: "" as ActionType,
        confirmText: "",
        onConfirm: () => { }
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const fetchPolicies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const res = await fetchProductPolicies(token!);
        setPolicies(res.data ?? []);
            if (res.data) {
            setTotalPages(Math.ceil(res.data.length / itemsPerPage));
            }
        if (!res.data) {
            setError(res.error ?? 'Failed to load policies.');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    const handleDelete = async (id: string, token: string) => {
        token && setConfirmModalConfig({
            title: "Delete Policy?",
            message: "This action cannot be undone. Are you sure you want to delete this policy?",
            actionType: "danger",
            confirmText: "Yes, Delete",
            onConfirm: async () => {
                setIsProcessing(true);
                await deleteProductPolicy(id, token);
                setPolicies(prev => prev.filter(policy => policy.id !== id));
                setIsProcessing(false);
                setIsConfirmModalOpen(false);
            }
        });
        setIsConfirmModalOpen(true);
    };

    const filtered = policies.filter((p) =>
        p.policy_name.toLowerCase().includes(search.toLowerCase()),
    );

    const colorSet = (type: string) => POLICY_TYPE_COLORS[type] ?? POLICY_TYPE_COLORS.none;

    return (
        <>
            <main className="w-full px-1 py-4">
                {/* ── Header ── */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6 gap-4">
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Product Policies</h1>
                            <p className="text-xs text-gray-500 mt-1">Manage warranties, guarantees, and return rules.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="configDocuments/coverage"
                            className="flex items-center gap-2 font-semibold text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm border border-indigo-100"
                        >
                            <Layers size={16} />
                            Coverage Map
                        </Link>
                        <Link
                            href="configDocuments/assignments"
                            className="flex items-center gap-2 font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm"
                        >
                            <LinkIcon size={16} />
                            Assign Policies
                        </Link>
                        <Link
                            href="configDocuments/policyForm"
                            className="flex items-center gap-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            Create Policy
                        </Link>
                    </div>
                </header>

                {/* ── Quick Stats Strip ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total Policies', value: policies.length, color: 'blue' },
                        { label: 'Active', value: policies.filter(p => p.is_active).length, color: 'emerald' },
                        { label: 'Inactive', value: policies.filter(p => !p.is_active).length, color: 'gray' },
                        { label: 'With Duration', value: policies.filter(p => p.duration_value).length, color: 'purple' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                            <p className="text-xs text-gray-500">{stat.label}</p>
                            <p className={`text-2xl font-bold text-${stat.color}-600 mt-0.5`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                {/* ── Search + View Toggle ── */}
                <div className={`relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4 ${theme === 'light' ? '' : 'invert'}`}>
                    <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
                        <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search" />
                        <input
                            type="text"
                            className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                            placeholder="Search policies..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </span>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-gray-50">
                        <button
                            onClick={() => setActiveView('list')}
                            className={`p-1.5 rounded-lg transition-colors ${activeView === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setActiveView('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${activeView === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Grid View ── */}
                {activeView === 'grid' && (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 ${theme === 'light' ? '' : 'invert'}`}>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                                    <div className="h-8 bg-gray-100 rounded" />
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="col-span-3 py-16 text-center text-gray-400 text-sm">No policies found.</div>
                        ) : filtered.map((policy) => {
                            const c = colorSet(policy.policy_type);
                            return (
                                <div key={policy.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h3 className="font-semibold text-gray-800 truncate">{policy.policy_name}</h3>
                                            <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                                {policy.policy_type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${policy.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {policy.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {policy.duration_value && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            ⏱ {policy.duration_value} {policy.duration_unit}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                                        <Link
                                            href={`configDocuments/coverage/${policy.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Eye size={13} /> Coverage
                                        </Link>
                                        <Link
                                            href={`policies/policyForm?id=${policy.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Edit size={13} /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(policy.id, token!)}
                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── List / Table View ── */}
                {activeView === 'list' && (
                    <div className={`w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white ${theme === 'light' ? '' : 'invert'}`}>
                        <table className="w-full table-auto min-w-[900px] border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Name</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coverage</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                                            Loading policies...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                                            {search ? 'No policies match your search.' : 'No policies found. Create your first one.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((policy) => {
                                        const c = colorSet(policy.policy_type);
                                        return (
                                            <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium text-gray-800">{policy.policy_name}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                                        {policy.policy_type.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {policy.duration_value ? `${policy.duration_value} ${policy.duration_unit}` : '—'}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${policy.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {policy.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <Link
                                                        href={`configDocuments/coverage/${policy.id}`}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                                    >
                                                        <Eye size={12} /> View coverage
                                                        <ChevronRight size={12} />
                                                    </Link>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Link href={`policies/policyForm?id=${policy.id}`} className="text-gray-500 hover:text-blue-600 transition-colors">
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(policy.id, token!)}
                                                            className="text-gray-500 hover:text-red-600 transition-colors"
                                                            aria-label="Delete policy"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <span className="flex justify-end mt-4">
                    <Pagination setCount={setCurrentPage} count={currentPage} totalPages={totalPages} style="relative right-0 w-54" />
                </span>
            </main>

            <ConfirmationModal
                title={confirmModalConfig.title}
                message={confirmModalConfig.message}
                actionType={confirmModalConfig.actionType}
                confirmText={confirmModalConfig.confirmText}
                onConfirm={confirmModalConfig.onConfirm}
                onClose={() => setIsConfirmModalOpen(false)}
                isOpen={isConfirmModalOpen}
                isLoading={isProcessing}
            />
        </>
    );
}