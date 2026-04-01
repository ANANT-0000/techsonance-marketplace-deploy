'use client';
import { useFieldArray, useForm } from "react-hook-form";
import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import { Trash2, Plus, UploadCloud, Package, Tag, Image, Building2, ChevronDown, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { fetchVendorProducts, fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { ProductFeatureType, ProductImageType, ProductType } from "@/utils/Types";
import { fetchProduct } from "@/utils/commonAPiClient";
import { ca } from "date-fns/locale";
import { ORGANIZATION_TAXATION_OPTIONS } from "@/constants";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { set } from "zod";

type Feature = { title: string; description: string };
export const PRODUCT_FORM_FIELDS = [

  {
    section: "Price & Inventory", icon: 'tag', fields: [
      { name: "basePrice", label: "Base Price (₹)", type: "number" },
      { name: "discountPercent", label: "Discount (%)", type: "number" },
      { name: "stocks", label: "Stock Quantity", type: "number" },
      { name: "sku", label: "SKU", type: "text" },
    ]
  },
  {
    section: "Category & Taxation", icon: 'building-2', fields: [
      { name: "category", label: "Category", type: "select", },
      { name: "status", label: "Status", type: "select", },
      { name: "taxProfile", label: "Tax Profile", type: "select", },
    ]

  }
]
type ProductUpdateFormValues = {
  productName: string;
  description: string;
  features: Feature[];
  basePrice: number;
  discountPercent: number;
  stocks: number;
  sku: string;
  category: string;
  productMedia: File[];
  featureMedia: File[];
  status: string;
  taxProfile: string;
};

export default function ProductUpdateFormPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductUpdateFormValues>({
    defaultValues: {
      productName: "",
      description: "",
      features: [{ title: "", description: "" }],
      basePrice: 0,
      discountPercent: 0,
      stocks: 0,
      sku: "",
      category: "",
      productMedia: [],
      featureMedia: [],
      status: "",
      taxProfile: "",
    },
  });


  const [productData, setProductData] = useState<ProductType | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const { fields, append, remove } = useFieldArray({ control, name: "features" });
  const [productFiles, setProductFiles] = useState<ProductImageType[] | File[]>([]);
  const [featureFiles, setFeatureFiles] = useState<ProductImageType[] | File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isFetching, setIsFetching] = useState(true);
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setIsFetching(true);
      try {
        const productResponse: { data: ProductType } = await fetchProduct(id);
        const product = productResponse?.data;
        console.log("productResponse", productResponse);
        if (!product) return;

        setProductData(product);
        try {
          const vendorId = product.vendor_id || "";
          const categoryResponse = await fetchVendorsProductsCategory(vendorId);
          const categories = categoryResponse?.data || [];

          setCategoryOptions(
            categories.map((cat: any) => ({ value: cat.id, label: cat.name }))
          );
        } catch (catError) {
          console.error("Error fetching categories:", catError);
        }

        // 3. Reset the form with the fresh product data
        reset({
          productName: product.name || '',
          description: product.description || '',
          features: (product.features as ProductFeatureType[])?.map(f => ({
            title: f.title,
            description: f.description
          })) || [{ title: "", description: "" }],
          basePrice: Number(product.base_price) || 0,
          discountPercent: Number(product.discount_percent) || 0,
          stocks: Number(product.stock_quantity) || 0,
          sku: product.sku || "TSHIRT-001",
          category: categoryOptions.filter(cat => cat.value === product.category_id)[0]?.label || '',
          status: product.status || "Active",
        });
        setFeatureFiles(product.images?.filter((img) => img.imgType === 'gallery') || []);
        setProductFiles(product.images?.filter((img) => img.imgType === 'main') || []);
      } catch (error) {
        console.error("Error in product initialization:", error);
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [id, reset]);
  console.log("productData", productData);
  console.log("categoryOptions", categoryOptions);
  console.log("productFiles", productFiles)
  console.log('featureFiles', featureFiles)
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentFiles: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    fieldName: keyof ProductUpdateFormValues
  ) => {
    if (!e.target.files) return;
    const updated = [...currentFiles, ...Array.from(e.target.files)];
    setFiles(updated);
    setValue(fieldName, updated as any, { shouldDirty: true });
    e.target.value = "";
  };

  const handleFileRemove = (
    index: number,
    currentFiles: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    fieldName: keyof ProductUpdateFormValues
  ) => {
    const updated = currentFiles.filter((_, i) => i !== index);
    setFiles(updated);
    setValue(fieldName, updated as any, { shouldDirty: true });
  };

  const onSubmit = async (data: ProductUpdateFormValues) => {
    const payload = {
      id,
      name: data.productName,
      description: data.description,
      features: data.features,
      category_id: data.category,
      status: data.status,
      tax_profile: data.taxProfile,
      base_price: Number(data.basePrice),
      discount_percent: Number(data.discountPercent),
      stock_quantity: Number(data.stocks),
      sku: data.sku,
    };

    try {
      console.log("Update Payload →", payload);
      await new Promise((r) => setTimeout(r, 1200));
      setSubmitStatus("success");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm text-slate-800 placeholder:text-slate-400";
  const labelCls = "block mb-1.5 text-sm font-semibold text-slate-700";
  const sectionCls = "border border-slate-200 rounded-2xl bg-white mb-6 shadow-sm overflow-hidden";
  const sectionHeaderCls = "flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70";

  if (isFetching) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-brand-primary" />
          <p className="text-sm font-medium">Loading product…</p>
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
              <h1 className="text-2xl font-bold text-slate-900">Update Product</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Editing product <span className="font-mono text-indigo-600">#{id}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {submitStatus === "success" && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 size={16} /> Changes saved!
                </span>
              )}
              {submitStatus === "error" && (
                <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                  <AlertCircle size={16} /> Something went wrong
                </span>
              )}
              <button
                type="button"
                onClick={() => reset()}
                className="border border-slate-300 bg-white text-slate-700 text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="flex items-center gap-2 bg-brand-secondary text-white text-sm font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving…</>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </header>

          {/* ── 1. GENERAL INFORMATION ── */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Package size={18} className="text-brand-primary" />
              <h2 className="text-base font-semibold text-slate-800">General Information</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. Classic Cotton T-Shirt"
                  {...register("productName", { required: "Product name is required" })}
                />
                {errors.productName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />{errors.productName.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                <textarea
                  rows={4}
                  className={inputCls}
                  placeholder="Describe your product…"
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />{errors.description.message}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Product Features</h3>
                  <button
                    type="button"
                    onClick={() => append({ title: "", description: "" })}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <Plus size={14} /> Add Feature
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 group">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-white rounded-md p-1 border border-slate-200 shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Feature Title</label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="e.g. Waterproof"
                          {...register(`features.${index}.title`, { required: "Required" })}
                        />
                        {errors.features?.[index]?.title && (
                          <p className="text-red-500 text-xs mt-1">{errors.features[index]?.title?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Details</label>
                        <textarea
                          rows={2}
                          className={inputCls}
                          placeholder="Feature description…"
                          {...register(`features.${index}.description`, { required: "Required" })}
                        />
                        {errors.features?.[index]?.description && (
                          <p className="text-red-500 text-xs mt-1">{errors.features[index]?.description?.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>



          {/* ── 2. PRICING & INVENTORY ── */}
          {
            PRODUCT_FORM_FIELDS.map((field, idx) => (
              <div className={sectionCls} key={idx}>
                <div className={sectionHeaderCls}>
                  <DynamicIcon name={field.icon as IconName} size={18} className="text-brand-primary" />
                  <h2 className="text-base font-semibold text-slate-800">{field.section}</h2>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-4 gap-10">
                    {field.fields.map((f, idx) => (
                      <div key={idx} className="mb-4 flex-1">
                        <label className={labelCls}>{f.label} {f.label.includes("*") && <span className="text-red-400">*</span>}</label>
                        {f.type === "select" ? (
                          <div className="relative">
                            <select
                              {...register(f.name as keyof ProductUpdateFormValues, { required: f.label.includes("*") ? "Required" : false })}
                              className="form_input appearance-none pr-9 disabled:opacity-50"
                            >
                              {
                                f.name === "category" ? (
                                  categoryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))
                                ) : f.name === "status" ? (
                                  <>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                  </>
                                ) : f.name === "taxProfile" ? (
                                  ORGANIZATION_TAXATION_FIELDS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))
                                ) : null
                              }
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            {errors[f.name as keyof ProductUpdateFormValues] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle size={12} />{errors[f.name as keyof ProductUpdateFormValues]?.message as string}
                              </p>
                            )}
                          </div>
                        ) : (
                          <input
                            type={f.type}
                            step={f.type === "number" ? "0.01" : undefined}
                            min={f.type === "number" ? 0 : undefined}
                            className={inputCls}
                            placeholder={f.type === "number" ? (f.name === "basePrice" ? "0.00" : "0") : `Enter ${f.label.toLowerCase()}`}
                            {...register(f.name as keyof ProductUpdateFormValues, { required: f.label.includes("*") ? "Required" : false, min: f.type === "number" ? { value: 0, message: "Must be ≥ 0" } : undefined })}
                          />
                        )}
                        {errors[f.name as keyof ProductUpdateFormValues] && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />{errors[f.name as keyof ProductUpdateFormValues]?.message as string}
                          </p>
                        )}
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            ))
          }


          {/* ── 3. MEDIA ── */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Image size={18} className="text-brand-primary" />
              <h2 className="text-base font-semibold text-slate-800">Media</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  { label: "Product Images", files: productFiles, setFiles: setProductFiles, fieldName: "productMedia" as keyof ProductUpdateFormValues },
                  { label: "Feature / Spec Media", files: featureFiles, setFiles: setFeatureFiles, fieldName: "featureMedia" as keyof ProductUpdateFormValues },
                ] as const
              ).map(({ label, files, setFiles, fieldName }) => (
                <div key={fieldName} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">{label}</h3>
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-indigo-300 bg-indigo-50/30 rounded-xl cursor-pointer hover:bg-indigo-50 transition group">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, files, setFiles as any, fieldName)}
                    />
                    <UploadCloud size={32} className="text-indigo-400 group-hover:text-indigo-600 transition mb-2" />
                    <p className="text-xs font-semibold text-brand-primary group-hover:text-indigo-700">Click to upload</p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, MP4 up to 10MB</p>
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((file, i) => (
                        <li key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-sm">
                          <img src={file?.image_url ? file.image_url : URL.createObjectURL(file)} alt={file.alt_text ? file.alt_text : "Uploaded Image"} className="w-16 h-16 object-cover rounded-md" />
                          <button
                            type="button"
                            onClick={() => handleFileRemove(i, files, setFiles as any, fieldName)}
                            className="ml-2 text-slate-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={24} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* ── FOOTER CTA ── */}
          <div className="flex justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => reset()}
              className="border border-slate-300 bg-white text-slate-700 text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition shadow-sm"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-2.5 px-8 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Saving…</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}