'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { Save, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { authToken } from "@/utils/authToken";


export default function AddGstFormPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.vendorId as string;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        gst_number: "", legal_name: "", trade_name: "",
        state_code: "", registration_type: "Regular",
        registration_date: "", effective_from: "",
        is_default: false
    });

    const token = authToken();
    
    useEffect(() => {
        if (!token) redirect("/auth/vendorLogin");
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // await vendorApiClient.post('/finances/taxes/gst', formData, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // router.push(`/vendor/${vendorId}/finances/gst`);
        } catch (error) {
            console.error("Error saving GST:", error);
            alert("Failed to save GST. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-full max-w-4xl px-1">
            {/* Header */}
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Building2 size={22} className="text-emerald-500" />
                    <h1 className="text-2xl font-bold text-gray-800">New GST Registration</h1>
                </div>
                <Link href={`/vendor/${vendorId}/finances/gst`} className="flex items-center gap-2 font-semibold text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                    <ArrowLeft size={16} /> Back to List
                </Link>
            </header>

            {/* Form Container imitating the table wrapper style */}
            <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white p-6 mb-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">GSTIN Number <span className="text-red-500">*</span></label>
                        <input required type="text" name="gst_number" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-emerald-400 focus:bg-white focus:outline-none font-mono uppercase transition-colors" placeholder="e.g. 22AAAAA0000A1Z5" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Legal Name (As per PAN) <span className="text-red-500">*</span></label>
                            <input required type="text" name="legal_name" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Trade Name</label>
                            <input required type="text" name="trade_name" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">State Code <span className="text-red-500">*</span></label>
                            <input required type="text" name="state_code" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors" placeholder="e.g. 22" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Registration Type</label>
                            <select name="registration_type" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors">
                                <option value="Regular">Regular</option>
                                <option value="Composition">Composition</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Registration Date <span className="text-red-500">*</span></label>
                            <input required type="date" name="registration_date" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors text-gray-700" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Effective From <span className="text-red-500">*</span></label>
                            <input required type="date" name="effective_from" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors text-gray-700" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                        <input type="checkbox" id="is_default" name="is_default" onChange={handleChange} className="w-5 h-5 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer" />
                        <label htmlFor="is_default" className="text-sm font-medium text-gray-800 cursor-pointer">Set as Primary/Default GST Number for future billing</label>
                    </div>

                    <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
                        <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-70">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                            {loading ? "Saving..." : "Save GST Registration"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}