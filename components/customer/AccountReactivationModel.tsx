'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, X, Mail, ArrowRight } from 'lucide-react';
import AxiosAPI from '@/lib/axios';
import { ACCOUNT_REACTIVATION_TEXT } from '@/constants/customerText';

interface AccountReactivationProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Triggered when fully reactivated to log them in
    emailMasked: string;
}

type Step = 'info' | 'otp' | 'success';

export function AccountReactivation({
    isOpen,
    onClose,
    onSuccess,
    emailMasked
}: AccountReactivationProps) {
    const [step, setStep] = useState<Step>('info');
    const [isLoading, setIsLoading] = useState(false);
    
    // OTP State
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);

    // Reset  when closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('info');
                setOtp(new Array(6).fill(""));
                setTimeLeft(30);
            }, 300);  
        }
    }, [isOpen]);

    // Timer for Resend OTP
    useEffect(() => {
        if (step === 'otp' && timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft, step]);

    if (!isOpen) return null;

    // --- Actions ---

    const handleSendCode = async () => {
        setIsLoading(true);
        await AxiosAPI.post(`v1/users/reactivate`, { email: emailMasked })
        setIsLoading(false);
        setStep('otp');
        setTimeLeft(30);
    };

    const handleVerifyReactivation = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) return;

        setIsLoading(true);
        await AxiosAPI.patch(`v1/users/reactivate/confirm`, { otp: otpString ,email:emailMasked})
        .catch((error) => {
            // Error handling logic
        })
        
        setIsLoading(false);
        setStep('success');
    };

    // --- OTP Input Handlers ---
    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.value !== "" && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                setOtp([...otp.map((d, idx) => (idx === index ? "" : d))]);
            }
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pastedData.some(char => isNaN(Number(char)))) return;

        const newOtp = [...otp];
        pastedData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 md:p-8 relative">
                    
                    {/* Hide close button on success step to force them to click Continue */}
                    {step !== 'success' && (
                        <button 
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* --- STEP 1: INFORMATION --- */}
                    {step === 'info' && (
                        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 mb-5 border border-indigo-100">
                                <UserCheck size={36} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {ACCOUNT_REACTIVATION_TEXT.HEADER_INFO}
                            </h3>
                            <p className="text-sm text-gray-500 mb-8 px-2 leading-relaxed">
                                {ACCOUNT_REACTIVATION_TEXT.DESC_INFO}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={handleSendCode}
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>{ACCOUNT_REACTIVATION_TEXT.BTN_REACTIVATE} <ArrowRight size={16} /></>
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {ACCOUNT_REACTIVATION_TEXT.BTN_CANCEL}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 2: OTP VERIFICATION --- */}
                    {step === 'otp' && (
                        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-5 border border-blue-100">
                                <ShieldCheck size={36} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {ACCOUNT_REACTIVATION_TEXT.HEADER_OTP}
                            </h3>
                            <p className="text-sm text-gray-500 mb-8 px-2 leading-relaxed">
                                {ACCOUNT_REACTIVATION_TEXT.DESC_OTP_1}<span className="font-semibold text-gray-800">{emailMasked}</span>{ACCOUNT_REACTIVATION_TEXT.DESC_OTP_2}
                            </p>

                            <form onSubmit={handleVerifyReactivation} className="w-full">
                                <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                                    {otp.map((data, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength={1}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            value={data}
                                            onChange={(e) => handleChange(e.target, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onPaste={handlePaste}
                                            disabled={isLoading}
                                            className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.join("").length !== 6}
                                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        ACCOUNT_REACTIVATION_TEXT.BTN_VERIFY
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-sm text-gray-500">
                                {ACCOUNT_REACTIVATION_TEXT.RESEND_PROMPT}
                                {timeLeft > 0 ? (
                                    <span className="font-medium text-gray-400">{ACCOUNT_REACTIVATION_TEXT.RESEND_IN}{timeLeft}s</span>
                                ) : (
                                    <button 
                                        onClick={() => { setTimeLeft(30); setOtp(new Array(6).fill("")); handleSendCode(); }} 
                                        disabled={isLoading}
                                        className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                                    >
                                        {ACCOUNT_REACTIVATION_TEXT.RESEND_BTN}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- STEP 3: SUCCESS --- */}
                    {step === 'success' && (
                        <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                            <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mb-5 border border-emerald-100">
                                <CheckCircle2 size={48} strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {ACCOUNT_REACTIVATION_TEXT.HEADER_SUCCESS}
                            </h3>
                            <p className="text-sm text-gray-500 mb-8 px-2 leading-relaxed">
                                {ACCOUNT_REACTIVATION_TEXT.DESC_SUCCESS}
                            </p>

                            <button
                                onClick={onSuccess}
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors flex justify-center items-center gap-2"
                            >
                                {ACCOUNT_REACTIVATION_TEXT.BTN_CONTINUE} <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}