"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Info } from "lucide-react";
import { AUTH_TEXT, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VALUE } from "@/constants";

export function CookieConsentBanner() {
  const [cookiesBlocked, setCookiesBlocked] = useState<boolean>(false);
  const [consentGranted, setConsentGranted] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detect if cookies are blocked
    if (!navigator.cookieEnabled) {
      setCookiesBlocked(true);
    }
    
    // Check if consent was already given
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== COOKIE_CONSENT_VALUE) {
      setConsentGranted(false);
    }
  }, []);

  if (!mounted) return null;

  if (cookiesBlocked) {
    return (
      <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-red-800 font-semibold text-sm">{AUTH_TEXT.CONSENT.BANNER_BLOCKED_TITLE}</h4>
          <p className="text-red-700 text-xs mt-1 leading-relaxed">
            {AUTH_TEXT.CONSENT.BANNER_BLOCKED_DESC}
          </p>
        </div>
      </div>
    );
  }

  if (!consentGranted) {
    return (
      <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-blue-800 font-semibold text-sm">{AUTH_TEXT.CONSENT.BANNER_POLICY_TITLE}</h4>
          <p className="text-blue-700 text-xs mt-1 leading-relaxed">
            {AUTH_TEXT.CONSENT.BANNER_POLICY_DESC}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
