"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useReducer, useRef } from "react";
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
import {
  AUTH_TEXT,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VALUE,
  UserRole,
} from "@/constants";
import { VENDOR_LOGIN_TEXT } from "@/constants/authText";

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
}

const REDIRECT_PATH = "/vendor";
const REGISTER_PATH = "/auth/vendorRegister";
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
  | { type: ActionType.RESET_FORM };

const initialState: State = {
  uiState: UiState.IDLE,
  steps: [StepStatus.PENDING, StepStatus.PENDING, StepStatus.PENDING],
  showPass: false,
  redirectPct: 100,
  countdown: 3,
  cookiesBlocked: false,
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
    default:
      return state;
  }
}

// ==========================================
// 3. COMPONENTS
// ==========================================

const StoreIllustration = () => (
  <svg
    width="100%"
    viewBox="0 0 400 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="10"
      y="30"
      width="280"
      height="155"
      rx="12"
      fill="rgba(255,255,255,0.08)"
    />
    <rect
      x="10"
      y="30"
      width="280"
      height="32"
      rx="12"
      fill="rgba(255,255,255,0.12)"
    />
    <rect x="10" y="50" width="280" height="12" fill="rgba(255,255,255,0.12)" />
    <circle cx="26" cy="46" r="6" fill="#f87171" />
    <circle cx="44" cy="46" r="6" fill="#fbbf24" />
    <circle cx="62" cy="46" r="6" fill="#34d399" />
    <rect
      x="24"
      y="72"
      width="60"
      height="8"
      rx="4"
      fill="rgba(255,255,255,0.2)"
    />
    <rect
      x="24"
      y="86"
      width="44"
      height="6"
      rx="3"
      fill="rgba(255,255,255,0.12)"
    />
    <rect
      x="24"
      y="100"
      width="52"
      height="6"
      rx="3"
      fill="rgba(255,255,255,0.12)"
    />
    <rect
      x="24"
      y="114"
      width="40"
      height="6"
      rx="3"
      fill="rgba(255,255,255,0.12)"
    />
    <rect
      x="104"
      y="68"
      width="172"
      height="84"
      rx="8"
      fill="rgba(255,255,255,0.06)"
    />
    <rect
      x="116"
      y="80"
      width="60"
      height="8"
      rx="4"
      fill="rgba(255,255,255,0.18)"
    />
    <rect
      x="116"
      y="96"
      width="148"
      height="5"
      rx="2.5"
      fill="rgba(255,255,255,0.1)"
    />
    <rect
      x="116"
      y="107"
      width="120"
      height="5"
      rx="2.5"
      fill="rgba(255,255,255,0.1)"
    />
    <rect
      x="116"
      y="118"
      width="135"
      height="5"
      rx="2.5"
      fill="rgba(255,255,255,0.1)"
    />
    <rect x="116" y="135" width="52" height="10" rx="5" fill="#6ee7b7" />
    <rect x="24" y="148" width="252" height="1" fill="rgba(255,255,255,0.08)" />
    <rect
      x="24"
      y="158"
      width="40"
      height="6"
      rx="3"
      fill="rgba(255,255,255,0.12)"
    />
    <rect
      x="72"
      y="158"
      width="40"
      height="6"
      rx="3"
      fill="rgba(255,255,255,0.12)"
    />
    <rect
      x="120"
      y="158"
      width="40"
      height="6"
      rx="3"
      fill="rgba(255,255,255,0.12)"
    />
    <rect
      x="234"
      y="155"
      width="52"
      height="12"
      rx="6"
      fill="rgba(255,255,255,0.15)"
    />
  </svg>
);

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
  const { error, user, isAuthenticated, role } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const [state, dispatchState] = useReducer(loginReducer, initialState);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    dispatchState({
      type: ActionType.SET_COOKIES_BLOCKED,
      payload: !navigator.cookieEnabled,
    });
    const initialToken = authToken();
    if (initialToken && isAuthenticated && role === UserRole.VENDOR) {
      router.replace(REDIRECT_PATH);
    }
    return () => {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
      }
    };
  }, [router, isAuthenticated, role]);

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
      if (result?.status === 403 && result?.message === "VENDOR SUBSCRIPTION EXPIRED") {
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

  return (
    <main className="max-h-[80vh] max-w-[80vw] flex items-center justify-center p-4 font-sans bg-white">
      <div
        className="w-full grid grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200"
        style={{ minHeight: "620px", maxHeight: "90vh" }}
      >
        {/* ── LEFT PANEL — illustration ── */}
        <div className="bg-[#1a56db] p-5 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-300 block" />
              <span className="text-theme-caption text-white font-medium tracking-wide">
                {VENDOR_LOGIN_TEXT.PORTAL_LABEL}
              </span>
            </div>
            <h2 className="text-theme-h3 font-bold text-white leading-snug mb-3 whitespace-pre-line">
              {VENDOR_LOGIN_TEXT.HERO_TITLE}
            </h2>
            <p className="text-theme-body-sm text-white/65 leading-relaxed max-w-[260px]">
              {VENDOR_LOGIN_TEXT.HERO_SUBTITLE}
            </p>

            {/* stat pills */}
            <div className="flex gap-3 mt-4">
              {[
                {
                  icon: <Users size={14} />,
                  num: VENDOR_LOGIN_TEXT.STAT_VENDORS_NUM,
                  label: VENDOR_LOGIN_TEXT.STAT_VENDORS_LABEL,
                },
                {
                  icon: <TrendingUp size={14} />,
                  num: VENDOR_LOGIN_TEXT.STAT_UPTIME_NUM,
                  label: VENDOR_LOGIN_TEXT.STAT_UPTIME_LABEL,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 rounded-xl p-3.5 flex-1"
                >
                  <div className="text-white/50 mb-1">{s.icon}</div>
                  <div className="text-theme-h5 font-bold text-white">
                    {s.num}
                  </div>
                  <div className="text-theme-xxs text-white/55 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* dashboard illustration */}
            <div className="mt-0">
              <StoreIllustration />
            </div>
          </div>

          <div className="text-theme-xxs text-white/35 mt-3">
            {VENDOR_LOGIN_TEXT.FOOTER_COPYRIGHT}
          </div>
        </div>

        {/* ── RIGHT PANEL — form / states ── */}
        <div className="flex flex-col justify-center px-12 py-10">
          {/* IDLE */}
          {state.uiState === UiState.IDLE && (
            <div>
              <p className="text-theme-xxs font-semibold tracking-widest uppercase text-gray-400 mb-5">
                {VENDOR_LOGIN_TEXT.LOGIN_SUBHEADING}
              </p>
              <h1 className="text-theme-h4 font-bold text-gray-900 mb-1">
                {VENDOR_LOGIN_TEXT.LOGIN_HEADING}
              </h1>
              <p className="text-theme-body-sm text-gray-500 mb-7">
                {VENDOR_LOGIN_TEXT.LOGIN_DESCRIPTION}
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <CookieConsentBanner />
                {/* Email */}
                <div>
                  <label className="block text-theme-caption font-semibold text-gray-600 mb-1.5 tracking-wide">
                    {VENDOR_LOGIN_TEXT.EMAIL_LABEL}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Store size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder={VENDOR_LOGIN_TEXT.EMAIL_PLACEHOLDER}
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-theme-body-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-300"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-theme-caption mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-theme-caption font-semibold text-gray-600 tracking-wide">
                      {VENDOR_LOGIN_TEXT.PASSWORD_LABEL}
                    </label>
                    <a
                      href="#"
                      className="text-theme-caption text-blue-600 hover:underline"
                    >
                      {VENDOR_LOGIN_TEXT.FORGOT_PASSWORD}
                    </a>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Eye size={15} style={{ display: "none" }} />
                    </span>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </span>
                    <input
                      type={state.showPass ? "text" : "password"}
                      placeholder={VENDOR_LOGIN_TEXT.PASSWORD_PLACEHOLDER}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-theme-body-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-300"
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {state.showPass ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-red-500 text-theme-caption mt-1 max-w-xs">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-theme-caption mt-1">
                      {VENDOR_LOGIN_TEXT.PASSWORD_HINT}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-theme-body-sm text-red-600">
                    <AlertCircle size={15} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || state.cookiesBlocked}
                  className="w-full mt-1 bg-[#1a56db] hover:bg-[#1648c0] active:scale-[.98] disabled:opacity-60 text-white font-semibold text-theme-body-sm rounded-xl py-3.5 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      {VENDOR_LOGIN_TEXT.BTN_LOGGING_IN}
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} />
                      {VENDOR_LOGIN_TEXT.BTN_LOGIN}
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-theme-caption text-gray-400 mt-5 px-2 leading-relaxed">
                {AUTH_TEXT.CONSENT.DISCLAIMER}
              </p>

              <p className="text-center text-theme-body-sm text-gray-500 mt-5">
                {VENDOR_LOGIN_TEXT.NO_ACCOUNT_TEXT}{" "}
                <Link
                  href={REGISTER_PATH}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {VENDOR_LOGIN_TEXT.CREATE_ONE_LINK}
                </Link>
              </p>
            </div>
          )}

          {/* LOADING */}
          {state.uiState === UiState.LOADING && (
            <div className="flex flex-col items-center text-center">
              <p className="text-theme-xxs font-semibold tracking-widest uppercase text-gray-400 mb-1">
                {VENDOR_LOGIN_TEXT.LOADING_HEADING}
              </p>
              <p className="text-theme-caption text-gray-400 mb-6">
                {VENDOR_LOGIN_TEXT.LOADING_SUBHEADING}
              </p>
              <div className="w-full flex flex-col gap-2.5">
                {LOGIN_STEPS.map((label, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-theme-body-sm font-medium transition-all ${STEP_STYLES[state.steps[i]]}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <StepIcon status={state.steps[i]} />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {state.uiState === UiState.SUCCESS && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <Check size={28} className="text-green-600" />
              </div>
              <h2 className="text-theme-h6 font-bold text-gray-900 mb-1">
                {VENDOR_LOGIN_TEXT.SUCCESS_HEADING}
              </h2>
              <p className="text-theme-body-sm text-gray-500 mb-6">
                {VENDOR_LOGIN_TEXT.SUCCESS_SUBHEADING}
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="h-1.5 bg-[#1a56db] rounded-full transition-all duration-75"
                  style={{ width: `${state.redirectPct}%` }}
                />
              </div>
              <p className="text-theme-caption text-gray-400">
                {VENDOR_LOGIN_TEXT.REDIRECT_TEXT_PREFIX}{" "}
                {Math.max(0, state.countdown)}
                {VENDOR_LOGIN_TEXT.REDIRECT_TEXT_SUFFIX}
              </p>
            </div>
          )}

          {/* PROMPT CHANGE PASSWORD */}
          {state.uiState === UiState.PROMPT_CHANGE_PASSWORD && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5 animate-bounce">
                <AlertCircle size={28} className="text-amber-600" />
              </div>
              <h2 className="text-theme-h6 font-bold text-gray-900 mb-2">
                {VENDOR_LOGIN_TEXT.TEMP_PASS_HEADING}
              </h2>
              <p className="text-theme-body-sm text-gray-500 mb-6 leading-relaxed">
                {VENDOR_LOGIN_TEXT.TEMP_PASS_DESCRIPTION}
              </p>
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => router.push(CHANGE_PASSWORD_PATH)}
                  className="w-full bg-[#1a56db] hover:bg-[#1648c0] text-white font-semibold text-theme-body-sm rounded-xl py-3 transition cursor-pointer"
                >
                  {VENDOR_LOGIN_TEXT.BTN_CHANGE_PASS}
                </button>
                <button
                  onClick={() => router.push(REDIRECT_PATH)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-theme-body-sm rounded-xl py-3 transition cursor-pointer"
                >
                  {VENDOR_LOGIN_TEXT.BTN_SKIP}
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {state.uiState === UiState.ERROR && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5">
                <X size={28} className="text-red-500" />
              </div>
              <h2 className="text-theme-h6 font-bold text-gray-900 mb-1">
                {VENDOR_LOGIN_TEXT.ERROR_HEADING}
              </h2>
              <p className="text-theme-body-sm text-gray-500 mb-6">
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
                className="bg-[#1a56db] hover:bg-[#1648c0] text-white font-semibold text-theme-body-sm rounded-xl px-8 py-3 transition"
              >
                {VENDOR_LOGIN_TEXT.BTN_TRY_AGAIN}
              </button>
            </div>
          )}

          {/* EXPIRED SUBSCRIPTION */}
          {state.uiState === UiState.EXPIRED_SUBSCRIPTION && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5 animate-pulse">
                <AlertCircle size={28} className="text-amber-600" />
              </div>
              <h2 className="text-theme-h6 font-bold text-gray-900 mb-1">
                Subscription Expired
              </h2>
              <p className="text-theme-body-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
                Your vendor subscription has expired. Please renew your plan or contact our support team to reactivate your store.
              </p>
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    window.location.href = "mailto:support@techsonance.com?subject=Vendor Subscription Renewal Request";
                  }}
                  className="w-full bg-[#1a56db] hover:bg-[#1648c0] text-white font-semibold text-theme-body-sm rounded-xl py-3 transition cursor-pointer"
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
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-theme-body-sm rounded-xl py-3 transition cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
