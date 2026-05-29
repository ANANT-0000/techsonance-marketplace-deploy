"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Globe2,
  ShieldCheck,
  FileArchive,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ArrowRight,
  Mail,
  Clock,
} from "lucide-react";

import {
    validateComplianceFields,
    validateRequiredDocuments,
  vendorRegisterSchema,
  VendorRegisterSchema,
 
 
} from "@/utils/validation";
import { COUNTRIES, COUNTRY_CODES } from "@/constants/common";
import { VendorDocumentTypes } from "@/constants";
import { vendorRegister } from "@/utils/authApiClient";

import FinancialCompliance from "@/components/vendor/FinancialCompliance";
import { DocUploadInput, FileEntry } from "@/components/vendor/DocUploadInput";
import { VendorRegisterFormData } from "@/utils/Types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const COMPLIANCE_REGEX: Record<
  string,
  { pattern: RegExp; message: string }
> = {
  // India
  gstin: {
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    message:
      "Invalid GSTIN. Format: 2-digit state code + 10-char PAN + 1-char entity + Z + 1-char checksum (e.g. 27AAPFU0939F1ZV)",
  },
  pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    message:
      "Invalid PAN. Format: 5 uppercase letters + 4 digits + 1 uppercase letter (e.g. ABCDE1234F)",
  },
  fssai: {
    pattern: /^[0-9]{14}$/,
    message: "FSSAI license must be exactly 14 digits",
  },
  dpdp_dpo: {
    pattern: /^[A-Za-z\s.'-]{3,100}$/,
    message:
      "DPO name must be 3–100 characters (letters, spaces, dots, hyphens allowed)",
  },
 
  // Bangladesh
  bin: {
    // NBR BIN format: 9-digit registration number
    pattern: /^[0-9]{9}$/,
    message:
      "Invalid BIN. Must be exactly 9 digits as issued by NBR Bangladesh",
  },
  tin: {
    // Bangladesh TIN: 12-digit (IRD)
    pattern: /^[0-9]{12}$/,
    message:
      "Invalid TIN. Bangladesh TIN must be exactly 12 digits as issued by NBR",
  },
 
  // Sri Lanka
  tin_lk: {
    // IRB Sri Lanka TIN: 9 digits (older) or 12 digits (new format)
    pattern: /^[0-9]{9}([0-9]{3})?$/,
    message:
      "Invalid TIN. Sri Lanka TIN must be 9 or 12 digits as issued by Inland Revenue Board",
  },
  vat_reg: {
    // SVAT/VAT: 9 digits + V or X suffix
    pattern: /^[0-9]{9}[VX]$/,
    message:
      "Invalid VAT number. Format: 9 digits followed by V or X (e.g. 123456789V)",
  },
};
const BUSINESS_CATEGORIES = [
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Food & Beverages",
  "Health & Wellness",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Books & Stationery",
  "Toys & Games",
  "Automotive",
  "Industrial & B2B",
  "Other",
];

const COMPANY_STRUCTURES = [
  "Sole Proprietorship",
  "Partnership Firm",
  "Limited Liability Partnership (LLP)",
  "Private Limited Company (Pvt. Ltd.)",
  "Public Limited Company",
  "One Person Company (OPC)",
  "NGO / Non-Profit",
  "Other",
];

const COUNTRY_DIAL_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
];

// ─── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: "Organization", icon: Building2 },
  { id: 1, label: "Domain", icon: Globe2 },
  { id: 2, label: "Compliance", icon: ShieldCheck },
  { id: 3, label: "Documents", icon: FileArchive },
];

// Fields validated per step by react-hook-form
const STEP_RHF_FIELDS: Record<number, (keyof VendorRegisterSchema)[]> = {
  0: [
    "company_name",
    "store_owner_first_name",
    "store_owner_last_name",
    "email",
    "country_code",
    "phone_number",
    "category",
    "company_structure",
  ],
  1: ["company_domain"],
  2: [],
  3: [],
};

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";
const labelCls =
  "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5";
const errorCls = "mt-1.5 text-xs text-red-600 flex items-center gap-1";

