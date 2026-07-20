"use client";

import { useReducer, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  requestVendorPasswordResetOTP,
  resetPasswordWithOTP,
} from "@/utils/authApiClient";
import { VENDOR_FORGOT_PASSWORD_TEXT } from "@/constants/authText";
import { PASSWORD_REQUIREMENTS_REGEX } from "@/utils/validation";
import { VEDNOR_LOGIN_PATH } from "@/constants";

interface State {
  step: 1 | 2;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  email: string;
  otp: string;
  newPassword: string;
  showPassword: boolean;
  resendCooldown: number;
  otpAttempts: number;
  isLockedOut: boolean;
  otpExpiryTime: number | null;
  isPendingBlocked: boolean;
}

export enum ForgotPasswordActionType {
  SET_STEP = "SET_STEP",
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  SET_SUCCESS = "SET_SUCCESS",
  SET_EMAIL = "SET_EMAIL",
  SET_OTP = "SET_OTP",
  SET_NEW_PASSWORD = "SET_NEW_PASSWORD",
  TOGGLE_PASSWORD_VISIBILITY = "TOGGLE_PASSWORD_VISIBILITY",
  RESET_FORM = "RESET_FORM",
  DECREMENT_COOLDOWN = "DECREMENT_COOLDOWN",
  START_COOLDOWN = "START_COOLDOWN",
  INCREMENT_OTP_ATTEMPTS = "INCREMENT_OTP_ATTEMPTS",
  SET_LOCKED_OUT = "SET_LOCKED_OUT",
  SET_OTP_EXPIRY = "SET_OTP_EXPIRY",
  SET_PENDING_BLOCKED = "SET_PENDING_BLOCKED",
}

type Action =
  | { type: ForgotPasswordActionType.SET_STEP; payload: 1 | 2 }
  | { type: ForgotPasswordActionType.SET_LOADING; payload: boolean }
  | { type: ForgotPasswordActionType.SET_ERROR; payload: string | null }
  | { type: ForgotPasswordActionType.SET_SUCCESS; payload: string | null }
  | { type: ForgotPasswordActionType.SET_EMAIL; payload: string }
  | { type: ForgotPasswordActionType.SET_OTP; payload: string }
  | { type: ForgotPasswordActionType.SET_NEW_PASSWORD; payload: string }
  | { type: ForgotPasswordActionType.TOGGLE_PASSWORD_VISIBILITY }
  | { type: ForgotPasswordActionType.RESET_FORM }
  | { type: ForgotPasswordActionType.DECREMENT_COOLDOWN }
  | { type: ForgotPasswordActionType.START_COOLDOWN; payload: number }
  | { type: ForgotPasswordActionType.INCREMENT_OTP_ATTEMPTS }
  | { type: ForgotPasswordActionType.SET_LOCKED_OUT; payload: boolean }
  | { type: ForgotPasswordActionType.SET_OTP_EXPIRY; payload: number | null }
  | { type: ForgotPasswordActionType.SET_PENDING_BLOCKED; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ForgotPasswordActionType.SET_STEP:
      return { ...state, step: action.payload };
    case ForgotPasswordActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ForgotPasswordActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case ForgotPasswordActionType.SET_SUCCESS:
      return { ...state, successMessage: action.payload };
    case ForgotPasswordActionType.SET_EMAIL:
      return { ...state, email: action.payload };
    case ForgotPasswordActionType.SET_OTP:
      return { ...state, otp: action.payload };
    case ForgotPasswordActionType.SET_NEW_PASSWORD:
      return { ...state, newPassword: action.payload };
    case ForgotPasswordActionType.TOGGLE_PASSWORD_VISIBILITY:
      return { ...state, showPassword: !state.showPassword };
    case ForgotPasswordActionType.RESET_FORM:
      return {
        ...state,
        step: 1,
        otp: "",
        error: null,
        successMessage: null,
        otpAttempts: 0,
        isLockedOut: false,
        otpExpiryTime: null,
      };
    case ForgotPasswordActionType.DECREMENT_COOLDOWN:
      return {
        ...state,
        resendCooldown: Math.max(0, state.resendCooldown - 1),
      };
    case ForgotPasswordActionType.START_COOLDOWN:
      return { ...state, resendCooldown: action.payload };
    case ForgotPasswordActionType.INCREMENT_OTP_ATTEMPTS:
      return { ...state, otpAttempts: state.otpAttempts + 1 };
    case ForgotPasswordActionType.SET_LOCKED_OUT:
      return { ...state, isLockedOut: action.payload };
    case ForgotPasswordActionType.SET_OTP_EXPIRY:
      return { ...state, otpExpiryTime: action.payload };
    case ForgotPasswordActionType.SET_PENDING_BLOCKED:
      return { ...state, isPendingBlocked: action.payload };
    default:
      return state;
  }
}

