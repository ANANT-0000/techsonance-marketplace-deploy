"use client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductPolicy,
  fetchProductPolicyById,
  updateProductPolicy,
} from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { policyFormSchema, PolicyFormSchemaType } from "@/utils/validation";
import { UiText } from "@/constants/ui-text";
import { PolicyType } from "../page";

export enum DurationUnit {
  DAYS = "days",
  MONTHS = "months",
  YEARS = "years",
  LIFETIME = "lifetime",
}

const policyTypes = [
  { value: PolicyType.WARRANTY, label: "Warranty" },
  { value: PolicyType.GUARANTEE, label: "Guarantee" },
  { value: PolicyType.EXCHANGE_ONLY, label: "Exchange Only" },
  { value: PolicyType.NO_RETURN, label: "No Return (Final Sale)" },
  { value: PolicyType.EXTENDED_SUPPORT, label: "Extended Support" },
  { value: PolicyType.NONE, label: "None" },
] as const;

interface PolicyFormPageProps {
  labels?: typeof UiText;
}

export default function PolicyFormPage({
  labels = UiText,
}: PolicyFormPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(policyFormSchema),
    mode: "onChange",
    defaultValues: {
      policy_name: "",
      policy_type: PolicyType.NONE,
      duration_value: undefined,
      duration_unit: undefined,
      coverage_description: "",
      exclusions: "",
      service_provider: "",
      claim_contact_email: "",
      claim_contact_phone: "",
      claim_process_description: "",
      generates_document: false,
      is_active: true,
    },
  });

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);
  const token = authToken();
  const selectedType = watch("policy_type");
  const requiresDuration = [
    PolicyType.WARRANTY,
    PolicyType.GUARANTEE,
    PolicyType.EXTENDED_SUPPORT,
  ].includes(selectedType as PolicyType);

  useEffect(() => {
    if (!editId || !token) return;
    setIsFetchingEdit(true);
    fetchProductPolicyById(editId, token)
      .then((result) => {
        const data = result?.data ?? result;
        if (!data) {
          setGlobalError(labels.POLICY_NOT_FOUND);
          return;
        }
        reset({
          policy_name: data.policy_name ?? "",
          policy_type: data.policy_type,
          duration_value: data.duration_value ?? undefined,
          duration_unit: data.duration_unit ?? undefined,
          coverage_description: data.coverage_description ?? "",
          exclusions: data.exclusions ?? "",
          service_provider: data.service_provider ?? "",
          claim_contact_email: data.claim_contact_email ?? "",
          claim_contact_phone: data.claim_contact_phone ?? "",
          claim_process_description: data.claim_process_description ?? "",
          generates_document: data.generates_document ?? false,
          is_active: data.is_active ?? true,
        });
      })
      .catch(() => setGlobalError(labels.POLICY_LOAD_EDIT_ERROR))
      .finally(() => setIsFetchingEdit(false));
  }, [
    editId,
    token,
    reset,
    labels.POLICY_NOT_FOUND,
    labels.POLICY_LOAD_EDIT_ERROR,
  ]);

  const onError = () => {};
  const onSubmit = async (data: PolicyFormSchemaType) => {
    setGlobalError(null);
    try {
      const result = editId
        ? await updateProductPolicy(editId, data, token!)
        : await createProductPolicy(data, token!);

      if (result?.error || result?.statusCode >= 400) {
        setGlobalError(result?.message ?? labels.POLICY_SAVE_ERROR);
        return;
      }
      router.push("/vendor/configDocuments");
    } catch {
      setGlobalError(labels.POLICY_SAVE_ERROR);
    }
  };

  return (
    <>
      <main className="px-1 py-4 w-full max-w-5xl mx-auto">
        <header className="my-6">
          <h1 className="font-bold text-theme-h4 text-gray-800">
            {editId ? labels.EDIT_POLICY : labels.CREATE_NEW_POLICY}
          </h1>
          <p className="text-theme-body-sm text-gray-500 mt-1">
            {labels.POLICY_SUBTITLE}
          </p>
        </header>

        {isFetchingEdit && (
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-theme-body-sm border border-blue-200 mb-4">
            {labels.LOADING_POLICY_DATA}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="w-full flex flex-col gap-6"
        >
          {globalError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-theme-body-sm border border-red-200">
              {globalError}
            </div>
          )}

          {/* Basic Details */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-theme-h6 font-bold text-gray-800 mb-4 border-b pb-2">
              {labels.BASIC_DETAILS}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.POLICY_NAME} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year Manufacturer Warranty"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  {...register("policy_name")}
                />

                {errors.policy_name && (
                  <p className="text-theme-caption text-red-500">
                    {errors.policy_name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.POLICY_TYPE} <span className="text-red-500">*</span>
                </label>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  {...register("policy_type")}
                >
                  <option value="">{labels.SELECT_TYPE}</option>
                  {policyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.policy_type && (
                  <p className="text-theme-caption text-red-500">
                    {errors.policy_type.message}
                  </p>
                )}
              </div>
            </div>

            {requiresDuration && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col gap-2">
                  <label className="text-theme-body-sm font-semibold text-gray-600">
                    {labels.DURATION_VALUE}
                  </label>

                  <input
                    type="number"
                    min={1}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                    {...register("duration_value", { valueAsNumber: true })}
                  />

                  {errors.duration_value && (
                    <p className="text-theme-caption text-red-500">
                      {errors.duration_value.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-theme-body-sm font-semibold text-gray-600">
                    {labels.DURATION_UNIT}
                  </label>
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-2"
                    {...register("duration_unit")}
                  >
                    <option value={DurationUnit.DAYS}>
                      {labels.DURATION_UNITS.DAYS}
                    </option>
                    <option value={DurationUnit.MONTHS}>
                      {labels.DURATION_UNITS.MONTHS}
                    </option>
                    <option value={DurationUnit.YEARS}>
                      {labels.DURATION_UNITS.YEARS}
                    </option>
                    <option value={DurationUnit.LIFETIME}>
                      {labels.DURATION_UNITS.LIFETIME}
                    </option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* Coverage & Claims */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-theme-h6 font-bold text-gray-800 mb-4 border-b pb-2">
              {labels.COVERAGE_CLAIMS_CONFIG}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.COVERAGE_DESC}
                </label>
                <textarea
                  rows={3}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                  placeholder={labels.COVERAGE_PLACEHOLDER}
                  {...register("coverage_description")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.EXCLUSIONS}
                </label>
                <textarea
                  rows={3}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                  placeholder={labels.EXCLUSIONS_PLACEHOLDER}
                  {...register("exclusions")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.SERVICE_PROVIDER}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brand Service Center"
                  className="border border-gray-300 rounded-lg px-4 py-2"
                  {...register("service_provider")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.CLAIM_EMAIL}
                </label>
                <input
                  type="email"
                  placeholder="support@brand.com"
                  className="border border-gray-300 rounded-lg px-4 py-2"
                  {...register("claim_contact_email")}
                />

                {errors.claim_contact_email && (
                  <p className="text-theme-caption text-red-500">
                    {errors.claim_contact_email.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-theme-body-sm font-semibold text-gray-600">
                  {labels.CLAIM_PHONE}
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  className="border border-gray-300 rounded-lg px-4 py-2"
                  {...register("claim_contact_phone")}
                />

                {errors.claim_contact_phone && (
                  <p className="text-theme-caption text-red-500">
                    {errors.claim_contact_phone.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Settings */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-600"
                {...register("generates_document")}
              />

              <span className="text-theme-body-sm font-medium text-gray-700">
                {labels.GENERATES_PDF}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-600"
                {...register("is_active")}
              />

              <span className="text-theme-body-sm font-medium text-gray-700">
                {labels.POLICY_IS_ACTIVE}
              </span>
            </label>
          </section>

          <div className="w-full flex justify-end gap-4 pb-10">
            <Link
              href="/vendor/configDocuments"
              className="py-2.5 px-6 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
            >
              {labels.CANCEL}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isFetchingEdit}
              className="py-2.5 px-6 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-sm disabled:opacity-60"
            >
              {isSubmitting
                ? labels.SAVING
                : editId
                  ? labels.UPDATE_POLICY
                  : labels.SAVE_POLICY}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
