"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import AxiosAPI from "@/lib/axios";
import { VENDOR_SET_PASSWORD_TEXT } from "@/constants/authText";
import { loginSuccess } from "@/lib/features/auth/authSlice";

export function SetTemporaryVendorPassword({
  embedded = false,
  onSuccess,
}: { embedded?: boolean; onSuccess?: () => void } = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, access_token, refresh_token, role } = useAppSelector(
    (state: RootState) => state.auth,
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(VENDOR_SET_PASSWORD_TEXT.ERR_PASSWORDS_MISMATCH);
      return;
    }

    const actualUser = user && "user" in user ? (user as any).user : user;
    const userId =
      actualUser &&
      ("id" in actualUser
        ? (actualUser as any).id
        : "user_id" in actualUser
          ? (actualUser as any).user_id
          : null);

    if (!userId) {
      setError(VENDOR_SET_PASSWORD_TEXT.ERR_SESSION_INVALID);
      return;
    }

    setIsLoading(true);
    try {
      const response = await AxiosAPI.post(
        `/v1/users/change-password/${userId}`,
        {
          newPassword,
        },
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(VENDOR_SET_PASSWORD_TEXT.MSG_PASSWORD_UPDATED);
        if (user && access_token && refresh_token && role) {
          const actualUser = "user" in user ? (user as any).user : user;
          dispatch(
            loginSuccess({
              user: {
                ...user,
                ...("user" in user ? { user: { ...actualUser } } : {}),
              },
              access_token,
              refresh_token,
              role,
            }),
          );
        }
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.replace("/vendor");
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          VENDOR_SET_PASSWORD_TEXT.ERR_UPDATE_FAILED,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? "w-full"
          : "flex-1 flex flex-col items-center justify-center p-6 bg-white min-h-full"
      }
    >
      <motion.div
        initial={embedded ? { opacity: 0, x: 20 } : { opacity: 0, scale: 0.95 }}
        animate={embedded ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={
          embedded
            ? "w-full"
            : "w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        }
      >
        <div className={embedded ? "py-2" : "p-12"}>
          <div className="mb-7">
            <p className="text-theme-xxs font-semibold tracking-widest uppercase text-gray-400 mb-5">
              {VENDOR_SET_PASSWORD_TEXT.HEADING_SECURE_ACCOUNT}
            </p>
            <h1 className="text-theme-h4 font-bold text-gray-900 mb-1">
              {VENDOR_SET_PASSWORD_TEXT.HEADING_SET_NEW_PASSWORD}
            </h1>
            <p className="text-theme-body-sm text-gray-500">
              {VENDOR_SET_PASSWORD_TEXT.DESC_SET_NEW_PASSWORD}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-start gap-3 shadow-sm"
                role="status"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                <p className="text-sm font-medium">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-theme-caption font-semibold text-gray-600 mb-1.5 tracking-wide">
                {VENDOR_SET_PASSWORD_TEXT.LABEL_NEW_PASSWORD}
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-theme-body-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-300"
                  placeholder={VENDOR_SET_PASSWORD_TEXT.PH_NEW_PASSWORD}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition focus:outline-none"
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-theme-caption font-semibold text-gray-600 mb-1.5 tracking-wide">
                {VENDOR_SET_PASSWORD_TEXT.LABEL_CONFIRM_PASSWORD}
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-theme-body-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-300"
                  placeholder={VENDOR_SET_PASSWORD_TEXT.PH_CONFIRM_PASSWORD}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition focus:outline-none"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isLoading || !newPassword || !confirmPassword || !!success
              }
              className="w-full bg-platform-primary hover:bg-platform-secondary text-white font-bold rounded-xl py-3.5 transition shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {VENDOR_SET_PASSWORD_TEXT.BTN_UPDATING}
                </>
              ) : (
                VENDOR_SET_PASSWORD_TEXT.BTN_UPDATE_PASSWORD
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
