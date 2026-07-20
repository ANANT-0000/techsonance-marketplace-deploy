"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useReducer, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { Save, ArrowLeft, Percent, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useForm } from "react-hook-form";
import { authToken } from "@/utils/authToken";
import {
  fetchCreateTaxSlab,
  fetchSingleTaxSlab,
  fetchTaxProfiles,
  fetchUpdateTaxSlab,
} from "@/utils/vendorApiClient";
import { TAX_RATES_FORM_TEXT } from "@/constants/vendorText";
import { FieldConfig, FieldType } from "@/utils/Types";
import { TAXSLAB_FORM_FIELDS } from "@/constants";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { toast } from "sonner";

// ── Configuration Array ───────────────────────────────────────────────

export enum SessionState {
  CHECKING = "checking",
  INVALID = "invalid",
  VALID = "valid",
}

interface TaxRatesFormState {
  loading: boolean;
  profiles: { id: string; profile_type: string }[];
  sessionState: SessionState;
}

enum TaxRatesFormActionType {
  SET_LOADING = "SET_LOADING",
  SET_PROFILES = "SET_PROFILES",
  SET_SESSION_STATE = "SET_SESSION_STATE",
}

type TaxRatesFormAction =
  | { type: TaxRatesFormActionType.SET_LOADING; payload: boolean }
  | { type: TaxRatesFormActionType.SET_PROFILES; payload: { id: string; profile_type: string }[] }
  | { type: TaxRatesFormActionType.SET_SESSION_STATE; payload: SessionState };

function formReducer(state: TaxRatesFormState, action: TaxRatesFormAction): TaxRatesFormState {
  switch (action.type) {
    case TaxRatesFormActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case TaxRatesFormActionType.SET_PROFILES:
      return { ...state, profiles: action.payload };
    case TaxRatesFormActionType.SET_SESSION_STATE:
      return { ...state, sessionState: action.payload };
    default:
      return state;
  }
}

