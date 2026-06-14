"use client";

import React, { useReducer } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { changePassword } from "@/utils/authApiClient";
import { updateUserProfile } from "@/lib/features/auth/authSlice";
import { USER_STORAGE_KEY } from "@/constants";
import { authToken } from "@/utils/authToken";
import { CHANGE_PASSWORD_TEXT } from "@/constants/vendorText";

// ─── useReducer Action Types & State ─────────────────────────────────────────
enum ChangePasswordActionType {
  SET_PASSWORD = "SET_PASSWORD",
  SET_CURRENT_PASSWORD = "SET_CURRENT_PASSWORD",
  SET_CONFIRM_PASSWORD = "SET_CONFIRM_PASSWORD",
  SET_SHOW_PASS = "SET_SHOW_PASS",
  SET_SHOW_CONFIRM_PASS = "SET_SHOW_CONFIRM_PASS",
  SET_SHOW_CURRENT_PASS = "SET_SHOW_CURRENT_PASS",
  SET_STATUS = "SET_STATUS",
  SET_ERROR_MSG = "SET_ERROR_MSG",
}

interface ChangePasswordState {
  password: string;
  currentPassword: string;
  confirmPassword: string;
  showPass: boolean;
  showConfirmPass: boolean;
  showCurrentPass: boolean;
  status: "idle" | "loading" | "success" | "error";
  errorMsg: string;
}

const initialState: ChangePasswordState = {
  password: "",
  currentPassword: "",
  confirmPassword: "",
  showPass: false,
  showConfirmPass: false,
  showCurrentPass: false,
  status: "idle",
  errorMsg: "",
};

type ChangePasswordAction =
  | { type: ChangePasswordActionType.SET_PASSWORD; payload: string }
  | { type: ChangePasswordActionType.SET_CURRENT_PASSWORD; payload: string }
  | { type: ChangePasswordActionType.SET_CONFIRM_PASSWORD; payload: string }
  | { type: ChangePasswordActionType.SET_SHOW_PASS; payload: boolean }
  | { type: ChangePasswordActionType.SET_SHOW_CONFIRM_PASS; payload: boolean }
  | { type: ChangePasswordActionType.SET_SHOW_CURRENT_PASS; payload: boolean }
  | {
      type: ChangePasswordActionType.SET_STATUS;
      payload: "idle" | "loading" | "success" | "error";
    }
  | { type: ChangePasswordActionType.SET_ERROR_MSG; payload: string };

