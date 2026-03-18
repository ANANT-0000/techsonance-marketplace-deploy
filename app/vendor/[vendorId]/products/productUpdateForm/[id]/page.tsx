'use client';
import { useFieldArray, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Trash2, Plus, UploadCloud, Package, Tag, Image, Building2, ChevronDown, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type Feature = { title: string; description: string };

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

export default function ProductUpdateForm() {
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

  const { fields, append, remove } = useFieldArray({ control, name: "features" });

  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [featureFiles, setFeatureFiles] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isFetching, setIsFetching] = useState(true);

  // --- Fetch existing product data ---
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        // Replace with your real API call:
        // const res = await fetch(`/api/products/${id}`);
        // const data = await res.json();
        // Simulated prefill:
        await new Promise((r) => setTimeout(r, 800));
        const data = {
          productName: "Classic Cotton T-Shirt",
          description: "A comfortable everyday t-shirt made from 100% cotton.",
          features: [{ title: "Breathable", description: "Made with natural cotton fibres." }],
          basePrice: 499,
          discountPercent: 10,
          stocks: 50,
          sku: "TSHIRT-001",
          category: "fashion",
          status: "Active",
          taxProfile: "reduced",
        };
        reset(data);
      } catch {
        // handle fetch error
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id, reset]);

  // --- Unified file handler ---
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

  // --- Submit (PATCH/PUT) ---
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
      // Replace with real API call:
      // await fetch(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
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
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Tag size={18} className="text-brand-primary" />
              <h2 className="text-base font-semibold text-slate-800">Pricing & Inventory</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-5">
                <div className="flex-1 min-w-[180px]">
                  <label className={labelCls}>Base Price (₹) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className={`${inputCls} pl-7`}
                      placeholder="0.00"
                      {...register("basePrice", { required: "Required", min: { value: 0, message: "Must be ≥ 0" } })}
                    />
                  </div>
                  {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className={labelCls}>Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputCls}
                    placeholder="0"
                    {...register("discountPercent", { min: 0, max: 100 })}
                  />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className={labelCls}>Stock Quantity <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    placeholder="0"
                    {...register("stocks", { required: "Required", min: { value: 0, message: "Must be ≥ 0" } })}
                  />
                  {errors.stocks && <p className="text-red-500 text-xs mt-1">{errors.stocks.message}</p>}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className={labelCls}>SKU <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. SHIRT-001"
                    {...register("sku", { required: "SKU is required" })}
                  />
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
                </div>
              </div>
            </div>
          </div>

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
                          <span className="truncate max-w-[180px] font-medium text-slate-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(i, files, setFiles as any, fieldName)}
                            className="ml-2 text-slate-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
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
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Building2 size={18} className="text-brand-primary" />
              <h2 className="text-base font-semibold text-slate-800">Organization & Taxation (GST)</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "category" as const,
                  label: "Category",
                  options: [
                    { value: "electronic", label: "Electronics" },
                    { value: "fashion", label: "Fashion" },
                    { value: "home_appliance", label: "Home Appliances" },
                    { value: "books", label: "Books" },
                    { value: "sports", label: "Sports" },
                  ],
                },
                {
                  name: "status" as const,
                  label: "Status",
                  options: [
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "Draft", label: "Draft" },
                  ],
                },
                {
                  name: "taxProfile" as const,
                  label: "Tax Profile",
                  options: [
                    { value: "standard", label: "GST Standard (18%)" },
                    { value: "reduced", label: "GST Reduced (5%)" },
                    { value: "zero", label: "Zero Rated (0%)" },
                  ],
                },
              ].map(({ name, label, options: opts }) => (
                <div key={name}>
                  <label className={labelCls}>{label} <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select
                      {...register(name, { required: "Required" })}
                      className={`${inputCls} appearance-none pr-9`}
                    >
                      <option value="">Select {label}</option>
                      {opts.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {errors[name] && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />{errors[name]?.message}
                    </p>
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