// ── Main Component ────────────────────────────────────────────────────
export default function TaxSlabFormPage() {
  const companyId = getClientCompanyId();

  const params = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const vendorId = user && "vendor_id" in user ? user.vendor_id : "";
  const slabId = params.id as string;

  const isEditMode = slabId !== "new";

  const [state, dispatch] = useReducer(formReducer, {
    loading: isEditMode,
    profiles: [],
    sessionState: SessionState.CHECKING,
  });
  const { loading, profiles, sessionState } = state;

  const token = authToken();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!token || !companyId) {
      timer = setTimeout(() => {
        dispatch({ type: TaxRatesFormActionType.SET_SESSION_STATE, payload: SessionState.INVALID });
      }, 800);
      return () => clearTimeout(timer);
    }
    dispatch({ type: TaxRatesFormActionType.SET_SESSION_STATE, payload: SessionState.VALID });

    const fetchData = async () => {
      try {
        // Always fetch profiles for the dropdown
        const profilesRes = await fetchTaxProfiles(
          "desc",
          undefined,
          token,
          companyId,
        );
        dispatch({ type: TaxRatesFormActionType.SET_PROFILES, payload: profilesRes?.data || [] });

        // Only fetch existing slab data in edit mode
        if (isEditMode) {
          const res = await fetchSingleTaxSlab(slabId, token, companyId);
          if (res?.data) {
            reset({
              ...res.data,
              effective_from: res.data.effective_from?.split("T")[0],
              effective_to:
                res.data.effective_to === "2099-12-31"
                  ? "" // show blank instead of sentinel date
                  : res.data.effective_to?.split("T")[0],
            });
          }
        }
      } catch (error) {
        toast.error(TAX_RATES_FORM_TEXT.ALERTS.FAILED_FETCH);
      } finally {
        dispatch({ type: TaxRatesFormActionType.SET_LOADING, payload: false });
      }
    };

    fetchData();
  }, [token, slabId, isEditMode, reset]);

  const onSubmit = async (data: Record<string, string | boolean>) => {
    if (!token || !companyId) {
      toast.error(TAX_RATES_FORM_TEXT.ALERTS.SESSION_EXPIRED);
      return;
    }
    try {
      // Apply the 2099-12-31 sentinel logic before submitting if left blank
      const payload = {
        ...data,
        effective_to: data.effective_to ? data.effective_to : "2099-12-31",
      };

      if (isEditMode) {
        await fetchUpdateTaxSlab(slabId, payload, token!, companyId);
      } else {
        await fetchCreateTaxSlab(payload, token!, companyId);
      }
      router.push(`/vendor/finances/tax-rates`);
    } catch (error) {
      toast.error(
        isEditMode
          ? TAX_RATES_FORM_TEXT.ALERTS.FAILED_UPDATE
          : TAX_RATES_FORM_TEXT.ALERTS.FAILED_CREATE,
      );
    }
  };

  if (sessionState === "checking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">{TAX_RATES_FORM_TEXT.SESSION.CHECKING}</p>
      </div>
    );
  }

  if (sessionState === "invalid") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-red-100">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{TAX_RATES_FORM_TEXT.SESSION.AUTH_REQUIRED}</h2>
        <p className="text-gray-500 text-sm max-w-md text-center mb-6 leading-relaxed">
          {TAX_RATES_FORM_TEXT.SESSION.MISSING_FORM}
        </p>
        <Link 
          href={VEDNOR_LOGIN_PATH}
          className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm"
        >
          {TAX_RATES_FORM_TEXT.SESSION.LOGIN_BTN}
        </Link>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">{TAX_RATES_FORM_TEXT.LOADING}</p>
      </div>
    );

  return (
    <section className="w-full px-1">
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Percent size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {isEditMode
              ? TAX_RATES_FORM_TEXT.HEADER.EDIT
              : TAX_RATES_FORM_TEXT.HEADER.NEW}
          </h1>
        </div>
        <Link
          href={`/vendor/finances/tax-rates`}
          className="flex items-center gap-2 text-theme-body-sm bg-white border border-gray-100 text-gray-700 rounded-xl px-5 py-2.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} /> {TAX_RATES_FORM_TEXT.HEADER.BACK}
        </Link>
      </header>

      <div className="w-full rounded-2xl border border-gray-100 shadow-sm bg-white p-8 mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TAXSLAB_FORM_FIELDS.map((field) => {
              // Determine grid span width
              const spanClass =
                field.gridSpan === 2
                  ? "col-span-1 md:col-span-2"
                  : "col-span-1";

              // ── 1. SELECT RENDERER ──
              if (field.type === "select") {
                const options =
                  field.name === "tax_profile_id"
                    ? profiles.map((p) => ({
                        value: p.id,
                        label: p.profile_type,
                      }))
                    : (field.options ?? []);

                return (
                  <div key={field.name} className={spanClass}>
                    <label className="text-theme-body-sm font-semibold text-gray-700 block mb-1.5">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-0.5">*</span>
                      )}
                    </label>
                    <select
                      {...register(field.name, { required: field.required })}
                      className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">
                        {field.placeholder ??
                          TAX_RATES_FORM_TEXT.FIELDS.SELECT_DEFAULT}
                      </option>
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {field.note && (
                      <p className="text-theme-caption text-gray-400 mt-1">
                        {field.note}
                      </p>
                    )}
                    {errors[field.name] && (
                      <span className="text-theme-caption text-red-500 mt-1 block">
                        {TAX_RATES_FORM_TEXT.FIELDS.REQUIRED_ERROR}
                      </span>
                    )}
                  </div>
                );
              }

              // ── 2. TEXTAREA RENDERER ──
              if (field.type === "textarea") {
                return (
                  <div key={field.name} className={spanClass}>
                    <label className="text-theme-body-sm font-semibold text-gray-700 block mb-1.5">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      {...register(field.name, { required: field.required })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none resize-none transition-all"
                    />

                    {field.note && (
                      <p className="text-theme-caption text-gray-400 mt-1">
                        {field.note}
                      </p>
                    )}
                    {errors[field.name] && (
                      <span className="text-theme-caption text-red-500 mt-1 block">
                        {TAX_RATES_FORM_TEXT.FIELDS.REQUIRED_ERROR}
                      </span>
                    )}
                  </div>
                );
              }

              // ── 3. CHECKBOX RENDERER ──
              if (field.type === "checkbox") {
                return (
                  <div key={field.name} className={spanClass}>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        {...register(field.name)}
                        className="w-5 h-5 text-blue-500 bg-gray-50 border-gray-300 rounded focus:ring-blue-400"
                      />

                      <label className="ml-2 text-theme-body-sm font-semibold text-gray-700">
                        {field.label}
                      </label>
                    </div>
                  </div>
                );
              }

              // ── 4. DEFAULT (INPUT) RENDERER ──
              return (
                <div key={field.name} className={spanClass}>
                  <label className="text-theme-body-sm font-semibold text-gray-700 block mb-1.5">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    step={field.step}
                    {...register(field.name, { required: field.required })}
                    placeholder={field.placeholder}
                    className={`w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all ${field.type === "number" ? "font-bold text-blue-600" : ""}`}
                  />

                  {field.note && (
                    <p className="text-theme-caption text-gray-400 mt-1">
                      {field.note}
                    </p>
                  )}
                  {errors[field.name] && (
                    <span className="text-theme-caption text-red-500 mt-1 block">
                      {TAX_RATES_FORM_TEXT.FIELDS.REQUIRED_ERROR}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 disabled:active:scale-100"
            >
              {isSubmitting ? (
                TAX_RATES_FORM_TEXT.ACTIONS.PROCESSING
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode
                    ? TAX_RATES_FORM_TEXT.ACTIONS.UPDATE
                    : TAX_RATES_FORM_TEXT.ACTIONS.SAVE}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
