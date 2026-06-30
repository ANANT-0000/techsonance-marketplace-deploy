'use client';

import { useReducer, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, KeyRound, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { requestPasswordResetOTP, resetPasswordWithOTP } from '@/utils/authApiClient';

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
}

export enum ForgotPasswordActionType {
  SET_STEP = 'SET_STEP',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_SUCCESS = 'SET_SUCCESS',
  SET_EMAIL = 'SET_EMAIL',
  SET_OTP = 'SET_OTP',
  SET_NEW_PASSWORD = 'SET_NEW_PASSWORD',
  TOGGLE_PASSWORD_VISIBILITY = 'TOGGLE_PASSWORD_VISIBILITY',
  RESET_FORM = 'RESET_FORM',
  DECREMENT_COOLDOWN = 'DECREMENT_COOLDOWN',
  START_COOLDOWN = 'START_COOLDOWN',
  INCREMENT_OTP_ATTEMPTS = 'INCREMENT_OTP_ATTEMPTS',
  SET_LOCKED_OUT = 'SET_LOCKED_OUT',
  SET_OTP_EXPIRY = 'SET_OTP_EXPIRY',
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
    | { type: ForgotPasswordActionType.SET_OTP_EXPIRY; payload: number | null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ForgotPasswordActionType.SET_STEP: return { ...state, step: action.payload };
        case ForgotPasswordActionType.SET_LOADING: return { ...state, isLoading: action.payload };
        case ForgotPasswordActionType.SET_ERROR: return { ...state, error: action.payload };
        case ForgotPasswordActionType.SET_SUCCESS: return { ...state, successMessage: action.payload };
        case ForgotPasswordActionType.SET_EMAIL: return { ...state, email: action.payload };
        case ForgotPasswordActionType.SET_OTP: return { ...state, otp: action.payload };
        case ForgotPasswordActionType.SET_NEW_PASSWORD: return { ...state, newPassword: action.payload };
        case ForgotPasswordActionType.TOGGLE_PASSWORD_VISIBILITY: return { ...state, showPassword: !state.showPassword };
        case ForgotPasswordActionType.RESET_FORM: return { ...state, step: 1, otp: '', error: null, successMessage: null, otpAttempts: 0, isLockedOut: false, otpExpiryTime: null };
        case ForgotPasswordActionType.DECREMENT_COOLDOWN: return { ...state, resendCooldown: Math.max(0, state.resendCooldown - 1) };
        case ForgotPasswordActionType.START_COOLDOWN: return { ...state, resendCooldown: action.payload };
        case ForgotPasswordActionType.INCREMENT_OTP_ATTEMPTS: return { ...state, otpAttempts: state.otpAttempts + 1 };
        case ForgotPasswordActionType.SET_LOCKED_OUT: return { ...state, isLockedOut: action.payload };
        case ForgotPasswordActionType.SET_OTP_EXPIRY: return { ...state, otpExpiryTime: action.payload };
        default: return state;
    }
}

