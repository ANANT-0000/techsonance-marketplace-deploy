"use client";

import { useEffect, useReducer, useRef } from "react";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/lib/features/auth/authSlice";
import { adminLogin } from "@/utils/authApiClient";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Eye, EyeOff } from "lucide-react";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import {
  AUTH_TEXT,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VALUE,
  IS_AUTHENTICATED_KEY,
} from "@/constants";
import { ADMIN_LOGIN_TEXT } from "@/constants/adminText";

type UiState = "idle" | "loading" | "success" | "error";
type Step = { label: string; status: "pending" | "active" | "done" | "failed" };

const INITIAL_STEPS: Step[] = [
  { label: ADMIN_LOGIN_TEXT.STEP_VALIDATING, status: "pending" },
  { label: ADMIN_LOGIN_TEXT.STEP_PERMISSIONS, status: "pending" },
  { label: ADMIN_LOGIN_TEXT.STEP_INITIALISING, status: "pending" },
];

export enum ActionType {
  SET_LOGIN_ID = "SET_LOGIN_ID",
  SET_LOGIN_PASS = "SET_LOGIN_PASS",
  SET_ERROR = "SET_ERROR",
  SET_UI_STATE = "SET_UI_STATE",
  UPDATE_STEP = "UPDATE_STEP",
  RESET_STEPS = "RESET_STEPS",
  SET_COUNTDOWN = "SET_COUNTDOWN",
  TOGGLE_SHOW_PASS = "TOGGLE_SHOW_PASS",
  SET_REDIRECT_PROGRESS = "SET_REDIRECT_PROGRESS",
  SET_COOKIES_BLOCKED = "SET_COOKIES_BLOCKED",
  RESET_ON_RETRY = "RESET_ON_RETRY",
}

export type Action =
  | { type: ActionType.SET_LOGIN_ID; payload: string | null }
  | { type: ActionType.SET_LOGIN_PASS; payload: string | null }
  | { type: ActionType.SET_ERROR; payload: string | null }
  | { type: ActionType.SET_UI_STATE; payload: UiState }
  | {
      type: ActionType.UPDATE_STEP;
      payload: { index: number; status: Step["status"] };
    }
  | { type: ActionType.RESET_STEPS }
  | { type: ActionType.SET_COUNTDOWN; payload: number }
  | { type: ActionType.TOGGLE_SHOW_PASS }
  | { type: ActionType.SET_REDIRECT_PROGRESS; payload: number }
  | { type: ActionType.SET_COOKIES_BLOCKED; payload: boolean }
  | { type: ActionType.RESET_ON_RETRY };

interface State {
  adminLoginID: string | null;
  adminLoginPass: string | null;
  error: string | null;
  uiState: UiState;
  steps: Step[];
  countdown: number;
  showPass: boolean;
  redirectProgress: number;
  cookiesBlocked: boolean;
}

const initialState: State = {
  adminLoginID: null,
  adminLoginPass: null,
  error: null,
  uiState: "idle",
  steps: INITIAL_STEPS,
  countdown: 3,
  showPass: false,
  redirectProgress: 100,
  cookiesBlocked: false,
};

function adminLoginReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_LOGIN_ID:
      return { ...state, adminLoginID: action.payload };
    case ActionType.SET_LOGIN_PASS:
      return { ...state, adminLoginPass: action.payload };
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionType.SET_UI_STATE:
      return { ...state, uiState: action.payload };
    case ActionType.UPDATE_STEP:
      return {
        ...state,
        steps: state.steps.map((s, i) =>
          i === action.payload.index
            ? { ...s, status: action.payload.status }
            : s,
        ),
      };
    case ActionType.RESET_STEPS:
      return {
        ...state,
        steps: INITIAL_STEPS.map((s, i) => ({
          ...s,
          status: i === 0 ? "active" : "pending",
        })),
      };
    case ActionType.SET_COUNTDOWN:
      return { ...state, countdown: action.payload };
    case ActionType.TOGGLE_SHOW_PASS:
      return { ...state, showPass: !state.showPass };
    case ActionType.SET_REDIRECT_PROGRESS:
      return { ...state, redirectProgress: action.payload };
    case ActionType.SET_COOKIES_BLOCKED:
      return { ...state, cookiesBlocked: action.payload };
    case ActionType.RESET_ON_RETRY:
      return { ...state, uiState: "idle", error: null };
    default:
      return state;
  }
}

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const [state, dispatchState] = useReducer(adminLoginReducer, initialState);
  const router = useRouter();
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatchState({
      type: ActionType.SET_COOKIES_BLOCKED,
      payload: !navigator.cookieEnabled,
    });
    const storedData =
      typeof window !== "undefined"
        ? localStorage.getItem(IS_AUTHENTICATED_KEY)
        : null;
    const auth = storedData ? JSON.parse(storedData) : null;
    if (auth && auth?.isAuthenticated && auth?.role === "admin") {
      router.push(`/admin`);
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const updateStep = (index: number, status: Step["status"]) => {
    dispatchState({ type: ActionType.UPDATE_STEP, payload: { index, status } });
  };

  const submitHandler = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_VALUE);
    dispatchState({ type: ActionType.SET_ERROR, payload: null });
    dispatchState({ type: ActionType.SET_UI_STATE, payload: "loading" });
    dispatchState({ type: ActionType.RESET_STEPS });

    dispatch(loginStart());

    const result: { status: boolean; message: string; data?: any } =
      await adminLogin({
        admin_id: state.adminLoginID!,
        password: state.adminLoginPass!,
      });

    dispatch(
      result.status ? loginSuccess(result.data) : loginFailure(result.message),
    );

    if (!result.status) {
      updateStep(0, "failed");
      dispatchState({ type: ActionType.SET_ERROR, payload: result.message });
      dispatchState({ type: ActionType.SET_UI_STATE, payload: "error" });
      return;
    }

    // Step 1 done, step 2 active
    updateStep(0, "done");
    updateStep(1, "active");
    await new Promise((r) => setTimeout(r, 600));

    updateStep(1, "done");
    updateStep(2, "active");
    await new Promise((r) => setTimeout(r, 600));

    updateStep(2, "done");
    await new Promise((r) => setTimeout(r, 400));

    dispatchState({ type: ActionType.SET_UI_STATE, payload: "success" });
    startRedirect();
  };

  const startRedirect = () => {
    let elapsed = 0;
    const total = 3000;
    const interval = 50;
    countdownRef.current = setInterval(() => {
      elapsed += interval;
      dispatchState({
        type: ActionType.SET_REDIRECT_PROGRESS,
        payload: Math.max(0, 100 - (elapsed / total) * 100),
      });
      dispatchState({
        type: ActionType.SET_COUNTDOWN,
        payload: Math.ceil((total - elapsed) / 1000),
      });
      if (elapsed >= total) {
        clearInterval(countdownRef.current!);
        router.replace(`/admin`);
      }
    }, interval);
  };

  const StepIcon = ({ status }: { status: Step["status"] }) => {
    if (status === "active")
      return (
        <span className="block w-3.5 h-3.5 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
      );
    if (status === "done")
      return <span className="text-green-600 text-theme-body-sm">✓</span>;
    if (status === "failed")
      return <span className="text-red-500 text-theme-body-sm">✕</span>;
    return <span className="text-gray-300 text-theme-body-sm">○</span>;
  };

  const stepStyles: Record<Step["status"], string> = {
    pending: "bg-gray-50 border-gray-100",
    active: "bg-sky-50 border-sky-100",
    done: "bg-green-50 border-green-100",
    failed: "bg-red-50 border-red-100",
  };
  const stepTextStyles: Record<Step["status"], string> = {
    pending: "text-gray-400",
    active: "text-sky-700",
    done: "text-green-700",
    failed: "text-red-600",
  };

  return (
    <main className="min-h-screen   flex items-center justify-center p-6 font-sans">
      <div className="w-full  bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header — always visible */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
            <svg
              className="w-5 h-5 text-sky-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-theme-h6 font-semibold text-gray-900 mb-0.5">
            {ADMIN_LOGIN_TEXT.TITLE}
          </h1>
          <p className="text-theme-body-sm text-gray-500">
            {ADMIN_LOGIN_TEXT.SUBTITLE}
          </p>
        </div>

        {/* IDLE — login form */}
        {state.uiState === "idle" && (
          <form
            onSubmit={submitHandler}
            className="w-full px-8 py-6 flex flex-col gap-4"
          >
            <CookieConsentBanner />
            <div className="flex flex-col gap-1.5">
              <label className="text-md font-medium text-gray-600 tracking-wide">
                {ADMIN_LOGIN_TEXT.ID_LABEL}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  @
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg text-theme-body-sm text-gray-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                  placeholder={ADMIN_LOGIN_TEXT.ID_PLACEHOLDER}
                  onChange={(e) =>
                    dispatchState({
                      type: ActionType.SET_LOGIN_ID,
                      payload: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-md font-medium text-gray-600 tracking-wide">
                {ADMIN_LOGIN_TEXT.PASS_LABEL}
              </label>
              <div className="relative">
                <input
                  type={state.showPass ? "text" : "password"}
                  className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-lg text-md"
                  onChange={(e) =>
                    dispatchState({
                      type: ActionType.SET_LOGIN_PASS,
                      payload: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    dispatchState({ type: ActionType.TOGGLE_SHOW_PASS })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={
                    state.showPass
                      ? ADMIN_LOGIN_TEXT.HIDE_PASS
                      : ADMIN_LOGIN_TEXT.SHOW_PASS
                  }
                >
                  {state.showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {state.error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-theme-body-sm text-red-600">
                <span>⚠</span> {state.error}
              </div>
            )}
            <button
              type="submit"
              disabled={state.cookiesBlocked}
              className="w-full bg-sky-500 hover:bg-sky-600 active:scale-[.98] disabled:opacity-60 text-white font-semibold text-theme-body-sm rounded-lg py-2.5 transition flex items-center justify-center gap-2"
            >
              {ADMIN_LOGIN_TEXT.BTN_AUTH}
            </button>
            <p className="text-center text-theme-caption text-gray-400 flex items-center justify-center gap-1 mt-1">
              {ADMIN_LOGIN_TEXT.MONITOR_MSG}
            </p>
            <p className="text-center text-[10px] text-gray-400 mt-2 px-2 leading-relaxed">
              {AUTH_TEXT.CONSENT.DISCLAIMER}
            </p>
          </form>
        )}

        {/* LOADING — step progress */}
        {state.uiState === "loading" && (
          <div className="px-8 py-8 flex flex-col items-center">
            <p className="text-theme-caption font-medium text-gray-400 uppercase tracking-widest mb-1">
              {ADMIN_LOGIN_TEXT.LOADING_TITLE}
            </p>
            <p className="text-theme-caption text-gray-400 mb-5">
              {ADMIN_LOGIN_TEXT.LOADING_SUBTITLE}
            </p>
            <div className="w-full flex flex-col gap-2">
              {state.steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-theme-body-sm font-medium transition-all ${stepStyles[step.status]} ${stepTextStyles[step.status]}`}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-100 flex-shrink-0">
                    <StepIcon status={step.status} />
                  </div>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUCCESS — redirect countdown */}
        {state.uiState === "success" && (
          <div className="px-8 py-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4 text-theme-h4">
              ✓
            </div>
            <h2 className="text-theme-body font-semibold text-gray-900 mb-1">
              {ADMIN_LOGIN_TEXT.SUCCESS_TITLE}
            </h2>
            <p className="text-theme-body-sm text-gray-500 mb-5">
              {ADMIN_LOGIN_TEXT.SUCCESS_SUBTITLE}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
              <div
                className="h-1.5 bg-sky-500 rounded-full transition-all"
                style={{ width: `${state.redirectProgress}%` }}
              />
            </div>
            <p className="text-theme-caption text-gray-400">
              {ADMIN_LOGIN_TEXT.REDIRECT_PREFIX}
              {state.countdown}
              {ADMIN_LOGIN_TEXT.REDIRECT_SUFFIX}
            </p>
          </div>
        )}

        {/* ERROR — access denied */}
        {state.uiState === "error" && (
          <div className="px-8 py-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4 text-theme-h4">
              ✕
            </div>
            <h2 className="text-theme-body font-semibold text-gray-900 mb-1">
              {ADMIN_LOGIN_TEXT.ERROR_TITLE}
            </h2>
            <p className="text-theme-body-sm text-gray-500 mb-5">
              {state.error || ADMIN_LOGIN_TEXT.ERROR_DEFAULT_MSG}
            </p>
            <button
              onClick={() => dispatchState({ type: ActionType.RESET_ON_RETRY })}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-theme-body-sm rounded-lg px-6 py-2.5 transition"
            >
              {ADMIN_LOGIN_TEXT.BTN_TRY_AGAIN}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
