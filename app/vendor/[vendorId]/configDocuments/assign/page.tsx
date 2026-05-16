'use client';
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { assignPolicyToCategory, assignProductPolicyOverride, deleteProductPolicy, fetchProductPolicies, fetchVendorOneProducts, fetchVendorProductsOptions, fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { set } from "date-fns";
import fa from "zod/v4/locales/fa.cjs";

interface PolicyOption { id: string; policy_name: string; }
interface CategoryOption { id: string; name: string; }
interface ProductOption { id: string; name: string; }

interface AssignPolicySchema {
    target_type: 'category' | 'product';
    policy_id: string;
    target_id: string;
    priority?: number;
    overrides_category?: boolean;
}

// const loadPolicies = async (setPolicies: React.Dispatch<React.SetStateAction<PolicyOption[]>>, token: string) => {
//     const result = await fetchProductPolicies(token);
//     console.log('Fetched policies for assignment:', result);
//     setPolicies(result?.data ?? []);
//     const categoryOptions = await fetchVendorsProductsCategory(token);  

//     const productOptions = await fetchVendorProductsOptions(token);
//     console.log('Unique category IDs:', categoryOptions.data);
//     console.log('Unique product IDs:', productOptions.data);
// };

// delete handler

export default function AssignPolicyPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<AssignPolicySchema>({
        defaultValues: { target_type: 'category', priority: 1, overrides_category: true },
    });

    const [globalError, setGlobalError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);


    const [policies, setPolicies] = useState<PolicyOption[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const targetType = watch('target_type');
    const token =authToken()  
    useEffect(() => {
       Promise.all([
            fetchProductPolicies(token!),
            fetchVendorsProductsCategory(token!),
            fetchVendorProductsOptions(token!),
        ]).then(([policiesResult, categoriesResult, productsResult]) => {
            setPolicies(policiesResult?.data ?? []);
            setCategories(categoriesResult?.data ?? []);
            setProducts(productsResult?.data ?? []);
            console.log('Fetched policies for assignment:', policiesResult, 'Categories:', categoriesResult, 'Products:', productsResult);
            setLoadingOptions(false);
        }).catch((error) => {
            console.error('Error fetching options:', error);
            setGlobalError('Failed to load policies, categories, or products. Please try again later.');
            setLoadingOptions(false);
        });
   
        },[token]);
                

const onSubmit = async (data: AssignPolicySchema) => {
    setGlobalError(null);
    try {
        const result = data.target_type === 'category'
            ? await assignPolicyToCategory(
                { category_id: data.target_id, policy_id        : data.policy_id, priority: data.priority ?? 1 },
                token!,
              )
            : await assignProductPolicyOverride(
                { product_id: data.target_id, policy_id: data.policy_id, overrides_category: data.overrides_category ?? true },
                token!,
              );

        if (result?.error || result?.statusCode >= 400) {
            setGlobalError(result?.message ?? 'Failed to assign policy.');
            return;
        }
        router.push('../configDocuments');
    } catch {
        setGlobalError('Failed to assign policy.');
    }
};
 
    return (
        <>
            <main className="px-1 py-4 w-full max-w-3xl mx-auto">
                <header className="my-6">
                    <h1 className="font-bold text-2xl text-gray-800">Assign Product Policy</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Apply rules to an entire category or override them for a specific product.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        {globalError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                                {globalError}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                                {successMsg}
                            </div>
                        )}

                        <div className="flex flex-col gap-5">
                            {/* Target Type */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Where should this policy apply?</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-blue-50 transition w-full">
                                        <input
                                            type="radio"
                                            value="category"
                                            className="w-4 h-4 accent-blue-600"
                                            {...register('target_type')}
                                        />
                                        <span className="font-medium text-gray-700">Category Default</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-blue-50 transition w-full">
                                        <input
                                            type="radio"
                                            value="product"
                                            className="w-4 h-4 accent-blue-600"
                                            {...register('target_type')}
                                        />
                                        <span className="font-medium text-gray-700">Specific Product Override</span>
                                    </label>
                                </div>
                            </div>

                            {/* Policy Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">Select Policy to Assign</label>
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={loadingOptions}
                                    {...register('policy_id', { required: 'Please select a policy' })}
                                >
                                    <option value="">
                                        {loadingOptions ? 'Loading policies...' : '-- Choose Policy --'}
                                    </option>
                                    {policies.map((p) => (
                                        <option key={p.id} value={p.id}>{p.policy_name}</option>
                                    ))}
                                </select>
                                {errors.policy_id && (
                                    <p className="text-xs text-red-500">{errors.policy_id.message}</p>
                                )}
                            </div>

                            {/* Dynamic Target (Category or Product) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-600">
                                    {targetType === 'category' ? 'Select Category' : 'Select Product'}
                                </label>
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={loadingOptions}
                                    {...register('target_id', { required: 'Please select a target' })}
                                >
                                    <option value="">
                                        {loadingOptions
                                            ? 'Loading...'
                                            : `-- Choose ${targetType === 'category' ? 'Category' : 'Product'} --`}
                                    </option>
                                    {(targetType === 'category' ? categories : products).map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                                {errors.target_id && (
                                    <p className="text-xs text-red-500">{errors.target_id.message}</p>
                                )}
                            </div>

                            {/* Priority (categories only) */}
                            {targetType === 'category' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-600">
                                        Priority Level <span className="text-gray-400 font-normal">(lower = higher priority)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        {...register('priority', { valueAsNumber: true })}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="w-full flex justify-end gap-4">
                        <Link
                            href="../policies"
                            className="py-2.5 px-6 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || loadingOptions}
                            className="py-2.5 px-6 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-sm disabled:opacity-60"
                        >
                            {isSubmitting ? 'Assigning...' : 'Assign Policy'}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}