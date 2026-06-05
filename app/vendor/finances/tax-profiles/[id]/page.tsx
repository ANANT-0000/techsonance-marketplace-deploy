'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { Save, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useForm } from "react-hook-form";
import { authToken } from "@/utils/authToken";
import { fetchCreateTaxProfile, fetchSingleTaxProfile, fetchUpdateTaxProfile } from "@/utils/vendorApiClient";

type FieldConfig = {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'checkbox';
    required?: boolean;
    placeholder?: string;
    gridSpan?: 1 | 2;
};

export default function UnifiedTaxProfileFormPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const vendorId = (user && 'vendor_id' in user ? user.vendor_id : '') ?? '';
    const profileId = params.id as string;
    
    // Determine mode
    const isEditMode = profileId !== 'new';

    const [loading, setLoading] = useState(isEditMode);
    const token = authToken();
    
    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { isSubmitting, errors } 
    } = useForm();

    // Dynamic Field Configuration
    const formFields: FieldConfig[] = [
        { name: "profile_type", label: "Profile Name (Category)", type: "text", required: true, placeholder: "e.g. Electronics 18%, Apparel 5%", gridSpan: 2 },
        { name: "tax_profile_description", label: "Description", type: "textarea", required: true, placeholder: "Briefly describe what products this applies to...", gridSpan: 2 },
        { name: "is_default", label: "Set as default profile for new products", type: "checkbox", gridSpan: 2 },
    ];

    // Fetch existing data for Edit Mode
    useEffect(() => {
        if (!token) redirect("/auth/vendorLogin");
        
        const fetchProfileData = async () => {
            if (!isEditMode) return; 
            try {
                const res = await fetchSingleTaxProfile(profileId, token!);
                if(res.data?.data) {
                    reset(res.data.data); // Instantly populate the form
                }
            } catch (error) {
                console.error("Failed to load Profile details");
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [token, profileId, isEditMode, reset]);

    const onSubmit = async (data: any) => {
        try {
            if (isEditMode) {
                await fetchUpdateTaxProfile(profileId, data, token!);
            } else {
                await fetchCreateTaxProfile(data, token!);
            }
            router.push(`/vendor/finances/tax-profiles`);
        } catch (error) {
            alert(`Failed to ${isEditMode ? 'update' : 'create'} Tax Profile.`);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading form data...</div>;

    return (
        <section className="w-full  px-1">
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Layers size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Tax Profile' : 'New Tax Profile'}
                    </h1>
                </div>
                <Link href={`/vendor/finances/tax-profiles`} className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 shadow-sm hover:bg-gray-50">
                    <ArrowLeft size={16} /> Back to Profiles
                </Link>
            </header>

            <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white p-6 mb-4">
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
                    
                    {formFields.map((field) => {
                        if (field.type === 'checkbox') {
                            return (
                                <div key={field.name} className={`flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 col-span-1 md:col-span-${field.gridSpan}`}>
                                    <input 
                                        type="checkbox" 
                                        id={field.name} 
                                        {...register(field.name)} 
                                        className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                                    />
                                    <label htmlFor={field.name} className="text-sm font-medium text-gray-800 cursor-pointer">{field.label}</label>
                                </div>
                            );
                        }

                        if (field.type === 'textarea') {
                            return (
                                <div key={field.name} className={`col-span-1 md:col-span-${field.gridSpan}`}>
                                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <textarea 
                                        {...register(field.name, { required: field.required })} 
                                        placeholder={field.placeholder} 
                                        rows={3}
                                        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors" 
                                    />
                                    {errors[field.name] && <span className="text-xs text-red-500 mt-1 block">This field is required</span>}
                                </div>
                            );
                        }

                        return (
                            <div key={field.name} className={`col-span-1 md:col-span-${field.gridSpan}`}>
                                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input 
                                    type={field.type} 
                                    {...register(field.name, { required: field.required })} 
                                    placeholder={field.placeholder} 
                                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors" 
                                />
                                {errors[field.name] && <span className="text-xs text-red-500 mt-1 block">This field is required</span>}
                            </div>
                        );
                    })}

                    <div className="col-span-2 flex justify-end pt-4 mt-2 border-t border-gray-100">
                        <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70">
                            {isSubmitting ? "Processing..." : (
                                <>
                                    <Save size={18} /> 
                                    {isEditMode ? "Update Profile" : "Save Profile"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}