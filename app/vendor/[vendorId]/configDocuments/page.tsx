'use client';
import { Pagination } from "@/components/common/Pagination";
import { searchImgDark } from "@/constants/common";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { useAppSelector } from "@/hooks/reduxHooks";
import { ShieldCheck, Plus, Edit, Trash2, Link as LinkIcon } from "lucide-react";
import { deleteProductPolicy, fetchProductPolicies } from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { ActionType, ConfirmationModal } from "@/components/common/ConfirmationModal";

export interface ProductPolicy {
    id: string;
    policy_name: string;
    policy_type: string;
    duration_value?: number;
    duration_unit?: string;
    is_active: boolean;
}

// Adjust this to wherever your Next.js API proxy or backend lives
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export default function PoliciesPage() {
    const { theme } = useAppSelector((state) => state.adminTheme);

    const [policies, setPolicies] = useState<ProductPolicy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [count, setCount] = useState(1);
const token=authToken();
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
     const res = await fetchProductPolicies(token!)
     setPolicies(res.data ?? []);
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
                await deleteProductPolicy(id, token)
                setPolicies(prev => prev.filter(policy => policy.id !== id));
                setIsProcessing(false);
                setIsConfirmModalOpen(false);
            }
        });
        setIsConfirmModalOpen(true);
};

    // ── FIX #11: Apply search filter ─────────────────────────────────────────
    const filtered = policies.filter((p) =>
        p.policy_name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <>
            <main className="w-full px-1 py-4">
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
                            href="configDocuments/assign"
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

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

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
                </div>

                <div className={`w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white ${theme === 'light' ? '' : 'invert'}`}>
                    <table className="w-full table-auto min-w-[900px] border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                                        Loading policies...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                                        {search ? 'No policies match your search.' : 'No policies found. Create your first one.'}
                                    </td>
                                </tr>
                            ) : (
                                // FIX #11: render `filtered` not `policies`
                                filtered.map((policy) => (
                                    <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800">{policy.policy_name}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium capitalize">
                                                {policy.policy_type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {policy.duration_value ? `${policy.duration_value} ${policy.duration_unit}` : 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${policy.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {policy.is_active ? 'Active' : 'Inactive'}
                                            </span>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <span className="flex justify-end mt-4">
                    <Pagination setCount={setCount} count={count} totalPages={1} style="relative right-0 w-54" />
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