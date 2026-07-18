"use client";
import { companyDomain } from "@/config";
import {
  BASE_API_URL,
  ORGANIZATION_TAXATION_OPTIONS,
  PRODUCT_FORM_FIELDS,
  PRODUCT_FORM_PRICING_FIELDS,
} from "@/constants";
import { PRODUCT_FORM_TEXT } from "@/constants/vendorText";
import { useAppSelector } from "@/hooks/reduxHooks";
import { usePreviewUrls } from "@/lib/clientUtils";
import { authToken } from "@/utils/authToken";
import { generateSKU } from "@/utils/generateSku";
import {
  FileOrProductImage,
  ProductImage,
  ProductStatus,
  VendorUser,
} from "@/utils/Types";
import {
  ProductFormInput,
  ProductFormOutput,
  ProductFormValuesType,
  productSchema,
} from "@/utils/validation";
import {
  createInventoryRecord,
  createProduct,
  updateProduct,
} from "@/utils/vendorApiClient";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";

import { ArrowLeft } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useCallback, useState, use } from "react";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { useVendorTour } from "@/components/vendor/VendorTourProvider";

// Replaced constants
export function ProductForm({
  categoryOptions,
  warehouseOptions,
  taxSlabsOptions,
  vendorId,
  existingData,
  productId,
}: {
  categoryOptions: { value: string; label: string }[];
  warehouseOptions?: { value: string; label: string }[];
  taxSlabsOptions: { value: string; label: string }[];
  vendorId: string;
  existingData?: Partial<ProductFormInput | ProductFormOutput>;
  productId?: string;
}) {
  const isUpdate = Boolean(productId && existingData);

  const {
    control,
    reset,
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      productName: "",
      description: "",
      features: [{ title: "", description: "" }],
      attributes: [{ name: "", value: "" }],
      basePrice: "",
      discountPercent: "",
      stocks: "",
      sku: "",
      productMedia: [],
      featureMedia: [],
      category: "",
      status: ProductStatus.INACTIVE,
      warehouseId: "",
      taxSlabId: "",
      weight_kg: "",
      length_cm: "",
      width_cm: "",
      height_cm: "",
    },
  });
  const productName = watch("productName");
  const attributes = watch("attributes"); // Example: { Color: 'Black', Capacity: '256GB' }
  const categoryName = watch("category");
  // Auto-generate SKU when variant details change, ONLY if the user hasn't manually typed a custom SKU
  const [isAutoGenerating, setIsAutoGenerating] = useState(true);
  useEffect(() => {
    if (isAutoGenerating && productName) {
      const newSku = generateSKU({
        productName: productName, // Passed from parent Product
        categoryName: categoryName,
        attributes: attributes,
      });

      setValue("sku", newSku, { shouldValidate: true });
    }
  }, [isAutoGenerating, attributes, productName, categoryName, setValue]);
  const formPageLabels = isUpdate
    ? PRODUCT_FORM_TEXT.PAGE.UPDATE
    : PRODUCT_FORM_TEXT.PAGE.CREATE;
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control, name: "features" });
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({ control, name: "attributes" });
  const user = useAppSelector((state) => state.auth.user) as VendorUser | undefined;
  const router = useRouter();

  const [productFiles, setProductFiles] = useState<FileOrProductImage[]>([]);
  const [featureFiles, setFeatureFiles] = useState<FileOrProductImage[]>([]);
  const [deletedImgs, setDeletedImgs] = useState<string[]>([]);

  const { getPreviewUrl, revokeAll, revokeOne } = usePreviewUrls();
  const token = authToken();
  const { startVendorTour } = useVendorTour();
  
  useEffect(() => {
    if (user && user.preferences && Array.isArray(user.preferences.completed_tours)) {
      if (!user.preferences.completed_tours.includes("productCreation")) {
        const timer = setTimeout(() => {
          startVendorTour("productCreation");
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user, startVendorTour]);

  useEffect(() => {
    return () => revokeAll();
  }, [revokeAll]);

  const fileStateMap = {
    productMedia: { files: productFiles, setFiles: setProductFiles },
    featureMedia: { files: featureFiles, setFiles: setFeatureFiles },
  } as const;

  // Populate form when editing an existing product
  useEffect(() => {
    if (!isUpdate || !existingData) return;
    reset({
      productName: existingData.productName || "",
      description: existingData.description || "",
      features: existingData.features?.length
        ? existingData.features.map((feat) => ({
            title: feat.title,
            description: feat.description,
          }))
        : [{ title: "", description: "" }],
      attributes: existingData.attributes?.length
        ? existingData.attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          }))
        : [{ name: "", value: "" }],
      basePrice: String(existingData.basePrice) ?? "",
      discountPercent: String(existingData.discountPercent) ?? "",
      stocks: String(existingData.stocks) ?? "",
      sku: existingData.sku || "",
      productMedia: [],
      featureMedia: [],
      category: existingData.category || "",
      status:
        (existingData.status as ProductStatus) ||
        ProductStatus.INACTIVE,
      warehouseId: existingData.warehouseId || "",
      taxSlabId: existingData.taxSlabId || "",
      weight_kg: existingData.weight_kg !== undefined && existingData.weight_kg !== null ? String(existingData.weight_kg) : "",
      length_cm: existingData.length_cm !== undefined && existingData.length_cm !== null ? String(existingData.length_cm) : "",
      width_cm: existingData.width_cm !== undefined && existingData.width_cm !== null ? String(existingData.width_cm) : "",
      height_cm: existingData.height_cm !== undefined && existingData.height_cm !== null ? String(existingData.height_cm) : "",
    });

    const initialProductFiles =
      (existingData.productMedia as FileOrProductImage[]) || [];
    const initialFeatureFiles =
      (existingData.featureMedia as FileOrProductImage[]) || [];

    setProductFiles(initialProductFiles);
    setFeatureFiles(initialFeatureFiles);

    // Keep RHF in sync with the pre-loaded image objects
    setValue("productMedia", initialProductFiles as any, {
      shouldDirty: false,
    });
    setValue("featureMedia", initialFeatureFiles as any, {
      shouldDirty: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, existingData]);

  // ── File handlers ──
  const handleFileSelect = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      currentFiles: FileOrProductImage[],
      setFiles: React.Dispatch<React.SetStateAction<FileOrProductImage[]>>,
      fieldName: keyof ProductFormValuesType,
    ) => {
      if (!e.target.files) return;
      const updated = [...currentFiles, ...Array.from(e.target.files)];
      setFiles(updated);
      setValue(fieldName, updated as any, { shouldDirty: true });
      e.target.value = "";
    },
    [setValue],
  );

  const handleFileRemove = useCallback(
    (
      index: number,
      currentFiles: FileOrProductImage[],
      setFiles: React.Dispatch<React.SetStateAction<FileOrProductImage[]>>,
      fieldName: keyof ProductFormValuesType,
      imgId?: string,
    ) => {
      const removed = currentFiles[index];
      revokeOne(removed);
      const updated = currentFiles.filter((_, i) => i !== index);
      setFiles(updated);
      setValue(fieldName, updated as any, { shouldDirty: true });
      if (imgId) setDeletedImgs((prev) => [...prev, imgId]);
    },
    [setValue, revokeOne],
  );

  // ── Submit ──

  const onSubmit = async (data: ProductFormValuesType) => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    // On create, both image sets must have at least one file
    if (!isUpdate && (productFiles.length === 0 || featureFiles.length === 0)) {
      return;
    }

    if (!user || ("vendor_id" in user && !user.vendor_id) || !user.company_id) {
      return;
    }

    const basePayload = {
      name: data.productName,
      description: data.description,
      features: data.features,
      attributes: data.attributes,
      category_id: data.category,
      status: data.status.toLowerCase(),
      base_price: String(data.basePrice),
      discount_percent: data.discountPercent !== null && data.discountPercent !== undefined ? String(data.discountPercent) : "0",
      stock_quantity: Number(data.stocks),
      sku: data.sku,
      warehouse_id: data.warehouseId,
      tax_slab_id: data.taxSlabId,
      variant_name: data.productName,
      weight_kg: String(data.weight_kg),
      length_cm: Number(data.length_cm),
      width_cm: Number(data.width_cm),
      height_cm: Number(data.height_cm),
    };

    const payload = isUpdate
      ? {
          ...basePayload,
          variant_id: existingData?.variantId,
          price: Number(data.basePrice),
        }
      : basePayload;

    const formData = new FormData();
    productFiles.forEach((file) => {
      if (file instanceof File) formData.append("product", file);
    });
    featureFiles.forEach((file) => {
      if (file instanceof File) formData.append("product_spec", file);
    });
    formData.append("product_data", JSON.stringify(payload));
    if (deletedImgs.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(deletedImgs));
    }

    try {
      let response: {
        ok: boolean;
        status: number;
        statusText: string;
        data?: any;
      };

      if (isUpdate) {
        response = await updateProduct(formData, productId!, token);
      } else {
        response = await createProduct(formData, vendorId, token);
      }
      if (response.status !== 201 && response.status !== 200) {
        return;
      }
      router.push("/vendor/products");
    } catch (error) {
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-4 py-2 px-3 mb-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition shadow-sm"
      >
        <ArrowLeft size={18} /> {PRODUCT_FORM_TEXT.ACTIONS.BACK}
      </button>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── HEADER ── */}
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-theme-h4 font-bold text-slate-900">
              {formPageLabels.headerTitle}
            </h1>
            <p className="text-theme-body-sm text-slate-500 mt-0.5">
              {formPageLabels.headerDesc}
            </p>
          </div>
        </header>

        {/* ── 1. GENERAL INFORMATION ── */}
        <div id="tour-product-basic" className="section">
          <div className="section_header">
            <DynamicIcon
              fallback={() => <p></p>}
              name="package"
              size={18}
              className="text-indigo-500"
            />
            <h2 className="text-theme-body font-semibold text-slate-800">
              {PRODUCT_FORM_TEXT.SECTIONS.GENERAL}
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {PRODUCT_FORM_TEXT.GENERAL_FIELDS.map((field, idx) => (
              <div key={idx}>
                <label className="form_label">
                  {field.label} <span className="text-red-400">*</span>
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    className="form_input"
                    placeholder={field.placeholder}
                    aria-multiline={true}
                    {...register(field.name as keyof ProductFormValuesType)}
                  />
                ) : (
                  <input
                    type="text"
                    className="form_input"
                    placeholder={field.placeholder}
                    {...register(field.name as keyof ProductFormValuesType, {
                      required: `${field.label} is required`,
                    })}
                  />
                )}
                {errors[field.name as keyof ProductFormValuesType] && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon
                      fallback={() => <p></p>}
                      name="alert-circle"
                      size={12}
                    />
                    {
                      errors[field.name as keyof ProductFormValuesType]
                        ?.message as string
                    }
                  </p>
                )}
              </div>
            ))}

            {/* Features */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-theme-body-sm font-semibold text-slate-700">
                  {PRODUCT_FORM_TEXT.SECTIONS.FEATURES}
                </h3>
                <button
                  type="button"
                  onClick={() => appendFeature({ title: "", description: "" })}
                  className="flex items-center gap-1.5 text-theme-caption font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                >
                  <DynamicIcon fallback={() => <p></p>} name="plus" size={14} />{" "}
                  {PRODUCT_FORM_TEXT.ACTIONS.ADD_FEATURE}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featureFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 group"
                  >
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-white rounded-md p-1 border border-slate-200 shadow-sm"
                    >
                      <DynamicIcon
                        fallback={() => <p></p>}
                        name="trash-2"
                        size={14}
                      />
                    </button>
                    <div className="mb-3">
                      <label className="block text-theme-caption font-semibold text-slate-600 mb-1">
                        {PRODUCT_FORM_TEXT.LABELS.FEAT_TITLE}
                      </label>
                      <input
                        type="text"
                        className="form_input"
                        placeholder={PRODUCT_FORM_TEXT.LABELS.FEAT_TITLE_PH}
                        {...register(`features.${index}.title`, {
                          required: "Feature title is required",
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-theme-caption font-semibold text-slate-600 mb-1">
                        {PRODUCT_FORM_TEXT.LABELS.DETAILS}
                      </label>
                      <textarea
                        rows={2}
                        className="form_input"
                        placeholder={PRODUCT_FORM_TEXT.LABELS.FEAT_DESC_PH}
                        {...register(`features.${index}.description`, {
                          required: "Feature description is required",
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attributes */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-theme-body-sm font-semibold text-slate-700">
                  {PRODUCT_FORM_TEXT.SECTIONS.ATTRIBUTES}
                </h3>
                <button
                  type="button"
                  onClick={() => appendAttribute({ name: "", value: "" })}
                  className="flex items-center gap-1.5 text-theme-caption font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                >
                  <DynamicIcon fallback={() => <p></p>} name="plus" size={14} />{" "}
                  {PRODUCT_FORM_TEXT.ACTIONS.ADD_ATTRIBUTE}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attributeFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 group"
                  >
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-white rounded-md p-1 border border-slate-200 shadow-sm"
                    >
                      <DynamicIcon
                        fallback={() => <p></p>}
                        name="trash-2"
                        size={14}
                      />
                    </button>
                    <div className="mb-3">
                      <label className="block text-theme-caption font-semibold text-slate-600 mb-1">
                        {PRODUCT_FORM_TEXT.LABELS.ATTR_TITLE}
                      </label>
                      <input
                        type="text"
                        className="form_input"
                        placeholder={PRODUCT_FORM_TEXT.LABELS.ATTR_TITLE_PH}
                        {...register(`attributes.${index}.name`, {
                          required: "Attribute title is required",
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-theme-caption font-semibold text-slate-600 mb-1">
                        {PRODUCT_FORM_TEXT.LABELS.DETAILS}
                      </label>
                      <textarea
                        rows={2}
                        className="form_input"
                        placeholder={PRODUCT_FORM_TEXT.LABELS.ATTR_DESC_PH}
                        {...register(`attributes.${index}.value`, {
                          required: "Attribute value is required",
                        })}
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
            <DynamicIcon
              fallback={() => <p></p>}
              name="tag"
              size={18}
              className="text-blue-500"
            />
            <h2 className="text-theme-body font-semibold text-slate-800">
              {PRODUCT_FORM_TEXT.SECTIONS.PRICING}
            </h2>
          </div>
          <div className="p-6">
            <div className="p-6 flex flex-col md:flex-row gap-6 border border-slate-200 rounded-xl bg-slate-50">
              {Array.isArray(PRODUCT_FORM_PRICING_FIELDS) &&
                PRODUCT_FORM_PRICING_FIELDS.map((field) => (
                  <div key={field.name} className="mb-4 flex-1">
                    <label className="block text-theme-body-sm font-semibold text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      className="form_input"
                      placeholder={field.placeholder}
                      {...register(field.name as keyof ProductFormValuesType)}
                    />
                    {errors[field.name as keyof ProductFormValuesType] && (
                      <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                        <DynamicIcon
                          fallback={() => <p></p>}
                          name="alert-circle"
                          size={16}
                        />
                        {
                          errors[field.name as keyof ProductFormValuesType]
                            ?.message as string
                        }
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── LOGISTICS & DIMENSIONS ── */}
        <div className="section">
          <div className="section_header">
            <DynamicIcon
              fallback={() => <p></p>}
              name="truck"
              size={18}
              className="text-amber-500"
            />
            <h2 className="text-theme-body font-semibold text-slate-800">
              Logistics & Dimensions
            </h2>
          </div>
          <div className="p-6">
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 border border-slate-200 rounded-xl bg-slate-50">
              {/* Weight */}
              <div>
                <label className="form_label">
                  Weight (kg) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="form_input"
                  placeholder="e.g. 0.5"
                  {...register("weight_kg")}
                />
                {errors.weight_kg && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={14} />
                    {errors.weight_kg.message as string}
                  </p>
                )}
              </div>

              {/* Length */}
              <div>
                <label className="form_label">
                  Length (cm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="form_input"
                  placeholder="e.g. 15"
                  {...register("length_cm")}
                />
                {errors.length_cm && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={14} />
                    {errors.length_cm.message as string}
                  </p>
                )}
              </div>

              {/* Width */}
              <div>
                <label className="form_label">
                  Width (cm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="form_input"
                  placeholder="e.g. 10"
                  {...register("width_cm")}
                />
                {errors.width_cm && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={14} />
                    {errors.width_cm.message as string}
                  </p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="form_label">
                  Height (cm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="form_input"
                  placeholder="e.g. 8"
                  {...register("height_cm")}
                />
                {errors.height_cm && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon fallback={() => <p></p>} name="alert-circle" size={14} />
                    {errors.height_cm.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. MEDIA ── */}
        <div className="section">
          <div className="section_header">
            <DynamicIcon
              fallback={() => <p></p>}
              name="image"
              size={18}
              className="text-indigo-500"
            />
            <h2 className="text-theme-body font-semibold text-slate-800">
              {PRODUCT_FORM_TEXT.SECTIONS.MEDIA}
            </h2>
          </div>

          {/* Global Media Guideline Banner */}
          <div className="px-6 pt-4 pb-2">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-3 items-start">
              <DynamicIcon
                fallback={() => <p></p>}
                name="info"
                size={16}
                className="text-indigo-500 mt-0.5 shrink-0"
              />
              <p className="text-theme-caption text-indigo-700 leading-relaxed">
                <strong>{PRODUCT_FORM_TEXT.MEDIA_GUIDE.TITLE}</strong> {PRODUCT_FORM_TEXT.MEDIA_GUIDE.DESC}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCT_FORM_TEXT.FILE_UPLOAD_LABELS.map(
              ({ label, fieldName, limit, hint }) => {
                const { files, setFiles } =
                  fileStateMap[fieldName as keyof typeof fileStateMap];

                return (
                  <div
                    key={fieldName}
                    className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col"
                  >
                    {/* Header & Dynamic Hint */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-theme-body-sm font-semibold text-slate-700">
                          {label}
                        </h3>
                        <span className="text-theme-tiny font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Max {limit} file{limit !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-theme-caption text-slate-500 leading-relaxed">
                        {hint}
                      </p>
                    </div>

                    {/* Upload area */}
                    <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition group mt-auto">
                      <input
                        type="file"
                        multiple={limit > 1} // Dynamically enable multiple uploads based on limit
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileSelect(
                            e,
                            files,
                            setFiles as React.Dispatch<
                              React.SetStateAction<FileOrProductImage[]>
                            >,
                            fieldName as "productMedia" | "featureMedia",
                          )
                        }
                      />
                      <DynamicIcon
                        fallback={() => <p></p>}
                        name="upload-cloud"
                        size={28}
                        className="text-blue-400 group-hover:text-blue-600 transition mb-2"
                      />
                      <p className="text-theme-body-sm font-semibold text-blue-600 group-hover:text-blue-700">
                        {PRODUCT_FORM_TEXT.MEDIA_GUIDE.BROWSE}
                      </p>
                      <p className="text-theme-xxs text-slate-400 mt-1">
                        {PRODUCT_FORM_TEXT.MEDIA_GUIDE.LIMITS}
                      </p>
                    </label>

                    {/* Preview list */}
                    {files.length > 0 && (
                      <ul className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-200/60">
                        {files.map((file: FileOrProductImage, i: number) => (
                          <li
                            key={i}
                            className="relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm w-16 h-16 group/preview"
                          >
                            <img
                              src={getPreviewUrl(file)}
                              alt={`preview-${i}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay that appears on hover for easier deletion */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault(); // Prevent triggering the file input label
                                  handleFileRemove(
                                    i,
                                    files,
                                    setFiles as React.Dispatch<
                                      React.SetStateAction<FileOrProductImage[]>
                                    >,
                                    fieldName as "productMedia" | "featureMedia",
                                    (file as { id?: string }).id ?? undefined,
                                  );
                                }}
                                className="p-1.5 bg-red-500 text-white hover:bg-red-600 transition rounded-full shadow-sm"
                                title="Remove image"
                              >
                                <DynamicIcon
                                  fallback={() => <p></p>}
                                  name="trash-2"
                                  size={14}
                                />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* ── 4. CATEGORY & TAXATION ── */}
        <div id="tour-product-category" className="section">
          <div className="section_header">
            <DynamicIcon
              fallback={() => <p></p>}
              name="building-2"
              size={18}
              className="text-blue-500"
            />
            <h2 className="text-theme-body font-semibold text-slate-800">
              {PRODUCT_FORM_TEXT.SECTIONS.CATEGORY_TAX}
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category */}
            <div>
              <label className="form_label">
                {PRODUCT_FORM_TEXT.LABELS.CATEGORY} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("category")}
                  className="form_input appearance-none pr-9"
                >
                  <option value="" disabled>
                    {PRODUCT_FORM_TEXT.LABELS.SELECT_CATEGORY}
                  </option>
                  {categoryOptions.map((c, idx) => (
                    <option key={idx} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <DynamicIcon
                  fallback={() => <p></p>}
                  name="chevron-down"
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.category && (
                <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                  <DynamicIcon
                    fallback={() => <p></p>}
                    name="alert-circle"
                    size={12}
                  />
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label className="form_label">
                {PRODUCT_FORM_TEXT.LABELS.TAX_RATE} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("taxSlabId")}
                  className="form_input appearance-none pr-9"
                >
                  <option value="" disabled>
                    {PRODUCT_FORM_TEXT.LABELS.SELECT_TAX}
                  </option>
                  {taxSlabsOptions.map((t, idx) => (
                    <option key={idx} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <DynamicIcon
                  fallback={() => <p></p>}
                  name="chevron-down"
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.taxSlabId && (
                <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                  <DynamicIcon
                    fallback={() => <p></p>}
                    name="alert-circle"
                    size={12}
                  />
                  {errors.taxSlabId.message}
                </p>
              )}
            </div>

            <div>
              <label className="form_label">
                {PRODUCT_FORM_TEXT.LABELS.WAREHOUSE} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("warehouseId")}
                  className="form_input appearance-none pr-9"
                >
                  <option value="" disabled>
                    {PRODUCT_FORM_TEXT.LABELS.SELECT_WAREHOUSE}
                  </option>
                  {warehouseOptions &&
                    warehouseOptions.map((v) => (
                      <option value={v.value} key={v.value}>
                        {v.label}
                      </option>
                    ))}
                </select>
                <DynamicIcon
                  fallback={() => <p></p>}
                  name="chevron-down"
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.warehouseId && (
                <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                  <DynamicIcon
                    fallback={() => <p></p>}
                    name="alert-circle"
                    size={12}
                  />
                  {errors.warehouseId.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="form_label">
                Status <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("status")}
                  className="form_input appearance-none pr-9"
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <DynamicIcon
                  fallback={() => <p></p>}
                  name="chevron-down"
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.status && (
                <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                  <DynamicIcon
                    fallback={() => <p></p>}
                    name="alert-circle"
                    size={12}
                  />
                  {errors.status.message}
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
            className="flex items-center gap-2 bg-blue-600 text-white text-theme-body-sm font-semibold py-2.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <DynamicIcon
                  fallback={() => <p></p>}
                  name="loader-2"
                  size={15}
                  className="animate-spin"
                />
                {isUpdate ? "Updating…" : "Publishing…"}
              </>
            ) : (
              formPageLabels.submitButton
            )}
          </button>
        </div>
      </form>
    </>
  );
}
