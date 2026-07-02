"use client";

import React from "react";
import * as LucideIcons from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Configuration & Constants (Zero Hardcoding)
// ─────────────────────────────────────────────────────────────────────────────

export const TRUST_STRIP_CONFIG = {
  INFO_ICON_SIZE: 12,
  ICON_SIZE: 18,
} as const;

export const DEFAULT_TRUST_BADGES = [
  {
    id: "warranty",
    icon: "warranty",
    title: "12+3 Months",
    subtitle: "Warranty",
    showInfo: true,
  },
  {
    id: "gst",
    icon: "gst",
    title: "GST",
    subtitle: "Billing",
    showInfo: false,
  },
  {
    id: "delivery",
    icon: "delivery",
    title: "Free Express",
    subtitle: "Delivery*",
    showInfo: false,
  },
  {
    id: "replacement",
    icon: "replacement",
    title: "7-day",
    subtitle: "Replacement",
    showInfo: false,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2. Custom Illustrated Icon Components (Direct Match for Screenshot Graphics)
// ─────────────────────────────────────────────────────────────────────────────

const WarrantyIcon = () => (
  <div className="relative shrink-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center select-none scale-[0.85] lg:scale-100 transition-transform">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield */}
      <path d="M22 4C29 4 34 6 34 6V18C34 26.5 27.5 32 22 35C16.5 32 10 26.5 10 18V6C10 6 15 4 22 4Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round"/>
      {/* Circular Badge */}
      <circle cx="22" cy="18" r="8" fill="#1E293B"/>
      {/* Inner Badge Text */}
      <text x="22" y="20.5" fill="white" fontSize="7" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">25%</text>
      {/* Bottom Ribbon */}
      <rect x="13" y="26" width="18" height="5" rx="1.5" fill="#0F172A"/>
      <text x="22" y="29.8" fill="white" fontSize="4.2" fontWeight="900" textAnchor="middle" letterSpacing="0.4" fontFamily="sans-serif">EXTRA</text>
    </svg>
  </div>
);

const GstBillingIcon = () => (
  <div className="relative shrink-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center select-none scale-[0.85] lg:scale-100 transition-transform">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Invoice */}
      <rect x="12" y="7" width="20" height="28" rx="2.5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
      <line x1="16" y1="13" x2="28" y2="13" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="18" x2="28" y2="18" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="23" x2="22" y2="23" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
      {/* Circular percentage badge */}
      <circle cx="15" cy="29" r="6.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5"/>
      {/* Small percentage sign */}
      <path d="M13.5 27.5C13.5 27.8 13.7 28 14 28C14.3 28 14.5 27.8 14.5 27.5C14.5 27.2 14.3 27 14 27C13.7 27 13.5 27.2 13.5 27.5ZM14 31L16 27M15.5 30.5C15.5 30.8 15.7 31 16 31C16.3 31 16.5 30.8 16.5 30.5C16.5 30.2 16.3 30 16 30C15.7 30 15.5 30.2 15.5 30.5Z" stroke="#475569" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  </div>
);

const DeliveryIcon = () => (
  <div className="relative shrink-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center select-none scale-[0.85] lg:scale-100 transition-transform">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Truck Cargo Box */}
      <path d="M8 13H24V27H8V13Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
      {/* Cabin */}
      <path d="M24 17H30L34 22V27H24V17Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
      {/* Wheels */}
      <circle cx="14" cy="29" r="3" fill="#1E293B"/>
      <circle cx="28" cy="29" r="3" fill="#1E293B"/>
      {/* Inner FREE badge on Cargo Box */}
      <rect x="10" y="17" width="12" height="6" rx="1" fill="#CBD5E1"/>
      <text x="16" y="21.5" fill="#475569" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">FREE</text>
    </svg>
  </div>
);

const ReplacementIcon = () => (
  <div className="relative shrink-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center select-none scale-[0.85] lg:scale-100 transition-transform">
    <img
      src="/assets/replacement icon.png"
      alt="7-day Replacement"
      className="w-10 h-10 object-contain"
    />
  </div>
);

