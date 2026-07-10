'use client';

import React, { useRef, useEffect, KeyboardEvent, ClipboardEvent, useReducer } from 'react';
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

export enum ActionType {
  SET_STEP = 'SET_STEP',
  SET_IS_LOADING = 'SET_IS_LOADING',
  SET_OTP = 'SET_OTP',
  UPDATE_OTP_DIGIT = 'UPDATE_OTP_DIGIT',
  CLEAR_OTP_DIGIT = 'CLEAR_OTP_DIGIT',
  SET_TIME_LEFT = 'SET_TIME_LEFT',
  DECREMENT_TIME = 'DECREMENT_TIME',
  RESET_STATE = 'RESET_STATE',
}

type Action = 
  | { type: ActionType.SET_STEP; payload: Step }
  | { type: ActionType.SET_IS_LOADING; payload: boolean }
  | { type: ActionType.SET_OTP; payload: string[] }
  | { type: ActionType.UPDATE_OTP_DIGIT; payload: { index: number; value: string } }
  | { type: ActionType.CLEAR_OTP_DIGIT; payload: number }
  | { type: ActionType.SET_TIME_LEFT; payload: number }
  | { type: ActionType.DECREMENT_TIME }
  | { type: ActionType.RESET_STATE };

interface State {
  step: Step;
  isLoading: boolean;
  otp: string[];
  timeLeft: number;
}

const initialState: State = {
  step: 'info',
  isLoading: false,
  otp: new Array(6).fill(""),
  timeLeft: 30,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_STEP:
      return { ...state, step: action.payload };
    case ActionType.SET_IS_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionType.SET_OTP:
      return { ...state, otp: action.payload };
    case ActionType.UPDATE_OTP_DIGIT:
      return {
        ...state,
        otp: state.otp.map((d, idx) => (idx === action.payload.index ? action.payload.value : d)),
      };
    case ActionType.CLEAR_OTP_DIGIT:
      return {
        ...state,
        otp: state.otp.map((d, idx) => (idx === action.payload ? "" : d)),
      };
    case ActionType.SET_TIME_LEFT:
      return { ...state, timeLeft: action.payload };
    case ActionType.DECREMENT_TIME:
      return { ...state, timeLeft: state.timeLeft - 1 };
    case ActionType.RESET_STATE:
      return { ...initialState };
    default:
      return state;
  }
}

