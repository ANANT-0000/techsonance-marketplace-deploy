"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useReducer, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AxiosAPI from "@/lib/axios";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  X,
  Clock,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

import { loginSchema } from "@/utils/validation";
import { vendorLogin } from "@/utils/authApiClient";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  loginEnd,
  loginFailure,
  loginStart,
  loginSuccess,
} from "@/lib/features/auth/authSlice";
import { authToken } from "@/utils/authToken";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { TS_LOGO } from "@/constants/common";
import {
  AUTH_TEXT,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VALUE,
  UserRole,
} from "@/constants";
import { VENDOR_LOGIN_TEXT } from "@/constants/authText";
import { SetTemporaryVendorPassword } from "@/components/vendor/SetTemporaryVendorPassword";

// ==========================================
// 1. CONSTANTS & ENUMS
// ==========================================

export enum UiState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
  PROMPT_CHANGE_PASSWORD = "prompt_change_password",
  EXPIRED_SUBSCRIPTION = "expired_subscription",
}

export enum StepStatus {
  PENDING = "pending",
  ACTIVE = "active",
  DONE = "done",
  FAILED = "failed",
}

export enum ActionType {
  SET_UI_STATE = "SET_UI_STATE",
  SET_STEP = "SET_STEP",
  SET_STEPS = "SET_STEPS",
  TOGGLE_SHOW_PASS = "TOGGLE_SHOW_PASS",
  SET_REDIRECT_PROGRESS = "SET_REDIRECT_PROGRESS",
  SET_COOKIES_BLOCKED = "SET_COOKIES_BLOCKED",
  RESET_FORM = "RESET_FORM",
  SET_IS_MOUNTED = "SET_IS_MOUNTED",
  SET_RESEND_STATUS = "SET_RESEND_STATUS",
  SET_IS_RESENDING = "SET_IS_RESENDING",
  SET_RESEND_COOLDOWN = "SET_RESEND_COOLDOWN",
  SET_SHOW_RESEND_LINK = "SET_SHOW_RESEND_LINK",
}

const REDIRECT_PATH = "/vendor";
// Registration URL is resolved from the platform base URL env var so it works
// in every environment (local, staging, production) without code changes.
// NEXT_PUBLIC_PLATFORM_REGISTRATION_URL should be the base origin of the
// marketplace platform, e.g. http://localhost:3000 or https://marketplace.techsonance.co.in
const REGISTER_URL = `${
  process.env.NEXT_PUBLIC_PLATFORM_REGISTRATION_URL ??
  (typeof window !== "undefined" ? window.location.origin : "")
}/auth/vendorRegister`;
const CHANGE_PASSWORD_PATH = "/vendor/settings/change-password";

const ERROR_MSG_LOGIN_FAILED = "Login failed";
const ERROR_MSG_INVALID_CREDS = "Invalid credentials. Please try again.";

const LOGIN_STEPS = [
  "Verifying business credentials",
  "Checking store permissions",
  "Loading your dashboard",
];

const TIMING = {
  REDIRECT_TOTAL_MS: 3000,
  REDIRECT_TICK_MS: 50,
  STEP_1_DELAY_MS: 650,
  STEP_2_DELAY_MS: 650,
  STEP_3_DELAY_MS: 350,
};

const STEP_STYLES: Record<StepStatus, string> = {
  [StepStatus.PENDING]: "bg-gray-50 border-gray-100 text-gray-400",
  [StepStatus.ACTIVE]: "bg-blue-50 border-blue-100 text-blue-700",
  [StepStatus.DONE]: "bg-green-50 border-green-100 text-green-700",
  [StepStatus.FAILED]: "bg-red-50 border-red-100 text-red-600",
};

// ==========================================
// 2. STATE MANAGEMENT (useReducer)
// ==========================================

interface LoginFormData {
  email: string;
  password: string;
}

interface State {
  uiState: UiState;
  steps: StepStatus[];
  showPass: boolean;
  redirectPct: number;
  countdown: number;
  cookiesBlocked: boolean;
  isMounted: boolean;
  resendStatus: { type: "success" | "error"; message: string } | null;
  isResending: boolean;
  resendCooldown: number;
  showResendLink: boolean;
}

