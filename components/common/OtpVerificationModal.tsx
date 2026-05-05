'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Mail, X, ShieldAlert } from 'lucide-react';

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => void;
    onResend: () => void;
    emailMasked?: string;
    isLoading?: boolean;
    actionType?: 'deactivate' | 'delete' | 'verify'; // Changes colors slightly
}

export function OtpVerificationModal({
    isOpen,
    onClose,
    onVerify,
    onResend,
    emailMasked,
    isLoading = false,
    actionType = 'verify'
}: OtpVerificationModalProps) {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);

    // Timer for Resend OTP
    useEffect(() => {
        if (!isOpen) {
            setOtp(new Array(6).fill(""));
            setTimeLeft(30);
            return;
        }

        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft, isOpen]);

    if (!isOpen) return null;

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

     
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
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
        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length === 6) {
            onVerify(otpString);
        }
    };

    const handleResendClick = () => {
        setTimeLeft(30);
        setOtp(new Array(6).fill(""));
        onResend();
        inputRefs.current[0]?.focus();
    };

    const isDanger = actionType === 'deactivate' || actionType === 'delete';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 relative">
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mt-2">
                        <div className={`p-4 rounded-full mb-4 ${isDanger ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isDanger ? <ShieldAlert size={32} /> : <Mail size={32} />}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Security Verification
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 px-2">
                            To complete this action, please enter the 6-digit verification code sent to <span className="font-semibold text-gray-800">{emailMasked}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
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
                                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.join("").length !== 6}
                                className={`w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2 ${
                                    isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify & Continue"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-sm text-gray-500">
                            Didn't receive the code?{" "}
                            {timeLeft > 0 ? (
                                <span className="font-medium text-gray-400">Resend in {timeLeft}s</span>
                            ) : (
                                <button 
                                    onClick={handleResendClick} 
                                    disabled={isLoading}
                                    className="font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}