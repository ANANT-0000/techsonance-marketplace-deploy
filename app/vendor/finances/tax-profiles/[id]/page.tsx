"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useState, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { Save, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useForm } from "react-hook-form";
import { authToken } from "@/utils/authToken";
import {
  fetchCreateTaxProfile,
  fetchSingleTaxProfile,
  fetchUpdateTaxProfile,
} from "@/utils/vendorApiClient";
import { TAX_PROFILE_FORM_TEXT } from "@/constants/vendorText";
import { FieldConfig, FieldType } from "@/utils/Types";
import { TAX_PROFILE_FORM_FIELDS } from "@/constants";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { DataLoadErrorCard } from "@/components/vendor/DataLoadErrorCard";
import { TableRowSkeleton } from "@/components/common/skeletons";

export default function UnifiedTaxProfileFormPage() {
  const companyId = getClientCompanyId();

  const params = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";
  const profileId = params.id as string;

  // Determine mode
  const isEditMode = profileId !== "new";

  const [loading, setLoading] = useState(isEditMode);
  const token = authToken();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  // Dynamic Field Configuration

  // Fetch existing data for Edit Mode
  useEffect(() => {
    if (!token || !companyId) return;

    const fetchProfileData = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchSingleTaxProfile(profileId, token!, companyId);
        if (res.data?.data) {
          reset(res.data.data); // Instantly populate the form
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token, companyId, profileId, isEditMode, reset]);

  const onSubmit = async (data: any) => {
    if (!token || !companyId) return;
    try {
      if (isEditMode) {
        await fetchUpdateTaxProfile(profileId, data, token, companyId);
      } else {
        await fetchCreateTaxProfile(data, token, companyId);
      }
      router.push(`/vendor/finances/tax-profiles`);
    } catch (error) {
      alert(
        isEditMode
          ? TAX_PROFILE_FORM_TEXT.ALERTS.FAILED_UPDATE
          : TAX_PROFILE_FORM_TEXT.ALERTS.FAILED_CREATE,
      );
    }
  };

  if (!token || !companyId) {
    return (
      <DataLoadErrorCard
        title={TAX_PROFILE_FORM_TEXT.ERRORS.SESSION_EXPIRED_TITLE}
        description={TAX_PROFILE_FORM_TEXT.ERRORS.SESSION_EXPIRED_DESC}
        tryAgainText={TAX_PROFILE_FORM_TEXT.ERRORS.GO_TO_LOGIN}
        onTryAgain={() => router.push(VEDNOR_LOGIN_PATH)}
      />
    );
  }

  if (loading)
    return (
      <section className="w-full px-1">
        <header className="flex justify-between items-center my-6">
          <div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="w-24 h-10 bg-gray-100 rounded-xl animate-pulse"></div>
        </header>
        <div className="w-full rounded-2xl border border-gray-100 shadow-sm bg-white p-8 mb-4">
          <TableRowSkeleton columns={2} rows={3} />
        </div>
      </section>
    );

  return (
    <section className="w-full px-1">
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Layers size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {isEditMode
              ? TAX_PROFILE_FORM_TEXT.HEADER.EDIT
              : TAX_PROFILE_FORM_TEXT.HEADER.NEW}
          </h1>
        </div>
        <Link
          href={`/vendor/finances/tax-profiles`}
          className="flex items-center gap-2 text-theme-body-sm bg-white border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> {TAX_PROFILE_FORM_TEXT.HEADER.BACK}
        </Link>
      </header>

      <div className="w-full rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8 mb-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-8 gap-y-6"
        >
          {TAX_PROFILE_FORM_FIELDS.map((field) => {
            if (field.type === "checkbox") {
              return (
                <div
                  key={field.name}
                  className={`flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 col-span-1 md:col-span-${field.gridSpan}`}
                >
                  <input
                    type="checkbox"
                    id={field.name}
                    {...register(field.name)}
                    className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />

                  <label
                    htmlFor={field.name}
                    className="text-theme-body-sm font-medium text-gray-800 cursor-pointer"
                  >
                    {field.label}
                  </label>
                </div>
              );
            }

            if (field.type === "textarea") {
              return (
                <div
                  key={field.name}
                  className={`col-span-1 md:col-span-${field.gridSpan}`}
                >
                  <label className="text-theme-body-sm font-semibold text-gray-700 block mb-1.5">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    {...register(field.name, { required: field.required })}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors"
                  />

                  {errors[field.name] && (
                    <span className="text-theme-caption text-red-500 mt-1 block">
                      {TAX_PROFILE_FORM_TEXT.FIELDS.REQUIRED_ERROR}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div
                key={field.name}
                className={`col-span-1 md:col-span-${field.gridSpan}`}
              >
                <label className="text-theme-body-sm font-semibold text-gray-700 block mb-1.5">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={field.type}
                  {...register(field.name, { required: field.required })}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors"
                />

                {errors[field.name] && (
                  <span className="text-theme-caption text-red-500 mt-1 block">
                    {TAX_PROFILE_FORM_TEXT.FIELDS.REQUIRED_ERROR}
                  </span>
                )}
              </div>
            );
          })}

          <div className="col-span-2 flex justify-end pt-6 mt-4 border-t border-gray-100">
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all disabled:opacity-70 disabled:hover:shadow-none"
            >
              {isSubmitting ? (
                TAX_PROFILE_FORM_TEXT.ACTIONS.PROCESSING
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode
                    ? TAX_PROFILE_FORM_TEXT.ACTIONS.UPDATE
                    : TAX_PROFILE_FORM_TEXT.ACTIONS.SAVE}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