export default function ForgotPasswordClient() {
    const router = useRouter();

    const [state, dispatch] = useReducer(reducer, {
        step: 1,
        isLoading: false,
        error: null,
        successMessage: null,
        email: '',
        otp: '',
        newPassword: '',
        showPassword: false,
        resendCooldown: 0,
        otpAttempts: 0,
        isLockedOut: false,
        otpExpiryTime: null
    });

    const [timeLeft, setTimeLeft] = useState<string>('15:00');

    // Handle timer for resend debounce
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
                    setTimeLeft('00:00');
                    dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: 'OTP has expired. Please request a new one.' });
                } else {
                    const minutes = Math.floor(diff / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [state.otpExpiryTime, state.step]);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: true });
        dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: null });
        dispatch({ type: ForgotPasswordActionType.SET_SUCCESS, payload: null });

        try {
            await requestPasswordResetOTP(state.email);
            dispatch({ type: ForgotPasswordActionType.SET_STEP, payload: 2 });
            dispatch({ type: ForgotPasswordActionType.SET_SUCCESS, payload: 'If this email matches an active profile, a secure 6-digit recovery code has been sent. The token will remain active for 15 minutes.' });
            dispatch({ type: ForgotPasswordActionType.START_COOLDOWN, payload: 60 });
            dispatch({ type: ForgotPasswordActionType.SET_OTP_EXPIRY, payload: Date.now() + 15 * 60 * 1000 }); // 15 minutes
        } catch (err) {
            dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: 'Failed to send OTP. Please check your email and try again.' });
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
            dispatch({ type: ForgotPasswordActionType.SET_SUCCESS, payload: 'Password reset successfully! Redirecting to login...' });

            setTimeout(() => {
                router.push('/auth/customerLogin');
            }, 2000);
        } catch (err: any) {
            const newAttempts = state.otpAttempts + 1;
            dispatch({ type: ForgotPasswordActionType.INCREMENT_OTP_ATTEMPTS });
            
            if (newAttempts >= 3) {
                dispatch({ type: ForgotPasswordActionType.SET_LOCKED_OUT, payload: true });
                dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: 'Maximum attempts reached. For your security, this session has been locked. Please reload the page to try again.' });
            } else {
                dispatch({ type: ForgotPasswordActionType.SET_ERROR, payload: err.message || `Invalid OTP or failed to reset password. (${3 - newAttempts} attempts remaining)` });
            }
        } finally {
            dispatch({ type: ForgotPasswordActionType.SET_LOADING, payload: false });
        }
    };

    const passwordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 3) return { strength, label: 'Fair', color: 'bg-amber-500' };
        if (strength <= 4) return { strength, label: 'Good', color: 'bg-lime-500' };
        return { strength, label: 'Strong', color: 'bg-emerald-500' };
    };

    const strength = passwordStrength(state.newPassword);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-700"
            >
                {/* Header with Gradient using Theme Colors */}
                <div className="bg-gradient-to-br from-theme-primary via-theme-primary/95 to-theme-secondary px-8 py-10 text-theme-primary-foreground relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

                    <div className="relative">
                        {state.step === 2 && (
                            <button
                                onClick={() => dispatch({ type: ForgotPasswordActionType.SET_STEP, payload: 1 })}
                                className="mb-3 flex items-center gap-1 text-theme-primary-foreground/80 hover:text-theme-primary-foreground transition-colors text-theme-body-sm cursor-pointer border-none bg-transparent"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-theme-primary-foreground/20 backdrop-blur-xs flex items-center justify-center">
                                <Lock className="w-6 h-6 text-theme-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="text-theme-h4 font-bold">Reset Password</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-8 h-1 rounded-full ${state.step >= 1 ? 'bg-theme-primary-foreground' : 'bg-theme-primary-foreground/30'}`}></div>
                                    <div className={`w-8 h-1 rounded-full ${state.step >= 2 ? 'bg-theme-primary-foreground' : 'bg-theme-primary-foreground/30'}`}></div>
                                </div>
                            </div>
                        </div>

                        <p className="text-theme-primary-foreground/90 text-theme-body-sm">
                            {state.step === 1
                                ? "Enter your email address and we'll send you a verification code."
                                : "Enter the 6-digit code sent to your email and create a new password."}
                        </p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-8">
                    {/* Alert Messages */}
                    <AnimatePresence mode="wait">
                        {state.error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-theme-body-sm">{state.error}</p>
                            </motion.div>
                        )}

                        {state.successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-start gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-theme-body-sm">{state.successMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Steps */}
                    <AnimatePresence mode="wait">
                        {state.step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleRequestOtp}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-theme-body-sm font-semibold text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-theme-primary transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={state.email}
                                            onChange={(e) => dispatch({ type: ForgotPasswordActionType.SET_EMAIL, payload: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-theme-primary/20 focus:border-theme-primary outline-none transition-all text-slate-700 placeholder:text-slate-400 text-theme-body-sm"
                                            placeholder="manish@example.com"
                                        />
                                    </div>
                                    <p className="text-theme-caption text-slate-500 mt-2">
                                        We'll send a 6-digit verification code to this email
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={state.isLoading || !state.email || state.resendCooldown > 0}
                                    className="w-full flex items-center justify-center gap-2 bg-theme-primary text-theme-primary-foreground hover:bg-theme-secondary py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group cursor-pointer border-none"
                                >
                                    {state.isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending Code...
                                        </>
                                    ) : (
                                        <>
                                            {state.resendCooldown > 0 ? `Wait ${state.resendCooldown}s to Resend` : 'Send Verification Code'}
                                            {state.resendCooldown === 0 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleResetPassword}
                                className="space-y-6"
                            >
                                {/* Email Display */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-theme-caption text-slate-500">Code sent to</p>
                                        {state.otpExpiryTime && (
                                            <span className={`text-theme-caption font-bold ${timeLeft === '00:00' ? 'text-red-500' : 'text-amber-500'}`}>
                                                Expires in: {timeLeft}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-theme-body-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {state.email}
                                    </p>
                                </div>

                                {/* OTP Input */}
                                <div>
                                    <label className="block text-theme-body-sm font-semibold text-slate-700 mb-2">
                                        Verification Code
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-theme-primary transition-colors">
                                            <KeyRound className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={state.otp}
                                            onChange={(e) => dispatch({ type: ForgotPasswordActionType.SET_OTP, payload: e.target.value.replace(/\D/g, '') })}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-theme-primary/20 focus:border-theme-primary outline-none transition-all tracking-[0.5em] font-mono text-theme-h4 text-center font-bold text-slate-700"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-theme-caption text-slate-500">
                                            {state.otp.length}/6 digits entered
                                        </p>
                                        <button
                                            type="button"
                                            disabled={state.resendCooldown > 0 || state.isLockedOut}
                                            onClick={(e) => {
                                                if (state.resendCooldown === 0 && !state.isLockedOut) {
                                                    handleRequestOtp(e);
                                                }
                                            }}
                                            className="text-theme-caption text-theme-primary hover:text-theme-secondary font-semibold bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {state.resendCooldown > 0 ? `Resend code in ${state.resendCooldown}s` : 'Resend code'}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-theme-body-sm font-semibold text-slate-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-theme-primary transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={state.showPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={state.newPassword}
                                            onChange={(e) => dispatch({ type: ForgotPasswordActionType.SET_NEW_PASSWORD, payload: e.target.value })}
                                            className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-theme-primary/20 focus:border-theme-primary outline-none transition-all text-slate-700 text-theme-body-sm"
                                            placeholder="Enter a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => dispatch({ type: ForgotPasswordActionType.TOGGLE_PASSWORD_VISIBILITY })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-theme-primary text-theme-caption font-semibold cursor-pointer border-none bg-transparent"
                                        >
                                            {state.showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {state.newPassword && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-3"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(strength.strength / 5) * 100}%` }}
                                                        className={`h-full ${strength.color} transition-all duration-300`}
                                                    />
                                                </div>
                                                <span className="text-theme-caption font-medium text-slate-600">
                                                    {strength.label}
                                                </span>
                                            </div>
                                            <ul className="text-theme-caption text-slate-500 space-y-1">
                                                <li className={state.newPassword.length >= 8 ? 'text-emerald-600' : ''}>
                                                    ✓ At least 8 characters
                                                </li>
                                                <li className={/[A-Z]/.test(state.newPassword) && /[a-z]/.test(state.newPassword) ? 'text-emerald-600' : ''}>
                                                    ✓ Mix of uppercase & lowercase
                                                </li>
                                                <li className={/\d/.test(state.newPassword) ? 'text-emerald-600' : ''}>
                                                    ✓ Contains numbers
                                                </li>
                                            </ul>
                                        </motion.div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={state.isLoading || state.otp.length !== 6 || !state.newPassword || state.newPassword.length < 8 || state.isLockedOut || timeLeft === '00:00'}
                                    className="w-full flex items-center justify-center gap-2 bg-theme-primary text-theme-primary-foreground hover:bg-theme-secondary py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group cursor-pointer border-none"
                                >
                                    {state.isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Resetting Password...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
                                            <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
                    <p className="text-center text-theme-body-sm text-slate-600">
                        Remember your password?{' '}
                        <button
                            onClick={() => router.push('/auth/customerLogin')}
                            className="text-theme-primary hover:text-theme-secondary font-semibold hover:underline bg-transparent border-none cursor-pointer"
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
            </motion.div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
            >
                <p className="text-theme-caption text-slate-500 flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" />
                    Your password is encrypted and secure
                </p>
            </motion.div>
        </div>
    );
}
