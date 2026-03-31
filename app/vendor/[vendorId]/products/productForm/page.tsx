'use client';
import { useFieldArray, useForm } from "react-hook-form";
import { use, useEffect, useState } from "react";
import { Trash2, Plus, UploadCloud, RefreshCw, Package, Tag, Image, Building2, ChevronDown, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { BASE_API_URL } from "@/constants/constants";
import { ORGANIZATION_TAXATION_FIELDS, } from "@/constants/common";
import { ProductFormValuesType } from "@/utils/Types";
import { useAppSelector } from "@/hooks/reduxHooks";
import { fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { useParams } from "next/navigation";

import { useRouter } from "next/navigation";

export default function ProductForm() {
    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValuesType>({
        defaultValues: {
            productName: "",
            description: "",
            features: [{ title: "", description: "" }],
            basePrice: 0,
            discountPercent: 0,
            stocks: 0,
            sku: "",
            has_variants: false,
            productMedia: [],
            featureMedia: [],
            category: "",
            status: "",
            taxProfile: "",
        },
    });

    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: "features" });
    const { user } = useAppSelector((state) => state.auth);
    const { vendorId } = useParams();
    const router = useRouter();
    const [productFiles, setProductFiles] = useState<File[]>([]);
    const [featureFiles, setFeatureFiles] = useState<File[]>([]);
    const hasVariants = watch("has_variants");
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);

    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
    const FILE_UPLOAD_FIELDS = [
        { label: "Product Images / Thumbnail", files: productFiles, setFiles: setProductFiles, fieldName: "productMedia" as keyof ProductFormValuesType },
        { label: "Feature / Spec Media", files: featureFiles, setFiles: setFeatureFiles, fieldName: "featureMedia" as keyof ProductFormValuesType },
    ] as const;
    useEffect(() => {
        fetchVendorsProductsCategory(vendorId?.toString() || "").then((res) => {
            const options = res.data.map((c: any) => ({ value: c.id, label: c.name }));
            setCategoryOptions(options);
            setCategoriesLoading(false);
        }).catch(() => setCategoriesLoading(false));
    }, [vendorId]);
    // --- Unified file handler ---
    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        currentFiles: File[],
        setFiles: React.Dispatch<React.SetStateAction<File[]>>,
        fieldName: keyof ProductFormValuesType
    ) => {
        if (!e.target.files) return;
        const updated = [...currentFiles, ...Array.from(e.target.files)];
        setFiles(updated);
        setValue(fieldName, updated as any);
        e.target.value = "";
    };

    const handleFileRemove = (
        index: number,
        currentFiles: File[],
        setFiles: React.Dispatch<React.SetStateAction<File[]>>,
        fieldName: keyof ProductFormValuesType
    ) => {
        const updated = currentFiles.filter((_, i) => i !== index);
        setFiles(updated);
        setValue(fieldName, updated as any);
    };

    // --- Submit ---
    const onSubmit = async (data: ProductFormValuesType) => {
        console.log("submit started");
        if (productFiles.length === 0 || featureFiles.length === 0) {
            console.log("product file checking failed", { productFiles, featureFiles });
            setSubmitStatus("error");
            return;
        }
        if (!user || !user.vendor_id || !user.company_id) {
            console.log("user vendor and company information is missing");
            setSubmitStatus("error");
            return;
        }

        const totalStock = Number(data.stocks);

        const payload = {
            name: data.productName,
            description: data.description,
            features: data.features,
            category_id: data.category,
            status: data.status.toLowerCase(),
            tax_profile: data.taxProfile,
            has_variants: false,
            base_price: String(data.basePrice),
            discount_percent: String(data.discountPercent),
            stock_quantity: totalStock,
            sku: data.has_variants ? undefined : data.sku,
        };

        const formData = new FormData();
        productFiles.forEach((file) => formData.append('product', file));
        featureFiles.forEach((file) => formData.append('product_spec', file));
        formData.append('product_data', JSON.stringify(payload));
        // console.log("formData.getAll('product_data'):", formData.getAll('product_data'));
        try {
            const response = await fetch(`${BASE_API_URL}products/${user.company_id}/${user.vendor_id}`, {
                method: "POST",
                body: formData,
            });
            console.log("response", response);
            if (!response.status) throw new Error("Failed to create product");

            setSubmitStatus("success");
            router.push(`/vendor/${vendorId}/products`);
        } catch {
            setSubmitStatus("error");
        }
    };
    return (
        <main className="min-h-screen  py-8 ">
            <div className=" mx-auto">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>

                    {/* ── HEADER ── */}
                    <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Create New Product</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to list a new product.</p>
                        </div>
                        {/* <div className="flex items-center gap-3 flex-wrap">
                            {submitStatus === "success" && (
                                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                                    <CheckCircle2 size={16} /> Published!
                                </span>
                            )}
                            {submitStatus === "error" && (
                                <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                                    <AlertCircle size={16} /> Something went wrong
                                </span>
                            )}
                            <button type="button" className="border border-slate-300 bg-white text-slate-700 text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition shadow-sm">
                                Save Draft
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Publishing…</> : "Publish Product"}
                            </button>
                        </div> */}
                    </header>

                    <div className={"section"}>
                        <div className={"section_header"}>
                            <Package size={18} className="text-indigo-500" />
                            <h2 className="text-base font-semibold text-slate-800">General Information</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className={"form_label"}>Product Name <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    className={'form_input'}
                                    placeholder="e.g. Classic Cotton T-Shirt"
                                    {...register("productName", { required: "Product name is required" })}
                                />
                                {errors.productName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.productName.message}</p>}
                            </div>
                            <div>
                                <label className={"form_label"}>Description <span className="text-red-400">*</span></label>
                                <textarea
                                    rows={4}
                                    className={"form_input"}
                                    placeholder="Describe your product…"
                                    {...register("description", { required: "Description is required" })}
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.description.message}</p>}
                            </div>

                            {/* Features */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-slate-700">Product Features</h3>
                                    <button
                                        type="button"
                                        onClick={() => appendFeature({ title: "", description: "" })}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                                    >
                                        <Plus size={14} /> Add Feature
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {featureFields.map((field, index) => (
                                        <div key={field.id} className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 group">
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-white rounded-md p-1 border border-slate-200 shadow-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Feature Title</label>
                                                <input
                                                    type="text"
                                                    className={'form_input'}
                                                    placeholder="e.g. Waterproof"
                                                    {...register(`features.${index}.title`, { required: "Required" })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Details</label>
                                                <textarea
                                                    rows={2}
                                                    className={"form_input"}
                                                    placeholder="Feature description…"
                                                    {...register(`features.${index}.description`, { required: "Required" })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ── 2. PRICING, INVENTORY ── */}
                    <div className={"section"}>
                        <div className={"section_header"}>
                            <Tag size={18} className="text-blue-500" />
                            <h2 className="text-base font-semibold text-slate-800">Pricing & Inventory</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-wrap gap-5 mb-6">
                                <div className="flex-1 min-w-[180px]">
                                    <label className={'form_label'}>Base Price (₹) <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            className={`my-1 border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500  w-full bg-white focus:border-blue-500 outline-none transition text-sm text-slate-800 placeholder:text-slate-400 pl-7`}
                                            placeholder="0.00"
                                            {...register("basePrice", { required: "Required", min: { value: 0, message: "Must be ≥ 0" } })}
                                        />
                                    </div>
                                    {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <label className={"form_label"}>Discount (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        className={"form_input"}
                                        placeholder="0"
                                        {...register("discountPercent", { min: 0, max: 100 })}
                                    />
                                </div>
                                {!hasVariants && (
                                    <>
                                        <div className="flex-1 min-w-[180px]">
                                            <label className={"form_label"}>Stock Quantity</label>
                                            <input type="number" min={0} className={"form_input"} placeholder="0" {...register("stocks", { min: 0 })} />
                                        </div>
                                        <div className="flex-1 min-w-[180px]">
                                            <label className={"form_label"}>SKU</label>
                                            <input type="text" className={"form_input"} placeholder="e.g. SHIRT-001" {...register("sku")} />
                                        </div>
                                    </>
                                )}
                            </div>


                        </div>
                    </div>

                    {/* ── 3. MEDIA ── */}
                    <div className={"section"}>
                        <div className={"section_header"}>
                            <Image size={18} className="text-indigo-500" />
                            <h2 className="text-base font-semibold text-slate-800">Media</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {FILE_UPLOAD_FIELDS.map(({ label, files, setFiles, fieldName }) => (
                                <div key={fieldName} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">{label}</h3>
                                    <label className="flex flex-col items-center justify-center py-2 border-2 border-dashed border-blue-300 bg-blue-50/30 rounded-xl cursor-pointer hover:bg-blue-50 transition group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            className="hidden"
                                            onChange={(e) => handleFileSelect(e, files, setFiles as any, fieldName)}
                                        />
                                        <UploadCloud size={32} className="text-blue-400 group-hover:text-blue-600 transition mb-2" />
                                        <p className="text-xs font-semibold text-blue-500 group-hover:text-blue-700">Click to upload</p>
                                        <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, MP4 up to 10MB</p>
                                    </label>
                                    {files.length > 0 && (
                                        <ul className="flex flex-wrap gap-3 mt-4">
                                            {files.map((file, i) => (
                                                <li key={i} className="flex justify-between items-start bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs shadow-sm relative">
                                                    {/* <span className="truncate max-w-[180px] font-medium text-slate-700">{file.name}</span> */}
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className=" w-16 h-16 object-cover rounded" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileRemove(i, files, setFiles as any, fieldName)}
                                                        className="absolute top-2 right-2 p-[0.125rem] bg-red-50 text-red-400 hover:text-red-600 transition rounded-2xl"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── 4. ORGANIZATION & TAXATION ── */}
                    <div className={"section"}>
                        <div className={"section_header"}>
                            <Building2 size={18} className="text-blue-500" />
                            <h2 className="text-base font-semibold text-slate-800">Organization & Taxation (GST)</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="form_label">Category <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <select
                                        {...register("category", { required: "Required" })}
                                        disabled={categoriesLoading}
                                        className="form_input appearance-none pr-9 disabled:opacity-50"
                                    >
                                        <option value="">
                                            {categoriesLoading ? "Loading categories…" : "Select Category"}
                                        </option>
                                        {categoryOptions.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {errors.category && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />{errors.category.message}
                                    </p>
                                )}
                            </div>
                            {ORGANIZATION_TAXATION_FIELDS.map(({ name, label, options: opts }) => (
                                <div key={name}>
                                    <label className={'form_label'}>{label} <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <select
                                            {...register(name, { required: "Required" })}
                                            className={`form_input appearance-none pr-9`}
                                        >
                                            <option value="">Select {label}</option>
                                            {opts.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    {errors[name] && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors[name]?.message}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── FOOTER CTA ── */}
                    <div className="flex justify-end gap-3 pb-8">
                        <button type="button" className="border border-slate-300 bg-white text-slate-700 text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition shadow-sm">
                            Save Draft
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Publishing…</> : "Publish Product"}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
}