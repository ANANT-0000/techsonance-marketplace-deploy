'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { Save, ArrowLeft, Percent } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useForm } from "react-hook-form";
import { authToken } from "@/utils/authToken";
import {
    fetchCreateTaxSlab,
    fetchSingleTaxSlab, // Updated import
    fetchTaxProfiles,
    fetchUpdateTaxSlab
} from "@/utils/vendorApiClient";

// ── Configuration Array ───────────────────────────────────────────────
export const TAXSLAB_FORM_FIELDS = [
    // Links to Tax Profile (required by tax_types insert)
    {
        name: "tax_profile_id",
        label: "Tax Profile",
        type: "select",
        required: true,
        placeholder: "Select a tax profile...",
        note: "The category this slab belongs to (e.g. Electronics, Apparel)",
        gridSpan: 2 // Added so it spans the full row
    },

    // tax_types fields (semantic definition)
    {
        name: "tax_name",
        label: "Tax name",
        type: "text",
        required: true,
        placeholder: "e.g. GST",
        note: "The tax authority name"
    },
    {
        name: "tax_code",
        label: "Tax code",
        type: "text",
        required: true,
        placeholder: "e.g. GST-IN-18",
        note: "Unique identifier used in invoices and reports"
    },
    {
        name: "tax_scope",
        label: "Tax scope",
        type: "select",
        required: true,
        options: [
            { value: "Intra-state", label: "Intra-state (CGST + SGST)" },
            { value: "Inter-state", label: "Inter-state (IGST)" },
            { value: "Both", label: "Both — resolved at checkout" },
        ],
        note: "For Indian GST, always use 'Both' — the split is auto-detected from addresses",
        gridSpan: 2
    },

    // tax_slabs fields (numeric rate)
    {
        name: "slab_name",
        label: "Slab name",
        type: "text",
        required: true,
        placeholder: "e.g. GST 18% — Electronics",
    },
    {
        name: "total_rate",
        label: "Total GST rate (%)",
        type: "number",
        required: true,
        placeholder: "18",
        step: "0.01",
        note: "Enter the full rate (e.g. 18 for GST 18%). Split calculated at checkout"
    },
    {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe the slab...",
        note: "Optional",
        gridSpan: 2 // Make textarea span full width
    },
    {
        name: "effective_from",
        label: "Effective from",
        type: "date",
        required: true
    },
    {
        name: "effective_to",
        label: "Effective to (leave blank if ongoing)",
        type: "date"
    },
    {
        name: "is_exempt",
        label: "Tax exempt (0% rate)",
        type: "checkbox",
        gridSpan: 2
    },
];

// ── Main Component ────────────────────────────────────────────────────
export default function TaxSlabFormPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const vendorId = user && 'vendor_id' in user ? user.vendor_id : '';
    const slabId = params.id as string; // Updated from rateId to slabId

    const isEditMode = slabId !== 'new';

    const [loading, setLoading] = useState(isEditMode);
    const [profiles, setProfiles] = useState<{ id: string; profile_type: string }[]>([]);
    const token = authToken();

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors }
    } = useForm();

    useEffect(() => {
        if (!token) redirect("/auth/vendorLogin");

        const fetchData = async () => {
            try {
                // Always fetch profiles for the dropdown
                const profilesRes = await fetchTaxProfiles('desc', undefined, token);
                setProfiles(profilesRes?.data || []);

                // Only fetch existing slab data in edit mode
                if (isEditMode) {
                    const res = await fetchSingleTaxSlab(slabId, token);
                    if (res?.data) {
                        reset({
                            ...res.data,
                            effective_from: res.data.effective_from?.split('T')[0],
                            effective_to: res.data.effective_to === '2099-12-31'
                                ? '' // show blank instead of sentinel date
                                : res.data.effective_to?.split('T')[0],
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load form dependencies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, slabId, isEditMode, reset]);

    const onSubmit = async (data: any) => {
        try {
            // Apply the 2099-12-31 sentinel logic before submitting if left blank
            const payload = {
                ...data,
                effective_to: data.effective_to ? data.effective_to : '2099-12-31'
            };

            if (isEditMode) {
                await fetchUpdateTaxSlab(slabId, payload, token!);
            } else {
                await fetchCreateTaxSlab(payload, token!);
            }
            router.push(`/vendor/finances/tax-rates`);
        } catch (error) {
            alert(`Failed to ${isEditMode ? 'update' : 'create'} Tax Rule.`);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading form data...</div>;

    return (
        <section className="w-full px-1">
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Percent size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Tax Rule & Rate' : 'New Tax Rule & Rate'}
                    </h1>
                </div>
                <Link href={`/vendor/finances/tax-rates`} className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 shadow-sm hover:bg-gray-50">
                    <ArrowLeft size={16} /> Back to Rates
                </Link>
            </header>

            <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white p-6 mb-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {TAXSLAB_FORM_FIELDS.map((field) => {
                            // Determine grid span width
                            const spanClass = field.gridSpan === 2 ? "col-span-1 md:col-span-2" : "col-span-1";

                            // ── 1. SELECT RENDERER ──
                            if (field.type === 'select') {
                                const options = field.name === 'tax_profile_id'
                                    ? profiles.map(p => ({ value: p.id, label: p.profile_type }))
                                    : field.options ?? [];

                                return (
                                    <div key={field.name} className={spanClass}>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                        </label>
                                        <select
                                            {...register(field.name, { required: field.required })}
                                            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors"
                                        >
                                            <option value="">{field.placeholder ?? `Select...`}</option>
                                            {options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        {field.note && <p className="text-xs text-gray-400 mt-1">{field.note}</p>}
                                        {errors[field.name] && <span className="text-xs text-red-500 mt-1 block">This field is required</span>}
                                    </div>
                                );
                            }

                            // ── 2. TEXTAREA RENDERER ──
                            if (field.type === 'textarea') {
                                return (
                                    <div key={field.name} className={spanClass}>
                                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <textarea
                                            {...register(field.name, { required: field.required })}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none resize-none"
                                        />
                                        {field.note && <p className="text-xs text-gray-400 mt-1">{field.note}</p>}
                                        {errors[field.name] && <span className="text-xs text-red-500 mt-1 block">This field is required</span>}
                                    </div>
                                );
                            }

                            // ── 3. CHECKBOX RENDERER ──
                            if (field.type === 'checkbox') {
                                return (
                                    <div key={field.name} className={spanClass}>
                                        <div className="flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                {...register(field.name)}
                                                className="w-5 h-5 text-blue-500 bg-gray-50 border-gray-300 rounded focus:ring-blue-400"
                                            />
                                            <label className="ml-2 text-sm font-semibold text-gray-700">{field.label}</label>
                                        </div>
                                    </div>
                                );
                            }

                            // ── 4. DEFAULT (INPUT) RENDERER ──
                            return (
                                <div key={field.name} className={spanClass}>
                                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={field.type}
                                        step={field.step}
                                        {...register(field.name, { required: field.required })}
                                        placeholder={field.placeholder}
                                        className={`w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white outline-none ${field.type === 'number' ? 'font-bold text-blue-600' : ''}`}
                                    />
                                    {field.note && <p className="text-xs text-gray-400 mt-1">{field.note}</p>}
                                    {errors[field.name] && <span className="text-xs text-red-500 mt-1 block">This field is required</span>}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
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