'use client';
import { BASE_API_URL, ORGANIZATION_TAXATION_OPTIONS } from "@/constants";
import { useAppSelector } from "@/hooks/reduxHooks";
import { ProductImageType } from "@/utils/Types";
import { ProductFormValuesType, productSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { DynamicIcon } from "lucide-react/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

const FILE_UPLOAD_FIELD_LABELS = [
    { label: "Product Images / Thumbnail", fieldName: "productMedia" as keyof ProductFormValuesType },
    { label: "Feature / Specification Media", fieldName: "featureMedia" as keyof ProductFormValuesType },
] as const;

export function ProductForm({ categoryOptions, vendorId, existingData }: { categoryOptions: { value: string; label: string }[]; vendorId: string; existingData?: ProductFormValuesType }) {
    const {
        control,
        reset,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValuesType>({
        resolver: zodResolver(productSchema), // Add this
        mode: "onChange",
        defaultValues: {
            productName: "",
            description: "",
            features: [{ title: "", description: "" }],
            attributes: [{ name: "", values: "" }],
            basePrice: null,
            discountPercent: null,
            stocks: null,
            sku: "",
            has_variants: false,
            productMedia: [],
            featureMedia: [],
            category: "",
            status: 'inactive',
            taxProfile: "",
        },
    });
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: "features" });
    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({ control, name: "attributes" });
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const [productFiles, setProductFiles] = useState<File[] | ProductImageType[]>([]);
    const [featureFiles, setFeatureFiles] = useState<File[] | ProductImageType[]>([]);
    const fileStateMap = useMemo(() => ({
        productMedia: { files: productFiles, setFiles: setProductFiles },
        featureMedia: { files: featureFiles, setFiles: setFeatureFiles },
    }), [productFiles, featureFiles]);

    const productPreviewUrls = useMemo(
        () => productFiles.map((file) => (file instanceof File ? URL.createObjectURL(file) : (file as ProductImageType).image_url)),
        [productFiles]
    );
    const featurePreviewUrls = useMemo(
        () => featureFiles.map((file) => (file instanceof File ? URL.createObjectURL(file) : (file as ProductImageType).image_url)),
        [featureFiles]
    );


    useEffect(() => {
        return () => { productPreviewUrls.forEach((url) => URL.revokeObjectURL(url)); };
    }, [productPreviewUrls]);

    useEffect(() => {
        return () => { featurePreviewUrls.forEach((url) => URL.revokeObjectURL(url)); };
    }, [featurePreviewUrls]);

    const previewUrlMap = useMemo(() => ({
        productMedia: productPreviewUrls,
        featureMedia: featurePreviewUrls,
    }), [productPreviewUrls, featurePreviewUrls]);
    const handleFileSelect = useCallback((
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
    }, [setValue]);

    const handleFileRemove = useCallback((
        index: number,
        currentFiles: File[],
        setFiles: React.Dispatch<React.SetStateAction<File[]>>,
        fieldName: keyof ProductFormValuesType
    ) => {
        const updated = currentFiles.filter((_, i) => i !== index);
        setFiles(updated);
        setValue(fieldName, updated as any);
    }, [setValue]);

    const onSubmit = async (data: ProductFormValuesType) => {
        if (productFiles.length === 0 || featureFiles.length === 0) {
            console.warn("Product or feature files are missing.");
            return;
        }
        if (!user || !user.vendor_id || !user.company_id) {
            console.warn("User vendor and company information is missing.");
            return;
        }

        const payload = {
            name: data.productName,
            description: data.description,
            features: data.features,
            attributes: data.attributes,
            category_id: data.category,
            status: data.status.toLowerCase(),
            tax_profile: data.taxProfile,
            has_variants: false,
            base_price: String(data.basePrice),
            discount_percent: String(data.discountPercent),
            stock_quantity: Number(data.stocks),
            sku: data.has_variants ? undefined : data.sku,
        };

        const formData = new FormData();
        productFiles.forEach((file) => formData.append('product', file));
        featureFiles.forEach((file) => formData.append('product_spec', file));
        formData.append('product_data', JSON.stringify(payload));

        try {
            const response = await fetch(`${BASE_API_URL}products/${user.company_id}/${user.vendor_id}`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error("Failed to create product");
            router.push(`/vendor/${vendorId}/products`);
        } catch (error) {
            console.error("Error occurred while creating product:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── HEADER ── */}
            <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Product</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to list a new product.</p>
                </div>
            </header>

            {/* ── 1. GENERAL INFORMATION ── */}
            <div className={"section"}>
                <div className={"section_header"}>
                    <DynamicIcon name="package" size={18} className="text-indigo-500" />
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
                        {errors.productName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><DynamicIcon name="alert-circle" size={12} />{errors.productName.message}</p>}
                    </div>
                    <div>
                        <label className={"form_label"}>Description <span className="text-red-400">*</span></label>
                        <textarea
                            rows={4}
                            className={"form_input"}
                            placeholder="Describe your product…"
                            {...register("description", { required: "Description is required" })}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><DynamicIcon name="alert-circle" size={12} />{errors.description.message}</p>}
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
                                <DynamicIcon name="plus" size={14} /> Add Feature
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
                                        <DynamicIcon name="trash-2" size={14} />
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

                    {/* Attributes */}
                    <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-700">Product Attributes</h3>
                            <button
                                type="button"
                                onClick={() => appendAttribute({ name: "", values: "" })}
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                            >
                                <DynamicIcon name="plus" size={14} /> Add Attribute
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {attributeFields.map((field, index) => (
                                <div key={field.id} className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 group">
                                    <button
                                        type="button"
                                        onClick={() => removeAttribute(index)}
                                        className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-white rounded-md p-1 border border-slate-200 shadow-sm"
                                    >
                                        <DynamicIcon name="trash-2" size={14} />
                                    </button>
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Attribute Title</label>
                                        <input
                                            type="text"
                                            className={'form_input'}
                                            placeholder="e.g. Material Type"
                                            {...register(`attributes.${index}.name`, { required: "Required" })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Details</label>
                                        <textarea
                                            rows={2}
                                            className={"form_input"}
                                            placeholder="e.g. 100% Cotton"
                                            {...register(`attributes.${index}.values`, { required: "Required" })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. PRICING & INVENTORY ── */}
            <div className={"section"}>
                <div className={"section_header"}>
                    <DynamicIcon name="tag" size={18} className="text-blue-500" />
                    <h2 className="text-base font-semibold text-slate-800">Pricing & Inventory</h2>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-5 mb-6">
                        <div className="flex-1 min-w-[180px]">
                            <label className={'form_label'}>Base Price (₹) <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                                <input
                                    inputMode="decimal"
                                    step="0.01"
                                    min={0}
                                    className="my-1 border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white focus:border-blue-500 outline-none transition text-sm text-slate-800 placeholder:text-slate-400 pl-7"
                                    placeholder="0.00"
                                    {...register("basePrice", { required: "Required", min: { value: 0, message: "Must be ≥ 0" } })}
                                />
                            </div>
                            {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className={"form_label"}>Discount (%)</label>
                            <input
                                inputMode="decimal"
                                min={0}
                                max={100}
                                className={"form_input"}
                                placeholder="0"
                                {...register("discountPercent", { min: 0, max: 100 })}
                            />
                            {errors.discountPercent && <p className="text-red-500 text-xs mt-1">{errors.discountPercent.message}</p>}
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className={"form_label"}>Stock Quantity</label>
                            <input type="number" min={0} className={"form_input"} placeholder="0" {...register("stocks", { min: 0 })} />
                            {errors.stocks && <p className="text-red-500 text-xs mt-1">{errors.stocks.message}</p>}
                        </div>

                        <div className="flex-1 min-w-[180px]">
                            <label className={"form_label"}>SKU</label>
                            <input type="text" className={"form_input"} placeholder="e.g. SHIRT-001" {...register("sku")} />
                            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
                        </div>

                    </div>
                </div>
            </div>

            {/* ── 3. MEDIA ── */}
            <div className={"section"}>
                <div className={"section_header"}>
                    <DynamicIcon name="image" size={18} className="text-indigo-500" />
                    <h2 className="text-base font-semibold text-slate-800">Media</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FILE_UPLOAD_FIELD_LABELS.map(({ label, fieldName }) => {
                        const { files, setFiles } = fileStateMap[fieldName];
                        const previewUrls = previewUrlMap[fieldName];
                        return (
                            <div key={fieldName} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">{label}</h3>
                                <label className="flex flex-col items-center justify-center py-2 border-2 border-dashed border-blue-300 bg-blue-50/30 rounded-xl cursor-pointer hover:bg-blue-50 transition group">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e, files as File[], setFiles as React.Dispatch<React.SetStateAction<File[]>>, fieldName)}
                                    />
                                    <DynamicIcon name="upload-cloud" size={32} className="text-blue-400 group-hover:text-blue-600 transition mb-2" />
                                    <p className="text-xs font-semibold text-blue-500 group-hover:text-blue-700">Click to upload</p>
                                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, MP4 up to 10MB</p>
                                </label>
                                {files.length > 0 && (
                                    <ul className="flex flex-wrap gap-3 mt-4">
                                        {files.map((file, i) => (
                                            <li key={i} className="relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm w-20 h-20">
                                                <img
                                                    src={previewUrls[i]}
                                                    alt={`preview-${i}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleFileRemove(i, files as File[], setFiles as React.Dispatch<React.SetStateAction<File[]>>, fieldName)}
                                                    className="absolute top-1 right-1 p-0.5 bg-red-50 text-red-400 hover:text-red-600 transition rounded-full border border-red-200"
                                                >
                                                    <DynamicIcon name="loader-2" size={15} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── 4. Category & TAXATION ── */}
            <div className={"section"}>
                <div className={"section_header"}>
                    <DynamicIcon name="building-2" size={18} className="text-blue-500" />
                    <h2 className="text-base font-semibold text-slate-800">Product Category & Taxation (GST)</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="form_label">Category <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <select
                                {...register('category', { required: "Required" })}
                                className="form_input appearance-none pr-9"
                            >
                                <option value="" disabled>Select Category</option>
                                {categoryOptions.map((c, idx) => (
                                    <option key={idx} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            <DynamicIcon name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.category && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <DynamicIcon name="alert-circle" size={12} />{errors.category.message}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <label className={'form_label'}>Tax Profile <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <select
                                {...register('taxProfile', { required: "Required" })}
                                className="form_input appearance-none pr-9"
                            >
                                <option value="" disabled>Select Tax Profile</option>
                                {ORGANIZATION_TAXATION_OPTIONS.map(({ value, label }, idx) => (
                                    <option value={value} key={idx}>{label}</option>
                                ))}
                            </select>
                            <DynamicIcon name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.taxProfile && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><DynamicIcon name="alert-circle" size={12} />{errors.taxProfile.message}</p>}
                    </div>

                    <div className="relative">
                        <label className={'form_label'}>Status <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <select
                                {...register('status', { required: "Required" })}
                                className="form_input appearance-none pr-9"
                            >
                                <option value="" disabled>Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <DynamicIcon name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.status && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><DynamicIcon name="alert-circle" size={12} />{errors.status.message}</p>}
                    </div>
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
                    {isSubmitting ? <><DynamicIcon name="loader-2" size={15} className="animate-spin" /> Publishing…</> : "Publish Product"}
                </button>
            </div>
        </form>
    );
}