const SupportIcon = () => (
  <div className="relative shrink-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center select-none scale-[0.85] lg:scale-100 transition-transform">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="18" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
      <path d="M14 24C14 18 18 14 22 14C26 14 30 18 30 24" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="12" y="22" width="4" height="6" rx="1.5" fill="#0F172A"/>
      <rect x="28" y="22" width="4" height="6" rx="1.5" fill="#0F172A"/>
      <path d="M14 26C14 29 17 30 20 28" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const DefaultIcon = () => (
  <div className="relative shrink-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center select-none scale-[0.85] lg:scale-100 transition-transform">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="18" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
      <path d="M22 14V30M14 22H30" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const IconMap: Record<string, React.ComponentType> = {
  warranty: WarrantyIcon,
  gst: GstBillingIcon,
  delivery: DeliveryIcon,
  replacement: ReplacementIcon,
  
  // Map CMS options to custom graphic illustrations
  security: WarrantyIcon,
  shipping: DeliveryIcon,
  quality: GstBillingIcon,
  support: SupportIcon,
  default: DefaultIcon,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Helper normalizer
// ─────────────────────────────────────────────────────────────────────────────

function toIconKey(name: string): string {
  if (!/[_\s-]/.test(name)) {
    return name;
  }
  return name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Main Strip Component
// ─────────────────────────────────────────────────────────────────────────────

export function TrustStrip({ getField }: { getField?: (k: string) => any }) {
  const cmsBadges = getField ? getField("social_proof_badges") : null;
  
  // Fall back to default badges if CMS configuration is missing or holds empty titles (visual placeholder state)
  const hasValidCmsBadges =
    Array.isArray(cmsBadges) &&
    cmsBadges.length > 0 &&
    cmsBadges.some((badge: any) => (badge.title || badge.label || "").trim() !== "");

  if (!hasValidCmsBadges) {
    return null;
  }

  const badgesData = cmsBadges;

  return (
    <section className="trust-strip bg-white border-y border-gray-100 py-3.5 lg:py-6">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-16 xl:px-24">
        <div className="grid grid-cols-4 gap-1 lg:gap-0">
          {badgesData.map((badge: any, index: number) => {
            // Check if we have a custom graphical illustration matching the badge icon type
            const CustomIcon = IconMap[badge.icon];

            // Fallback renderer using standard Lucide icons
            const iconKey = toIconKey(badge.icon || "");
            const LucideIconComponent = (LucideIcons as any)[iconKey] || LucideIcons.HelpCircle;

            // Border styling: clean vertical borders on desktop, none on mobile
            let borderClass = "";
            if (index === 0) {
              borderClass = "lg:border-none lg:pr-6 lg:pl-0";
            } else if (index === 1) {
              borderClass = "lg:border-l lg:border-gray-100 lg:px-6";
            } else if (index === 2) {
              borderClass = "lg:border-l lg:border-gray-100 lg:px-6";
            } else if (index === 3) {
              borderClass = "lg:border-l lg:border-gray-100 lg:pl-6 lg:pr-0";
            }

            return (
              <div
                key={badge.id || badge.title || badge.label || index}
                className={`flex flex-col lg:flex-row items-center lg:items-center text-center lg:text-left gap-1 lg:gap-3.5 ${borderClass}`}
              >
                {/* Visual Icon Box */}
                {CustomIcon ? (
                  <CustomIcon />
                ) : (
                  <div className="shrink-0 w-8 h-8 lg:w-11 lg:h-11 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 scale-[0.8] lg:scale-100 transition-transform">
                    <LucideIconComponent
                      size={TRUST_STRIP_CONFIG.ICON_SIZE}
                      className="text-gray-700"
                      strokeWidth={1.5}
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="flex flex-col items-center lg:items-start">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-900 leading-tight">
                    {badge.title || badge.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500 mt-0.5 flex items-center justify-center lg:justify-start gap-0.5">
                    <span>{badge.subtitle || badge.sub || badge.desc}</span>
                    {badge.showInfo && (
                      <LucideIcons.Info
                        size={TRUST_STRIP_CONFIG.INFO_ICON_SIZE}
                        className="text-gray-400 inline cursor-pointer hover:text-gray-700 transition-colors"
                      />
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}