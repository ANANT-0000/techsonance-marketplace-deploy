'use client';
import { useFieldArray, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Plus, UploadCloud, Layers, Tag, Image, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { BASE_API_URL } from "@/constants/constants";

type VariantUpdateValues = {
    variantName: string;
    attributes: { name: string; value: string }[];
    basePrice: number;
    discountPercent: number;
    stocks: number;
    sku: string;
    status: string;
};

export default function VariantUpdateForm() {
    const { vendorId, productId, variantId } = useParams<{ vendorId: string; productId: string; variantId: string }>();
    const router = useRouter();
    const [isFetching, setIsFetching] = useState(true);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [existingMedia, setExistingMedia] = useState<any[]>([]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<VariantUpdateValues>({
        defaultValues: {
            variantName: "",
            attributes: [{ name: "", value: "" }],
            basePrice: 0,
            discountPercent: 0,
            stocks: 0,
            sku: "",
            status: "active",
        },
    });

    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({ control, name: "attributes" });

    useEffect(() => {
        const loadVariantData = async () => {
            setIsFetching(true);
            try {
                // Adjust this to your actual API fetch method for variants
                const response = await fetch(`${BASE_API_URL}products/variants/${variantId}`);
                const { data } = await response.json();
                
                reset({
                    variantName: data.name || "",
                    attributes: data.attributes || [{ name: "", value: "" }],
                    basePrice: data.base_price || 0,
                    discountPercent: data.discount_percent || 0,
                    stocks: data.stock_quantity || 0,
                    sku: data.sku || "",
                    status: data.status || "active",
                });
                setExistingMedia(data.images || []);
            } catch (error) {
                console.error("Error fetching variant", error);
            } finally {
                setIsFetching(false);
            }
        };
        if (variantId) loadVariantData();
    }, [variantId, reset]);

    const onSubmit = async (data: VariantUpdateValues) => {
        const payload = {
            id: variantId,
            product_id: productId,
            name: data.variantName,
            attributes: data.attributes,
            status: data.status,
            base_price: Number(data.basePrice),
            discount_percent: Number(data.discountPercent),
            stock_quantity: Number(data.stocks),
            sku: data.sku,
        };

        try {
            // Replace with your PATCH/PUT variant API
            console.log("Variant Update Payload", payload);
            await new Promise((r) => setTimeout(r, 1000)); 
            setSubmitStatus("success");
            setTimeout(() => setSubmitStatus("idle"), 3000);
        } catch {
            setSubmitStatus("error");
            setTimeout(() => setSubmitStatus("idle"), 3000);
        }
    };

    if (isFetching) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="text-sm font-medium">Loading variant details…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-8 px-4">
            <div className="mx-auto">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* ── HEADER ── */}
                    <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Update Variant</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Editing variant <span className="font-mono text-indigo-600">#{variantId}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            {submitStatus === "success" && <span className="text-emerald-600 font-medium text-sm flex items-center gap-1"><CheckCircle2 size={16}/> Saved!</span>}
                            <button type="button" onClick={() => router.back()} className="border border-slate-300 bg-white text-slate-700 text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition">
                                Back
                            </button>
                            <button type="submit" disabled={isSubmitting || !isDirty} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                                {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save Changes"}
                            </button>
                        </div>
                    </header>

                    {/* ── 1. VARIANT DETAILS & ATTRIBUTES ── */}
                    <div className="border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                            <Layers size={18} className="text-indigo-500" />
                            <h2 className="text-base font-semibold text-slate-800">Variant Details</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block mb-1.5 text-sm font-semibold text-slate-700">Variant Name</label>
                                <input type="text" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" {...register("variantName", { required: "Required" })} />
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-slate-700">Variant Attributes</h3>
                                    <button type="button" onClick={() => appendAttribute({ name: "", value: "" })} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                                        <Plus size={14} /> Add Attribute
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {attributeFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-3 relative border border-slate-200 rounded-xl p-4 bg-slate-50 group">
                                            <button type="button" onClick={() => removeAttribute(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Key (e.g. Size)</label>
                                                <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm outline-none" {...register(`attributes.${index}.name`)} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Value (e.g. XL)</label>
                                                <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm outline-none" {...register(`attributes.${index}.value`)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 2. PRICING & INVENTORY ── */}
                    <div className="border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                            <Tag size={18} className="text-indigo-500" />
                            <h2 className="text-base font-semibold text-slate-800">Pricing & Inventory</h2>
                        </div>
                        <div className="p-6 flex flex-wrap gap-5">
                            <div className="flex-1 min-w-[180px]">
                                <label className="block mb-1.5 text-sm font-semibold text-slate-700">Base Price (₹)</label>
                                <input type="number" step="0.01" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" {...register("basePrice")} />
                            </div>
                            <div className="flex-1 min-w-[180px]">
                                <label className="block mb-1.5 text-sm font-semibold text-slate-700">Discount (%)</label>
                                <input type="number" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none" {...register("discountPercent")} />
                            </div>
                            <div className="flex-1 min-w-[180px]">
                                <label className="block mb-1.5 text-sm font-semibold text-slate-700">Stock Quantity</label>
                                <input type="number" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none" {...register("stocks")} />
                            </div>
                            <div className="flex-1 min-w-[180px]">
                                <label className="block mb-1.5 text-sm font-semibold text-slate-700">SKU</label>
                                <input type="text" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none" {...register("sku")} />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}