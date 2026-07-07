"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const CHECKOUT_SESSION_KEY = "checkout_session_token";
export function createCheckoutSession(): string {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(CHECKOUT_SESSION_KEY, token);
    return token;
}

export function useCheckoutSession(redirectTo: string) {
    const router = useRouter();
    const clearCheckoutSession = useRef(false)
    useEffect(() => {
        const sessionToken = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
        if (!sessionToken) {
            toast("Your checkout session has ended. Please start again.", {
                icon: "🛒",
                duration: 4000,
            });
            router.push(redirectTo);
        }
    }, [])
    const clearSession = () => {
        if (clearCheckoutSession.current) return;
        clearCheckoutSession.current = true;
        sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
    }
    return { clearSession };
}