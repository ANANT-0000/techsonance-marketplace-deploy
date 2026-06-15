"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFailure,
  loginStart,
  loginSuccess,
  closeLoginModal,
} from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { loginSchema } from "@/utils/validation";
import { CustomerLogin } from "@/utils/authApiClient";
import { BASE_API_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";
import { AccountReactivation } from "@/components/customer/AccountReactivationModel";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface LoginFormData {
  email: string;
  password: string;
}

interface CustomerLoginFormProps {
  isModal?: boolean;
  onSuccess?: () => void;
}

export default function CustomerLoginForm({ isModal = false, onSuccess }: CustomerLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const { loginRedirectUrl } = useAppSelector((state: RootState) => state.auth);
  
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isReactivationOpen, setIsReactivationOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const userEmail = watch("email");

  useEffect(() => {
    if (!isModal && searchParams.get("registered") === "true") {
      setSuccessMessage("Account created successfully! Please log in.");
    }
  }, [searchParams, isModal]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    dispatch(loginStart());

    try {
      const response = await CustomerLogin(data);
      if (response.status === 200) {
        dispatch(loginSuccess(response?.data));
        toast.success("Signed in successfully!");
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (isModal) {
          if (loginRedirectUrl) {
            router.push(loginRedirectUrl);
          }
        } else {
          const redirect = searchParams.get("redirect");
          if (redirect) {
            router.push(redirect);
          } else {
            router.push("/");
          }
        }
      } else if (response.status === 423) {
        dispatch(loginFailure(response?.message));
        setServerError(response?.message);
        setIsReactivationOpen(true);
      } else {
        const message =
          response?.message || "Login failed. Please check your credentials.";
        dispatch(loginFailure(message));
        setServerError(message);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      dispatch(loginFailure(message));
      setServerError(message);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const domain = await getCompanyDomain();
      if (domain == null) {
        throw new Error("Company domain not found");
      }
      
      const redirect = isModal ? loginRedirectUrl : searchParams.get("redirect");
      if (redirect) {
        sessionStorage.setItem("oauth_redirect", redirect);
      }
      
      window.location.href = `${BASE_API_URL}/v1/auth/google?domain=${encodeURIComponent(domain)}`;
    } catch (error) {
      setServerError("Failed to initialize Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleReactivationSuccess = () => {
    setIsReactivationOpen(false);
    toast.success("Redirecting to dashboard...");
    if (onSuccess) {
      onSuccess();
    }
    router.push("/customer");
  };

  const handleForgotPasswordClick = () => {
    if (isModal) {
      dispatch(closeLoginModal());
    }
    router.push("/auth/forgotPassword");
  };

  const handleCreateAccountClick = () => {
    if (isModal) {
      dispatch(closeLoginModal());
    }
    router.push("/auth/customerRegister");
  };

  return (
    <div className="w-full">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
          },
        }}
      />
      
      <div className="mb-6">
        <h2 className="text-theme-h4 font-bold text-gray-800 mb-1.5">
          Welcome Back
        </h2>
        <p className="text-theme-body-sm text-slate-600">
          Sign in to access your account
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5">
          <svg
            className="w-4.5 h-4.5 text-green-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-green-700 text-theme-body-sm font-medium">
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {serverError && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
          <svg
            className="w-4.5 h-4.5 text-red-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-700 text-theme-body-sm font-medium">
            {serverError}
          </p>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isSubmitting}
        className={`${isGoogleLoading || isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 border-slate-300 hover:border-slate-400"} w-full flex items-center justify-center gap-3 border-2 text-slate-700 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-xs mb-5 cursor-pointer text-theme-body-sm`}
      >
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
          {isGoogleLoading
            ? "Connecting to Google..."
            : "Continue with Google"}
        </span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-3.5 text-slate-400 text-theme-caption font-medium uppercase tracking-wider">
          or sign in with email
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-theme-caption font-semibold text-gray-700 uppercase tracking-wide"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className={`border-2 rounded-lg py-2 px-3 text-theme-body-sm focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? "border-red-400 focus:ring-red-100 bg-red-50"
                : "border-slate-200 focus:ring-theme-primary/20 focus:border-theme-primary"
            }`}
            disabled={isSubmitting || isGoogleLoading}
          />
          {errors.email && (
            <p className="text-red-600 text-theme-caption font-medium flex items-center gap-1 mt-0.5">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="text-theme-caption font-semibold text-gray-700 uppercase tracking-wide"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-theme-primary hover:text-theme-secondary hover:underline text-theme-caption font-semibold transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`w-full border-2 rounded-lg pl-3 pr-9 py-2 text-theme-body-sm focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? "border-red-400 focus:ring-red-100 bg-red-50"
                  : "border-slate-200 focus:ring-theme-primary/20 focus:border-theme-primary"
              }`}
              disabled={isSubmitting || isGoogleLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-theme-primary transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-theme-caption font-medium flex items-center gap-1 mt-0.5">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="w-full font-bold py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none bg-theme-primary text-theme-primary-foreground hover:bg-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-5 cursor-pointer text-theme-body-sm"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4.5 w-4.5 text-current"
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
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <p className="text-center text-theme-body-sm text-slate-600 pt-3">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={handleCreateAccountClick}
            className="text-theme-primary font-bold hover:text-theme-secondary hover:underline transition-colors cursor-pointer"
          >
            Create account
          </button>
        </p>
      </form>

      <AccountReactivation
        isOpen={isReactivationOpen}
        onClose={() => setIsReactivationOpen(false)}
        onSuccess={handleReactivationSuccess}
        emailMasked={userEmail}
      />
    </div>
  );
}
