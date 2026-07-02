"use client";

import { useReducer, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { CUSTOMER_REGISTRATION_FIELDS } from "@/constants/dynamicFields";
import { CustomerRegister } from "@/utils/authApiClient";
import {
  customerRegisterSchema,
  CustomerRegisterSchemaType,
} from "@/utils/validation";
import { getCompanyDomain } from "@/lib/get-domain";
import { BASE_API_URL, AUTH_TEXT, ENV_DEVELOPMENT } from "@/constants";

export enum ActionType {
  SET_SERVER_ERROR = 'SET_SERVER_ERROR',
  SET_IS_SUBMITTING = 'SET_IS_SUBMITTING',
  SET_IS_GOOGLE_LOADING = 'SET_IS_GOOGLE_LOADING',
}

type Action =
  | { type: ActionType.SET_SERVER_ERROR; payload: string | null }
  | { type: ActionType.SET_IS_SUBMITTING; payload: boolean }
  | { type: ActionType.SET_IS_GOOGLE_LOADING; payload: boolean };

interface State {
  serverError: string | null;
  isSubmitting: boolean;
  isGoogleLoading: boolean;
}

const initialState: State = {
  serverError: null,
  isSubmitting: false,
  isGoogleLoading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_SERVER_ERROR: return { ...state, serverError: action.payload };
    case ActionType.SET_IS_SUBMITTING: return { ...state, isSubmitting: action.payload };
    case ActionType.SET_IS_GOOGLE_LOADING: return { ...state, isGoogleLoading: action.payload };
    default: return state;
  }
}

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerRegisterSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      phone_number: "",
      terms_accepted: true,
    },
  });

  // Debug errors in development
  useEffect(() => {
    if (
      process.env.NODE_ENV === ENV_DEVELOPMENT &&
      Object.keys(errors).length > 0
    ) {
    }
  }, [errors]);

  const onSubmit = async (data: CustomerRegisterSchemaType) => {
    dispatch({ type: ActionType.SET_IS_SUBMITTING, payload: true });
    dispatch({ type: ActionType.SET_SERVER_ERROR, payload: null });

    try {
      const companyDomain = await getCompanyDomain();
      const response = await CustomerRegister(data, companyDomain);

      if (response?.status === 201) {
        router.push("/auth/customerLogin?registered=true");
      } else {
        dispatch({ type: ActionType.SET_SERVER_ERROR, payload: response?.message || AUTH_TEXT.REGISTER.FAIL_GENERIC });
      }
    } catch (err: any) {
      dispatch({ type: ActionType.SET_SERVER_ERROR, payload: err.message || AUTH_TEXT.REGISTER.FAIL_SERVER });
    } finally {
      dispatch({ type: ActionType.SET_IS_SUBMITTING, payload: false });
    }
  };

  const handleGoogleRegister = async () => {
    dispatch({ type: ActionType.SET_IS_GOOGLE_LOADING, payload: true });
    dispatch({ type: ActionType.SET_SERVER_ERROR, payload: null });

    try {
      const domain = await getCompanyDomain();
      if (domain == null) {
        throw new Error(AUTH_TEXT.REGISTER.DOMAIN_NOT_FOUND);
      }
      window.location.href = `${BASE_API_URL}/v1/auth/google?domain=${encodeURIComponent(domain)}`;
    } catch (error) {
      dispatch({ type: ActionType.SET_SERVER_ERROR, payload: AUTH_TEXT.REGISTER.GOOGLE_INIT_FAIL });
      dispatch({ type: ActionType.SET_IS_GOOGLE_LOADING, payload: false });
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen w-full p-4  ">
      <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full">
        {/* Form Section */}
        <div className="flex flex-col px-6 py-8 lg:px-12 lg:py-10 justify-center flex-1">
          <div className="mb-8">
            <h1 className="text-theme-h3 font-bold text-gray-800 mb-2">
              {AUTH_TEXT.REGISTER.TITLE}
            </h1>
            <p className="text-theme-body-sm text-slate-600">
              {AUTH_TEXT.REGISTER.SUBTITLE}
            </p>
          </div>

          {/* Server Error Alert */}
          {state.serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700 text-theme-body-sm font-medium">{state.serverError}</p>
            </div>
          )}

          {/* Google OAuth Button - Primary Position */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={state.isGoogleLoading || state.isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>
              {state.isGoogleLoading
                ? AUTH_TEXT.REGISTER.GOOGLE_LOADING
                : AUTH_TEXT.REGISTER.GOOGLE_BTN}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-theme-body-sm font-medium">
              {AUTH_TEXT.REGISTER.OR_EMAIL}
            </span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>

          {/* Email Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CUSTOMER_REGISTRATION_FIELDS.map((field) => (
                <div
                  key={field.id}
                  className={`flex flex-col gap-1.5 ${
                    field.id === "email" || field.id.includes("password")
                      ? "md:col-span-2"
                      : ""
                  }`}
                >
                  <label
                    htmlFor={field.id}
                    className="text-theme-caption font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    {...register(field.id as keyof CustomerRegisterSchemaType)}
                    type={field.type}
                    placeholder={field.placeholder}
                    className={`border-2 rounded-lg px-4 py-2.5 text-theme-body-sm focus:outline-none focus:ring-2 transition-all ${
                      errors[field.id as keyof CustomerRegisterSchemaType]
                        ? "border-red-400 focus:ring-red-200 bg-red-50"
                        : "border-slate-300 focus:ring-blue-200 focus:border-blue-400"
                    }`}
                    disabled={state.isSubmitting || state.isGoogleLoading}
                  />
                  {errors[field.id as keyof CustomerRegisterSchemaType] && (
                    <p className="text-red-600 text-theme-caption font-medium flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {
                        errors[field.id as keyof CustomerRegisterSchemaType]
                          ?.message
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={state.isSubmitting || state.isGoogleLoading}
              className="w-full font-bold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:from-blue-400 disabled:to-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {state.isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {AUTH_TEXT.REGISTER.BTN_LOADING}
                </>
              ) : (
                AUTH_TEXT.REGISTER.BTN_DEFAULT
              )}
            </button>

            <p className="text-center text-theme-body-sm text-slate-600 pt-4">
              {AUTH_TEXT.REGISTER.ALREADY_HAVE}
              <Link
                href="/auth/customerLogin"
                className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors"
              >
                {AUTH_TEXT.REGISTER.LOGIN_LINK}
              </Link>
            </p>
          </form>
        </div>

        {/* Image Section */}
        <div className="hidden relative flex-1 lg:flex flex-col justify-center items-start bg-gradient-to-br from-blue-600 to-blue-800 ">
          {" "}
          <div className=" flex flex-col justify-center items-center text-white p-12  ">
            <h2 className="text-theme-h2 font-bold mb-4 text-center">
              {AUTH_TEXT.REGISTER.COMMUNITY_TITLE}
            </h2>
            <p className="text-theme-h6 text-center text-blue-100">
              {AUTH_TEXT.REGISTER.COMMUNITY_SUB}
            </p>
          </div>
          {/* <div className="absolute inset-0 bg-black/20"></div> */}
          <Image
            src="https://imgs.search.brave.com/KuCYM754oU5_H4hh07t-Qc6WZH3BUTuLJEFzYxh8Y2c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzUyLzg1/LzEyLzUyODUxMmU2/MDA1NjY1OGVmN2Zi/MGEwZWM5MDk0YmI0/LmpwZw"
            width={800}
            height={800}
            alt="Join our community"
            className=" object-contain opacity-90 shadow-2xl rounded-full "
            priority
          />
        </div>
      </div>
    </main>
  );
}
