"use client";

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

export default function UnifiedTaxProfileFormPage() {
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
    if (!token) redirect("/auth/vendorLogin");

    const fetchProfileData = async () => {
      if (!isEditMode) return;
      try {
        const res = await fetchSingleTaxProfile(profileId, token!);
        if (res.data?.data) {
          reset(res.data.data); // Instantly populate the form
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token, profileId, isEditMode, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode) {
        await fetchUpdateTaxProfile(profileId, data, token!);
      } else {
        await fetchCreateTaxProfile(data, token!);
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

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        {TAX_PROFILE_FORM_TEXT.LOADING}
      </div>
    );

  return (
    <section className="w-full  px-1">
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

      <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white p-6 mb-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-6"
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

          <div className="col-span-2 flex justify-end pt-4 mt-2 border-t border-gray-100">
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70"
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
