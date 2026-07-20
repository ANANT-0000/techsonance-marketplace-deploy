"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";
import {
  FileOrProductImage,
  ProductImage,
  ProductStatus,
  Product,
  VariantFormValues,
} from "@/utils/Types";
import { useAppSelector } from "@/hooks/reduxHooks";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DynamicIcon } from "lucide-react/dynamic";
import {
  createProductVariant,
  updateProductVariant,
} from "@/utils/vendorApiClient";
import { usePreviewUrls } from "@/lib/clientUtils";
import { PRODUCT_FORM_PRICING_FIELDS } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductVariantFormValuesType,
  productVariantSchema,
} from "@/utils/validation";
import { ArrowLeft } from "lucide-react";
import { generateSKU } from "@/utils/generateSku";
import { authToken } from "@/utils/authToken";
import { PRODUCT_VARIANT_FORM_TEXT } from "@/constants/vendorText";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import toast from "react-hot-toast";

// Replaced constants
export const ProductVariantForm = ({
  vendorId,
  productId,
  warehouseOptions,
  productDetails,
  existVariant,
  variantId,
}: {
  vendorId: string;
  productId?: string;
  warehouseOptions?: { value: string; label: string }[];
  productDetails?: {
    id: string;
    name: string;
    category: { id: string; name: string };
  };
  existVariant?: VariantFormValues;
  variantId?: string;
}) => {
  const companyId = getClientCompanyId();

  const isEditMode = Boolean(variantId && existVariant);
  const router = useRouter();
  const { user } = useAppSelector((state: any) => state.auth);
  const {
    control,
    watch,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productVariantSchema),
    mode: "onChange",
    defaultValues: {
      variantName: "",
      attributes: [{ name: "", value: "" }],
      basePrice: "",
      discountPercent: "",
      stocks: "",
      sku: "",
      variantMediaMain: [],
      variantMediaGallery: [],
      warehouseId: "",
      status: ProductStatus.INACTIVE,
      weight_kg: "",
      length_cm: "",
      width_cm: "",
      height_cm: "",
    },
  });
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({ control, name: "attributes" });
  const [deletedImgs, setDeletedImgs] = useState<string[]>([]);
  const [productFiles, setProductFiles] = useState<FileOrProductImage[]>([]);
  const [featureFiles, setFeatureFiles] = useState<FileOrProductImage[]>([]);
  const { getPreviewUrl, revokeAll, revokeOne } = usePreviewUrls();
  const variantName = watch("variantName");
  const attributes = watch("attributes");
  const [isAutoGenerating, setIsAutoGenerating] = useState(true);

  useEffect(() => {
    if (isAutoGenerating && (productDetails?.name || variantName)) {
      const newSku = generateSKU({
        productName: productDetails?.name || variantName || "",
        categoryName: productDetails?.category.name,
        attributes: attributes,
      });

      setValue("sku", newSku, { shouldValidate: true });
    }
  }, [
    variantName,
    attributes,
    productDetails?.name,
    productDetails?.category.name,
    isAutoGenerating,
    setValue,
  ]);

  // ── Populate form when editing ──
  useEffect(() => {
    if (!existVariant) return;
    reset({
      variantName: existVariant.variantName,
      attributes: existVariant.attributes?.length
        ? existVariant.attributes.map(
            (attr: { name: string; value: string }) => ({
              name: attr.name,
              value: attr.value,
            }),
          )
        : [{ name: "", value: "" }],
      basePrice: existVariant.basePrice,
      discountPercent: existVariant.discountPercent,
      stocks: existVariant.stocks,
      sku: existVariant.sku,
      variantMediaMain: existVariant.variantMediaMain ?? [],
      variantMediaGallery: existVariant.variantMediaGallery ?? [],
      warehouseId: existVariant.warehouseId || "",
      status: (existVariant.status as ProductStatus) ?? ProductStatus.INACTIVE,
      weight_kg: existVariant.weight_kg || "",
      length_cm: existVariant.length_cm || "",
      width_cm: existVariant.width_cm || "",
      height_cm: existVariant.height_cm || "",
    });

    const initialProductFiles =
      (existVariant.variantMediaMain as FileOrProductImage[]) || [];
    const initialFeatureFiles =
      (existVariant.variantMediaGallery as FileOrProductImage[]) || [];

    setProductFiles(initialProductFiles);
    setFeatureFiles(initialFeatureFiles);
    setValue("variantMediaMain", initialProductFiles as any, {
      shouldDirty: false,
    });
    setValue("variantMediaGallery", initialFeatureFiles as any, {
      shouldDirty: false,
    });
  }, [existVariant, variantId]); // reset is stable, no need to add it

  // Re-sync select if options load after initial reset
  useEffect(() => {
    if (existVariant?.warehouseId && warehouseOptions?.length) {
      setValue("warehouseId", existVariant.warehouseId);
    }
  }, [existVariant?.warehouseId, warehouseOptions, setValue]);

  const token = authToken();
  useEffect(() => {
    if (!token) redirect(VEDNOR_LOGIN_PATH);
    return () => revokeAll();
  }, []);
  const fileStateMap = {
    variantMediaMain: { files: productFiles, setFiles: setProductFiles },
    variantMediaGallery: { files: featureFiles, setFiles: setFeatureFiles },
  } as const;

  const handleFileSelect = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      currentFiles: FileOrProductImage[],
      setFiles: React.Dispatch<React.SetStateAction<FileOrProductImage[]>>,
      fieldName: keyof ProductVariantFormValuesType,
    ) => {
      if (!e.target.files) return;
      const updated = [...currentFiles, ...Array.from(e.target.files)];
      setFiles(updated);
      setValue(
        fieldName as keyof ProductVariantFormValuesType,
        updated as any,
        { shouldDirty: true },
      );
      e.target.value = "";
    },
    [setValue],
  );

  const handleFileRemove = useCallback(
    (
      index: number,
      currentFiles: FileOrProductImage[],
      setFiles: React.Dispatch<React.SetStateAction<FileOrProductImage[]>>,
      fieldName: keyof ProductVariantFormValuesType,
      id?: string,
    ) => {
      const removed = currentFiles[index];
      revokeOne(removed); // free memory for this file only
      const updated = currentFiles.filter((_, i) => i !== index);
      setFiles(updated);
      setValue(
        fieldName as keyof ProductVariantFormValuesType,
        updated as any,
        { shouldDirty: true },
      );
      if (id) {
        setDeletedImgs((prev) => [...prev, id]);
      }
    },
    [setValue, revokeOne],
  );

  // ── Submit ──
  const onSubmit = async (data: ProductVariantFormValuesType) => {
    if (user && "vendor_id" in user && user.vendor_id && !user.company_id)
      return;

    const payload = {
      product_id: productId,
      variant_name: data.variantName,
      attributes: data.attributes,
      status: data.status.toLowerCase(),
      price: String(data.basePrice),
      discount_percent: data.discountPercent ?? 0,
      stock_quantity: String(data.stocks) ?? 0,
      sku: data.sku,
      warehouse_id: data.warehouseId,
      weight_kg: data.weight_kg,
      length_cm: data.length_cm,
      width_cm: data.width_cm,
      height_cm: data.height_cm,
    };

    const formData = new FormData();
    productFiles.forEach((f) => {
      if (f instanceof File) formData.append("product", f);
    });
    featureFiles.forEach((f) => {
      if (f instanceof File) formData.append("product_spec", f);
    });
    formData.append("variant_data", JSON.stringify(payload));
    if (deletedImgs.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(deletedImgs));
    }
    const createOrUpdate = async () => {
      if (!token || !companyId) {
        toast.error(PRODUCT_VARIANT_FORM_TEXT.ERRORS.SESSION_EXPIRED_SAVE, {
          icon: '🔒',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }
      if (variantId && existVariant?.productId) {
        return await updateProductVariant(
          formData,
          existVariant.productId,
          variantId,
          token,
          companyId,
        );
      } else {
        if (!productId) {
          return;
        }
        return await createProductVariant(
          formData,
          productId,
          token,
          companyId,
        );
      }
    };
    const response = await createOrUpdate();
    if (response?.status === 200 || response.status == 201) {
      router.push("/vendor/products");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-4 p-2.5 mb-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition shadow-sm"
      >
        <ArrowLeft size={18} /> {PRODUCT_VARIANT_FORM_TEXT.ACTIONS.BACK}
      </button>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── HEADER ── */}
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-theme-h4 font-bold text-slate-900">
              {isEditMode
                ? PRODUCT_VARIANT_FORM_TEXT.PAGE.UPDATE.TITLE
                : PRODUCT_VARIANT_FORM_TEXT.PAGE.CREATE.TITLE}
            </h1>
            <p className="text-theme-body-sm text-slate-500 mt-0.5">
              {isEditMode
                ? `Editing variant: ${existVariant?.variantName}`
                : `Creating a new variation for product #${productId}`}
            </p>
          </div>
        </header>

        {/* ── 1. VARIANT DETAILS & ATTRIBUTES ── */}
        <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl mb-8 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-slate-200">
          <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/30 flex items-center gap-3">
            <DynamicIcon
              fallback={() => <p></p>}
              name="layers"
              size={18}
              className="text-indigo-500"
            />
            <h2 className="text-theme-body font-semibold text-slate-800">
              {PRODUCT_VARIANT_FORM_TEXT.SECTIONS.DETAILS}
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Variant Name */}
            <div>
              <label className="block mb-1.5 text-theme-body-sm font-semibold text-slate-700">
                {PRODUCT_VARIANT_FORM_TEXT.LABELS.NAME}{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-theme-body-sm"
                placeholder={PRODUCT_VARIANT_FORM_TEXT.LABELS.NAME_PH}
                {...register("variantName", {
                  required: "Variant name is required",
                })}
              />
              {errors.variantName && (
                <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                  <DynamicIcon
                    fallback={() => <p></p>}
                    name="alert-circle"
                    size={12}
                  />
                  {errors.variantName.message}
                </p>
              )}
            </div>

            {/* Attributes */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-theme-body-sm font-semibold text-slate-700">
                  {PRODUCT_VARIANT_FORM_TEXT.LABELS.ATTR_TITLE}
                </h3>
                <button
                  type="button"
                  onClick={() => appendAttribute({ name: "", value: "" })}
                  className="flex items-center gap-1.5 text-theme-caption font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                >
                  <DynamicIcon fallback={() => <p></p>} name="plus" size={14} />{" "}
                  {PRODUCT_VARIANT_FORM_TEXT.ACTIONS.ADD_ATTR}
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
                      className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-white rounded-md p-1 border shadow-sm"
                    >
                      <DynamicIcon
                        fallback={() => <p></p>}
                        name="trash-2"
                        size={14}
                      />
                    </button>
                    <div className="mb-3">
                      <label className="block text-theme-caption font-semibold text-slate-600 mb-1">
                        {PRODUCT_VARIANT_FORM_TEXT.LABELS.ATTR_NAME}
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={
                          PRODUCT_VARIANT_FORM_TEXT.LABELS.ATTR_NAME_PH
                        }
                        {...register(`attributes.${index}.name`, {
                          required: "Required",
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-theme-caption font-semibold text-slate-600 mb-1">
                        {PRODUCT_VARIANT_FORM_TEXT.LABELS.ATTR_VAL}
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={
                          PRODUCT_VARIANT_FORM_TEXT.LABELS.ATTR_VAL_PH
                        }
                        {...register(`attributes.${index}.value`, {
                          required: "Required",
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
        <div className="border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <DynamicIcon
              fallback={() => <p></p>}
              name="tag"
              size={18}
              className="text-blue-500"
            />
            <h2 className="text-theme-body font-semibold text-slate-800">
              {PRODUCT_VARIANT_FORM_TEXT.SECTIONS.PRICING}
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
                      type={field.type}
                      className=" form_input w-full border rounded-lg px-4 py-2.5 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={field.placeholder}
                      {...register(
                        field.name as keyof ProductVariantFormValuesType,
                        { required: "Required" },
                      )}
                    />
                    {errors[
                      field.name as keyof ProductVariantFormValuesType
                    ] && (
                      <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                        <DynamicIcon
                          fallback={() => <p></p>}
                          name="alert-circle"
                          size={16}
                        />
                        {
                          errors[
                            field.name as keyof ProductVariantFormValuesType
                          ]?.message as string
                        }
                      </p>
                    )}
                  </div>
                ))}
              <div>
                <label className="block text-theme-body-sm font-semibold text-slate-700 mb-1">
                  {PRODUCT_VARIANT_FORM_TEXT.LABELS.WAREHOUSE}
                </label>
                <select
                  className="form_input w-full border rounded-lg px-4 py-2.5 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register(
                    "warehouseId" as keyof ProductVariantFormValuesType,
                    { required: "Please select a warehouse" },
                  )}
                >
                  <option value="">
                    {PRODUCT_VARIANT_FORM_TEXT.LABELS.SELECT_WAREHOUSE}
                  </option>
                  {warehouseOptions?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. LOGISTICS & DIMENSIONS ── */}
        <div className="border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
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
                <label className="block text-theme-body-sm font-semibold text-slate-700 mb-1">
                  Weight (kg) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2.5 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. 0.5"
                  {...register("weight_kg")}
                />
                {errors.weight_kg && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon
                      fallback={() => <p></p>}
                      name="alert-circle"
                      size={14}
                    />
                    {errors.weight_kg.message as string}
                  </p>
                )}
              </div>

              {/* Length */}
              <div>
                <label className="block text-theme-body-sm font-semibold text-slate-700 mb-1">
                  Length (cm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2.5 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. 15"
                  {...register("length_cm")}
                />
                {errors.length_cm && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon
                      fallback={() => <p></p>}
                      name="alert-circle"
                      size={14}
                    />
                    {errors.length_cm.message as string}
                  </p>
                )}
              </div>

              {/* Width */}
              <div>
                <label className="block text-theme-body-sm font-semibold text-slate-700 mb-1">
                  Width (cm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2.5 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. 10"
                  {...register("width_cm")}
                />
                {errors.width_cm && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon
                      fallback={() => <p></p>}
                      name="alert-circle"
                      size={14}
                    />
                    {errors.width_cm.message as string}
                  </p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="block text-theme-body-sm font-semibold text-slate-700 mb-1">
                  Height (cm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2.5 text-theme-body-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. 8"
                  {...register("height_cm")}
                />
                {errors.height_cm && (
                  <p className="text-red-500 text-theme-caption mt-1 flex items-center gap-1">
                    <DynamicIcon
                      fallback={() => <p></p>}
                      name="alert-circle"
                      size={14}
                    />
                    {errors.height_cm.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. MEDIA ── */}
        <div className="border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <DynamicIcon
              fallback={() => <p></p>}
              name="image"
              size={18}
              className="text-indigo-500"
            />
            <div>
              <h2 className="text-theme-body font-semibold text-slate-800">
                {PRODUCT_VARIANT_FORM_TEXT.SECTIONS.MEDIA} <span className="text-slate-400 font-normal ml-1">{PRODUCT_VARIANT_FORM_TEXT.SECTIONS.MEDIA_OPTIONAL}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {PRODUCT_VARIANT_FORM_TEXT.SECTIONS.MEDIA_NOTE}
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCT_VARIANT_FORM_TEXT.FILE_UPLOAD_LABELS.map(
              ({ label, fieldName }) => {
                const { files, setFiles } =
                  fileStateMap[fieldName as keyof typeof fileStateMap];
                return (
                  <div
                    key={fieldName}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                  >
                    <h3 className="text-theme-body-sm font-semibold text-slate-700 mb-3">
                      {label}
                    </h3>

                    {/* Upload area */}
                    <label className="flex flex-col items-center justify-center py-8 border border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl cursor-pointer hover:bg-indigo-50/80 hover:border-indigo-300 transition-all duration-250 ease-out group mt-auto shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_14px_rgba(99,102,241,0.06)]">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileSelect(
                            e,
                            files,
                            setFiles as React.Dispatch<
                              React.SetStateAction<FileOrProductImage[]>
                            >,
                            fieldName as
                              | "variantMediaMain"
                              | "variantMediaGallery",
                          )
                        }
                      />
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm border border-indigo-50 group-hover:scale-105 transition-transform duration-250 ease-out">
                        <DynamicIcon
                          fallback={() => <p></p>}
                          name="upload-cloud"
                          size={24}
                          className="text-indigo-400 group-hover:text-indigo-500 transition-colors"
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                        {PRODUCT_VARIANT_FORM_TEXT.ACTIONS.UPLOAD}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {PRODUCT_VARIANT_FORM_TEXT.MEDIA_GUIDE.LIMITS}
                      </p>
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
                                  setFiles as React.Dispatch<
                                    React.SetStateAction<FileOrProductImage[]>
                                  >,
                                  fieldName as
                                    | "variantMediaMain"
                                    | "variantMediaGallery",
                                  "id" in file ? file.id : "",
                                )
                              }
                              className="absolute top-1 right-1 p-0.5 bg-red-50 text-red-400 hover:text-red-600 transition rounded-full border border-red-200"
                              title="Remove image"
                            >
                              <DynamicIcon
                                fallback={() => <p></p>}
                                name="x"
                                size={12}
                              />
                            </button>
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

        {/* ── FOOTER CTA ── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-slate-300 bg-white text-slate-700 text-theme-body-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            {PRODUCT_VARIANT_FORM_TEXT.ACTIONS.CANCEL}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white text-theme-body-sm font-semibold py-2.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <DynamicIcon
                  name="loader-2"
                  size={15}
                  className="animate-spin"
                  fallback={() => <p />}
                />
                {PRODUCT_VARIANT_FORM_TEXT.ACTIONS.SAVING}
              </>
            ) : isEditMode ? (
              PRODUCT_VARIANT_FORM_TEXT.ACTIONS.UPDATE
            ) : (
              PRODUCT_VARIANT_FORM_TEXT.ACTIONS.SAVE
            )}
          </button>
        </div>
      </form>
    </>
  );
};