export type Action =
  | { type: ActionType.SET_UI_STATE; payload: UiState }
  | {
      type: ActionType.SET_STEP;
      payload: { index: number; status: StepStatus };
    }
  | { type: ActionType.SET_STEPS; payload: StepStatus[] }
  | { type: ActionType.TOGGLE_SHOW_PASS }
  | {
      type: ActionType.SET_REDIRECT_PROGRESS;
      payload: { pct: number; countdown: number };
    }
  | { type: ActionType.SET_COOKIES_BLOCKED; payload: boolean }
  | { type: ActionType.RESET_FORM }
  | { type: ActionType.SET_IS_MOUNTED; payload: boolean }
  | { type: ActionType.SET_RESEND_STATUS; payload: { type: "success" | "error"; message: string } | null }
  | { type: ActionType.SET_IS_RESENDING; payload: boolean }
  | { type: ActionType.SET_RESEND_COOLDOWN; payload: number }
  | { type: ActionType.SET_SHOW_RESEND_LINK; payload: boolean };

const initialState: State = {
  uiState: UiState.IDLE,
  steps: [StepStatus.PENDING, StepStatus.PENDING, StepStatus.PENDING],
  showPass: false,
  redirectPct: 100,
  countdown: 3,
  cookiesBlocked: false,
  isMounted: false,
  resendStatus: null,
  isResending: false,
  resendCooldown: 0,
  showResendLink: false,
};

function loginReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_UI_STATE:
      return { ...state, uiState: action.payload };
    case ActionType.SET_STEP:
      return {
        ...state,
        steps: state.steps.map((v, idx) =>
          idx === action.payload.index ? action.payload.status : v,
        ),
      };
    case ActionType.SET_STEPS:
      return { ...state, steps: action.payload };
    case ActionType.TOGGLE_SHOW_PASS:
      return { ...state, showPass: !state.showPass };
    case ActionType.SET_REDIRECT_PROGRESS:
      return {
        ...state,
        redirectPct: action.payload.pct,
        countdown: action.payload.countdown,
      };
    case ActionType.SET_COOKIES_BLOCKED:
      return { ...state, cookiesBlocked: action.payload };
    case ActionType.RESET_FORM:
      return { ...initialState, cookiesBlocked: state.cookiesBlocked };
    case ActionType.SET_IS_MOUNTED:
      return { ...state, isMounted: action.payload };
    case ActionType.SET_RESEND_STATUS:
      return { ...state, resendStatus: action.payload };
    case ActionType.SET_IS_RESENDING:
      return { ...state, isResending: action.payload };
    case ActionType.SET_RESEND_COOLDOWN:
      return { ...state, resendCooldown: action.payload };
    case ActionType.SET_SHOW_RESEND_LINK:
      return { ...state, showResendLink: action.payload };
    default:
      return state;
  }
}


const StepIcon = ({ status }: { status: StepStatus }) => {
  if (status === StepStatus.ACTIVE)
    return (
      <span className="block w-3.5 h-3.5 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
    );
  if (status === StepStatus.DONE)
    return <Check size={13} className="text-green-600" />;
  if (status === StepStatus.FAILED)
    return <X size={13} className="text-red-500" />;
  return <Clock size={13} className="text-gray-300" />;
};

