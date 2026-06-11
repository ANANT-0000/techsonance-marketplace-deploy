"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Flame, ArrowRight } from "lucide-react";

export interface ScarcityBlockProps {
  timer_title?: string;
  expires_at?: string;
  alert_text?: string;
  alert_bg?: string;
  alert_text_color?: string;
  btn_text?: string;
  btn_link?: string;
}

import { SCARCITY_BLOCK_DEFAULTS } from "@/constants/storefront";
import { SCARCITY_BLOCK_TEXT } from "@/constants/customerText";

export function ScarcityBlock({
  timer_title,
  expires_at,
  alert_text,
  alert_bg,
  alert_text_color,
  btn_text,
  btn_link,
}: ScarcityBlockProps) {
  const bg = alert_bg ?? SCARCITY_BLOCK_DEFAULTS.alert_bg;
  const textColor = alert_text_color ?? SCARCITY_BLOCK_DEFAULTS.alert_text_color;
  const buttonText = btn_text ?? SCARCITY_BLOCK_DEFAULTS.btn_text;
  const buttonLink = btn_link ?? SCARCITY_BLOCK_DEFAULTS.btn_link;
  const title = timer_title ?? SCARCITY_BLOCK_DEFAULTS.timer_title;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const targetDate = expires_at
      ? new Date(expires_at).getTime()
      : new Date().getTime() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expires_at]);

  const padZero = (num: number) => String(num).padStart(2, "0");
  if (!alert_text || !title || !expires_at) {
    return null;
  }
  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-16 xl:px-24 bg-[#faf9f6]">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-6">
        {/* Urgent Promo Alert Banner */}
        {alert_text && (
          <div
            style={{ backgroundColor: bg, color: textColor }}
            className="w-full py-4 px-4 sm:px-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md relative overflow-hidden group text-center sm:text-left"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center animate-pulse shrink-0">
                <Flame size={16} />
              </span>
              <p className="text-sm font-bold tracking-wide leading-normal">
                {alert_text}
              </p>
            </div>

            <Link href={buttonLink}>
              <span className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap">
                {buttonText} <ArrowRight size={13} />
              </span>
            </Link>
          </div>
        )}

        {/* Countdown Timer Block */}
        {!timeLeft.isExpired && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 shadow-sm text-center md:text-left">
            {/* Left Side: Icon & Copy */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <Clock
                  size={24}
                  className="animate-spin-slow"
                  style={{ animationDuration: "8s" }}
                />
              </div>
              <div className="max-w-xs md:max-w-sm">
                {title && (
                  <h3 className="text-[10px] sm:text-xs font-black text-slate-400 tracking-[0.25em] uppercase mb-1 sm:mb-2">
                    {title}
                  </h3>
                )}
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                  {SCARCITY_BLOCK_TEXT.LIMITED_STOCK}
                </p>
              </div>
            </div>

            {/* Right Side: Timer Digits */}
            <div className="flex items-start justify-center gap-1.5 sm:gap-3 select-none">
              {[
                { label: SCARCITY_BLOCK_TEXT.DAYS, val: timeLeft.days },
                { label: SCARCITY_BLOCK_TEXT.HRS, val: timeLeft.hours },
                { label: SCARCITY_BLOCK_TEXT.MINS, val: timeLeft.minutes },
                { label: SCARCITY_BLOCK_TEXT.SECS, val: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className="flex items-start gap-1.5 sm:gap-3"
                >
                  {/* Timer Circle & Label */}
                  <div className="flex flex-col items-center gap-2">
                    {/* Sizing scales dynamically: w-12 on mobile up to w-16 on desktop */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-900 border border-slate-800 text-white rounded-full flex items-center justify-center font-mono text-lg sm:text-xl md:text-2xl font-bold shadow-lg shadow-slate-950/10 relative overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2 border-b border-white/5" />
                      {padZero(item.val)}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-wider">
                      {item.label}
                    </span>
                  </div>

                  {/* Safely aligned Colons (no negative margins) */}
                  {idx < 3 && (
                    <div className="flex flex-col justify-start pt-2.5 sm:pt-3 md:pt-4">
                      <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-300 animate-pulse">
                        :
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
