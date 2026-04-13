'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dot, Edit, Landmark, AlertCircle, UploadCloud, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { billingSchema, BillingFormData } from '@/utils/validation';

// const DEFAULT_SETTINGS = {
//     gstin: "24ABCDE1234F1Z5",
//     pan: "ABCDE1234F",
//     businessName: "TechWorld Innovations Pvt Ltd",
//     prefix: "INV",
//     year: 2026,
//     startSequence: 467,
//     termsAndNotes: "Thank you for your business..."
//     signatureUrl: ''
// };
export default function BillingAndBankingPage() {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<BillingFormData>({
        resolver: zodResolver(billingSchema),
        mode: "onChange",
        defaultValues: {
            gstin: "",
            pan: "",
            businessName: "",
            prefix: "",
            year: 0,
            startSequence: 1,
            termsAndNotes: "",
            signatureUrl: ''
        }
    });

    const watchedPrefix = watch("prefix");
    const watchedYear = watch("year");
    const watchedSequence = watch("startSequence");

    // Handle Signature Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setValue("signatureUrl", url); // In real app, upload to S3/Cloudinary first
        }
    };

    const onSubmit = (data: BillingFormData) => {
        console.log("Saving Billing Data:", data);
    };

    return (
        <main className="max-w-5xl mx-auto py-10 px-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* --- TAX IDENTITY --- */}
                <section className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                    <header className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Tax Identity</h1>
                            <p className="text-sm text-gray-500">Manage your GSTIN and PAN details.</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-full px-4 py-1 text-xs font-bold text-green-600">
                            Verified Status: Active
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">GSTIN Number</label>
                            <input
                                {...register("gstin")}
                                className={`form_input uppercase ${errors.gstin ? 'border-red-500' : ''}`}
                            />
                            {errors.gstin && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.gstin.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">PAN Number</label>
                            <input
                                {...register("pan")}
                                className={`form_input uppercase ${errors.pan ? 'border-red-500' : ''}`}
                            />
                            {errors.pan && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.pan.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Registered Business Name</label>
                        <input {...register("businessName")} className="form_input" />
                        {errors.businessName && <p className="text-red-500 text-xs">{errors.businessName.message}</p>}
                    </div>
                </section>

                {/* --- INVOICE CUSTOMIZATION --- */}
                <section className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-6">Invoice Customization</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-sm font-semibold block">Invoice Prefix & Year</label>
                            <div className="flex">
                                <input {...register("prefix")} className="form_input rounded-r-none border-r-0 w-24 text-center uppercase" />
                                <div className="bg-gray-100 border-y border-gray-300 flex items-center px-3 text-gray-400">-</div>
                                <select {...register("year", { valueAsNumber: true })}className="form_input rounded-l-none">
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <p className="text-xs text-gray-400 font-medium italic">
                                Preview format: <span className="text-blue-600 font-bold">{watchedPrefix}-{watchedYear}-{String(watchedSequence).padStart(5, '0')}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold block">Starting Sequence</label>
                            <input type="number" {...register("startSequence", { valueAsNumber: true })} className="form_input" />
                        </div>
                    </div>

                    {/* Signature Upload */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <label className="text-sm font-semibold block mb-4">Authorized Signature</label>
                        <div className="flex items-center gap-6">
                            <div className="relative w-48 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden group">
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} className="w-full h-full object-contain p-2" alt="Signature" />
                                        <button
                                            type="button"
                                            onClick={() => { setPreviewUrl(null); setValue("signatureUrl", ""); }}
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <Trash2 className="text-white" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-1">
                                        <UploadCloud size={24} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Upload PNG</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 max-w-xs">
                                Upload a transparent PNG of your signature. This will appear at the bottom of every generated invoice.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <label className="text-sm font-semibold block mb-2">Invoice Terms & Notes</label>
                        <textarea {...register("termsAndNotes")} rows={3} className="form_input w-full" placeholder="Default terms and conditions..." />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </section>
            </form>
        </main>
    );
}