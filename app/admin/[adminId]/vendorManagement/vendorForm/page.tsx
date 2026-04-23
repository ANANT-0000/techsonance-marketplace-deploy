'use client';
import { Navbar } from "@/components/admin/Navbar";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { COUNTRIES } from "@/constants/common";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VendorDocumentTypes } from "@/constants";
import { BUSINESS_ADMIN_ACCOUNT_FIELDS, ORGANIZATION_DETAIL_FIELDS, RegistrationStages } from "@/constants/dynamicFields";
import { DocUploadInput } from "@/components/vendor/DocUploadInput";
import FinancialCompliance from "@/components/vendor/FinancialCompliance";
import { Button } from "@/components/common/Button";
import { RegistrationSuccessModal } from "@/components/common/RegistrationSuccessModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorRegisterSchema, VendorRegisterSchema } from "@/utils/validation";
import { vendorRegister } from "@/utils/authApiClient";

const STEP_FIELDS: Record<number, (keyof VendorRegisterSchema)[]> = {
    0: ["company_name", "store_owner_first_name", "store_owner_last_name", "country_code", "phone_number", "category", "company_structure"],
    1: ["company_domain"],
    2: [],
    3: [],
    4: ["first_name", "last_name", "email", "password", "confirm_password"],
    5: [],
};


