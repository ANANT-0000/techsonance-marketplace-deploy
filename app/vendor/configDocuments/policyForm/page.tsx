'use client';
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { createProductPolicy, fetchProductPolicyById, updateProductPolicy } from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { policyFormSchema, PolicyFormSchemaType } from "@/utils/validation";

const policyTypes = [
    { value: 'warranty', label: 'Warranty' },
    { value: 'guarantee', label: 'Guarantee' },
    { value: 'exchange_only', label: 'Exchange Only' },
    { value: 'no_return', label: 'No Return (Final Sale)' },
    { value: 'extended_support', label: 'Extended Support' },
    { value: 'none', label: 'None' },
] as const;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
const DOMAIN_HEADER = { 'company-domain': typeof window !== 'undefined' ? window.location.hostname : '' };

export default function PolicyFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(policyFormSchema),
        mode: 'onChange',
        defaultValues: {
            policy_name:           '',
                policy_type:          'none',
                duration_value:            undefined,
                duration_unit:              undefined,
                coverage_description:       '',
                exclusions:              '',
                service_provider:          '',
                claim_contact_email:      '',
                claim_contact_phone:       '',
                claim_process_description:  '',
                generates_document:        false,
            is_active: true,
        },
    });

    const [globalError, setGlobalError] = useState<string | null>(null);
    const [isFetchingEdit, setIsFetchingEdit] = useState(false);
    const token=authToken()
    const selectedType = watch('policy_type');
    const requiresDuration = ['warranty', 'guarantee', 'extended_support'].includes(selectedType);

    console.log("isSubmitting:", isSubmitting);
useEffect(() => {
    if (!editId || !token) return;
    setIsFetchingEdit(true);
    fetchProductPolicyById(editId, token)
        .then((result) => {
            const data = result?.data ?? result;
            if (!data) { setGlobalError('Policy not found.'); return; }
            reset({
                policy_name:               data.policy_name ?? '',
                policy_type:               data.policy_type,
                duration_value:            data.duration_value ?? undefined,
                duration_unit:             data.duration_unit ?? undefined,
                coverage_description:      data.coverage_description ?? '',
                exclusions:                data.exclusions ?? '',
                service_provider:          data.service_provider ?? '',
                claim_contact_email:       data.claim_contact_email ?? '',
                claim_contact_phone:       data.claim_contact_phone ?? '',
                claim_process_description: data.claim_process_description ?? '',
                generates_document:        data.generates_document ?? false,
                is_active:                 data.is_active ?? true,
            });
        })
        .catch(() => setGlobalError('Failed to load policy for editing.'))
        .finally(() => setIsFetchingEdit(false));
}, [editId, token, reset]);
const onError = (formErrors: any) => {
    console.log("Validation Failed! Here are the errors:", formErrors);
};
const onSubmit = async (data: PolicyFormSchemaType) => {    
    console.log('submitting')
    setGlobalError(null);
    try {
    
        const result = editId
            ? await updateProductPolicy(editId, data, token!)
            : await createProductPolicy(data, token!);

        if (result?.error || result?.statusCode >= 400) {
            setGlobalError(result?.message ?? 'Failed to save policy.');
            return;
        }
        router.push('/vendor/configDocuments');
    } catch {
        setGlobalError('Failed to save policy.');
    }
};


    return (
        <>
            <main className="px-1 py-4 w-full max-w-5xl mx-auto">
                <header className="my-6">
                    <h1 className="font-bold text-2xl text-gray-800">
                        {editId ? 'Edit Product Policy' : 'Create New Product Policy'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Define warranty or return rules to assign to products/categories.
                    </p>
                </header>

                {isFetchingEdit && (
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-sm border border-blue-200 mb-4">
                        Loading policy data...
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full flex flex-col gap-6">
                    {globalError && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {globalError}
                        </div>
                    )}

                    {/* Basic Details */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">
                                    Policy Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1 Year Manufacturer Warranty"
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    {...register('policy_name')}
                                />
                                {errors.policy_name && (
                                    <p className="text-xs text-red-500">{errors.policy_name.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">
                                    Policy Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    {...register('policy_type')}
                                >
                                    <option value="">Select Type</option>
                                    {policyTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.policy_type && (
                                    <p className="text-xs text-red-500">{errors.policy_type.message}</p>
                                )}
                            </div>
                        </div>

                        {requiresDuration && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-600">Duration Value</label>
                                    
                                    <input
                                        type="number"
                                        min={1}
                                        className="border border-gray-300 rounded-lg px-4 py-2"
                                        {...register('duration_value',{ valueAsNumber: true })}
                                    />
                                    {errors.duration_value && (
                                        <p className="text-xs text-red-500">{errors.duration_value.message}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-600">Duration Unit</label>
                                    <select
                                        className="border border-gray-300 rounded-lg px-4 py-2"
                                        {...register('duration_unit')}
                                    >
                                        <option value="days">Days</option>
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                        <option value="lifetime">Lifetime</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Coverage & Claims */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Coverage & Claims Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Coverage Description</label>
                                <textarea
                                    rows={3}
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="What does this cover?"
                                    {...register('coverage_description')}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Exclusions</label>
                                <textarea
                                    rows={3}
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="What is explicitly excluded?"
                                    {...register('exclusions')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Service Provider</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Brand Service Center"
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    {...register('service_provider')}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Claim Email</label>
                                <input
                                    type="email"
                                    placeholder="support@brand.com"
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    {...register('claim_contact_email')}
                                />
                                {errors.claim_contact_email && (
                                    <p className="text-xs text-red-500">{errors.claim_contact_email.message}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Claim Phone</label>
                                <input
                                    type="text"
                                    placeholder="+91 98765 43210"
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    {...register('claim_contact_phone')}
                                />
                                   {errors.claim_contact_phone && (
                                    <p className="text-xs text-red-500">{errors.claim_contact_phone.message}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Settings */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex gap-8">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-blue-600"
                                {...register('generates_document')}
                            />
                            <span className="text-sm font-medium text-gray-700">Generates Warranty PDF/Document</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-blue-600"
                                {...register('is_active')}
                            />
                            <span className="text-sm font-medium text-gray-700">Policy is Active</span>
                        </label>
                    </section>

                    <div className="w-full flex justify-end gap-4 pb-10">
                        <Link
                            href="/vendor/configDocuments"
                            className="py-2.5 px-6 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || isFetchingEdit}
                            className="py-2.5 px-6 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-sm disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving...' : editId ? 'Update Policy' : 'Save Policy'}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}