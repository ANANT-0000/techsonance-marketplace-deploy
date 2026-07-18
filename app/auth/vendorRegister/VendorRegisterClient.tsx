"use client";

import { useCallback, useEffect, useReducer } from "react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowRight,
  Mail,
  Clock,
  Globe2,
  Link2,
  Eye,
  EyeOff,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import {
  validateComplianceFields,
  vendorRegisterSchema,
  VendorRegisterSchema,
  SUBDOMAIN_RULES,
  CUSTOM_DOMAIN_RULES,
} from "@/utils/validation";
import type { SubscriptionPlan } from "@/utils/Types";
import {
  COUNTRIES,
  COUNTRY_CODES,
  TS_LOGO,
  UNREGISTERED_COUNTRIES,
} from "@/constants/common";
import {
  BUSINESS_CATEGORIES,
  COMPANY_STRUCTURES,
  STEP_RHF_FIELDS,
  VENDOR_REGISTER_FORM_STEPS,
} from "@/constants";
import { PLATFORM_BASE_DOMAIN } from "@/constants/constants";
import {
  VENDOR_REGISTER_TEXT,
  VENDOR_REGISTER_BRAND_FEATURES,
} from "@/constants/authText";
import { vendorRegister } from "@/utils/authApiClient";

import FinancialCompliance from "@/components/vendor/FinancialCompliance";
import { DocUploadInput, FileEntry } from "@/components/vendor/DocUploadInput";
import { RegistrationSuccessModal } from "@/components/common/RegistrationSuccessModal";
import AxiosAPI from "@/lib/axios";
import Image from "next/image";
import { StepIndicator } from "@/components/common/StepIndicator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ─── State Management (useReducer) ───────────────────────────────────────────

export enum ActionType {
  SET_FORM_STEP = "SET_FORM_STEP",
  SET_GLOBAL_ERROR = "SET_GLOBAL_ERROR",
  SET_SHOW_SUCCESS = "SET_SHOW_SUCCESS",
  SET_EMAIL_ERROR = "SET_EMAIL_ERROR",
  SET_PHONE_ERROR = "SET_PHONE_ERROR",
  SET_COUNTRY_CODE = "SET_COUNTRY_CODE",
  SET_COMPLIANCE_VALUES = "SET_COMPLIANCE_VALUES",
  UPDATE_COMPLIANCE_VALUE = "UPDATE_COMPLIANCE_VALUE",
  SET_COMPLIANCE_ERRORS = "SET_COMPLIANCE_ERRORS",
  SET_FINANCIAL_FILE_MAP = "SET_FINANCIAL_FILE_MAP",
  SET_MISSING_FINANCIAL_DOCS = "SET_MISSING_FINANCIAL_DOCS",
  RESET_ON_COUNTRY_CHANGE = "RESET_ON_COUNTRY_CHANGE",
  RESET_FORM_STATE = "RESET_FORM_STATE",
  SET_REGISTERED_BUSINESS = "SET_REGISTERED_BUSINESS",
  SET_SLUG_CACHE = "SET_SLUG_CACHE",
  SET_CUSTOM_CACHE = "SET_CUSTOM_CACHE",
  SET_IS_CHECKING_EMAIL = "SET_IS_CHECKING_EMAIL",
  SET_IS_CHECKING_PHONE = "SET_IS_CHECKING_PHONE",
  SET_IS_FINAL_SUBMIT_INTENT = "SET_IS_FINAL_SUBMIT_INTENT",
  TOGGLE_SHOW_PASSWORD = "TOGGLE_SHOW_PASSWORD",
  TOGGLE_SHOW_CONFIRM_PASSWORD = "TOGGLE_SHOW_CONFIRM_PASSWORD",
  SET_PLANS = "SET_PLANS",
  SET_IS_LOADING_PLANS = "SET_IS_LOADING_PLANS",
  TOGGLE_PLAN_DETAILS_OPEN = "TOGGLE_PLAN_DETAILS_OPEN",
  SET_EXPANDED_PLAN_ID = "SET_EXPANDED_PLAN_ID",
}

export type Action =
  | { type: ActionType.SET_FORM_STEP; payload: number }
  | { type: ActionType.SET_GLOBAL_ERROR; payload: string | null }
  | { type: ActionType.SET_SHOW_SUCCESS; payload: boolean }
  | { type: ActionType.SET_EMAIL_ERROR; payload: string | null }
  | { type: ActionType.SET_PHONE_ERROR; payload: string | null }
  | { type: ActionType.SET_COUNTRY_CODE; payload: string }
  | { type: ActionType.SET_COMPLIANCE_VALUES; payload: Record<string, string> }
  | {
      type: ActionType.UPDATE_COMPLIANCE_VALUE;
      payload: { key: string; val: string };
    }
  | { type: ActionType.SET_COMPLIANCE_ERRORS; payload: Record<string, string> }
  | { type: ActionType.SET_FINANCIAL_FILE_MAP; payload: FileEntry[] }
  | { type: ActionType.SET_MISSING_FINANCIAL_DOCS; payload: string[] }
  | { type: ActionType.RESET_ON_COUNTRY_CHANGE; payload: string }
  | { type: ActionType.RESET_FORM_STATE }
  | { type: ActionType.SET_REGISTERED_BUSINESS; payload: boolean }
  | { type: ActionType.SET_SLUG_CACHE; payload: string }
  | { type: ActionType.SET_CUSTOM_CACHE; payload: string }
  | { type: ActionType.SET_IS_CHECKING_EMAIL; payload: boolean }
  | { type: ActionType.SET_IS_CHECKING_PHONE; payload: boolean }
  | { type: ActionType.SET_IS_FINAL_SUBMIT_INTENT; payload: boolean }
  | { type: ActionType.TOGGLE_SHOW_PASSWORD }
  | { type: ActionType.TOGGLE_SHOW_CONFIRM_PASSWORD }
  | { type: ActionType.SET_PLANS; payload: SubscriptionPlan[] }
  | { type: ActionType.SET_IS_LOADING_PLANS; payload: boolean }
  | { type: ActionType.TOGGLE_PLAN_DETAILS_OPEN }
  | { type: ActionType.SET_EXPANDED_PLAN_ID; payload: string | null };