export function VendorForgotPasswordClient() {
  const router = useRouter();

  const [state, dispatch] = useReducer(reducer, {
    step: 1,
    isLoading: false,
    error: null,
    successMessage: null,
    email: "",
    otp: "",
    newPassword: "",
    showPassword: false,
    resendCooldown: 0,
    otpAttempts: 0,
    isLockedOut: false,
    otpExpiryTime: null,
    isPendingBlocked: false,
  });

  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  // Handle timer for resend cooldown
  useEffect(() => {
    if (state.resendCooldown > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: ForgotPasswordActionType.DECREMENT_COOLDOWN });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendCooldown]);

  // Handle 15-minute OTP expiry countdown
  useEffect(() => {
    if (state.otpExpiryTime && state.step === 2) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = state.otpExpiryTime! - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft("00:00");
          if (!state.isLockedOut) {
            dispatch({
              type: ForgotPasswordActionType.SET_ERROR,
              payload: VENDOR_FORGOT_PASSWORD_TEXT.ERR_OTP_EXPIRED,
            });
          }
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(
            `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          );
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.otpExpiryTime, state.step, state.isLockedOut]);

  const handleRequestOtp = async (e: React.SubmitEvent) => {
    e.preventDefault();
    dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: true });
    dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: null });
    dispatch({ type: ForgotPasswordActionType.SET_SUCCESS, payload: null });
    dispatch({
      type: ForgotPasswordActionType.SET_PENDING_BLOCKED,
      payload: false,
    });

    try {
      await requestVendorPasswordResetOTP(state.email);
      dispatch({ type: ForgotPasswordActionType.SET_STEP, payload: 2 });
      dispatch({
        type: ForgotPasswordActionType.SET_SUCCESS,
        payload: VENDOR_FORGOT_PASSWORD_TEXT.MSG_OTP_SENT,
      });
      dispatch({ type: ForgotPasswordActionType.START_COOLDOWN, payload: 60 });
      dispatch({
        type: ForgotPasswordActionType.SET_OTP_EXPIRY,
        payload: Date.now() + 15 * 60 * 1000,
      }); // 15 minutes
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage === "VENDOR_PENDING_FORGOT_PASSWORD_BLOCKED") {
        dispatch({
          type: ForgotPasswordActionType.SET_PENDING_BLOCKED,
          payload: true,
        });
        dispatch({
          type: ForgotPasswordActionType.SET_ERROR,
          payload:
            "Your account is pending. Please use 'Resend Temporary Password'.",
        });
      } else {
        dispatch({
          type: ForgotPasswordActionType.SET_ERROR,
          payload:
            errorMessage || VENDOR_FORGOT_PASSWORD_TEXT.ERR_OTP_SEND_FAILED,
        });
      }
    } finally {
      dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: false });
    }
  };

  const handleResendTempPassword = async () => {
    dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: true });
    dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: null });
    dispatch({ type: ForgotPasswordActionType.SET_SUCCESS, payload: null });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/vendor/resend-temp-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: state.email }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend temporary password");
      }
      dispatch({
        type: ForgotPasswordActionType.SET_SUCCESS,
        payload: "Temporary password sent! Check your email.",
      });
    } catch (err: any) {
      dispatch({
        type: ForgotPasswordActionType.SET_ERROR,
        payload: err.message || "Failed to resend temporary password",
      });
    } finally {
      dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: false });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: true });
    dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: null });
    dispatch({ type: ForgotPasswordActionType.SET_SUCCESS, payload: null });

    try {
      await resetPasswordWithOTP(state.email, state.otp, state.newPassword);
      dispatch({
        type: ForgotPasswordActionType.SET_SUCCESS,
        payload: VENDOR_FORGOT_PASSWORD_TEXT.MSG_RESET_SUCCESS,
      });

      setTimeout(() => {
        router.push(VEDNOR_LOGIN_PATH);
      }, 2000);
    } catch (err: any) {
      const newAttempts = state.otpAttempts + 1;
      dispatch({ type: ForgotPasswordActionType.INCREMENT_OTP_ATTEMPTS });

      if (newAttempts >= 3) {
        dispatch({
          type: ForgotPasswordActionType.SET_LOCKED_OUT,
          payload: true,
        });
        dispatch({
          type: ForgotPasswordActionType.SET_ERROR,
          payload: VENDOR_FORGOT_PASSWORD_TEXT.ERR_LOCKED_OUT,
        });
      } else {
        dispatch({
          type: ForgotPasswordActionType.SET_ERROR,
          payload:
            err.message ||
            VENDOR_FORGOT_PASSWORD_TEXT.ERR_RESET_FAILED(3 - newAttempts),
        });
      }
    } finally {
      dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: false });
    }
  };

  const passwordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (
      PASSWORD_REQUIREMENTS_REGEX.LOWERCASE.test(password) &&
      PASSWORD_REQUIREMENTS_REGEX.UPPERCASE.test(password)
    )
      strength++;
    if (PASSWORD_REQUIREMENTS_REGEX.NUMBER.test(password)) strength++;
    if (PASSWORD_REQUIREMENTS_REGEX.SPECIAL_CHAR.test(password)) strength++;

    if (strength <= 2)
      return {
        strength,
        label: VENDOR_FORGOT_PASSWORD_TEXT.STRENGTH_WEAK,
        color: "bg-red-500",
      };
    if (strength <= 3)
      return {
        strength,
        label: VENDOR_FORGOT_PASSWORD_TEXT.STRENGTH_FAIR,
        color: "bg-amber-500",
      };
    if (strength <= 4)
      return {
        strength,
        label: VENDOR_FORGOT_PASSWORD_TEXT.STRENGTH_GOOD,
        color: "bg-lime-500",
      };
    return {
      strength,
      label: VENDOR_FORGOT_PASSWORD_TEXT.STRENGTH_STRONG,
      color: "bg-emerald-500",
    };
  };

  const strength = passwordStrength(state.newPassword);

  return (
    <div className="min-h-screen max-h-screen overflow-y-scroll w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Left Panel - Premium Branding & Visuals */}
      <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 bg-gradient-to-br from-platform-primary via-platform-primary/95 to-platform-secondary text-white relative overflow-hidden flex-col justify-between p-12 lg:p-20">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

        {/* Top Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-wide">Techsonance</span>
        </div>

        {/* Center Messaging */}
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {VENDOR_FORGOT_PASSWORD_TEXT.TITLE}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed font-medium">
              {state.step === 1
                ? VENDOR_FORGOT_PASSWORD_TEXT.DESC_STEP1
                : VENDOR_FORGOT_PASSWORD_TEXT.DESC_STEP2}
            </p>
          </motion.div>
        </div>

        {/* Bottom Progress/Footer area */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-1.5 rounded-full transition-all duration-500 ${state.step >= 1 ? "bg-white" : "bg-white/20"}`}
            ></div>
            <div
              className={`w-12 h-1.5 rounded-full transition-all duration-500 ${state.step >= 2 ? "bg-white" : "bg-white/20"}`}
            ></div>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Vendor Portal</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative bg-white">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden w-full max-w-lg mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-platform-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-platform-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {VENDOR_FORGOT_PASSWORD_TEXT.TITLE}
            </h2>
          </div>
          <p className="text-slate-600 text-sm">
            {state.step === 1
              ? VENDOR_FORGOT_PASSWORD_TEXT.DESC_STEP1
              : VENDOR_FORGOT_PASSWORD_TEXT.DESC_STEP2}
          </p>
        </div>

        <div className="w-full max-w-lg">
          {state.step === 2 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() =>
                dispatch({
                  type: ForgotPasswordActionType.SET_STEP,
                  payload: 1,
                })
              }
              className="mb-8 flex items-center gap-2 text-slate-500 hover:text-platform-primary transition-colors text-sm font-medium cursor-pointer border-none bg-transparent group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-platform-primary/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              {VENDOR_FORGOT_PASSWORD_TEXT.BTN_BACK}
            </motion.button>
          )}

          <AnimatePresence mode="wait">
            {state.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium">{state.error}</p>
              </motion.div>
            )}

            {state.successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-start gap-3 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                <p className="text-sm font-medium">{state.successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {state.step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRequestOtp}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    {VENDOR_FORGOT_PASSWORD_TEXT.LBL_EMAIL}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-platform-primary transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={state.email}
                      onChange={(e) =>
                        dispatch({
                          type: ForgotPasswordActionType.SET_EMAIL,
                          payload: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-platform-focus-ring focus:border-platform-primary outline-none transition-all text-slate-700 placeholder:text-slate-400 text-sm font-medium"
                      placeholder={VENDOR_FORGOT_PASSWORD_TEXT.PH_EMAIL}
                    />
                  </div>
                  <p className="text-xs text-slate-500 pt-1 font-medium">
                    {VENDOR_FORGOT_PASSWORD_TEXT.HINT_EMAIL}
                  </p>
                </div>

                {state.isPendingBlocked ? (
                  <button
                    type="button"
                    onClick={handleResendTempPassword}
                    disabled={state.isLoading || !state.email}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer border-none mt-4"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend Temporary Password"
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={
                      state.isLoading ||
                      !state.email ||
                      state.resendCooldown > 0
                    }
                    className="w-full flex items-center justify-center gap-2 bg-platform-primary text-white hover:bg-platform-secondary py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-platform-primary group cursor-pointer border-none mt-4"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {VENDOR_FORGOT_PASSWORD_TEXT.BTN_SENDING}
                      </>
                    ) : (
                      <>
                        {state.resendCooldown > 0
                          ? VENDOR_FORGOT_PASSWORD_TEXT.BTN_WAIT(
                              state.resendCooldown,
                            )
                          : VENDOR_FORGOT_PASSWORD_TEXT.BTN_SEND}
                        {state.resendCooldown === 0 && (
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        )}
                      </>
                    )}
                  </button>
                )}
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                className="space-y-6"
              >
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {VENDOR_FORGOT_PASSWORD_TEXT.LBL_CODE_SENT}
                    </p>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-platform-primary" />
                      {state.email}
                    </p>
                  </div>
                  {state.otpExpiryTime && (
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full animate-pulse ${timeLeft === "00:00" ? "bg-red-500" : "bg-amber-500"}`}
                      ></div>
                      <span
                        className={`text-xs font-bold ${timeLeft === "00:00" ? "text-red-500" : "text-amber-600"}`}
                      >
                        {timeLeft}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* OTP Field */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {VENDOR_FORGOT_PASSWORD_TEXT.LBL_OTP}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-platform-primary transition-colors">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={state.otp}
                        onChange={(e) =>
                          dispatch({
                            type: ForgotPasswordActionType.SET_OTP,
                            payload: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-platform-focus-ring focus:border-platform-primary outline-none transition-all tracking-[0.4em] font-mono text-lg text-center font-bold text-slate-800"
                        placeholder={VENDOR_FORGOT_PASSWORD_TEXT.PH_OTP}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs font-medium text-slate-500">
                        {state.otp.length}
                        {VENDOR_FORGOT_PASSWORD_TEXT.HINT_OTP}
                      </p>
                      <button
                        type="button"
                        disabled={state.resendCooldown > 0 || state.isLockedOut}
                        onClick={(e) => {
                          if (
                            state.resendCooldown === 0 &&
                            !state.isLockedOut
                          ) {
                            handleRequestOtp(e as unknown as React.SubmitEvent);
                          }
                        }}
                        className="text-xs text-platform-primary hover:text-platform-secondary font-bold transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {state.resendCooldown > 0
                          ? VENDOR_FORGOT_PASSWORD_TEXT.BTN_RESEND_WAIT(
                              state.resendCooldown,
                            )
                          : VENDOR_FORGOT_PASSWORD_TEXT.BTN_RESEND}
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {VENDOR_FORGOT_PASSWORD_TEXT.LBL_NEW_PASS}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-platform-primary transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={state.showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={state.newPassword}
                        onChange={(e) =>
                          dispatch({
                            type: ForgotPasswordActionType.SET_NEW_PASSWORD,
                            payload: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-16 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-platform-focus-ring focus:border-platform-primary outline-none transition-all text-slate-800 text-sm font-medium"
                        placeholder={VENDOR_FORGOT_PASSWORD_TEXT.PH_NEW_PASS}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: ForgotPasswordActionType.TOGGLE_PASSWORD_VISIBILITY,
                          })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-platform-primary text-xs font-bold cursor-pointer border-none bg-transparent transition-colors"
                      >
                        {state.showPassword
                          ? VENDOR_FORGOT_PASSWORD_TEXT.BTN_HIDE
                          : VENDOR_FORGOT_PASSWORD_TEXT.BTN_SHOW}
                      </button>
                    </div>
                  </div>
                </div>

                {state.newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(strength.strength / 5) * 100}%`,
                          }}
                          className={`h-full ${strength.color} transition-all duration-300`}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                        {strength.label}
                      </span>
                    </div>
                    <ul className="text-xs font-medium text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      <li
                        className={`flex items-center gap-1.5 ${state.newPassword.length >= 8 ? "text-emerald-600" : ""}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${state.newPassword.length >= 8 ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></div>
                        {VENDOR_FORGOT_PASSWORD_TEXT.HINT_PASS_LENGTH}
                      </li>
                      <li
                        className={`flex items-center gap-1.5 ${PASSWORD_REQUIREMENTS_REGEX.UPPERCASE.test(state.newPassword) && PASSWORD_REQUIREMENTS_REGEX.LOWERCASE.test(state.newPassword) ? "text-emerald-600" : ""}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${PASSWORD_REQUIREMENTS_REGEX.UPPERCASE.test(state.newPassword) && PASSWORD_REQUIREMENTS_REGEX.LOWERCASE.test(state.newPassword) ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></div>
                        {VENDOR_FORGOT_PASSWORD_TEXT.HINT_PASS_MIX}
                      </li>
                      <li
                        className={`flex items-center gap-1.5 ${PASSWORD_REQUIREMENTS_REGEX.NUMBER.test(state.newPassword) ? "text-emerald-600" : ""}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${PASSWORD_REQUIREMENTS_REGEX.NUMBER.test(state.newPassword) ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></div>
                        {VENDOR_FORGOT_PASSWORD_TEXT.HINT_PASS_NUM}
                      </li>
                    </ul>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={
                    state.isLoading ||
                    state.otp.length !== 6 ||
                    !state.newPassword ||
                    state.newPassword.length < 8 ||
                    state.isLockedOut ||
                    timeLeft === "00:00"
                  }
                  className="w-full flex items-center justify-center gap-2 bg-platform-primary text-white hover:bg-platform-secondary py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-platform-primary group cursor-pointer border-none mt-6"
                >
                  {state.isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {VENDOR_FORGOT_PASSWORD_TEXT.BTN_RESETTING}
                    </>
                  ) : (
                    <>
                      {VENDOR_FORGOT_PASSWORD_TEXT.BTN_RESET}
                      <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm font-medium text-slate-600">
              {VENDOR_FORGOT_PASSWORD_TEXT.LBL_REMEMBER}
              <button
                onClick={() => router.push(VEDNOR_LOGIN_PATH)}
                className="text-platform-primary hover:text-platform-secondary font-bold hover:underline transition-colors bg-transparent border-none cursor-pointer ml-1"
              >
                {VENDOR_FORGOT_PASSWORD_TEXT.BTN_BACK_LOGIN}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
