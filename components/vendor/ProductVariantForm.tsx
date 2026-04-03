'use client';
import { FileOrImage, ProductImageType, VariantFormValuesType } from "@/utils/Types";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DynamicIcon } from "lucide-react/dynamic";
import { createProductVariant } from "@/utils/vendorApiClient";
import { usePreviewUrls } from "@/lib/utils";
import { PRODUCT_FORM_FIELDS } from "@/app/vendor/[vendorId]/products/productUpdateForm/[id]/page";
const FILE_UPLOAD_FIELD_LABELS = [
    { label: "Product Images / Thumbnail", fieldName: "variantMediaMain" as keyof VariantFormValuesType },
    { label: "Feature / Specification Media", fieldName: "variantMediaGallery" as keyof VariantFormValuesType },
] as const;



export const ProductVariantForm = ({
    vendorId,
    productId,
    existVariant,
}: {
    vendorId: string;
    productId: string;
    existVariant?: VariantFormValuesType;
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<VariantFormValuesType>({
        defaultValues: existVariant ?? {
            variantName: "",
            attributes: [{ name: "", value: "" }],
            basePrice: null,
            discountPercent: null,
            stocks: null,
            sku: "",
            variantMediaMain: [],
            variantMediaGallery: [],
            status: "active",
        },
    });

    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } =
        useFieldArray({ control, name: "attributes" });

    // ── File state ──
    const [productFiles, setProductFiles] = useState<FileOrImage[]>(() =>
        existVariant?.variantMediaMain ?? []
    );
    const [featureFiles, setFeatureFiles] = useState<FileOrImage[]>(() =>
        existVariant?.variantMediaGallery ?? []
    );
    const { getPreviewUrl, revokeAll, revokeOne } = usePreviewUrls();


    useEffect(() => {
        return () => revokeAll();
    }, []);
    const fileStateMap = {
        variantMediaMain: { files: productFiles, setFiles: setProductFiles },
        variantMediaGallery: { files: featureFiles, setFiles: setFeatureFiles },
    } as const;


    const handleFileSelect = useCallback(
        (
            e: React.ChangeEvent<HTMLInputElement>,
            currentFiles: FileOrImage[],
            setFiles: React.Dispatch<React.SetStateAction<FileOrImage[]>>,
            fieldName: keyof VariantFormValuesType
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
            fieldName: keyof VariantFormValuesType
        ) => {
            const removed = currentFiles[index];
            revokeOne(removed); // free memory for this file only
            const updated = currentFiles.filter((_, i) => i !== index);
            setFiles(updated);
            setValue(fieldName, updated as any, { shouldDirty: true });
        },
        [setValue, revokeOne]
    );

    // ── Submit ──
    const onSubmit = async (data: VariantFormValuesType) => {
        if (!user?.vendor_id || !user?.company_id) return;

        const payload = {
            product_id: productId,
            variant_name: data.variantName,
            attributes: data.attributes,
            status: data.status.toLowerCase(),
            price: String(data.basePrice),
            discount_percent: data.discountPercent ?? 0,
            stock_quantity: Number(data.stocks) ?? 0,
            sku: data.sku,
        };

        const formData = new FormData();
        productFiles.forEach((f) => { if (f instanceof File) formData.append("product", f); });
        featureFiles.forEach((f) => { if (f instanceof File) formData.append("product_spec", f); });
        formData.append("variant_data", JSON.stringify(payload));

        const result = await createProductVariant(formData, vendorId, productId);
        if (result?.status === 201) {
            router.push(`/vendor/${vendorId}/products`);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── HEADER ── */}
            <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Add Product Variant</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Creating a new variation for product #{productId}
                    </p>
                </div>
            </header>

            {/* ── 1. VARIANT DETAILS & ATTRIBUTES ── */}
            <div className="border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                    <DynamicIcon name="layers" size={18} className="text-indigo-500" />
                    <h2 className="text-base font-semibold text-slate-800">Variant Details</h2>
                </div>
                <div className="p-6 space-y-5">
                    {/* Variant Name */}
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                            Variant Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                            placeholder="e.g. Red - Medium"
                            {...register("variantName", { required: "Variant name is required" })}
                        />
                        {errors.variantName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <DynamicIcon name="alert-circle" size={12} />{errors.variantName.message}
                            </p>
                        )}
                    </div>

                    {/* Attributes */}
                    <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-700">Variant Attributes</h3>
                            <button
                                type="button"
                                onClick={() => appendAttribute({ name: "", value: "" })}
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
                                        className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-white rounded-md p-1 border shadow-sm"
                                    >
                                        <DynamicIcon name="trash-2" size={14} />
                                    </button>
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Attribute (e.g. Color, Size)
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. Size"
                                            {...register(`attributes.${index}.name`, { required: "Required" })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Value</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. Large"
                                            {...register(`attributes.${index}.value`, { required: "Required" })}
                                        />
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
                    <DynamicIcon name="tag" size={18} className="text-blue-500" />
                    <h2 className="text-base font-semibold text-slate-800">Pricing & Inventory</h2>
                </div>
                <div className="p-6">
                    <div className="p-6 flex flex-col md:flex-row gap-6 border border-slate-200 rounded-xl bg-slate-50">
                        {
                            Array.isArray(PRODUCT_FORM_FIELDS) && PRODUCT_FORM_PRICING_FIELDS.map((field) => (
                                <div key={field.name} className="mb-4 flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        className=" form_input w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={field.placeholder}
                                        {...register(field.name, { required: "Required" })}
                                    />
                                    {errors[field.name] && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <DynamicIcon name="alert-circle" size={16} />{errors[field.name]?.message as string}
                                        </p>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* ── 3. MEDIA ── */}
            <div className="border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                    <DynamicIcon name="image" size={18} className="text-indigo-500" />
                    <h2 className="text-base font-semibold text-slate-800">Variant Images</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FILE_UPLOAD_FIELD_LABELS.map(({ label, fieldName }) => {
                        const { files, setFiles } = fileStateMap[fieldName];

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
                                        onChange={(e) =>
                                            handleFileSelect(
                                                e,
                                                files,
                                                setFiles as React.Dispatch<React.SetStateAction<FileOrImage[]>>,
                                                fieldName
                                            )
                                        }
                                    />
                                    <DynamicIcon name="upload-cloud" size={32} className="text-blue-400 group-hover:text-blue-600 transition mb-2" />
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
                                                    alt={`variant-preview-${i}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleFileRemove(
                                                            i,
                                                            files,
                                                            setFiles as React.Dispatch<React.SetStateAction<FileOrImage[]>>,
                                                            fieldName
                                                        )
                                                    }
                                                    className="absolute top-1 right-1 p-0.5 bg-red-50 text-red-400 hover:text-red-600 transition rounded-full border border-red-200"
                                                    title="Remove image"
                                                >
                                                    <DynamicIcon name="x" size={12} />
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

            {/* ── FOOTER CTA ── */}
            <div className="flex justify-end gap-3 pb-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="border border-slate-300 bg-white text-slate-700 text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition shadow-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting
                        ? <><DynamicIcon name="loader-2" size={15} className="animate-spin" /> Saving…</>
                        : "Save Variant"
                    }
                </button>
            </div>
        </form>
    );
};