interface State {
  formStep: number;
  globalError: string | null;
  showSuccess: boolean;
  emailError: string | null;
  phoneError: string | null;
  countryCode: string;
  complianceValues: Record<string, string>;
  complianceErrors: Record<string, string>;
  financialFileMap: FileEntry[];
  missingFinancialDocs: string[];
  isRegisteredBusiness: boolean;
  slugCache: string;
  customCache: string;
  isCheckingEmail: boolean;
  isCheckingPhone: boolean;
  isFinalSubmitIntent: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  plans: SubscriptionPlan[];
  isLoadingPlans: boolean;
  isPlanDetailsOpen: boolean;
  expandedPlanId: string | null;
}

const initialState: State = {
  formStep: 0,
  globalError: null,
  showSuccess: false,
  emailError: null,
  phoneError: null,
  countryCode: "",
  complianceValues: {},
  complianceErrors: {},
  financialFileMap: [],
  missingFinancialDocs: [],
  isRegisteredBusiness: false,
  slugCache: "",
  customCache: "",
  isCheckingEmail: false,
  isCheckingPhone: false,
  isFinalSubmitIntent: false,
  showPassword: false,
  showConfirmPassword: false,
  plans: [],
  isLoadingPlans: true,
  isPlanDetailsOpen: true,
  expandedPlanId: null,
};

function registerReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_FORM_STEP:
      return { ...state, formStep: action.payload };
    case ActionType.SET_GLOBAL_ERROR:
      return { ...state, globalError: action.payload };
    case ActionType.SET_SHOW_SUCCESS:
      return { ...state, showSuccess: action.payload };
    case ActionType.SET_EMAIL_ERROR:
      return { ...state, emailError: action.payload };
    case ActionType.SET_PHONE_ERROR:
      return { ...state, phoneError: action.payload };
    case ActionType.SET_COUNTRY_CODE:
      return { ...state, countryCode: action.payload };
    case ActionType.SET_COMPLIANCE_VALUES:
      return { ...state, complianceValues: action.payload };
    case ActionType.UPDATE_COMPLIANCE_VALUE: {
      const newValues = {
        ...state.complianceValues,
        [action.payload.key]: action.payload.val,
      };
      const newErrors = { ...state.complianceErrors };
      if (newErrors[action.payload.key]) {
        delete newErrors[action.payload.key];
      }
      return {
        ...state,
        complianceValues: newValues,
        complianceErrors: newErrors,
      };
    }
    case ActionType.SET_COMPLIANCE_ERRORS:
      return { ...state, complianceErrors: action.payload };
    case ActionType.SET_FINANCIAL_FILE_MAP:
      return { ...state, financialFileMap: action.payload };
    case ActionType.SET_MISSING_FINANCIAL_DOCS:
      return { ...state, missingFinancialDocs: action.payload };
    case ActionType.RESET_ON_COUNTRY_CHANGE:
      return {
        ...state,
        countryCode: action.payload,
        complianceValues: {},
        complianceErrors: {},
        missingFinancialDocs: [],
        financialFileMap: [],
      };
    case ActionType.RESET_FORM_STATE:
      return { ...initialState, showSuccess: true };
    case ActionType.SET_REGISTERED_BUSINESS:
      return { ...state, isRegisteredBusiness: action.payload };
    case ActionType.SET_SLUG_CACHE:
      return { ...state, slugCache: action.payload };
    case ActionType.SET_CUSTOM_CACHE:
      return { ...state, customCache: action.payload };
    case ActionType.SET_IS_CHECKING_EMAIL:
      return { ...state, isCheckingEmail: action.payload };
    case ActionType.SET_IS_CHECKING_PHONE:
      return { ...state, isCheckingPhone: action.payload };
    case ActionType.SET_IS_FINAL_SUBMIT_INTENT:
      return { ...state, isFinalSubmitIntent: action.payload };
    case ActionType.TOGGLE_SHOW_PASSWORD:
      return { ...state, showPassword: !state.showPassword };
    case ActionType.TOGGLE_SHOW_CONFIRM_PASSWORD:
      return { ...state, showConfirmPassword: !state.showConfirmPassword };
    case ActionType.SET_PLANS:
      return { ...state, plans: action.payload };
    case ActionType.SET_IS_LOADING_PLANS:
      return { ...state, isLoadingPlans: action.payload };
    case ActionType.TOGGLE_PLAN_DETAILS_OPEN:
      return { ...state, isPlanDetailsOpen: !state.isPlanDetailsOpen };
    case ActionType.SET_EXPANDED_PLAN_ID:
      return { ...state, expandedPlanId: action.payload };
    default:
      return state;
  }
}

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-platform-primary focus:ring-2 focus:ring-platform-focus-ring transition-all";
const labelCls =
  "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1";
const errorCls = "mt-1 text-[11px] text-red-500 flex items-center gap-1";

