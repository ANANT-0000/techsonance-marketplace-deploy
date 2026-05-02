'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, KeyRound, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { requestPasswordResetOTP, resetPasswordWithOTP } from '@/utils/authApiClient';

export default function ForgotPasswordForm() {
    const router = useRouter();

    // Flow State
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await requestPasswordResetOTP(email);
            setStep(2);
            setSuccessMessage('An OTP has been sent to your email.');
        } catch (err) {
            setError('Failed to send OTP. Please check your email and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await resetPasswordWithOTP(email, otp, newPassword);
            setSuccessMessage('Password reset successfully! Redirecting to login...');

            setTimeout(() => {
                router.push('/auth/customerLogin');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP or failed to reset password.');
        } finally {
            setIsLoading(false);
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

    const strength = passwordStrength(newPassword);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
                {/* Header with Gradient */}
                <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 px-8 py-10 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

                    <div className="relative">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="mb-3 flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Reset Password</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                                    <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
                                </div>
                            </div>
                        </div>

                        <p className="text-white/90 text-sm">
                            {step === 1
                                ? "Enter your email address and we'll send you a verification code."
                                : "Enter the 6-digit code sent to your email and create a new password."}
                        </p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-8">
                    {/* Alert Messages */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </motion.div>
                        )}

                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-start gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{successMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Steps */}
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-slate-700 placeholder:text-slate-400"
                                            placeholder="manish@example.com"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        We'll send a 6-digit verification code to this email
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending Code...
                                        </>
                                    ) : (
                                        <>
                                            Send Verification Code
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                                    <p className="text-xs text-slate-500 mb-1">Code sent to</p>
                                    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {email}
                                    </p>
                                </div>

                                {/* OTP Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Verification Code
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                            <KeyRound className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all tracking-[0.5em] font-mono text-2xl text-center font-bold text-slate-700"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-slate-500">
                                            {otp.length}/6 digits entered
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep(1);
                                                setOtp('');
                                                setError(null);
                                            }}
                                            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                        >
                                            Resend code
                                        </button>
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-slate-700"
                                            placeholder="Enter a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {newPassword && (
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
                                                <span className="text-xs font-medium text-slate-600">
                                                    {strength.label}
                                                </span>
                                            </div>
                                            <ul className="text-xs text-slate-500 space-y-1">
                                                <li className={newPassword.length >= 8 ? 'text-emerald-600' : ''}>
                                                    ✓ At least 8 characters
                                                </li>
                                                <li className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-emerald-600' : ''}>
                                                    ✓ Mix of uppercase & lowercase
                                                </li>
                                                <li className={/\d/.test(newPassword) ? 'text-emerald-600' : ''}>
                                                    ✓ Contains numbers
                                                </li>
                                            </ul>
                                        </motion.div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6 || !newPassword || newPassword.length < 8}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group"
                                >
                                    {isLoading ? (
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
                    <p className="text-center text-sm text-slate-600">
                        Remember your password?{' '}
                        <button
                            onClick={() => router.push('/auth/customerLogin')}
                            className="text-teal-600 hover:text-teal-700 font-semibold hover:underline"
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
                <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" />
                    Your password is encrypted and secure
                </p>
            </motion.div>
        </div>
    );
}