'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { Save, ArrowLeft, Percent } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authToken } from "@/utils/authToken";
import {  fetchCreateTaxRate, fetchSingleTaxRate, fetchTaxProfiles, fetchUpdateTaxRate } from "@/utils/vendorApiClient";

export default function UnifiedTaxRateFormPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.vendorId as string;
    const rateId = params.id as string;
    
    const isEditMode = rateId !== 'new';

    const [loading, setLoading] = useState(isEditMode);
    const [profiles, setProfiles] = useState<{id: string,profile_type: string}[]>([]);
    const token = authToken();
    
    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { isSubmitting, errors } 
    } = useForm();

    // Fetch Profiles (always needed) and Existing Data (if edit mode)
    useEffect(() => {
        if (!token) redirect("/auth/vendorLogin");
        
        const fetchData = async () => {
            try {
                // 1. Fetch available profiles for the Select dropdown
                const profilesRes = await fetchTaxProfiles('', undefined, token);
                setProfiles(profilesRes?.data.data || []);
console.log("Fetched Profiles for Rate Form:", profilesRes?.data.data);
                // 2. Fetch existing rate data if editing
                if (isEditMode) {
                    const res = await fetchSingleTaxRate(rateId, token!);
                    
                    if(res.data?.data) {
                        const formattedData = {
                            ...res.data.data,
                            effective_from: res.data.data.effective_from?.split('T')[0],
                            effective_to: res.data.data.effective_to?.split('T')[0]
                        };
                        reset(formattedData);
                    }
                }
            } catch (error) {
                console.error("Failed to load form dependencies");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, rateId, isEditMode, reset]);

    const onSubmit = async (data: any) => {
        try {
            if (isEditMode) {
                    await  fetchUpdateTaxRate(rateId, data, vendorId, token!);
            } else {
                await  fetchCreateTaxRate(data, token!);
            }
            router.push(`/vendor/${vendorId}/finances/tax-rates`);
        } catch (error) {
            alert(`Failed to ${isEditMode ? 'update' : 'create'} Tax Rule.`);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading form data...</div>;

    return (
        <section className="w-full  px-1">
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Percent size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Tax Rule & Rate' : 'New Tax Rule & Rate'}
                    </h1>
                </div>
                <Link href={`/vendor/${vendorId}/finances/tax-rates`} className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 shadow-sm hover:bg-gray-50">
                    <ArrowLeft size={16} /> Back to Rates
                </Link>
            </header>

            <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white p-6 mb-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    
                    {/* Section 1 */}
                    <div className="border-b border-gray-100 pb-6">
                        <label className="text-sm font-bold text-gray-800 mb-3 block">1. Assign to Tax Profile <span className="text-red-500">*</span></label>
                        <select 
                            {...register("tax_profile_id", { required: true })}
                            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors"
                        >
                            <option value="">Select a Tax Profile...</option>
                            {Array.isArray(profiles) &&  profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.profile_type}</option>
                            ))}
                        </select>
                        {errors.tax_profile_id && <span className="text-xs text-red-500 mt-1 block">Please select a profile</span>}
                    </div>

                    {/* Section 2 */}
                    <div className="border-b border-gray-100 pb-6">
                        <label className="text-sm font-bold text-gray-800 mb-3 block">2. Tax Type Definition</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Tax Name <span className="text-red-500">*</span></label>
                                <input type="text" {...register("tax_name", { required: true })} placeholder="e.g. State GST" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Tax Code <span className="text-red-500">*</span></label>
                                <input type="text" {...register("tax_code", { required: true })} placeholder="e.g. SGST" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Scope <span className="text-red-500">*</span></label>
                                <select {...register("tax_scope", { required: true })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none">
                                    <option value="Intra-state">Intra-state (Local)</option>
                                    <option value="Inter-state">Inter-state (National)</option>
                                    <option value="Global">Global</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div>
                        <label className="text-sm font-bold text-gray-800 mb-3 block">3. Rate & Applicability</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Rate Display Name <span className="text-red-500">*</span></label>
                                <input type="text" {...register("tax_rate_name", { required: true })} placeholder="e.g. SGST 9%" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Applicable State / Region <span className="text-red-500">*</span></label>
                                <input type="text" {...register("state", { required: true })} placeholder="e.g. Maharashtra" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Tax Percentage (%) <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" {...register("tax_rate_value", { required: true })} placeholder="9.00" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none font-bold text-blue-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Effective From <span className="text-red-500">*</span></label>
                                <input type="date" {...register("effective_from", { required: true })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Effective To (Leave empty if ongoing)</label>
                                <input type="date" {...register("effective_to")} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
                        <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70">
                            {isSubmitting ? "Processing..." : (
                                <>
                                    <Save size={18} /> 
                                    {isEditMode ? "Update Tax Rule" : "Save Tax Rule"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}