export function AccountReactivation({
    isOpen,
    onClose,
    onSuccess,
    emailMasked
}: AccountReactivationProps) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                dispatch({ type: ActionType.RESET_STATE });
            }, 300);  
        }
    }, [isOpen]);

    // Timer for Resend OTP
    useEffect(() => {
        if (state.step === 'otp' && state.timeLeft > 0) {
            const timerId = setTimeout(() => dispatch({ type: ActionType.DECREMENT_TIME }), 1000);
            return () => clearTimeout(timerId);
        }
    }, [state.timeLeft, state.step]);

    if (!isOpen) return null;

    // --- Actions ---

    const handleSendCode = async () => {
        dispatch({ type: ActionType.SET_IS_LOADING, payload: true });
        try {
            await AxiosAPI.post(`v1/users/reactivate`, { email: emailMasked });
            dispatch({ type: ActionType.SET_STEP, payload: 'otp' });
            dispatch({ type: ActionType.SET_TIME_LEFT, payload: 30 });
        } catch (error) {
            // Error is logged or handled globally
        } finally {
            dispatch({ type: ActionType.SET_IS_LOADING, payload: false });
        }
    };

    const handleVerifyReactivation = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const otpString = state.otp.join("");
        if (otpString.length !== 6) return;

        dispatch({ type: ActionType.SET_IS_LOADING, payload: true });
        try {
            await AxiosAPI.patch(`v1/users/reactivate/confirm`, { otp: otpString, email: emailMasked });
            dispatch({ type: ActionType.SET_STEP, payload: 'success' });
        } catch (error: any) {
            // Error is logged or handled globally
        } finally {
            dispatch({ type: ActionType.SET_IS_LOADING, payload: false });
        }
    };

    // --- OTP Input Handlers ---
    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;
        dispatch({ type: ActionType.UPDATE_OTP_DIGIT, payload: { index, value: element.value } });
        if (element.value !== "" && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (state.otp[index] === "" && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                dispatch({ type: ActionType.CLEAR_OTP_DIGIT, payload: index });
            }
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pastedData.some(char => isNaN(Number(char)))) return;

        const newOtp = [...state.otp];
        pastedData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        dispatch({ type: ActionType.SET_OTP, payload: newOtp });
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
                    {state.step !== 'success' && (
                        <button 
                            onClick={onClose}
                            disabled={state.isLoading}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* --- STEP 1: INFORMATION --- */}
                    {state.step === 'info' && (
                        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 mb-5 border border-indigo-100">
                                <UserCheck size={36} strokeWidth={2} />
                            </div>
                            <h3 className="text-theme-h5 font-bold text-gray-900 mb-2">
                                {ACCOUNT_REACTIVATION_TEXT.HEADER_INFO}
                            </h3>
                            <p className="text-theme-body-sm text-gray-500 mb-8 px-2 leading-relaxed">
                                {ACCOUNT_REACTIVATION_TEXT.DESC_INFO}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={handleSendCode}
                                    disabled={state.isLoading}
                                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-theme-body-sm shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {state.isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>{ACCOUNT_REACTIVATION_TEXT.BTN_REACTIVATE} <ArrowRight size={16} /></>
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={state.isLoading}
                                    className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-theme-body-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {ACCOUNT_REACTIVATION_TEXT.BTN_CANCEL}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 2: OTP VERIFICATION --- */}
                    {state.step === 'otp' && (
                        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-5 border border-blue-100">
                                <ShieldCheck size={36} strokeWidth={2} />
                            </div>
                            <h3 className="text-theme-h5 font-bold text-gray-900 mb-2">
                                {ACCOUNT_REACTIVATION_TEXT.HEADER_OTP}
                            </h3>
                            <p className="text-theme-body-sm text-gray-500 mb-8 px-2 leading-relaxed">
                                {ACCOUNT_REACTIVATION_TEXT.DESC_OTP_1}<span className="font-semibold text-gray-800">{emailMasked}</span>{ACCOUNT_REACTIVATION_TEXT.DESC_OTP_2}
                            </p>

                            <form onSubmit={handleVerifyReactivation} className="w-full">
                                <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                                    {state.otp.map((data, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength={1}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            value={data}
                                            onChange={(e) => handleChange(e.target, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onPaste={handlePaste}
                                            disabled={state.isLoading}
                                            className="w-11 h-14 sm:w-12 sm:h-14 text-center text-theme-h5 font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={state.isLoading || state.otp.join("").length !== 6}
                                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-theme-body-sm shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {state.isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        ACCOUNT_REACTIVATION_TEXT.BTN_VERIFY
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-theme-body-sm text-gray-500">
                                {ACCOUNT_REACTIVATION_TEXT.RESEND_PROMPT}
                                {state.timeLeft > 0 ? (
                                    <span className="font-medium text-gray-400">{ACCOUNT_REACTIVATION_TEXT.RESEND_IN}{state.timeLeft}s</span>
                                ) : (
                                    <button 
                                        onClick={() => { dispatch({ type: ActionType.SET_TIME_LEFT, payload: 30 }); dispatch({ type: ActionType.SET_OTP, payload: new Array(6).fill("") }); handleSendCode(); }} 
                                        disabled={state.isLoading}
                                        className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                                    >
                                        {ACCOUNT_REACTIVATION_TEXT.RESEND_BTN}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- STEP 3: SUCCESS --- */}
                    {state.step === 'success' && (
                        <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                            <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mb-5 border border-emerald-100">
                                <CheckCircle2 size={48} strokeWidth={2} />
                            </div>
                            <h3 className="text-theme-h4 font-bold text-gray-900 mb-2">
                                {ACCOUNT_REACTIVATION_TEXT.HEADER_SUCCESS}
                            </h3>
                            <p className="text-theme-body-sm text-gray-500 mb-8 px-2 leading-relaxed">
                                {ACCOUNT_REACTIVATION_TEXT.DESC_SUCCESS}
                            </p>

                            <button
                                onClick={onSuccess}
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-theme-body-sm shadow-sm transition-colors flex justify-center items-center gap-2"
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