export default function VendorFormPage() {
    const {
        register,
        handleSubmit,
        trigger,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(vendorRegisterSchema),
        mode: "onChange",
        defaultValues: {
            first_name: '',
            last_name: '',
            phone_number: '',
            company_name: '',
            store_owner_first_name: '',
            store_owner_last_name: '',
            category: '',
            company_domain: '',
            company_structure: '',
            email: '',
            country_code: '',
            password: '',
            confirm_password: '',
        },
    });

    const router = useRouter();
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState("");
    const [formStep, setFormStep] = useState(0);
    const totalSteps = Object.keys(RegistrationStages).length;
    const [fileMap, setFileMap] = useState<{ file: File | null; type: string }[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const nextStep = async () => {
        const fields = STEP_FIELDS[formStep];
        const valid = fields.length > 0 ? await trigger(fields) : true;
        if (!valid) return;
        setFormStep((prev) => Math.min(prev + 1, totalSteps - 1));
    };

    const prevStep = () => setFormStep((prev) => Math.max(prev - 1, 0));

    // Fix 2: single onSubmit — removed the dead first version
    const onSubmit = async (data: VendorRegisterSchema) => {
        setGlobalError(null);


        const formData = new FormData();
        fileMap.forEach(({ file, type }) => {
            if (file) {
                const renamedFile = new File([file], `${type}__${file.name}`, { type: file.type });
                formData.append("documents", renamedFile);
            }
        });
        formData.append("vendor", JSON.stringify(data));

        try {
            const result = await vendorRegister(formData);
            if (result?.status) {
                reset();
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    router.back();
                }, 2000);
            } else {
                setGlobalError(result?.message ?? "Registration failed. Please try again.");
            }
        } catch {
            setGlobalError("Something went wrong. Please try again.");
        }
    };

    return (
        <>
            <Navbar title={"Vendor Form"} />
            <RegistrationSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
            <main className="admin_vendorManagement">
                <header className="flex justify-between items-center my-6">
                    <h1 className="font-bold text-2xl">Manage Vendor domains, and platform access.</h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">

                    {/* ── Step 0: Organization Details ── */}
                    {formStep === 0 && (
                        <section className="border border-gray-100 bg-white p-6 rounded-2xl w-full shadow-md shadow-gray-100/80">
                            <h2 className="font-bold text-xl mb-6">Organization Details</h2>
                            <div className="grid grid-cols-2 gap-6">
                                {ORGANIZATION_DETAIL_FIELDS.map((field) => (
                                    <div key={field.id} className=" flex flex-col gap-2 w-full">
                                        <label className="input-label">
                                            {field.label} <span className="text-red-500">*</span>
                                        </label>

                                        {field.groupField ? (
                                            <div className="flex w-full">
                                                {field.groupField.map((subField) => (
                                                    <span key={subField.id} className="w-full">
                                                        {subField.type === "select" ? (
                                                            <select
                                                                className={`input-class w-full ${subField.styles ?? ""}`}
                                                                {...register(subField.id as keyof VendorRegisterSchema, {
                                                                    required: "Country code is required",
                                                                })}
                                                                onChange={(e) => {
                                                                    setCountryCode(e.target.value);
                                                                    register(subField.id as keyof VendorRegisterSchema).onChange(e);
                                                                }}
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
                                                                {...register(subField.id as keyof VendorRegisterSchema  , {
                                                                    required: "Phone number is required",
                                                                    pattern: { value: /^[0-9\-]+$/, message: "Please use format 123-456-7890" },
                                                                })}
                                                            />
                                                        )}
                                                        {errors[subField.id as keyof VendorRegisterSchema] && (
                                                            <p className="input-error">
                                                                {errors[subField.id as keyof VendorRegisterSchema]?.message}
                                                            </p>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>

                                        ) : field.type === "select" ? (
                                            <>
                                                <select
                                                    className="input-class"
                                                    {...register(field.id as keyof VendorRegisterSchema, {
                                                        required: `${field.label} is required`,
                                                    })}
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options?.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                {errors[field.id as keyof VendorRegisterSchema] && (
                                                    <p className="input-error">
                                                        {errors[field.id as keyof VendorRegisterSchema]?.message}
                                                    </p>
                                                )}
                                            </>

                                        ) : (
                                            <>
                                                <input
                                                    type={field.type ?? "text"}
                                                    className="input-class"
                                                    placeholder={field.placeholder}
                                                    {...register(field.id as keyof VendorRegisterSchema, {
                                                        required: `${field.label} is required`,
                                                    })}
                                                />
                                                {errors[field.id as keyof VendorRegisterSchema] && (
                                                    <p className="input-error">
                                                        {errors[field.id as keyof VendorRegisterSchema]?.message}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="w-full flex justify-end mt-6">
                                <Button label="Next" onClick={nextStep} />
                            </div>
                        </section>
                    )}

                    {/* ── Step 1: Instance Configuration ── */}
                    {formStep === 1 && (
                        <section className="border border-gray-100 bg-white p-6 rounded-2xl w-full shadow-md shadow-gray-100/80">
                            <label className="font-bold text-xl mb-4">Instance Configuration</label>
                            <div className="w-full flex mt-3">
                                <input
                                    {...register("company_domain", { required: "Instance domain is required" })}
                                    className="border-2 flex-[2] border-gray-200 px-4 py-2 rounded-l-xl focus:outline-none"
                                    placeholder="your-store"
                                />
                                <p className="border-2 flex-1 bg-gray-200 border-gray-300 px-4 py-2 rounded-r-xl text-gray-500 text-sm">
                                    .platform.com
                                </p>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">This will be the URL where customers access this vendor.</p>
                            {errors.company_domain && <p className="input-error mt-1">{errors.company_domain.message}</p>}
                            <div className="w-full flex justify-end gap-4 mt-6">
                                <Button label="Previous" onClick={prevStep} className="py-2 px-6 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all" />
                                <Button label="Next" onClick={nextStep} />
                            </div>
                        </section>
                    )}

                    {/* ── Step 2: Financial Compliance ── */}
                    {formStep === 2 && (
                        <section className="border border-gray-100 bg-white p-6 rounded-2xl w-full shadow-md shadow-gray-100/80">
                            <h2 className="font-bold text-xl mb-2">Legal & Financial Information</h2>
                            <p className="text-sm text-gray-500 text-balance mb-4">
                                Mandatory financial information is required for vendor registration.
                            </p>
                            <label className="input-label">Country <span className="text-red-500">*</span></label>
                            <select
                                className="input-class w-full mt-2"
                                onChange={(e) => setCountryCode(e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Select Country</option>
                                {COUNTRIES.map((c) => (
                                    <option key={c.country_code} value={c.country_code}>{c.country_name}</option>
                                ))}
                            </select>
                            <div>
                                <FinancialCompliance style="grid grid-cols-2 gap-6" country_code={countryCode} />

                            </div>
                            <DocUploadInput
                                setFileMap={setFileMap}
                                fileMap={fileMap}
                                typeList={COUNTRIES.find((c) => c.country_code === countryCode)?.fields || []}
                                title="Financial Documents"
                            />
                            <div className="w-full flex justify-end gap-4 mt-6">
                                <Button label="Previous" onClick={prevStep} className="py-2 px-6 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all" />
                                <Button label="Next" onClick={nextStep} />
                            </div>
                        </section>
                    )}

                    {/* ── Step 3: Legal Document Upload ── */}
                    {formStep === 3 && (
                        <section className="border border-gray-100 bg-white p-6 rounded-2xl w-full shadow-md shadow-gray-100/80">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Legal & Financial Document Upload</h2>
                            <p className="text-sm text-gray-500 mb-6">Please ensure all documents are clear and legible.</p>
                            <DocUploadInput
                                setFileMap={setFileMap}       // Fix 9: dedicated legal state
                                fileMap={fileMap}
                                typeList={VendorDocumentTypes}
                                title="Legal Business / Store Documents"
                            />
                            <div className="w-full flex justify-end gap-4 mt-6">
                                <Button label="Previous" onClick={prevStep} className="py-2 px-6 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all" />
                                <Button label="Next" onClick={nextStep} />
                            </div>
                        </section>
                    )}

                    {/* ── Step 4: Business Admin Account ── */}
                    {formStep === 4 && (
                        <section className="border border-gray-100 bg-white p-6 rounded-2xl w-full shadow-md shadow-gray-100/80">
                            <h2 className="font-bold text-xl mb-1">Business Admin Account</h2>
                            <p className="text-sm text-gray-500 mb-6 text-balance">
                                These credentials will be used for the first login to the Vendor Dashboard.
                            </p>
                            <div className="flex flex-col gap-6">
                                {BUSINESS_ADMIN_ACCOUNT_FIELDS.map((field) => (
                                    <div key={field.id} className="flex flex-col gap-2 w-full">
                                        <label className="input-label">
                                            {field.label} <span className="ml-1 text-red-500">*</span>
                                        </label>
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            className="input-class"
                                            {...register(field.id as keyof VendorRegisterSchema, {
                                                required: `${field.label} is required`,
                                                ...(field.id === "confirm_password" && {
                                                    validate: (val) =>
                                                        val === watch("password") || "Passwords do not match",
                                                }),
                                                ...(field.id === "email" && {
                                                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                                                }),
                                            })}
                                        />
                                        {errors[field.id as keyof VendorRegisterSchema] && (
                                            <p className="input-error">
                                                {errors[field.id as keyof VendorRegisterSchema]?.message}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="w-full flex justify-end gap-4 mt-6">
                                <Button label="Previous" onClick={prevStep} className="py-2 px-6 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all" />
                                <Button label="Next" onClick={nextStep} />
                            </div>
                        </section>
                    )}

                    {/* ── Step 5: Review & Submit ── */}
                    {formStep === 5 && (
                        <section className="border border-gray-100 bg-white p-6 rounded-2xl w-full shadow-md shadow-gray-100/80">
                            <h2 className="font-bold text-xl mb-2">Review & Submit</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Please review your information before submitting.
                            </p>
                            {globalError && (
                                <p className="text-red-600 text-center text-sm font-medium mb-4">{globalError}</p>
                            )}
                            <div className="w-full flex justify-end gap-4">
                                <Button
                                    label="Previous"
                                    onClick={prevStep}
                                    className="py-2 px-6 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="py-2 px-6 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all"
                                >
                                    {isSubmitting ? "Creating..." : "Create Business Account"}
                                </button>
                            </div>
                        </section>
                    )}


                    <div className="flex justify-end gap-6 mb-6">
                        <Link
                            onClick={() => reset()}
                            className="border border-gray-300 bg-gray-200 px-4 py-2 rounded-lg"
                            href="/admin/vendorManagement"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </main>
        </>
    );
}