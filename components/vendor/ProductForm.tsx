'use client';
import { BASE_API_URL, ORGANIZATION_TAXATION_OPTIONS, PRODUCT_FORM_FIELDS, PRODUCT_FORM_PRICING_FIELDS } from "@/constants";
import { useAppSelector } from "@/hooks/reduxHooks";
import { usePreviewUrls } from "@/lib/clientUtils";
import { FileOrImage, ProductImageType } from "@/utils/Types";
import { ProductFormValuesType, productSchema } from "@/utils/validation";
import { createProduct } from "@/utils/vendorApiClient";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { DynamicIcon } from "lucide-react/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";


const FILE_UPLOAD_FIELD_LABELS = [
    { label: "Product Images / Thumbnail", fieldName: "productMedia" as keyof ProductFormValuesType },
    { label: "Feature / Specification Media", fieldName: "featureMedia" as keyof ProductFormValuesType },
] as const;
const PRODUCT_FORM_GENERAL_FIELDS = [
    { name: "productName", label: "Product Name", placeholder: "e.g. Classic Cotton T-Shirt", type: "text" },
    { name: "description", label: "Description", placeholder: "Write a detailed description of the product...", type: "textarea" },
] as const;
const PRODUCT_FORM_PAGE_LABELS = {
    headerTitle: "Create New Product",
    headerDesc: "Fill in the details below to list a new product.",
    draftButton: "Save Draft",
    submitButton: "Publish Product",
}
const PRODUCT_UPDATE_FORM_PAGE_LABELS = {
    headerTitle: "Update Product",
    headerDesc: "Update the details below to modify the product.",
    draftButton: "Save Draft",
    submitButton: "Update Product",
}