export default function VendorLoginPage() {
  const router = useRouter();
  const { error, user, isAuthenticated, role } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useAppDispatch();

  const [state, dispatchState] = useReducer(loginReducer, initialState);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (state.resendCooldown > 0) {
      const timer = setTimeout(() => {
        dispatchState({ type: ActionType.SET_RESEND_COOLDOWN, payload: state.resendCooldown - 1 });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendCooldown]);

  const handleResendTempPassword = async () => {
    const email = watch("email");
    if (!email) {
      dispatchState({ type: ActionType.SET_RESEND_STATUS, payload: {
        type: "error",
        message:
          VENDOR_LOGIN_TEXT.ERR_EMAIL_REQUIRED_FOR_RESEND ||
          "Please enter your business email address first.",
      } });
      return;
    }

    dispatchState({ type: ActionType.SET_IS_RESENDING, payload: true });
    dispatchState({ type: ActionType.SET_RESEND_STATUS, payload: null });
    try {
      const response = await AxiosAPI.post(
        "/v1/auth/vendor/resend-temp-password",
        { email },
      );
      if (response.status === 200) {
        dispatchState({ type: ActionType.SET_RESEND_STATUS, payload: {
          type: "success",
          message:
            VENDOR_LOGIN_TEXT.MSG_TEMP_PASSWORD_RESENT ||
            "A new generated password has been sent to your email.",
        } });
        dispatchState({ type: ActionType.SET_RESEND_COOLDOWN, payload: 60 });
      } else {
        dispatchState({ type: ActionType.SET_RESEND_STATUS, payload: {
          type: "error",
          message:
            response.data?.message || "Failed to resend generated password.",
        } });
      }
    } catch (err: any) {
      dispatchState({ type: ActionType.SET_RESEND_STATUS, payload: {
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to resend generated password. Please try again.",
      } });
    } finally {
      dispatchState({ type: ActionType.SET_IS_RESENDING, payload: false });
    }
  };

  const {
    reset,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const emailValue = watch("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailRegex.test(emailValue)) {
      dispatchState({ type: ActionType.SET_SHOW_RESEND_LINK, payload: false });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await (
          await AxiosAPI.post("/v1/auth/vendor/check-generated-password", {
            email: emailValue,
          })
        ).data;
        if (response.status === 200 && response.data?.hasGeneratedPassword) {
          dispatchState({ type: ActionType.SET_SHOW_RESEND_LINK, payload: true });
        } else {
          dispatchState({ type: ActionType.SET_SHOW_RESEND_LINK, payload: false });
        }
      } catch {
        dispatchState({ type: ActionType.SET_SHOW_RESEND_LINK, payload: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watch("email")]);

  useEffect(() => {
    if (state.uiState !== UiState.IDLE) return;

    dispatchState({
      type: ActionType.SET_COOKIES_BLOCKED,
      payload: !navigator.cookieEnabled,
    });
    const initialToken = authToken();
    if (initialToken && isAuthenticated && role === UserRole.VENDOR) {
      if (
        user &&
        "password_change_required" in user &&
        (user as any).password_change_required
      ) {
        dispatchState({
          type: ActionType.SET_UI_STATE,
          payload: UiState.PROMPT_CHANGE_PASSWORD,
        });
      } else {
        router.replace(REDIRECT_PATH);
      }
    }
    dispatchState({ type: ActionType.SET_IS_MOUNTED, payload: true });
  }, [router, isAuthenticated, role, state.uiState, user]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
      }
    };
  }, []);

  const setStep = (index: number, status: StepStatus) =>
    dispatchState({ type: ActionType.SET_STEP, payload: { index, status } });

  const startRedirect = () => {
    let elapsed = 0;
    const { REDIRECT_TOTAL_MS, REDIRECT_TICK_MS } = TIMING;

    redirectTimerRef.current = setInterval(() => {
      elapsed += REDIRECT_TICK_MS;
      dispatchState({
        type: ActionType.SET_REDIRECT_PROGRESS,
        payload: {
          pct: Math.max(0, 100 - (elapsed / REDIRECT_TOTAL_MS) * 100),
          countdown: Math.ceil((REDIRECT_TOTAL_MS - elapsed) / 1000),
        },
      });

      if (elapsed >= REDIRECT_TOTAL_MS) {
        if (redirectTimerRef.current) {
          clearInterval(redirectTimerRef.current);
        }
        router.push(REDIRECT_PATH);
      }
    }, REDIRECT_TICK_MS);
  };

  const onSubmit = async (data: LoginFormData) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_VALUE);
    dispatch(loginStart());
    dispatchState({ type: ActionType.SET_UI_STATE, payload: UiState.LOADING });
    dispatchState({
      type: ActionType.SET_STEPS,
      payload: [StepStatus.ACTIVE, StepStatus.PENDING, StepStatus.PENDING],
    });

    const result = await vendorLogin(data, dispatch);
    if (result?.status === 200 && result?.user) {
      setStep(0, StepStatus.DONE);
      setStep(1, StepStatus.ACTIVE);
      await new Promise((r) => setTimeout(r, TIMING.STEP_1_DELAY_MS));

      setStep(1, StepStatus.DONE);
      setStep(2, StepStatus.ACTIVE);
      await new Promise((r) => setTimeout(r, TIMING.STEP_2_DELAY_MS));

      setStep(2, StepStatus.DONE);
      await new Promise((r) => setTimeout(r, TIMING.STEP_3_DELAY_MS));

      reset();
      dispatch(loginSuccess(result.user));
      dispatch(loginEnd());

      if (result?.user?.user?.password_change_required) {
        dispatchState({
          type: ActionType.SET_UI_STATE,
          payload: UiState.PROMPT_CHANGE_PASSWORD,
        });
      } else {
        dispatchState({
          type: ActionType.SET_UI_STATE,
          payload: UiState.SUCCESS,
        });
        startRedirect();
      }
    } else {
      setStep(0, StepStatus.FAILED);
      dispatch(loginFailure(result?.message || ERROR_MSG_LOGIN_FAILED));
      if (
        result?.status === 403 &&
        result?.message === "VENDOR SUBSCRIPTION EXPIRED"
      ) {
        dispatchState({
          type: ActionType.SET_UI_STATE,
          payload: UiState.EXPIRED_SUBSCRIPTION,
        });
      } else {
        dispatchState({
          type: ActionType.SET_UI_STATE,
          payload: UiState.ERROR,
        });
      }
    }
  };

  if (!state.isMounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-4 border-platform-primary/20 border-t-platform-primary animate-spin" />
      </main>
    );
  }

  return (
    <div className="min-h-screen max-h-screen overflow-y-scroll w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Left Panel - Premium Branding & Visuals */}
      <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 bg-gradient-to-br from-platform-primary via-platform-primary/95 to-platform-secondary text-white relative overflow-hidden flex-col justify-between p-12 lg:p-20">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

        {/* Top Logo Area */}
        <div className="relative z-10 flex items-center gap-3 mb-12">
          <Image
            src={TS_LOGO}
            alt="Techsonance Logo"
            width={400}
            height={300}
            className="w-50 h-16 bg-white rounded-full p-2 object-contain"
          />
        </div>

        {/* Center Messaging */}
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300 block shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
              <span className="text-theme-caption text-white font-medium tracking-wide">
                {VENDOR_LOGIN_TEXT.PORTAL_LABEL}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight whitespace-pre-line">
              {VENDOR_LOGIN_TEXT.HERO_TITLE}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed font-medium mb-10 max-w-sm">
              {VENDOR_LOGIN_TEXT.HERO_SUBTITLE}
            </p>

            {/* stat pills */}
            <div className="flex gap-4 mt-4">
              {[
                {
                  icon: <Users size={16} className="text-white" />,
                  num: VENDOR_LOGIN_TEXT.STAT_VENDORS_NUM,
                  label: VENDOR_LOGIN_TEXT.STAT_VENDORS_LABEL,
                },
                {
                  icon: <TrendingUp size={16} className="text-white" />,
                  num: VENDOR_LOGIN_TEXT.STAT_UPTIME_NUM,
                  label: VENDOR_LOGIN_TEXT.STAT_UPTIME_LABEL,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex-1 shadow-lg transition-transform hover:-translate-y-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">{s.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {s.num}
                  </div>
                  <div className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom area */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="text-white/60 text-sm font-medium">
            {VENDOR_LOGIN_TEXT.FOOTER_COPYRIGHT}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
            <Store className="w-3.5 h-3.5" />
            <span>Vendor Portal</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative bg-white">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden w-full max-w-lg mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-platform-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-platform-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {VENDOR_LOGIN_TEXT.LOGIN_HEADING}
            </h2>
          </div>
          <p className="text-slate-600 text-sm">
            {VENDOR_LOGIN_TEXT.LOGIN_DESCRIPTION}
          </p>
        </div>

        <div className="w-full max-w-lg">
          {/* IDLE */}
          {state.uiState === UiState.IDLE && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="hidden md:block mb-8">
                <p className="text-xs font-bold tracking-widest uppercase text-platform-primary mb-2">
                  {VENDOR_LOGIN_TEXT.LOGIN_SUBHEADING}
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {VENDOR_LOGIN_TEXT.LOGIN_HEADING}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {VENDOR_LOGIN_TEXT.LOGIN_DESCRIPTION}
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <CookieConsentBanner />
                
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    {VENDOR_LOGIN_TEXT.EMAIL_LABEL}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-platform-primary transition-colors">
                      <Store className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder={VENDOR_LOGIN_TEXT.EMAIL_PLACEHOLDER}
                      autoComplete="username"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-platform-focus-ring focus:border-platform-primary outline-none transition-all text-slate-700 placeholder:text-slate-400 text-sm font-medium"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs font-medium mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold text-slate-700">
                      {VENDOR_LOGIN_TEXT.PASSWORD_LABEL}
                    </label>
                    <Link
                      href="/auth/vendorForgotPassword"
                      className="text-xs font-bold text-platform-primary hover:text-platform-secondary transition-colors"
                    >
                      {VENDOR_LOGIN_TEXT.FORGOT_PASSWORD}
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-platform-primary transition-colors">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                    <input
                      type={state.showPass ? "text" : "password"}
                      placeholder={VENDOR_LOGIN_TEXT.PASSWORD_PLACEHOLDER}
                      autoComplete="current-password"
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-platform-focus-ring focus:border-platform-primary outline-none transition-all text-slate-700 placeholder:text-slate-400 text-sm font-medium"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        dispatchState({ type: ActionType.TOGGLE_SHOW_PASS })
                      }
                      aria-label={
                        state.showPass
                          ? VENDOR_LOGIN_TEXT.HIDE_PASSWORD
                          : VENDOR_LOGIN_TEXT.SHOW_PASSWORD
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-platform-primary transition-colors cursor-pointer"
                    >
                      {state.showPass ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-start mt-1">
                    <div>
                      {errors.password ? (
                        <p className="text-red-500 text-xs font-medium max-w-xs">
                          {errors.password.message}
                        </p>
                      ) : (
                        <p className="text-slate-500 text-xs font-medium">
                          {VENDOR_LOGIN_TEXT.PASSWORD_HINT}
                        </p>
                      )}
                    </div>
                    {state.showResendLink && (
                      <button
                        type="button"
                        disabled={state.isResending || state.resendCooldown > 0}
                        onClick={handleResendTempPassword}
                        className="text-xs font-bold text-platform-primary hover:text-platform-secondary bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                      >
                        {state.resendCooldown > 0
                          ? `Resend in ${state.resendCooldown}s`
                          : VENDOR_LOGIN_TEXT.RESEND_TEMP_PASSWORD_LINK}
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {state.resendStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm ${
                        state.resendStatus.type === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                      role={state.resendStatus.type === "success" ? "status" : "alert"}
                    >
                      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${state.resendStatus.type === "success" ? "text-emerald-500" : "text-red-500"}`} />
                      <p className="text-sm font-medium">{state.resendStatus.message}</p>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm"
                      role="alert"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting || state.cookiesBlocked}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-platform-primary text-white hover:bg-platform-secondary py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-platform-primary group cursor-pointer border-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="block w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      {VENDOR_LOGIN_TEXT.BTN_LOGGING_IN}
                    </>
                  ) : (
                    <>
                      {VENDOR_LOGIN_TEXT.BTN_LOGIN}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs font-medium text-slate-500 mt-6 px-2 leading-relaxed">
                {AUTH_TEXT.CONSENT.DISCLAIMER}
              </p>

              <p className="text-center text-sm font-medium text-slate-600 mt-6">
                {VENDOR_LOGIN_TEXT.NO_ACCOUNT_TEXT}{" "}
                <a
                  href={REGISTER_URL}
                  className="text-platform-primary font-bold hover:text-platform-secondary transition-colors"
                >
                  {VENDOR_LOGIN_TEXT.CREATE_ONE_LINK}
                </a>
              </p>
            </motion.div>
          )}

          {/* LOADING */}
          {state.uiState === UiState.LOADING && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm"
            >
              <p className="text-xs font-bold tracking-widest uppercase text-platform-primary mb-2">
                {VENDOR_LOGIN_TEXT.LOADING_HEADING}
              </p>
              <p className="text-sm text-slate-500 font-medium mb-8">
                {VENDOR_LOGIN_TEXT.LOADING_SUBHEADING}
              </p>
              <div className="w-full flex flex-col gap-3">
                {LOGIN_STEPS.map((label, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                      state.steps[i] === StepStatus.ACTIVE 
                        ? "bg-white border-blue-200 text-blue-700 shadow-md scale-[1.02]" 
                        : state.steps[i] === StepStatus.DONE
                          ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                          : state.steps[i] === StepStatus.FAILED
                            ? "bg-red-50 border-red-100 text-red-700"
                            : "bg-white border-slate-100 text-slate-400"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      state.steps[i] === StepStatus.ACTIVE ? "bg-blue-50" :
                      state.steps[i] === StepStatus.DONE ? "bg-emerald-100" :
                      state.steps[i] === StepStatus.FAILED ? "bg-red-100" : "bg-slate-50 border border-slate-200"
                    }`}>
                      <StepIcon status={state.steps[i]} />
                    </div>
                    {label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {state.uiState === UiState.SUCCESS && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-8 bg-emerald-50/30 rounded-2xl border border-emerald-100/50"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 shadow-sm"
              >
                <Check size={36} className="text-emerald-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {VENDOR_LOGIN_TEXT.SUCCESS_HEADING}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm">
                {VENDOR_LOGIN_TEXT.SUCCESS_SUBHEADING}
              </p>
              <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden mb-3 shadow-inner">
                <div
                  className="h-2 bg-emerald-500 rounded-full transition-all duration-75"
                  style={{ width: `${state.redirectPct}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {VENDOR_LOGIN_TEXT.REDIRECT_TEXT_PREFIX}{" "}
                <span className="text-slate-600">{Math.max(0, state.countdown)}</span>{" "}
                {VENDOR_LOGIN_TEXT.REDIRECT_TEXT_SUFFIX}
              </p>
            </motion.div>
          )}

          {/* PROMPT CHANGE PASSWORD */}
          {state.uiState === UiState.PROMPT_CHANGE_PASSWORD && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center w-full"
            >
              <SetTemporaryVendorPassword
                embedded={true}
                onSuccess={() => router.replace(REDIRECT_PATH)}
              />
            </motion.div>
          )}

          {/* ERROR */}
          {state.uiState === UiState.ERROR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-8 bg-red-50/30 rounded-2xl border border-red-100/50"
            >
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 shadow-sm">
                <X size={36} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {VENDOR_LOGIN_TEXT.ERROR_HEADING}
              </h2>
              <p className="text-sm font-medium text-slate-600 mb-8 max-w-sm">
                {error || ERROR_MSG_INVALID_CREDS}
              </p>
              <button
                onClick={() => {
                  dispatchState({
                    type: ActionType.SET_UI_STATE,
                    payload: UiState.IDLE,
                  });
                  dispatchState({
                    type: ActionType.SET_STEPS,
                    payload: [
                      StepStatus.PENDING,
                      StepStatus.PENDING,
                      StepStatus.PENDING,
                    ],
                  });
                }}
                className="bg-platform-primary hover:bg-platform-secondary text-white font-bold rounded-xl px-10 py-4 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer border-none"
              >
                {VENDOR_LOGIN_TEXT.BTN_TRY_AGAIN}
              </button>
            </motion.div>
          )}

          {/* EXPIRED SUBSCRIPTION */}
          {state.uiState === UiState.EXPIRED_SUBSCRIPTION && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-8 bg-amber-50/50 rounded-2xl border border-amber-100"
            >
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6 shadow-sm animate-pulse">
                <AlertCircle size={36} className="text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Subscription Expired
              </h2>
              <p className="text-sm font-medium text-slate-600 mb-8 max-w-xs leading-relaxed">
                Your vendor subscription has expired. Please renew your plan or
                contact our support team to reactivate your store.
              </p>
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    window.location.href =
                      "mailto:support@techsonance.com?subject=Vendor Subscription Renewal Request";
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl py-4 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer border-none"
                >
                  Renew Plan / Contact Support
                </button>
                <button
                  onClick={() => {
                    dispatchState({
                      type: ActionType.SET_UI_STATE,
                      payload: UiState.IDLE,
                    });
                    dispatchState({
                      type: ActionType.SET_STEPS,
                      payload: [
                        StepStatus.PENDING,
                        StepStatus.PENDING,
                        StepStatus.PENDING,
                      ],
                    });
                  }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl py-4 transition-all border-2 border-slate-200 cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
