"use client";

import React, { useState, useEffect, useRef } from "react";
import { isAxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Mail, ShieldCheck } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import AxiosAPI from "@/lib/axios";
import { updateUserProfile } from "@/lib/features/auth/authSlice";
import { USER_STORAGE_KEY } from "@/constants";

export default function VerifyEmailClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);

  const [otp, setOtp] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [codeSentMessage, setCodeSentMessage] = useState<string | null>(null);
  
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setError(null);
    setCodeSentMessage(null);
    setIsSendingCode(true);

    try {
      const response = await AxiosAPI.post("/vendor/send-verification-otp");
      if (response.status === 200 || response.status === 201) {
        setCodeSentMessage("Verification code has been sent to your email.");
        startCooldown();
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to send verification code. Please try again.");
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await AxiosAPI.post("/vendor/verify-email", { otp });

      if (response.status === 200 || response.status === 201) {
        setSuccess("Email verified successfully! Redirecting to dashboard...");
        
        // Update Redux state
        dispatch(updateUserProfile({ vendor_status: 'ACTIVE', user_status: 'ACTIVE' }));
        
        // Update local storage
        if (user) {
          const updatedUser = { ...user, vendor_status: 'ACTIVE', user_status: 'ACTIVE' };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }

        setTimeout(() => {
          router.replace("/vendor/dashboard");
        }, 1500);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to verify email. The code might be incorrect or expired.");
      } else {
        setError("Failed to verify email. The code might be incorrect or expired.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-platform-primary to-blue-500" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
              <Mail className="w-8 h-8 text-platform-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Verify Your Email</h1>
            <p className="text-slate-500 text-sm">
              We need to verify your email address before you can access the vendor dashboard and start selling.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-start gap-3 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                <p className="text-sm font-medium">{success}</p>
              </motion.div>
            )}

            {codeSentMessage && !success && !error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 flex items-start gap-3 shadow-sm"
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                <p className="text-sm font-medium">{codeSentMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <button
              onClick={handleSendCode}
              disabled={isSendingCode || cooldown > 0 || !!success}
              className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend Code in ${cooldown}s`
              ) : (
                "Send Verification Code"
              )}
            </button>

            <form onSubmit={handleVerify} className="space-y-5 pt-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-2xl bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-platform-focus-ring focus:border-platform-primary outline-none transition-all text-slate-700 font-bold placeholder:tracking-normal placeholder:font-normal placeholder:text-base placeholder:text-slate-400"
                  placeholder="------"
                  disabled={!!success || isVerifying}
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || otp.length !== 6 || !!success}
                className="w-full flex items-center justify-center gap-2 bg-platform-primary text-white hover:bg-platform-secondary py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none mt-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