export function ProductForm({
    categoryOptions,
    vendorId,
    existingData,
    productId,
}: {
    categoryOptions: { value: string; label: string }[];
    vendorId: string;
    existingData?: Partial<ProductFormValuesType>;
    productId?: string
}) {
    const {
        control,
        reset,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValuesType>({
        resolver: zodResolver(productSchema),
        mode: "onChange",
        defaultValues: {
            productName: "",
            description: "",
            features: [{ title: "", description: "" }],
            attributes: [{ name: "", values: "" }],
            basePrice: "",
            discountPercent: "",
            stocks: "",
            sku: "",
            has_variants: false,
            productMedia: [],
            featureMedia: [],
            category: "",
            status: "inactive",
            taxProfile: "",
        },
    });
    console.log("errors.basePrice", errors.basePrice)
    const formPageLabels = existingData ? PRODUCT_UPDATE_FORM_PAGE_LABELS : PRODUCT_FORM_PAGE_LABELS;
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: "features" });
    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({ control, name: "attributes" });
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [productFiles, setProductFiles] = useState<FileOrImage[]>([]);
    const [featureFiles, setFeatureFiles] = useState<FileOrImage[]>([]);
    const [deletedImgs, setDeletedImgs] = useState<string[]>([])
    const { getPreviewUrl, revokeAll, revokeOne } = usePreviewUrls();
    useEffect(() => {
        return () => revokeAll();
    }, [revokeAll]);
    const fileStateMap = {
        productMedia: { files: productFiles, setFiles: setProductFiles },
        featureMedia: { files: featureFiles, setFiles: setFeatureFiles },
    } as const;
    useEffect(() => {
        if (productId && existingData) {
            reset({ ...existingData, category: existingData.category ?? '', taxProfile: existingData.taxProfile ?? '', status: existingData.status ?? 'inactive' });
            setProductFiles(existingData.productMedia || []);
            setFeatureFiles(existingData.featureMedia || []);
        }
        console.log(existingData)
    }, [existingData, reset, categoryOptions]);

    // ── File handlers ──
    const handleFileSelect = useCallback(
        (
            e: React.ChangeEvent<HTMLInputElement>,
            currentFiles: FileOrImage[],
            setFiles: React.Dispatch<React.SetStateAction<FileOrImage[]>>,
            fieldName: keyof ProductFormValuesType
        ) => {
            if (!e.target.files) return;
            const updated = [...currentFiles, ...Array.from(e.target.files)];
            setFiles(updated);
            setValue(fieldName, updated as any, { shouldDirty: true });
            e.target.value = "";
        },
        [setValue]
    );

    const handleFileRemove = useCallback(
        (
            index: number,
            currentFiles: FileOrImage[],
            setFiles: React.Dispatch<React.SetStateAction<FileOrImage[]>>,
            fieldName: keyof ProductFormValuesType,
            imgId?: string) => {
            const removed = currentFiles[index];
            revokeOne(removed);
            const updated = currentFiles.filter((_, i) => i !== index);
            setFiles(updated);
            setValue(fieldName, updated as any, { shouldDirty: true });
            if (imgId) { setDeletedImgs((prev) => [...prev, imgId]) }
        },
        [setValue, revokeOne]
    );
    console.log("deletedImgs", deletedImgs)

    // ── Submit ──
    const onSubmit = async (data: ProductFormValuesType) => {
        if (!existingData && (productFiles.length === 0 || featureFiles.length === 0)) {
            console.warn("Product or feature files are missing.");
            return;
        }
        if (!user || !user.vendor_id || !user.company_id) {
            console.warn("User vendor and company information is missing.");
            return;
        }
        const isUpdate = Boolean(productId);
        let newProduct = {
            name: data.productName,
            description: data.description,
            features: data.features,
            attributes: data.attributes,
            category_id: data.category,
            status: data.status.toLowerCase(),
            tax_profile: data.taxProfile,
            base_price: String(data.basePrice),
            discount_percent: String(data.discountPercent),
            stock_quantity: Number(data.stocks),
            sku: data.has_variants ? undefined : data.sku,
        };
        const payload = isUpdate ? {
            ...newProduct, variant_name: data.productName,
            variant_id: existingData?.variantId, price: Number(data.basePrice),
        } : newProduct;
        const formData = new FormData();
        productFiles.forEach((file) => { if (file instanceof File) formData.append("product", file); });
        featureFiles.forEach((file) => { if (file instanceof File) formData.append("product_spec", file); });
        formData.append("product_data", JSON.stringify(payload));
        if (deletedImgs.length > 0) {
            formData.append('imagesToDelete', JSON.stringify(deletedImgs))
        }
        try {
            let response;
            if (productId) {
                console.log("updating")
                response = await fetch(
                    `${BASE_API_URL}products/${productId}`,
                    { method: "PATCH", body: formData }
                );
            } else {
                console.log("creating")
                response = await createProduct(formData, vendorId);
            }
            if (!response.ok) console.log(response.status, response.statusText);
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
                    <h1 className="text-2xl font-bold text-slate-900">{formPageLabels.headerTitle}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{formPageLabels.headerDesc}</p>
                </div>
            </header>

            {/* ── 1. GENERAL INFORMATION ── */}
            <div className="section">
                <div className="section_header">
                    <DynamicIcon fallback={() => <p></p>} name="package" size={18} className="text-indigo-500" fallback={() => <p></p>} />
                    <h2 className="text-base font-semibold text-slate-800">General Information</h2>
                </div>
                <div className="p-6 space-y-5">
                    {/* Product Name */}
                    {
                        PRODUCT_FORM_GENERAL_FIELDS.map((field, idx) => (
                            <div key={idx}>
                                <label className="form_label">{field.label} <span className="text-red-400">*</span></label>
                                {field.type === "textarea" ? (
                                    <textarea
                                        className="form_input"
                                        placeholder={field.placeholder}
                                        aria-multiline={true}
                                        {...register(field.name as keyof ProductFormValuesType, { required: "Required" })}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        className="form_input"
                                        placeholder={field.placeholder}
                                        {...register(field.name as keyof ProductFormValuesType, { required: "Required" })}
                                    />
                                )}
                                {errors[field.name] && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={12} />{errors[field.name].message}
                                    </p>
                                )}
                            </div>
                        ))}


                    {/* Features */}
                    <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-700">Product Features</h3>
                            <button
                                type="button"
                                onClick={() => appendFeature({ title: "", description: "" })}
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                            >
                                <DynamicIcon fallback={() => <p></p>} name="plus" size={14} /> Add Feature
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
                                        <DynamicIcon fallback={() => <p></p>} name="trash-2" size={14} />
                                    </button>
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Feature Title</label>
                                        <input
                                            type="text"
                                            className="form_input"
                                            placeholder="e.g. Waterproof"
                                            {...register(`features.${index}.title`)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Details</label>
                                        <textarea
                                            rows={2}
                                            className="form_input"
                                            placeholder="Feature description…"
                                            {...register(`features.${index}.description`)}
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
                                <DynamicIcon fallback={() => <p></p>} name="plus" size={14} /> Add Attribute
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
                                        <DynamicIcon fallback={() => <p></p>} name="trash-2" size={14} />
                                    </button>
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Attribute Title</label>
                                        <input
                                            type="text"
                                            className="form_input"
                                            placeholder="e.g. Material Type"
                                            {...register(`attributes.${index}.name`)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Details</label>
                                        <textarea
                                            rows={2}
                                            className="form_input"
                                            placeholder="e.g. 100% Cotton"
                                            {...register(`attributes.${index}.values`)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. PRICING & INVENTORY ── */}
            <div className="section">
                <div className="section_header">
                    <DynamicIcon fallback={() => <p></p>} name="tag" size={18} className="text-blue-500" />
                    <h2 className="text-base font-semibold text-slate-800">Pricing & Inventory</h2>
                </div>
                <div className="p-6">
                    <div className="p-6 flex flex-col md:flex-row gap-6 border border-slate-200 rounded-xl bg-slate-50">
                        {
                            Array.isArray(PRODUCT_FORM_PRICING_FIELDS) && PRODUCT_FORM_PRICING_FIELDS.map((field) => (
                                <div key={field.name} className="mb-4 flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        {field.label}
                                    </label>


                                    <input
                                        type="text"
                                        className="form_input"
                                        placeholder={field.placeholder}
                                        {...register(field.name as keyof ProductFormValuesType, { required: "Required" })}
                                    />



                                    {errors[field.name as keyof ProductFormValuesType] && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={16} />{errors[field.name as keyof ProductFormValuesType]?.message as string}
                                        </p>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* ── 3. MEDIA ── */}
            <div className="section">
                <div className="section_header">
                    <DynamicIcon fallback={() => <p></p>} name="image" size={18} className="text-indigo-500" />
                    <h2 className="text-base font-semibold text-slate-800">Media</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FILE_UPLOAD_FIELD_LABELS.map(({ label, fieldName }) => {
                        const { files, setFiles } = fileStateMap[fieldName];
                        console.log("files", files)
                        return (
                            <div key={fieldName} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">{label}</h3>

                                {/* Upload area */}
                                <label className="flex flex-col items-center justify-center py-2 border-2 border-dashed border-blue-300 bg-blue-50/30 rounded-xl cursor-pointer hover:bg-blue-50 transition group">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e, files, setFiles as React.Dispatch<React.SetStateAction<FileOrImage[]>>, fieldName)}
                                    />
                                    <DynamicIcon fallback={() => <p></p>} name="upload-cloud" size={32} className="text-blue-400 group-hover:text-blue-600 transition mb-2" />
                                    <p className="text-xs font-semibold text-blue-500 group-hover:text-blue-700">Click to upload</p>
                                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, MP4 up to 10MB</p>
                                </label>

                                {/* Preview list */}
                                {files.length > 0 && (
                                    <ul className="flex flex-wrap gap-3 mt-4">
                                        {files.map((file, i) => (
                                            <li
                                                key={i}
                                                className="relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm w-20 h-20"
                                            >
                                                <img
                                                    src={getPreviewUrl(file)}
                                                    alt={`preview-${i}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleFileRemove(
                                                            i,
                                                            files,
                                                            setFiles as React.Dispatch<React.SetStateAction<FileOrImage[]>>,
                                                            fieldName,
                                                            file.id ? file.id : undefined
                                                        )
                                                    }
                                                    className="absolute top-1 right-1 p-0.5 bg-red-50 text-red-400 hover:text-red-600 transition rounded-full border border-red-200"
                                                    title="Remove image"
                                                >
                                                    <DynamicIcon fallback={() => <p></p>} name="x" size={12} />
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

            {/* ── 4. CATEGORY & TAXATION ── */}
            <div className="section">
                <div className="section_header">
                    <DynamicIcon fallback={() => <p></p>} name="building-2" size={18} className="text-blue-500" />
                    <h2 className="text-base font-semibold text-slate-800">Product Category & Taxation (GST)</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category */}
                    <div>
                        <label className="form_label">Category <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <select {...register("category")} className="form_input appearance-none pr-9" defaultValue={existingData?.category ?? ''}   >
                                <option value="" disabled>Select Category</option>
                                {categoryOptions.map((c, idx) => (
                                    <option key={idx} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            <DynamicIcon fallback={() => <p></p>} name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.category && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={12} />{errors.category.message}
                            </p>
                        )}
                    </div>

                    {/* Tax Profile */}
                    <div>
                        <label className="form_label">Tax Profile <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <select {...register("taxProfile")} className="form_input appearance-none pr-9" defaultValue={existingData?.taxProfile ?? ''}>
                                <option value="" disabled>Select Tax Profile</option>
                                {ORGANIZATION_TAXATION_OPTIONS.map(({ value, label }, idx) => (
                                    <option value={value} key={idx}>{label}</option>
                                ))}
                            </select>
                            <DynamicIcon fallback={() => <p></p>} name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.taxProfile && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={12} />{errors.taxProfile.message}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="form_label">Status <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <select {...register("status")} className="form_input appearance-none pr-9" defaultValue={existingData?.status ?? ''}>
                                <option value="" disabled>Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <DynamicIcon fallback={() => <p></p>} name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.status && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={12} />{errors.status.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FOOTER CTA ── */}
            <div className="flex justify-end gap-3 pb-8">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting
                        ? <>  <DynamicIcon fallback={() => <p></p>} name="loader-2" size={15} className="animate-spin" /> Publishing…</>
                        : "Publish Product"
                    }
                </button>
            </div>
        </form>
    );
}