const AnimatedError = ({ error }: { error?: string }) => (
  <AnimatePresence>
    {error && (
      <motion.div
        initial={{ height: 0, opacity: 0, x: 0, marginTop: 0 }}
        animate={{
          height: "auto",
          opacity: 1,
          x: [-10, 10, -10, 10, 0],
          marginTop: 4,
          transition: { duration: 0.4 },
        }}
        exit={{ height: 0, opacity: 0, marginTop: 0 }}
        className="overflow-hidden"
        role="alert"
      >
        <p className={errorCls}>{error}</p>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Step header meta ─────────────────────────────────────────────────────────
const STEP_META = [
  {
    title: VENDOR_REGISTER_TEXT.STEP_0_TITLE,
    desc: VENDOR_REGISTER_TEXT.STEP_0_DESC,
  },
  {
    title: VENDOR_REGISTER_TEXT.STEP_1_TITLE,
    desc: VENDOR_REGISTER_TEXT.STEP_1_DESC,
  },
  {
    title: VENDOR_REGISTER_TEXT.STEP_2_TITLE,
    desc: VENDOR_REGISTER_TEXT.STEP_2_DESC,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VendorRegisterClient() {
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get("plan_id") || "";

  const [state, dispatch] = useReducer(registerReducer, initialState);

  useEffect(() => {
    async function fetchPlans() {
      dispatch({ type: ActionType.SET_IS_LOADING_PLANS, payload: true });
      try {
        const res = await AxiosAPI.get("/v1/subscription/plans");
        if (res.data?.success || res.data) {
          const plans = res.data?.data || res.data || [];
          dispatch({ type: ActionType.SET_PLANS, payload: plans });

          // Auto-select first trial plan if none selected
          const trialPlans = plans.filter(
            (p: SubscriptionPlan) =>
              p.trial_days && p.trial_days > 0 && p.price_monthly !== "0.00",
          );
          if (trialPlans.length > 0) {
            setValue("plan_id", trialPlans[0].id);
            dispatch({
              type: ActionType.SET_EXPANDED_PLAN_ID,
              payload: trialPlans[0].id,
            });
            clearErrors("plan_id");
          }
        }
      } catch (error) {
        console.error("Failed to fetch subscription state.plans", error);
      } finally {
        dispatch({ type: ActionType.SET_IS_LOADING_PLANS, payload: false });
      }
    }
    fetchPlans();
  }, []);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(vendorRegisterSchema),
    defaultValues: {
      phone_number: "",
      company_name: "",
      store_owner_first_name: "",
      store_owner_last_name: "",
      category: "",
      domain_type: "subdomain",
      company_domain: "",
      company_structure: "",
      email: "",
      country_code: "",
      password: "",
      confirm_password: "",
      plan_id: initialPlanId,
    },
  });

  const emailValue = watch("email");
  const phoneValue = watch("phone_number");
  const categoryValue = watch("category");
  const domainType = watch("domain_type");
  const companyDomain = watch("company_domain");
  const selectedPlanId = watch("plan_id");

  const selectedPlanDetails = state.plans.find((p) => p.id === selectedPlanId);

  const sourceCountries = state.isRegisteredBusiness
    ? COUNTRIES
    : UNREGISTERED_COUNTRIES;
  let currentCountryFields =
    sourceCountries.find((c) => c.country_code === state.countryCode)?.fields ??
    [];
  currentCountryFields = currentCountryFields.filter((field) => {
    if (field.value === "fssai" && categoryValue !== "Food & Beverages")
      return false;
    return true;
  });

  // ── Email duplicate check ─────────────────────────────────────────────────────
  const checkEmail = useCallback(
    async (emailStr?: string): Promise<boolean> => {
      const emailToCheck = emailStr || emailValue;
      if (!emailToCheck) {
        dispatch({ type: ActionType.SET_EMAIL_ERROR, payload: null });
        return true;
      }
      dispatch({ type: ActionType.SET_IS_CHECKING_EMAIL, payload: true });
      dispatch({ type: ActionType.SET_EMAIL_ERROR, payload: null });
      try {
        const res = await AxiosAPI.get(
          `/v1/vendors/check-email?email=${encodeURIComponent(emailToCheck)}`,
        );
        const exists = res.data?.data?.exists ?? res.data?.exists;
        if (exists) {
          dispatch({
            type: ActionType.SET_EMAIL_ERROR,
            payload: VENDOR_REGISTER_TEXT.ERROR_EMAIL_EXISTS,
          });
          return false;
        } else {
          dispatch({ type: ActionType.SET_EMAIL_ERROR, payload: null });
          return true;
        }
      } catch {
        // silently ignore network errors for email check, proceed
        return true;
      } finally {
        dispatch({ type: ActionType.SET_IS_CHECKING_EMAIL, payload: false });
      }
    },
    [emailValue, dispatch],
  );

  const checkPhone = useCallback(
    async (phoneStr?: string): Promise<boolean> => {
      const phoneToCheck = phoneStr || phoneValue;
      if (!phoneToCheck) {
        dispatch({ type: ActionType.SET_PHONE_ERROR, payload: null });
        return true;
      }
      dispatch({ type: ActionType.SET_IS_CHECKING_PHONE, payload: true });
      dispatch({ type: ActionType.SET_PHONE_ERROR, payload: null });
      try {
        const res = await AxiosAPI.post(`/v1/vendors/check-phone`, {
          phone: phoneToCheck,
        });
        const exists = res.data?.data?.exists ?? res.data?.exists;
        if (exists) {
          dispatch({
            type: ActionType.SET_PHONE_ERROR,
            payload: VENDOR_REGISTER_TEXT.ERROR_PHONE_EXISTS,
          });
          return false;
        } else {
          dispatch({ type: ActionType.SET_PHONE_ERROR, payload: null });
          return true;
        }
      } catch {
        return true;
      } finally {
        dispatch({ type: ActionType.SET_IS_CHECKING_PHONE, payload: false });
      }
    },
    [phoneValue, dispatch],
  );

  // ── Navigation ───────────────────────────────────────────────────────────────
  const nextStep = useCallback(async () => {
    dispatch({ type: ActionType.SET_GLOBAL_ERROR, payload: null });
    if (state.formStep === 0 || state.formStep === 1) {
      const fields = STEP_RHF_FIELDS[state.formStep];
      const valid = fields.length > 0 ? await trigger(fields) : true;
      if (!valid) return;
    }
    if (state.formStep === 0) {
      const isEmailValid = await checkEmail();
      const isPhoneValid = await checkPhone();
      if (!isEmailValid || !isPhoneValid) return;
    }
    dispatch({
      type: ActionType.SET_FORM_STEP,
      payload: Math.min(
        state.formStep + 1,
        VENDOR_REGISTER_FORM_STEPS.length - 1,
      ),
    });
  }, [state.formStep, trigger, checkEmail, checkPhone]);

  const prevStep = () => {
    dispatch({ type: ActionType.SET_GLOBAL_ERROR, payload: null });
    dispatch({
      type: ActionType.SET_FORM_STEP,
      payload: Math.max(state.formStep - 1, 0),
    });
  };

  const isNextDisabled = () => {
    if (state.formStep === 1) {
      if (domainType === "subdomain") {
        return (
          !!errors.company_domain ||
          !companyDomain ||
          (companyDomain?.length || 0) < 3
        );
      }
      return !!errors.company_domain || !companyDomain;
    }
    return false;
  };

  // ── Compliance change handler ─────────────────────────────────────────────────
  const handleComplianceChange = useCallback((key: string, val: string) => {
    dispatch({
      type: ActionType.UPDATE_COMPLIANCE_VALUE,
      payload: { key, val },
    });
  }, []);

  // ── Sync company_compliance into RHF so Zod validates real data ─────────────
  // Without this, zodResolver always sees company_compliance as [] (the schema
  // default), so Zod passes validation even when required compliance fields are
  // empty. Keeping shouldValidate:false avoids re-render thrash on every keystroke.
  useEffect(() => {
    const compliance = currentCountryFields.map((f) => ({
      field_key: f.value,
      field_value: state.complianceValues[f.value] ?? "",
      is_active: true,
      valid_until: "",
      field_details: [],
    }));
    setValue("company_compliance", compliance, { shouldValidate: false });
  }, [currentCountryFields, state.complianceValues, setValue]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  // Guard 1: must be on the final step.
  // Guard 2: state.isFinalSubmitIntent must be true — only set when the user explicitly
  //   clicks the submit button. This kills any rogue native submit fired by child
  //   component buttons that lack type="button" (e.g. DocUploadInput expand toggle).
  const onSubmit: SubmitHandler<VendorRegisterSchema> = async (data) => {
    if (
      state.formStep !== VENDOR_REGISTER_FORM_STEPS.length - 1 ||
      !state.isFinalSubmitIntent
    ) {
      dispatch({ type: ActionType.SET_IS_FINAL_SUBMIT_INTENT, payload: false });
      return;
    }
    dispatch({ type: ActionType.SET_IS_FINAL_SUBMIT_INTENT, payload: false });

    // Validate compliance fields before final submission
    if (!state.countryCode) {
      dispatch({
        type: ActionType.SET_GLOBAL_ERROR,
        payload: VENDOR_REGISTER_TEXT.ERROR_COUNTRY_REQUIRED,
      });
      return;
    }
    const compErrors = validateComplianceFields(
      currentCountryFields,
      state.complianceValues,
    );
    if (Object.keys(compErrors).length > 0) {
      dispatch({ type: ActionType.SET_COMPLIANCE_ERRORS, payload: compErrors });
      return;
    }

    dispatch({ type: ActionType.SET_GLOBAL_ERROR, payload: null });
    const formData = new FormData();
    state.financialFileMap.forEach(({ file, type }) => {
      if (file) {
        formData.append(
          "documents",
          new File([file], `${type}__${file.name}`, { type: file.type }),
        );
      }
    });
    const compliance = currentCountryFields.map((f) => ({
      field_key: f.value,
      field_value: state.complianceValues[f.value] ?? "",
      is_active: true,
      valid_until: "",
      field_details: [],
    }));
    const finalData = { ...data };
    if (finalData.domain_type === "subdomain") {
      finalData.company_domain = `${finalData.company_domain}.${PLATFORM_BASE_DOMAIN}`;
    }
    formData.append(
      "vendor",
      JSON.stringify({ ...finalData, company_compliance: compliance }),
    );
    try {
      const result = await vendorRegister(formData);
      if (result?.status === 201) {
        reset();
        dispatch({ type: ActionType.RESET_FORM_STATE });
      } else {
        dispatch({
          type: ActionType.SET_GLOBAL_ERROR,
          payload: result?.message ?? VENDOR_REGISTER_TEXT.ERROR_REG_FAILED,
        });
      }
    } catch {
      dispatch({
        type: ActionType.SET_GLOBAL_ERROR,
        payload: VENDOR_REGISTER_TEXT.ERROR_GENERIC,
      });
    }
  };

  // ───────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Registration success modal */}
      <RegistrationSuccessModal
        isOpen={state.showSuccess}
        onClose={() =>
          dispatch({ type: ActionType.SET_SHOW_SUCCESS, payload: false })
        }
      />

      {/* Full-viewport two-panel shell */}
      <div className="flex min-h-screen w-full">
        {/* ─── LEFT BRANDING PANEL (lg+) ────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col justify-between w-[42%] xl:w-[38%] shrink-0 relative overflow-hidden bg-gradient-to-br from-platform-bg-inverse to-platform-secondary">
          {/* Decorative blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-platform-primary/20 blur-3xl" />
            <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-platform-accent/15 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-platform-primary/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col h-full px-10 py-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12  ">
              <Image
                src={TS_LOGO}
                alt="logo"
                width={400}
                height={300}
                className="w-50 h-16 bg-white  rounded-full  p-2 object-contain"
              />
            </div>

            {/* Hero copy */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-platform-text-inverse text-xs font-semibold px-3 py-1.5 rounded-full mb-5 w-fit">
                <ArrowRight size={12} />
                {VENDOR_REGISTER_TEXT.PAGE_LABEL_REGISTRATION}
              </div>
              <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
                {VENDOR_REGISTER_TEXT.HERO_TITLE_START}
                <br />
                <span className="bg-gradient-to-r from-platform-accent to-platform-primary bg-clip-text text-transparent">
                  {VENDOR_REGISTER_TEXT.HERO_TITLE_HIGHLIGHT}
                </span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-10 max-w-xs">
                {VENDOR_REGISTER_TEXT.PAGE_DESC}
              </p>

              {/* Features */}
              <div className="space-y-4">
                {VENDOR_REGISTER_BRAND_FEATURES.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-base shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {f.title}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock size={11} />
                <span>{VENDOR_REGISTER_TEXT.TRUST_BADGE_SETUP}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Mail size={11} />
                <span>{VENDOR_REGISTER_TEXT.TRUST_BADGE_VERIFIED}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── RIGHT FORM PANEL ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
          {/* Top bar */}
          <header className="flex md:flex-row flex-col items-center  md:justify-center px-6 sm:px-10 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0 w-full ">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center mb-3  gap-2">
              <Image
                src={TS_LOGO}
                alt="logo"
                width={400}
                height={250}
                className="w-30 h-12 rounded-lg  object-contain"
              />
            </div>
            <div className="hidden md:block  " />

            <StepIndicator current={state.formStep} />
          </header>

          {/* Scrollable form area */}
          <div className="flex-1  overflow-y-auto transition-transform duration-500 ease-in-out ">
            <div className="min-h-full flex items-center justify-center px-6 sm:px-10 py-8">
              <div className="w-full max-w-xl xl:max-w-2xl">
                {/* Step header */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold text-platform-primary uppercase tracking-widest mb-1">
                    Step {state.formStep + 1} of{" "}
                    {VENDOR_REGISTER_FORM_STEPS.length}
                  </p>
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {STEP_META[state.formStep]?.title}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {STEP_META[state.formStep]?.desc}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-platform-primary to-platform-accent rounded-full transition-all duration-500"
                    style={{
                      width: `${((state.formStep + 1) / VENDOR_REGISTER_FORM_STEPS.length) * 100}%`,
                    }}
                  />
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if ((e.target as HTMLElement).tagName === "BUTTON")
                        return;
                      e.preventDefault();
                      // Only trigger navigation/submit if we are not typing in a text field that needs Enter (though forms rarely have textareas here)
                      if (
                        state.formStep !==
                        VENDOR_REGISTER_FORM_STEPS.length - 1
                      ) {
                        nextStep();
                      } else {
                        // Let the user explicitly click Submit for the final step to avoid accidental submissions
                      }
                    }
                  }}
                >
                  {/* ── STEP 0: Organization ── */}
                  {state.formStep === 0 && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                      {/* Company name */}
                      <div className="col-span-2">
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.COMPANY_NAME_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("company_name")}
                          className={inputCls}
                          placeholder={
                            VENDOR_REGISTER_TEXT.COMPANY_NAME_PLACEHOLDER
                          }
                        />
                        <AnimatedError error={errors.company_name?.message} />
                      </div>

                      {/* First name */}
                      <div>
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.OWNER_FIRST_NAME_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("store_owner_first_name")}
                          className={inputCls}
                          placeholder={
                            VENDOR_REGISTER_TEXT.OWNER_FIRST_NAME_PLACEHOLDER
                          }
                        />
                        <AnimatedError
                          error={errors.store_owner_first_name?.message}
                        />
                      </div>

                      {/* Last name */}
                      <div>
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.OWNER_LAST_NAME_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("store_owner_last_name")}
                          className={inputCls}
                          placeholder={
                            VENDOR_REGISTER_TEXT.OWNER_LAST_NAME_PLACEHOLDER
                          }
                        />
                        <AnimatedError
                          error={errors.store_owner_last_name?.message}
                        />
                      </div>

                      {/* Email */}
                      <div className="col-span-2">
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.EMAIL_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register("email", {
                              onBlur: (e) => checkEmail(e.target.value),
                            })}
                            type="email"
                            className={`${inputCls} pr-10`}
                            placeholder={VENDOR_REGISTER_TEXT.EMAIL_PLACEHOLDER}
                          />
                          {state.isCheckingEmail && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-platform-primary" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {VENDOR_REGISTER_TEXT.EMAIL_HINT}
                        </p>

                        <AnimatedError
                          error={
                            errors.email?.message ||
                            (state.emailError as string)
                          }
                        />
                      </div>

                      {/* Phone */}
                      <div className="col-span-2">
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.PHONE_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            {...register("country_code")}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white outline-none focus:border-platform-primary focus:ring-2 focus:ring-platform-focus-ring transition-all w-[110px] shrink-0"
                          >
                            <option value="">
                              {VENDOR_REGISTER_TEXT.PHONE_CODE_PLACEHOLDER}
                            </option>
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <input
                              {...register("phone_number", {
                                onBlur: (e) => checkPhone(e.target.value),
                              })}
                              onInput={(e) => {
                                e.currentTarget.value =
                                  e.currentTarget.value.replace(/\D/g, "");
                              }}
                              className={`${inputCls} w-full pr-10`}
                              placeholder={
                                VENDOR_REGISTER_TEXT.PHONE_PLACEHOLDER
                              }
                            />
                            {state.isCheckingPhone && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Loader2 className="w-4 h-4 animate-spin text-platform-primary" />
                              </div>
                            )}
                          </div>
                        </div>
                        <AnimatedError
                          error={
                            errors.country_code?.message ||
                            errors.phone_number?.message ||
                            (state.phoneError as string)
                          }
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.CATEGORY_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select {...register("category")} className={inputCls}>
                          <option value="">
                            {VENDOR_REGISTER_TEXT.CATEGORY_PLACEHOLDER}
                          </option>
                          {BUSINESS_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <AnimatedError error={errors.category?.message} />
                      </div>

                      {/* Company structure */}
                      <div>
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.STRUCTURE_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register("company_structure")}
                          className={inputCls}
                        >
                          <option value="">
                            {VENDOR_REGISTER_TEXT.STRUCTURE_PLACEHOLDER}
                          </option>
                          {COMPANY_STRUCTURES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <AnimatedError
                          error={errors.company_structure?.message}
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.PASSWORD_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register("password")}
                            type={state.showPassword ? "text" : "password"}
                            onPaste={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            className={`${inputCls} pr-10`}
                            placeholder={
                              VENDOR_REGISTER_TEXT.PASSWORD_PLACEHOLDER
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: ActionType.TOGGLE_SHOW_PASSWORD,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={
                              state.showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {state.showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        <AnimatedError error={errors.password?.message} />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.CONFIRM_PASSWORD_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register("confirm_password")}
                            type={
                              state.showConfirmPassword ? "text" : "password"
                            }
                            onPaste={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            className={`${inputCls} pr-10`}
                            placeholder={
                              VENDOR_REGISTER_TEXT.CONFIRM_PASSWORD_PLACEHOLDER
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: ActionType.TOGGLE_SHOW_CONFIRM_PASSWORD,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={
                              state.showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {state.showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        <AnimatedError
                          error={errors.confirm_password?.message}
                        />
                      </div>

                      {/* Plan Selection Accordion */}
                      {/* <div className="col-span-2">
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.PLAN_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2 space-y-3">
                          {state.isLoadingPlans ? (
                            <div className="flex justify-center p-6 border rounded-xl border-dashed border-gray-200">
                              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                          ) : (
                            <Accordion
                              type="single"
                              collapsible
                              value={state.expandedPlanId || ""}
                              onValueChange={(val) => {
                                dispatch({
                                  type: ActionType.SET_EXPANDED_PLAN_ID,
                                  payload: val || null,
                                });
                                if (val) {
                                  setValue("plan_id", val);
                                  clearErrors("plan_id");
                                }
                              }}
                              className="w-full space -y-3"
                            >
                              {state.plans
                                .filter(
                                  (p) =>
                                    p.trial_days &&
                                    p.trial_days > 0 &&
                                    p.price_monthly !== "0.00",
                                )
                                .map((p) => {
                                  const isSelected = watch("plan_id") === p.id;

                                  return (
                                    <AccordionItem
                                      key={p.id}
                                      value={p.id}
                                      className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                                        isSelected
                                          ? "border-platform-primary ring-1 ring-platform-primary bg-indigo-50/10"
                                          : "border-gray-200 bg-white hover:border-indigo-300"
                                      }`}
                                    >
                                      <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:border-b data-[state=open]:border-indigo-100/50">
                                        <div className="flex flex-1 items-center justify-between mr-4 text-left">
                                          <div>
                                            <h4 className="font-semibold text-gray-900">
                                              {p.display_name}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 font-medium">
                                              {p.trial_days && p.trial_days > 0
                                                ? `${p.trial_days} days free trial`
                                                : "No free trial"}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <span className="font-bold text-gray-900 text-sm">
                                              {
                                                VENDOR_REGISTER_TEXT.CURRENCY_SYMBOL
                                              }
                                              {p.price_monthly}
                                            </span>
                                            <span className="text-xs text-gray-500 font-normal">
                                              /mo
                                            </span>
                                          </div>
                                        </div>
                                        <input
                                          type="hidden"
                                          value={p.id}
                                          {...register("plan_id")}
                                        />
                                      </AccordionTrigger>
                                      <AccordionContent className="px-4 pt-4 pb-4">
                                        <p className="text-[13px] text-gray-600">
                                          {p.description}
                                        </p>
                                        {p.capabilities &&
                                          Object.keys(p.capabilities).length >
                                            0 && (
                                            <ul className="mt-3 space-y-2">
                                              {Object.entries(p.capabilities)
                                                .slice(0, 4)
                                                .map(([key, val]) => (
                                                  <li
                                                    key={key}
                                                    className="flex items-center gap-2 text-xs font-medium text-gray-600"
                                                  >
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                    <span className="capitalize">
                                                      {key.replace(/_/g, " ")}:{" "}
                                                      {String(val)}
                                                    </span>
                                                  </li>
                                                ))}
                                            </ul>
                                          )}
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}
                            </Accordion>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2">
                          {VENDOR_REGISTER_TEXT.PLAN_HINT}
                        </p>
                        <AnimatedError error={errors.plan_id?.message} />
                      </div> */}
                    </div>
                  )}

                  {/* ── STEP 1: Domain ── */}
                  {state.formStep === 1 && (
                    <div className="space-y-4">
                      {/* Domain type cards */}
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        role="radiogroup"
                      >
                        {/* Subdomain */}
                        <label
                          className={`relative flex flex-col cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                            domainType === "subdomain"
                              ? "border-platform-primary bg-platform-bg-muted shadow-[0_0_0_3px_var(--platform-focus-ring)]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="subdomain"
                            className="sr-only"
                            checked={domainType === "subdomain"}
                            onChange={() => {
                              if (domainType !== "subdomain") {
                                dispatch({
                                  type: ActionType.SET_CUSTOM_CACHE,
                                  payload: companyDomain,
                                });
                                setValue("domain_type", "subdomain");
                                setValue("company_domain", state.slugCache);
                                state.slugCache
                                  ? trigger("company_domain")
                                  : clearErrors("company_domain");
                              }
                            }}
                          />
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-lg transition-colors ${
                                  domainType === "subdomain"
                                    ? "bg-platform-primary text-white"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                <Globe2 size={15} strokeWidth={2.5} />
                              </div>
                              <span
                                className={`font-semibold text-sm ${
                                  domainType === "subdomain"
                                    ? "text-platform-text-title"
                                    : "text-gray-800"
                                }`}
                              >
                                {VENDOR_REGISTER_TEXT.DOMAIN_SUBDOMAIN_LABEL}
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                domainType === "subdomain"
                                  ? "border-platform-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  domainType === "subdomain"
                                    ? "bg-platform-primary"
                                    : "bg-transparent"
                                }`}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {VENDOR_REGISTER_TEXT.DOMAIN_SUBDOMAIN_DESC}
                            <strong className="text-gray-700">
                              name.{PLATFORM_BASE_DOMAIN}
                            </strong>
                          </p>
                        </label>

                        {/* Custom domain */}
                        <label
                          className={`relative flex flex-col cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                            domainType === "custom"
                              ? "border-emerald-600 bg-emerald-50/40 shadow-[0_0_0_3px_rgba(5,150,105,0.08)]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="custom"
                            className="sr-only"
                            checked={domainType === "custom"}
                            onChange={() => {
                              if (domainType !== "custom") {
                                dispatch({
                                  type: ActionType.SET_SLUG_CACHE,
                                  payload: companyDomain,
                                });
                                setValue("domain_type", "custom");
                                setValue("company_domain", state.customCache);
                                state.customCache
                                  ? trigger("company_domain")
                                  : clearErrors("company_domain");
                              }
                            }}
                          />
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-lg transition-colors ${
                                  domainType === "custom"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                <Link2 size={15} strokeWidth={2.5} />
                              </div>
                              <span
                                className={`font-semibold text-sm ${
                                  domainType === "custom"
                                    ? "text-emerald-900"
                                    : "text-gray-800"
                                }`}
                              >
                                {VENDOR_REGISTER_TEXT.DOMAIN_CUSTOM_LABEL}
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                domainType === "custom"
                                  ? "border-emerald-600"
                                  : "border-gray-300"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  domainType === "custom"
                                    ? "bg-emerald-600"
                                    : "bg-transparent"
                                }`}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {VENDOR_REGISTER_TEXT.DOMAIN_CUSTOM_DESC}
                            <strong className="text-gray-700">
                              {VENDOR_REGISTER_TEXT.DOMAIN_CUSTOM_EXAMPLE}
                            </strong>
                            )
                          </p>
                        </label>
                      </div>

                      {/* Domain input */}
                      <div>
                        <label className={labelCls}>
                          {domainType === "subdomain"
                            ? VENDOR_REGISTER_TEXT.DOMAIN_INPUT_SLUG
                            : VENDOR_REGISTER_TEXT.DOMAIN_INPUT_FULL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        {domainType === "subdomain" ? (
                          <div className="flex relative rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden transition-all focus-within:border-platform-primary focus-within:ring-4 focus-within:ring-platform-focus-ring bg-white">
                            <div className="flex-1 relative flex items-center">
                              <input
                                {...register("company_domain")}
                                className="w-full px-4 py-2.5 text-sm font-mono text-gray-800 placeholder:text-gray-400 outline-none bg-transparent pr-10"
                                placeholder={
                                  VENDOR_REGISTER_TEXT.DOMAIN_PLACEHOLDER
                                }
                                aria-describedby="subdomain-rules"
                              />
                              {!errors.company_domain && companyDomain && (
                                <div className="absolute right-3 flex items-center pointer-events-none">
                                  <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="border-l-2 border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm text-gray-500 font-medium flex items-center whitespace-nowrap select-none">
                              .{PLATFORM_BASE_DOMAIN}
                            </div>
                          </div>
                        ) : (
                          <div className="relative rounded-xl shadow-sm">
                            <input
                              {...register("company_domain", {
                                onBlur: (e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const stripped = val
                                      .replace(/^https?:\/\//i, "")
                                      .replace(/^www\./i, "")
                                      .replace(/\/$/, "");
                                    setValue("company_domain", stripped);
                                    trigger("company_domain");
                                  }
                                },
                              })}
                              className={`${inputCls} py-2.5 font-mono pr-10`}
                              placeholder={
                                VENDOR_REGISTER_TEXT.DOMAIN_CUSTOM_PLACEHOLDER
                              }
                              aria-describedby="custom-domain-rules"
                            />
                            {!errors.company_domain && companyDomain && (
                              <div className="absolute right-3 inset-y-0 flex items-center z-20">
                                <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                              </div>
                            )}
                          </div>
                        )}
                        <AnimatePresence>
                          {errors.company_domain && (
                            <motion.p
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                                marginTop: 4,
                              }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="text-[11px] text-red-500 flex items-center gap-1 overflow-hidden"
                            >
                              {errors.company_domain.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Live preview pill */}
                      <AnimatePresence>
                        {!errors.company_domain &&
                          domainType === "subdomain" &&
                          (companyDomain?.length || 0) >= 3 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-platform-bg-muted border border-platform-border-muted rounded-xl px-4 py-2.5 text-sm text-platform-text-body">
                                🌐 {VENDOR_REGISTER_TEXT.STORE_URL_LABEL}{" "}
                                <strong>
                                  {companyDomain}.{PLATFORM_BASE_DOMAIN}
                                </strong>
                              </div>
                            </motion.div>
                          )}
                        {!errors.company_domain &&
                          domainType === "custom" &&
                          companyDomain && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                <p className="text-sm text-emerald-700">
                                  🔗 <strong>{companyDomain}</strong>
                                </p>
                                <p className="text-xs text-emerald-500 mt-0.5">
                                  {
                                    VENDOR_REGISTER_TEXT.DOMAIN_PREVIEW_CUSTOM_HINT
                                  }
                                </p>
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>

                      {/* Validation rules */}
                      {domainType === "subdomain" ? (
                        <ul
                          id="subdomain-rules"
                          className="grid grid-cols-1 sm:grid-cols-3 gap-1.5"
                        >
                          {SUBDOMAIN_RULES.map((rule) => {
                            const val = watch("company_domain") || "";
                            const passed = val.length > 0 && rule.isValid(val);
                            return (
                              <li
                                key={rule.text}
                                className={`flex items-center gap-1.5 text-xs ${
                                  passed ? "text-emerald-600" : "text-gray-400"
                                }`}
                              >
                                {passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 ml-0.5" />
                                )}
                                {rule.text}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <ul
                          id="custom-domain-rules"
                          className="grid grid-cols-1 sm:grid-cols-3 gap-1.5"
                        >
                          {CUSTOM_DOMAIN_RULES.map((rule) => {
                            const val = watch("company_domain") || "";
                            const passed = val.length > 0 && rule.isValid(val);
                            return (
                              <li
                                key={rule.text}
                                className={`flex items-center gap-1.5 text-xs ${
                                  passed ? "text-emerald-600" : "text-gray-400"
                                }`}
                              >
                                {passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 ml-0.5" />
                                )}
                                {rule.text}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* ── STEP 2: Compliance ── */}
                  {state.formStep === 2 && (
                    <div className="space-y-4  ">
                      {/* Business registration toggle */}
                      <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl border border-gray-200 bg-white hover:border-platform-primary transition-all group">
                        <div>
                          <span className="block text-sm font-semibold text-gray-900 group-hover:text-platform-text-body transition-colors">
                            {VENDOR_REGISTER_TEXT.REGISTER_BUSINESS_ENTITY}
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {VENDOR_REGISTER_TEXT.REGISTER_BUSINESS_DESC}
                          </span>
                        </div>
                        <div className="relative inline-flex items-center ml-4 shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={state.isRegisteredBusiness}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              dispatch({
                                type: ActionType.SET_REGISTERED_BUSINESS,
                                payload: checked,
                              });
                              dispatch({
                                type: ActionType.RESET_ON_COUNTRY_CHANGE,
                                payload: "",
                              });
                            }}
                          />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-platform-focus-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-platform-primary shadow-inner" />
                        </div>
                      </label>

                      {/* Country picker */}
                      <div>
                        <label className={labelCls}>
                          {VENDOR_REGISTER_TEXT.COUNTRY_LABEL}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          className={inputCls}
                          value={state.countryCode}
                          onChange={(e) => {
                            if (e.target.value) {
                              dispatch({
                                type: ActionType.RESET_ON_COUNTRY_CHANGE,
                                payload: e.target.value,
                              });
                            }
                          }}
                        >
                          <option value="" disabled hidden>
                            {VENDOR_REGISTER_TEXT.COUNTRY_PLACEHOLDER}
                          </option>
                          {sourceCountries.map((c) => (
                            <option key={c.country_code} value={c.country_code}>
                              {c.country_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dynamic compliance fields */}
                      <FinancialCompliance
                        country_code={state.countryCode}
                        fields={currentCountryFields}
                        values={state.complianceValues}
                        onChange={handleComplianceChange}
                        externalErrors={state.complianceErrors}
                      />

                      {/* Optional doc uploads */}
                      {state.countryCode && currentCountryFields.length > 0 && (
                        <DocUploadInput
                          setFileMap={(files) =>
                            dispatch({
                              type: ActionType.SET_FINANCIAL_FILE_MAP,
                              payload:
                                typeof files === "function"
                                  ? files(state.financialFileMap)
                                  : files,
                            })
                          }
                          fileMap={state.financialFileMap}
                          typeList={currentCountryFields.map((f) => ({
                            ...f,
                            required: false,
                          }))}
                          title={VENDOR_REGISTER_TEXT.FINANCIAL_DOCS_TITLE}
                          missingDocs={state.missingFinancialDocs}
                        />
                      )}
                    </div>
                  )}

                  {/* Global error */}
                  {state.globalError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                      {state.globalError}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                    {state.formStep > 0 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white rounded-xl px-5 py-2.5 transition-all"
                      >
                        <ChevronLeft size={15} />
                        {VENDOR_REGISTER_TEXT.BTN_PREVIOUS}
                      </button>
                    ) : (
                      <Link
                        href="/auth/vendorLogin"
                        className="text-xs text-gray-400 hover:text-platform-primary underline underline-offset-2 transition-colors"
                      >
                        {VENDOR_REGISTER_TEXT.LINK_LOGIN}
                      </Link>
                    )}

                    {state.formStep < VENDOR_REGISTER_FORM_STEPS.length - 1 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={isNextDisabled()}
                        className="flex items-center gap-2 bg-platform-primary hover:bg-platform-cta-hover disabled:bg-platform-cta-disabled-bg disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-platform-focus-ring"
                      >
                        {VENDOR_REGISTER_TEXT.BTN_CONTINUE}
                        <ChevronRight size={15} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        onClick={() =>
                          dispatch({
                            type: ActionType.SET_IS_FINAL_SUBMIT_INTENT,
                            payload: true,
                          })
                        }
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-200"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            {VENDOR_REGISTER_TEXT.BTN_SUBMITTING}
                          </>
                        ) : (
                          <>
                            {VENDOR_REGISTER_TEXT.BTN_SUBMIT}
                            <CheckCircle2 size={15} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