function changePasswordReducer(
  state: ChangePasswordState,
  action: ChangePasswordAction,
): ChangePasswordState {
  switch (action.type) {
    case ChangePasswordActionType.SET_PASSWORD:
      return { ...state, password: action.payload };
    case ChangePasswordActionType.SET_CURRENT_PASSWORD:
      return { ...state, currentPassword: action.payload };
    case ChangePasswordActionType.SET_CONFIRM_PASSWORD:
      return { ...state, confirmPassword: action.payload };
    case ChangePasswordActionType.SET_SHOW_PASS:
      return { ...state, showPass: action.payload };
    case ChangePasswordActionType.SET_SHOW_CONFIRM_PASS:
      return { ...state, showConfirmPass: action.payload };
    case ChangePasswordActionType.SET_SHOW_CURRENT_PASS:
      return { ...state, showCurrentPass: action.payload };
    case ChangePasswordActionType.SET_STATUS:
      return { ...state, status: action.payload };
    case ChangePasswordActionType.SET_ERROR_MSG:
      return { ...state, errorMsg: action.payload };
    default:
      return state;
  }
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = authToken();
  const { user } = useAppSelector((state: RootState) => state.auth);

  const [state, reducerDispatch] = useReducer(
    changePasswordReducer,
    initialState,
  );
  const {
    password,
    currentPassword,
    confirmPassword,
    showPass,
    showConfirmPass,
    showCurrentPass,
    status,
    errorMsg,
  } = state;

  const userId = user && "user_id" in user ? user.user_id : null;
  const validatePassword = (pass: string) => {
    return pass.length >= 8;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reducerDispatch({
      type: ChangePasswordActionType.SET_ERROR_MSG,
      payload: "",
    });

    if (!password || !confirmPassword) {
      reducerDispatch({
        type: ChangePasswordActionType.SET_ERROR_MSG,
        payload: CHANGE_PASSWORD_TEXT.ERRORS.FILL_ALL,
      });
      reducerDispatch({
        type: ChangePasswordActionType.SET_STATUS,
        payload: "error",
      });
      return;
    }

    if (!validatePassword(password)) {
      reducerDispatch({
        type: ChangePasswordActionType.SET_ERROR_MSG,
        payload: CHANGE_PASSWORD_TEXT.ERRORS.LENGTH,
      });
      reducerDispatch({
        type: ChangePasswordActionType.SET_STATUS,
        payload: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      reducerDispatch({
        type: ChangePasswordActionType.SET_ERROR_MSG,
        payload: CHANGE_PASSWORD_TEXT.ERRORS.MISMATCH,
      });
      reducerDispatch({
        type: ChangePasswordActionType.SET_STATUS,
        payload: "error",
      });
      return;
    }

    if (!token) {
      reducerDispatch({
        type: ChangePasswordActionType.SET_ERROR_MSG,
        payload: CHANGE_PASSWORD_TEXT.ERRORS.NO_TOKEN,
      });
      reducerDispatch({
        type: ChangePasswordActionType.SET_STATUS,
        payload: "error",
      });
      return;
    }

    try {
      reducerDispatch({
        type: ChangePasswordActionType.SET_STATUS,
        payload: "loading",
      });
      const res = await changePassword(
        userId as string,
        currentPassword,
        password,
        token as string,
      );

      if (res.status === 200) {
        reducerDispatch({
          type: ChangePasswordActionType.SET_STATUS,
          payload: "success",
        });

        // Update user details in LocalStorage and Redux Auth state
        if (user) {
          const updatedUser = { ...user, password_change_required: false };
          localStorage.setItem(
            USER_STORAGE_KEY || "user",
            JSON.stringify(updatedUser),
          );
          dispatch(updateUserProfile({ password_change_required: false }));
        }

        // Redirect to vendor dashboard after 2 seconds
        setTimeout(() => {
          router.push(`/vendor`);
        }, 2000);
      } else {
        reducerDispatch({
          type: ChangePasswordActionType.SET_ERROR_MSG,
          payload: res.message,
        });
        reducerDispatch({
          type: ChangePasswordActionType.SET_STATUS,
          payload: "error",
        });
      }
    } catch (err: any) {
      reducerDispatch({
        type: ChangePasswordActionType.SET_ERROR_MSG,
        payload: err.message || CHANGE_PASSWORD_TEXT.ERRORS.UNEXPECTED,
      });
      reducerDispatch({
        type: ChangePasswordActionType.SET_STATUS,
        payload: "error",
      });
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-6 bg-gray-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-100 border-gray-150 p-8 relative overflow-hidden transition-all">
        {status === "success" ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600 animate-bounce">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-theme-h4 font-bold text-gray-900 mb-2">
              {CHANGE_PASSWORD_TEXT.SUCCESS_TITLE}
            </h2>
            <p className="text-theme-body-sm text-gray-500 mb-6 max-w-xs">
              {CHANGE_PASSWORD_TEXT.SUCCESS_SUBTITLE}
            </p>
            <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          </div>
        ) : (
          <div>
            <header className="mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                <Lock size={24} />
              </div>
              <h1 className="text-theme-h4 font-extrabold text-gray-900 tracking-tight">
                {CHANGE_PASSWORD_TEXT.TITLE}
              </h1>
              <p className="text-theme-body-sm text-gray-500 mt-2">
                {CHANGE_PASSWORD_TEXT.SUBTITLE}
              </p>
            </header>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-theme-caption font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  {CHANGE_PASSWORD_TEXT.CURRENT_PASSWORD}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) =>
                      reducerDispatch({
                        type: ChangePasswordActionType.SET_CURRENT_PASSWORD,
                        payload: e.target.value,
                      })
                    }
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-2xl text-theme-body-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder:text-gray-300"
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      reducerDispatch({
                        type: ChangePasswordActionType.SET_SHOW_CURRENT_PASS,
                        payload: !showCurrentPass,
                      })
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition"
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-theme-caption font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  {CHANGE_PASSWORD_TEXT.NEW_PASSWORD}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) =>
                      reducerDispatch({
                        type: ChangePasswordActionType.SET_PASSWORD,
                        payload: e.target.value,
                      })
                    }
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-2xl text-theme-body-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder:text-gray-300"
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      reducerDispatch({
                        type: ChangePasswordActionType.SET_SHOW_PASS,
                        payload: !showPass,
                      })
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-theme-caption font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  {CHANGE_PASSWORD_TEXT.CONFIRM_PASSWORD}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      reducerDispatch({
                        type: ChangePasswordActionType.SET_CONFIRM_PASSWORD,
                        payload: e.target.value,
                      })
                    }
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-2xl text-theme-body-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder:text-gray-300"
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      reducerDispatch({
                        type: ChangePasswordActionType.SET_SHOW_CONFIRM_PASS,
                        payload: !showConfirmPass,
                      })
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 transition"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Requirements info */}
              <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 border border-gray-100">
                <Check
                  size={16}
                  className={`flex-shrink-0 mt-0.5 ${password.length >= 8 ? "text-emerald-500" : "text-gray-350"}`}
                />
                <p className="text-theme-caption text-gray-500 leading-relaxed">
                  {CHANGE_PASSWORD_TEXT.REQUIRED_LENGTH}
                </p>
              </div>

              {status === "error" && (
                <div className="flex gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-theme-body-sm text-red-650 animate-shake">
                  <AlertCircle
                    size={18}
                    className="flex-shrink-0 mt-0.5 text-red-500"
                  />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#1a56db] hover:bg-[#1648c0] disabled:opacity-60 text-white font-bold text-theme-body-sm rounded-2xl py-3.5 shadow-md shadow-blue-100 transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {status === "loading" ? (
                  <>
                    <span className="block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {CHANGE_PASSWORD_TEXT.SAVING}
                  </>
                ) : (
                  <>
                    {CHANGE_PASSWORD_TEXT.UPDATE_PASSWORD}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
