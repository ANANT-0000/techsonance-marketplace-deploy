'use client';

import { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    X,
    PartyPopper,
    Building2,
    ShieldCheck,
    Globe2,
    FileText,
    FileArchive,
    Pencil,
} from "lucide-react";

import { Navbar } from "@/components/admin/Navbar";
import { COUNTRIES } from "@/constants/common";
import { VendorDocumentTypes } from "@/constants";
import {
    BUSINESS_ADMIN_ACCOUNT_FIELDS,
    ORGANIZATION_DETAIL_FIELDS,
    STEPS,
    STEP_RHF_FIELDS
} from "@/constants/dynamicFields";
import { DocUploadInput, FileEntry } from "@/components/vendor/DocUploadInput";
import FinancialCompliance from "@/components/vendor/FinancialCompliance";
import { zodResolver as _z } from "@hookform/resolvers/zod";
import {
    validateComplianceFields,
    validateRequiredDocuments,
    vendorRegisterSchema,
    VendorRegisterSchema,
} from "@/utils/validation";
import { vendorRegister } from "@/utils/authApiClient";
import { VendorCreatedToast } from "@/components/admin/VendorCreatedToast";
import { FormStepBar } from "@/components/admin/FormStepBar";
import { FormNavRow } from "@/components/admin/FormNavRow";
 
// ─── Step Progress Bar ─────────────────────────────────────────────────────────

// ─── Section wrapper ───────────────────────────────────────────────────────────
export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-100/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 className="font-bold text-gray-900 text-theme-body">{title}</h2>
                {subtitle && <p className="text-theme-body-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}
 // A single labelled row in a review group
export function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-theme-caption font-semibold text-gray-400 uppercase tracking-wide shrink-0 w-40">{label}</span>
            <span className="text-theme-body-sm text-gray-800 font-medium text-right break-all">{value || <span className="text-gray-300 italic">—</span>}</span>
        </div>
    );
}
// A collapsible review group with an "Edit" jump button
export function ReviewGroup({
    icon: Icon,
    title,
    onEdit,
    children,
}: {
    icon: React.ElementType;
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Icon size={15} className="text-slate-500" />
                    <span className="text-theme-body-sm font-bold text-gray-700">{title}</span>
                </div>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1.5 text-theme-caption text-slate-500 hover:text-slate-800 border border-gray-200 hover:border-gray-300 bg-white px-2.5 py-1 rounded-lg transition-all"
                >
                    <Pencil size={11} />
                    Edit
                </button>
            </div>
            <div className="px-4 divide-y divide-gray-50">{children}</div>
        </div>
    );
}
 
// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VendorFormPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        getValues,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(vendorRegisterSchema),
        mode: "onChange",
        defaultValues: {
            phone_number:             "",
            company_name:             "",
            store_owner_first_name:   "",
            store_owner_last_name:    "",
            category:                 "",
            company_domain:           "",
            company_structure:        "",
            email:                    "",
            country_code:             "",
            company_compliance:       [],
        },
    });

    // UI state
    const [formStep,      setFormStep]      = useState(0);
    const [globalError,   setGlobalError]   = useState<string | null>(null);
    const [showToast,     setShowToast]     = useState(false);
    const [createdVendor, setCreatedVendor] = useState("");

    // Step 2 — compliance
    const [countryCode,          setCountryCode]          = useState("");
    const [complianceValues,     setComplianceValues]     = useState<Record<string, string>>({});
    const [complianceErrors,     setComplianceErrors]     = useState<Record<string, string>>({});
    const [financialFileMap,     setFinancialFileMap]     = useState<FileEntry[]>([]);
    const [missingFinancialDocs, setMissingFinancialDocs] = useState<string[]>([]);

    // Step 3 — legal docs
    const [legalFileMap,     setLegalFileMap]     = useState<FileEntry[]>([]);
    const [missingLegalDocs, setMissingLegalDocs] = useState<string[]>([]);

    const currentCountryFields =
        COUNTRIES.find((c) => c.country_code === countryCode)?.fields ?? [];
  const countryName =
        COUNTRIES.find((c) => c.country_code === countryCode)?.country_name ?? countryCode;
    // ── Navigation ───────────────────────────────────────────────────────────
    const nextStep = useCallback(async () => {
        setGlobalError(null);

        // RHF field validation for steps 0, 1, 4
        const rhfFields = STEP_RHF_FIELDS[formStep] ?? [];
        if (rhfFields.length > 0) {
            const valid = await trigger(rhfFields);
            if (!valid) return;
        }

        // Step 2: compliance text fields + financial doc validation
        if (formStep === 2) {
            if (!countryCode) {
                setGlobalError("Please select a country to continue.");
                return;
            }
            const compErrors = validateComplianceFields(currentCountryFields, complianceValues);
            setComplianceErrors(compErrors);
            if (Object.keys(compErrors).length > 0) return;

            const missingDocs = validateRequiredDocuments(currentCountryFields, financialFileMap);
            setMissingFinancialDocs(missingDocs);
            if (missingDocs.length > 0) return;
        }

        setFormStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, [formStep, trigger, countryCode, currentCountryFields, complianceValues, financialFileMap]);

    const prevStep = () => {
        setGlobalError(null);
        setFormStep((prev) => Math.max(prev - 1, 0));
    };

    // ── Compliance field handler ─────────────────────────────────────────────
    const handleComplianceChange = (key: string, val: string) => {
        setComplianceValues((prev) => ({ ...prev, [key]: val }));
        if (complianceErrors[key]) {
            setComplianceErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    // ── Reset all state ──────────────────────────────────────────────────────
    const resetAll = () => {
        reset();
        setFinancialFileMap([]);
        setLegalFileMap([]);
        setComplianceValues({});
        setComplianceErrors({});
        setCountryCode("");
        setFormStep(0);
        setGlobalError(null);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const onSubmit: SubmitHandler<VendorRegisterSchema> = async (data) => {
        setGlobalError(null);

        // Validate legal docs on final submit
        const missingLegal = validateRequiredDocuments(VendorDocumentTypes, legalFileMap);
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

        // Build compliance array from controlled values map
        const compliance = currentCountryFields.map((f) => ({
            field_key:    f.value,
            field_value:  complianceValues[f.value] ?? "",
            is_active:    true,
            valid_until:  "",
            field_details: [],
        }));

        formData.append(
            "vendor",
            JSON.stringify({ ...data, company_compliance: compliance }),
        );

        try {
            const result = await vendorRegister(formData);
            if (result?.status === 201) {
                setCreatedVendor(data.company_name);
                setShowToast(true);
                resetAll();
                // Auto-dismiss after 6 seconds
                setTimeout(() => setShowToast(false), 6000);
            } else {
                setGlobalError(result?.message ?? "Registration failed. Please try again.");
            }
        } catch {
            setGlobalError("Something went wrong. Please try again.");
        }
    };
 
    const goToStep = (step: number) => {
        setGlobalError(null);
        setFormStep(step);
    };
    const snap = getValues();
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <Navbar title="Vendor Registration" />

            {showToast && (
                <VendorCreatedToast
                    vendorName={createdVendor}
                    onClose={() => setShowToast(false)}
                />
            )}

            <main className="admin_vendorManagement">
                {/* Page header */}
                <header className="flex justify-between items-center my-6">
                    <div>
                        <h1 className="font-bold text-theme-h4 text-gray-900">Register New Vendor</h1>
                        <p className="text-theme-body-sm text-gray-500 mt-1">
                            Complete all steps to create a vendor account from the admin panel.
                        </p>
                    </div>
                    <Link
                        href="/admin/vendorManagement"
                        onClick={resetAll}
                        className="text-theme-body-sm border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl text-gray-600 transition-all"
                    >
                        ← Back to Vendors
                    </Link>
                </header>

                {/* Step indicator */}
                <FormStepBar current={formStep} />

                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6" noValidate>

                    {/* ── Step 0: Organization Details ─────────────────────────────────── */}
                    {formStep === 0 && (
                        <Section
                            title="Organization Details"
                            subtitle="Basic information about the vendor's business and primary contact."
                        >
                            <div className="grid grid-cols-2 gap-6">
                                {ORGANIZATION_DETAIL_FIELDS.map((field) => (
                                    <div key={field.id} className="flex flex-col gap-2 w-full">
                                        <label className="input-label">
                                            {field.label} <span className="text-red-500">*</span>
                                        </label>

                                        {field.groupField ? (
                                            <div className="flex w-full items-start gap-2">
                                                {field.groupField.map((subField) => (
                                                    <div
                                                        key={subField.id}
                                                        className={`flex flex-col gap-1 ${subField.type === "select" ? "w-32" : "flex-1"}`}
                                                    >
                                                        {subField.type === "select" ? (
                                                            <select
                                                                className={`input-class w-full ${subField.styles ?? ""}`}
                                                                {...register(subField.id as keyof VendorRegisterSchema)}
                                                            >
                                                                <option value="">Code</option>
                                                                {subField.options?.map((o) => (
                                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type={subField.type ?? "text"}
                                                                className={`input-class w-full ${subField.styles ?? ""}`}
                                                                placeholder={subField.placeholder}
                                                                {...register(subField.id as keyof VendorRegisterSchema)}
                                                            />
                                                        )}
                                                        {errors[subField.id as keyof VendorRegisterSchema] && (
                                                            <p className="input-error">
                                                                {(errors[subField.id as keyof VendorRegisterSchema] as any)?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : field.type === "select" ? (
                                            <>
                                                <select
                                                    className="input-class"
                                                    {...register(field.id as keyof VendorRegisterSchema)}
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options?.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                {errors[field.id as keyof VendorRegisterSchema] && (
                                                    <p className="input-error">
                                                        {(errors[field.id as keyof VendorRegisterSchema] as any)?.message}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    type={field.type ?? "text"}
                                                    className="input-class"
                                                    placeholder={field.placeholder}
                                                    {...register(field.id as keyof VendorRegisterSchema)}
                                                />
                                                {errors[field.id as keyof VendorRegisterSchema] && (
                                                    <p className="input-error">
                                                        {(errors[field.id as keyof VendorRegisterSchema] as any)?.message}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <FormNavRow onNext={nextStep} isFirst />
                        </Section>
                    )}

                    {/* ── Step 1: Domain / Instance ────────────────────────────────────── */}
                    {formStep === 1 && (
                        <Section
                            title="Instance Configuration"
                            subtitle="Choose a unique subdomain for the vendor's storefront."
                        >
                            <label className="input-label">
                                Subdomain <span className="text-red-500">*</span>
                            </label>
                            <div className="flex mt-2">
                                <input
                                    {...register("company_domain")}
                                    className="border-2 flex-[2] border-gray-200 px-4 py-2 rounded-l-xl focus:outline-none focus:border-slate-400 font-mono text-theme-body-sm"
                                    placeholder="vendor-store"
                                />
                                <span className="border-2 flex-1 bg-gray-100 border-gray-200 px-4 py-2 rounded-r-xl text-gray-500 text-theme-body-sm flex items-center">
                                    .platform.com
                                </span>
                            </div>
                            {errors.company_domain && (
                                <p className="input-error mt-1">{errors.company_domain.message}</p>
                            )}
                            <ul className="mt-3 space-y-1">
                                {[
                                    "Lowercase letters, numbers, and hyphens only",
                                    "Cannot start or end with a hyphen",
                                    "3 – 63 characters",
                                ].map((hint) => (
                                    <li key={hint} className="flex items-center gap-2 text-theme-caption text-gray-400">
                                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                        {hint}
                                    </li>
                                ))}
                            </ul>

                            <FormNavRow onPrev={prevStep} onNext={nextStep} />
                        </Section>
                    )}

                    {/* ── Step 2: Financial Compliance ─────────────────────────────────── */}
                    {formStep === 2 && (
                        <Section
                            title="Legal & Financial Compliance"
                            subtitle="Required regulatory identifiers for the vendor's jurisdiction."
                        >
                            <div className="mb-4">
                                <label className="input-label">
                                    Country of Registration <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="input-class w-full mt-2"
                                    value={countryCode}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if(val){

                                            setComplianceValues({});
                                            setComplianceErrors({});
                                            setMissingFinancialDocs([]);
                                            setFinancialFileMap([]);
                                        }
                                        setCountryCode(val);
                                    }}
                                >
                                    <option value="" disabled>Select Country</option>
                                    {COUNTRIES.map((c) => (
                                        <option key={c.country_code} value={c.country_code}>
                                            {c.country_name}
                                        </option>
                                    ))}
                                </select>
                                {globalError && (
                                    <p className="mt-2 text-theme-body-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                                        {globalError}
                                    </p>
                                )}
                            </div>

                            {/* Dynamic compliance text fields */}
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

                            <FormNavRow onPrev={prevStep} onNext={nextStep} />
                        </Section>
                    )}

                    {/* ── Step 3: Legal Documents ───────────────────────────────────────── */}
                    {formStep === 3 && (
                        <Section
                            title="Legal Business Documents"
                            subtitle="Upload clear, legible copies of all required business registration documents. Accepted formats: PDF, JPG, PNG."
                        >
                            <DocUploadInput
                                setFileMap={setLegalFileMap}
                                fileMap={legalFileMap}
                                typeList={VendorDocumentTypes}
                                title="Business Registration Documents"
                                missingDocs={missingLegalDocs}
                            />

                            <FormNavRow onPrev={prevStep} onNext={nextStep} />
                        </Section>
                    )}

                    {/* ── Step 4: Admin Account ─────────────────────────────────────────── */}
               {formStep === 4 && (
                        <Section
                            title="Review & Confirm"
                            subtitle="Check all details before submitting. Use the Edit buttons to go back and make changes."
                        >
                            <div className="space-y-4">
 
                                {/* Organization */}
                                <ReviewGroup icon={Building2} title="Organization Details" onEdit={() => goToStep(0)}>
                                    <ReviewRow label="Company Name"    value={snap.company_name} />
                                    <ReviewRow label="Owner Name"      value={`${snap.store_owner_first_name} ${snap.store_owner_last_name}`} />
                                    <ReviewRow label="Business Email"  value={snap.email} />
                                    <ReviewRow label="Phone"           value={`${snap.country_code} ${snap.phone_number}`} />
                                    <ReviewRow label="Category"        value={snap.category} />
                                    <ReviewRow label="Structure"       value={snap.company_structure} />
                                </ReviewGroup>
 
                                {/* Domain */}
                                <ReviewGroup icon={Globe2} title="Storefront Domain" onEdit={() => goToStep(1)}>
                                    <ReviewRow label="Subdomain" value={snap.company_domain ? `${snap.company_domain}.platform.com` : ""} />
                                </ReviewGroup>
 
                                {/* Compliance */}
                                <ReviewGroup icon={ShieldCheck} title="Compliance" onEdit={() => goToStep(2)}>
                                    <ReviewRow label="Country" value={countryName} />
                                    {currentCountryFields.length > 0 ? (
                                        currentCountryFields.map((f) => (
                                            <ReviewRow key={f.value} label={f.label} value={complianceValues[f.value] ?? ""} />
                                        ))
                                    ) : (
                                        <div className="py-2.5 text-theme-caption text-gray-400 italic">No compliance fields selected.</div>
                                    )}
                                </ReviewGroup>
 
                                {/* Documents */}
                                <ReviewGroup icon={FileArchive} title="Uploaded Documents" onEdit={() => goToStep(3)}>
                                    {/* Financial docs */}
                                    {financialFileMap.filter((e) => e.file).length > 0 && (
                                        <div className="py-2.5">
                                            <p className="text-theme-tiny font-bold text-gray-400 uppercase tracking-wider mb-1.5">Financial</p>
                                            {financialFileMap.filter((e) => e.file).map((e) => (
                                                <div key={e.index} className="flex items-center gap-2 mb-1">
                                                    <FileText size={12} className="text-slate-400 shrink-0" />
                                                    <span className="text-theme-caption text-gray-700 truncate">{e.file!.name}</span>
                                                    <span className="text-theme-tiny text-gray-400 shrink-0 ml-auto">{e.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Legal docs */}
                                    {legalFileMap.filter((e) => e.file).length > 0 && (
                                        <div className="py-2.5 border-t border-gray-50">
                                            <p className="text-theme-tiny font-bold text-gray-400 uppercase tracking-wider mb-1.5">Legal</p>
                                            {legalFileMap.filter((e) => e.file).map((e) => (
                                                <div key={e.index} className="flex items-center gap-2 mb-1">
                                                    <FileText size={12} className="text-slate-400 shrink-0" />
                                                    <span className="text-theme-caption text-gray-700 truncate">{e.file!.name}</span>
                                                    <span className="text-theme-tiny text-gray-400 shrink-0 ml-auto">{e.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {financialFileMap.filter((e) => e.file).length === 0 && legalFileMap.filter((e) => e.file).length === 0 && (
                                        <div className="py-2.5 text-theme-caption text-gray-400 italic">No documents uploaded.</div>
                                    )}
                                </ReviewGroup>
                            </div>
 
                            {/* Global error */}
                            {globalError && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-theme-body-sm">
                                    {globalError}
                                </div>
                            )}
 
                            {/* Submit row */}
                            <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-100">
                                <button type="button" onClick={prevStep}
                                    className="flex items-center gap-2 text-theme-body-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-all">
                                    <ChevronLeft size={15} /> Previous
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-theme-body-sm font-semibold px-6 py-2.5 rounded-xl transition-all">
                                    {isSubmitting ? (
                                        <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                                    ) : (
                                        <><CheckCircle2 size={15} /> Confirm & Register Vendor</>
                                    )}
                                </button>
                            </div>
                        </Section>
                    )}
                    {/* Cancel link (always visible) */}
                    <div className="flex justify-end mb-6">
                        <Link
                            href="/admin/vendorManagement"
                            onClick={resetAll}
                            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 px-5 py-2 rounded-xl text-theme-body-sm transition-all"
                        >
                            Cancel & Discard
                        </Link>
                    </div>
                </form>
            </main>
        </>
    );
}

 