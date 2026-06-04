"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { changePassword } from "@/utils/authApiClient";
import { updateUserProfile } from "@/lib/features/auth/authSlice";
import { USER_STORAGE_KEY } from "@/constants";
import { authToken } from "@/utils/authToken";

export default function ChangePasswordPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { vendorId } = useParams();
    const token = authToken();
    const { user } = useAppSelector((state: RootState) => state.auth);

    const [password, setPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [showCurrentPass, setShowCurrentPass] = useState(false);

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const userId = user && 'user_id' in user ? user.user_id : null;
    const validatePassword = (pass: string) => {
        return pass.length >= 8;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!password || !confirmPassword) {
            setErrorMsg("Please fill in all fields.");
            setStatus("error");
            return;
        }

        if (!validatePassword(password)) {
            setErrorMsg("Password must be at least 8 characters long.");
            setStatus("error");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            setStatus("error");
            return;
        }

        if (!token) {
            setErrorMsg("Authentication token is missing. Please log in again.");
            setStatus("error");
            return;
        }

        try {
            setStatus("loading");
            const res = await changePassword(userId as string, currentPassword, password, token as string);

            if (res.status === 200) {
                setStatus("success");

                // Update user details in LocalStorage and Redux Auth state
                if (user) {
                    const updatedUser = { ...user, password_change_required: false };
                    localStorage.setItem(USER_STORAGE_KEY || "user", JSON.stringify(updatedUser));
                    dispatch(updateUserProfile({ password_change_required: false }));
                }

                // Redirect to vendor dashboard after 2 seconds
                setTimeout(() => {
                    router.push(`/vendor/${vendorId}`);
                }, 2000);
            } else {
                setErrorMsg(res.message);
                setStatus("error");
            }
        } catch (err: any) {
            setErrorMsg(err.message || "An unexpected error occurred.");
            setStatus("error");
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Secured!</h2>
                        <p className="text-sm text-gray-500 mb-6 max-w-xs">
                            Your password has been successfully updated and encrypted. Redirecting you to the dashboard...
                        </p>
                        <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div>
                        <header className="mb-8">
                            <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                                <Lock size={24} />
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Set a New Password</h1>
                            <p className="text-sm text-gray-500 mt-2">
                                Choose a strong password to replace the temporary one and protect your vendor account.
                            </p>
                        </header>

                        <form onSubmit={handleFormSubmit} className="space-y-5">

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPass ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder:text-gray-300"
                                        disabled={status === "loading"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPass(p => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition"
                                    >
                                        {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder:text-gray-300"
                                        disabled={status === "loading"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(p => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPass ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition placeholder:text-gray-300"
                                        disabled={status === "loading"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(p => !p)}
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
                                    className={`flex-shrink-0 mt-0.5 ${password.length >= 8 ? "text-emerald-500" : "text-gray-350"
                                        }`}
                                />
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Must be at least <span className="font-semibold text-gray-700">8 characters</span> long.
                                </p>
                            </div>

                            {status === "error" && (
                                <div className="flex gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-650 animate-shake">
                                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full bg-[#1a56db] hover:bg-[#1648c0] disabled:opacity-60 text-white font-bold text-sm rounded-2xl py-3.5 shadow-md shadow-blue-100 transition flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {status === "loading" ? (
                                    <>
                                        <span className="block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                        Saving Password...
                                    </>
                                ) : (
                                    <>
                                        Update Password
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
