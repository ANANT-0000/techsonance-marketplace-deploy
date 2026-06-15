"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { Save, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useForm } from "react-hook-form";
import { authToken } from "@/utils/authToken";
import {
  fetchCreateGstRecord,
  fetchSingleGstRecord,
  fetchUpdateGstRecord,
} from "@/utils/vendorApiClient";
import { GST_FORM_TEXT } from "@/constants/vendorText";
import { GST_FORM_FIELDS } from "@/constants";

// --- DYNAMIC FIELD CONFIGURATION TYPE ---

export default function GstFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const vendorId = user && "vendor_id" in user ? user.vendor_id : "";
  const gstId = params.id as string;

  // 1. DETERMINE MODE
  const isEditMode = gstId !== "new";

  const [loading, setLoading] = useState(isEditMode); // Only load if editing
  const token = authToken();

  // 2. INITIALIZE USE FORM
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  // 4. FETCH DATA IF EDIT MODE
  useEffect(() => {
    if (!token) redirect("/auth/vendorLogin");

    const fetchGstData = async () => {
      if (!isEditMode) return; // Skip fetching if creating new

      try {
        const res = await fetchSingleGstRecord(gstId, token!);

        if (res.data?.data) {
          // Format dates properly for HTML input type="date"
          const formattedData = {
            ...res.data.data,
            registration_date: res.data.data.registration_date?.split("T")[0],
            effective_from: res.data.data.effective_from?.split("T")[0],
          };
          reset(formattedData); // Instantly populates the form
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchGstData();
  }, [token, gstId, isEditMode, reset]);

  // 5. UNIFIED SUBMIT FUNCTION
  const onSubmit = async (data: any) => {
    try {
      if (isEditMode) {
        // EDIT MODE: PATCH Request
        await fetchUpdateGstRecord(gstId, data, token!);
      } else {
        // CREATE MODE: POST Request
        await fetchCreateGstRecord(data, token!);
      }
      router.push(`/vendor/finances/gst`);
    } catch (error) {
      alert(
        isEditMode
          ? GST_FORM_TEXT.ALERTS.FAILED_UPDATE
          : GST_FORM_TEXT.ALERTS.FAILED_CREATE,
      );
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        {GST_FORM_TEXT.LOADING}
      </div>
    );

  return (
    <main className="w-full   px-1">
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Building2 size={22} className="text-emerald-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {isEditMode ? GST_FORM_TEXT.HEADER.EDIT : GST_FORM_TEXT.HEADER.NEW}
          </h1>
        </div>
        <Link
          href={`/vendor/finances/gst`}
          className="flex items-center gap-2 text-theme-body-sm bg-white border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> {GST_FORM_TEXT.HEADER.BACK}
        </Link>
      </header>

      <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white p-6 mb-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-6"
        >
          {/* 6. DYNAMIC RENDERING ENGINE */}
          {GST_FORM_FIELDS.map((field) => {
            // Handle Checkboxes
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
                    className="w-5 h-5 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
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

            // Handle Text / Date / Select
            return (
              <div
                key={field.name}
                className={`col-span-1 md:col-span-${field.gridSpan}`}
              >
                <label className="text-theme-body-sm font-semibold text-gray-700 block mb-1.5">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "select" ? (
                  <select
                    {...register(field.name, { required: field.required })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="">{GST_FORM_TEXT.FIELDS.SELECT}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    {...register(field.name, { required: field.required })}
                    placeholder={field.placeholder}
                    className={`w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:bg-white focus:outline-none transition-colors ${field.name.includes("gst_number") && "font-mono uppercase"}`}
                  />
                )}

                {/* Inline Validation Errors */}
                {errors[field.name] && (
                  <span className="text-theme-caption text-red-500 mt-1 block">
                    {GST_FORM_TEXT.FIELDS.REQUIRED_ERROR}
                  </span>
                )}
              </div>
            );
          })}

          <div className="col-span-2 flex justify-end pt-4 mt-2 border-t border-gray-100">
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                GST_FORM_TEXT.ACTIONS.PROCESSING
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode
                    ? GST_FORM_TEXT.ACTIONS.UPDATE
                    : GST_FORM_TEXT.ACTIONS.SAVE}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