// ─── SuccessModal ─────────────────────────────────────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-emerald-400 w-full" />
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 ring-4 ring-emerald-100">
            <CheckCircle2 className="w-11 h-11 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Submitted!
          </h2>
          <p className="text-gray-500 text-sm mb-7 text-balance">
            Your business application is now under review by our team. We'll
            send your login credentials once approved.
          </p>
          <div className="w-full space-y-3 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Estimated Review Time
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  2 – 4 Business Days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Credentials Delivery
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  Sent to your registered email
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-colors text-sm"
          >
            Back to Home <ArrowRight size={16} />
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Need help?{" "}
            <a href="mailto:support@platform.com" className="underline">
              support@platform.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── StepIndicator ────────────────────────────────────────────────────────────
function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={[
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border-2",
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white border-gray-200 text-gray-400",
                ].join(" ")}
              >
                {done ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Icon size={17} />
                )}
              </div>
              <span
                className={[
                  "text-[11px] font-semibold whitespace-nowrap",
                  active
                    ? "text-blue-600"
                    : done
                      ? "text-emerald-600"
                      : "text-gray-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-0.5 mx-2 mt-[-14px] rounded-full transition-all duration-500",
                  i < current ? "bg-emerald-400" : "bg-gray-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VendorRegisterPage() {
  const [formStep, setFormStep] = useState(3);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 2 state
  const [countryCode, setCountryCode] = useState("");
  const [complianceValues, setComplianceValues] = useState<
    Record<string, string>
  >({});
  const [complianceErrors, setComplianceErrors] = useState<
    Record<string, string>
  >({});
  const [financialFileMap, setFinancialFileMap] = useState<FileEntry[]>([]);
  const [missingFinancialDocs, setMissingFinancialDocs] = useState<string[]>(
    [],
  );

  // Step 3 state
  const [legalFileMap, setLegalFileMap] = useState<FileEntry[]>([]);
  const [missingLegalDocs, setMissingLegalDocs] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(vendorRegisterSchema),
    defaultValues: {
      phone_number: "",
      company_name: "",
      store_owner_first_name: "",
      store_owner_last_name: "",
      category: "",
      company_compliance: [{
        field_key: "",
        field_value: "",
      }],
      company_domain: "",
      company_structure: "",
      email: "",
      country_code: "",
    },
  });

  const currentCountryFields =
    COUNTRIES.find((c) => c.country_code === countryCode)?.fields ?? [];
    console.log("Current form errors:", errors);
  // ── Navigation ──────────────────────────────────────────────────────────────
  const nextStep = useCallback(async () => {
    setGlobalError(null);

    // RHF field validation for steps 0 & 1
    if (formStep === 0 || formStep === 1) {
      const fields = STEP_RHF_FIELDS[formStep];
      const valid = fields.length > 0 ? await trigger(fields) : true;
      if (!valid) return;
    }

    // Step 2: compliance fields + financial doc upload
    if (formStep === 2) {
      if (!countryCode) {
        setGlobalError("Please select your country to continue.");
        return;
      }

      // Validate compliance text fields
      const compErrors = validateComplianceFields(
        currentCountryFields,
        complianceValues,
      );
      setComplianceErrors(compErrors);
      if (Object.keys(compErrors).length > 0) return;

      // Validate required document uploads
      const missingDocs = validateRequiredDocuments(
        currentCountryFields,
        financialFileMap,
      );
      setMissingFinancialDocs(missingDocs);
      if (missingDocs.length > 0) return;
    }

    setFormStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [
    formStep,
    trigger,
    countryCode,
    currentCountryFields,
    complianceValues,
    financialFileMap,
  ]);

  const prevStep = () => {
    setGlobalError(null);
    setFormStep((prev) => Math.max(prev - 1, 0));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<VendorRegisterSchema> = async (data: VendorRegisterSchema) => {
    setGlobalError(null);

    // Validate legal docs on final submit
    const missingLegal = validateRequiredDocuments(
      VendorDocumentTypes,
      legalFileMap,
    );
    setMissingLegalDocs(missingLegal);
    if (missingLegal.length > 0) return;

    const formData = new FormData();

    // Attach all files with type prefix
    [...financialFileMap, ...legalFileMap].forEach(({ file, type }) => {
      if (file) {
        formData.append(
          "documents",
          new File([file], `${type}__${file.name}`, { type: file.type }),
        );
      }
    });

    // Build compliance array from the controlled values map
    const compliance = currentCountryFields.map((f) => ({
      field_key: f.value,
      field_value: complianceValues[f.value] ?? "",
      is_active: true,
      valid_until: "",
      field_details: [],
    }));

    formData.append(
      "vendor",
      JSON.stringify({ ...data, company_compliance: compliance }),
    );

    try {
      const result = await vendorRegister(formData);
      if (result?.status === 201) {
        reset();
        setFinancialFileMap([]);
        setLegalFileMap([]);
        setComplianceValues({});
        setCountryCode("");
        setFormStep(0);
        setShowSuccess(true);
      } else {
        setGlobalError(
          result?.message ?? "Registration failed. Please try again.",
        );
      }
    } catch {
      setGlobalError("Something went wrong. Please try again.");
    }
  };

  // ── Compliance field handler ────────────────────────────────────────────────
  const handleComplianceChange = (key: string, val: string) => {
    setComplianceValues((prev) => ({ ...prev, [key]: val }));
    // Clear error on change
    if (complianceErrors[key]) {
      setComplianceErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {showSuccess && (
        <SuccessModal onClose={() => setShowSuccess(false)} />
      )}

      <main className="min-h-screen shadow-2xl py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Building2 size={13} />
              Vendor Registration
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Business Registration
            </h1>
            <p className="text-gray-500 text-sm text-balance max-w-md mx-auto">
              Set up your organisation profile, configure your storefront
              domain, and complete compliance requirements.
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={formStep} total={STEPS.length} />

          {/* Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100/80 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400 w-full" />

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-7 space-y-6"
              noValidate
            >
              {/* ── Step 0: Organization Details ── */}
              {formStep === 0 && (
                <section>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Organization Details
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Basic information about your business and primary contact.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* Company name — full width */}
                    <div className="col-span-2">
                      <label className={labelCls}>
                        Company / Store Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("company_name")}
                        className={inputCls}
                        placeholder="Acme Retail Pvt. Ltd."
                      />
                      {errors.company_name && (
                        <p className={errorCls}>{errors.company_name.message}</p>
                      )}
                    </div>

                    {/* First & last name */}
                    <div>
                      <label className={labelCls}>
                        Owner First Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("store_owner_first_name")}
                        className={inputCls}
                        placeholder="Rahul"
                      />
                      {errors.store_owner_first_name && (
                        <p className={errorCls}>
                          {errors.store_owner_first_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>
                        Owner Last Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("store_owner_last_name")}
                        className={inputCls}
                        placeholder="Sharma"
                      />
                      {errors.store_owner_last_name && (
                        <p className={errorCls}>
                          {errors.store_owner_last_name.message}
                        </p>
                      )}
                    </div>

                    {/* Email — full width */}
                    <div className="col-span-2">
                      <label className={labelCls}>
                        Business Email{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        className={inputCls}
                        placeholder="owner@company.com"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Your login credentials will be sent to this email after
                        approval.
                      </p>
                      {errors.email && (
                        <p className={errorCls}>{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone with country dial code */}
                    <div className="col-span-2">
                      <label className={labelCls}>
                        Phone Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          {...register("country_code")}
                          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-32 shrink-0"
                        >
                          <option value="">Code</option>
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          {...register("phone_number")}
                          className={`${inputCls} flex-1`}
                          placeholder="98765 43210"
                        />
                      </div>
                      {(errors.country_code || errors.phone_number) && (
                        <p className={errorCls}>
                          {errors.country_code?.message ||
                            errors.phone_number?.message}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className={labelCls}>
                        Business Category{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select {...register("category")} className={inputCls}>
                        <option value="">Select category</option>
                        {BUSINESS_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className={errorCls}>{errors.category.message}</p>
                      )}
                    </div>

                    {/* Company structure */}
                    <div>
                      <label className={labelCls}>
                        Company Structure{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("company_structure")}
                        className={inputCls}
                      >
                        <option value="">Select structure</option>
                        {COMPANY_STRUCTURES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.company_structure && (
                        <p className={errorCls}>
                          {errors.company_structure.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* ── Step 1: Domain / Infra ── */}
              {formStep === 1 && (
                <section>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Storefront Domain
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Choose a unique subdomain for your vendor storefront.
                      Customers will access your store at this URL.
                    </p>
                  </div>

                  <label className={labelCls}>
                    Subdomain <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <input
                      {...register("company_domain")}
                      className="flex-[2] border-2 border-r-0 border-gray-200 rounded-l-xl px-4 py-2.5 text-sm font-mono text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-all bg-white"
                      placeholder="your-store"
                    />
                    <span className="border-2 border-gray-200 bg-gray-50 rounded-r-xl px-4 py-2.5 text-sm text-gray-500 flex items-center whitespace-nowrap select-none">
                      .platform.com
                    </span>
                  </div>
                  {errors.company_domain && (
                    <p className={errorCls}>{errors.company_domain.message}</p>
                  )}
                  <ul className="mt-4 space-y-1.5">
                    {[
                      "Lowercase letters, numbers, and hyphens only",
                      "Cannot start or end with a hyphen",
                      "3 – 63 characters",
                    ].map((hint) => (
                      <li
                        key={hint}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        {hint}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── Step 2: Financial Compliance ── */}
              {formStep === 2 && (
                <section>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Legal & Financial Compliance
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Required regulatory identifiers for your jurisdiction.
                      All required fields must pass format validation.
                    </p>
                  </div>

                  {/* Country picker */}
                  <div className="mb-1">
                    <label className={labelCls}>
                      Country of Registration{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={inputCls}
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setComplianceValues({});
                        setComplianceErrors({});
                        setMissingFinancialDocs([]);
                        setFinancialFileMap([]);
                      }}
                    >
                      <option value="" disabled>
                        Select your country
                      </option>
                      {COUNTRIES.map((c) => (
                        <option key={c.country_code} value={c.country_code}>
                          {c.country_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic compliance fields */}
                  <FinancialCompliance
                    country_code={countryCode}
                    fields={currentCountryFields}
                    values={complianceValues}
                    onChange={handleComplianceChange}
                    externalErrors={complianceErrors}
                  />

                  {/* Financial document uploads */}
                  {countryCode && currentCountryFields.length > 0 && (
                    <DocUploadInput
                      setFileMap={setFinancialFileMap}
                      fileMap={financialFileMap}
                      typeList={currentCountryFields}
                      title="Supporting Financial Documents"
                      missingDocs={missingFinancialDocs}
                    />
                  )}
                </section>
              )}

              {/* ── Step 3: Legal Documents ── */}
              {formStep === 3 && (
                <section>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Legal Business Documents
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Upload clear, legible copies of all required business
                      registration documents. Accepted formats: PDF, JPG, PNG.
                    </p>
                  </div>

                  <DocUploadInput
                    setFileMap={setLegalFileMap}
                    fileMap={legalFileMap}
                    typeList={VendorDocumentTypes}
                    title="Business Registration Documents"
                    missingDocs={missingLegalDocs}
                  />

                  {/* Global submit error */}
                  {globalError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                      {globalError}
                    </div>
                  )}
                </section>
              )}

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {formStep > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white rounded-xl px-5 py-2.5 transition-all"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                ) : (
                  <Link
                    href="/auth/vendorLogin"
                    className="text-sm text-gray-400 hover:text-blue-600 underline underline-offset-2 transition-colors"
                  >
                    Already registered? Log in
                  </Link>
                )}

                {formStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-200"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit Registration
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Step counter */}
              <p className="text-center text-xs text-gray-400">
                Step {formStep + 1} of {STEPS.length}
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}