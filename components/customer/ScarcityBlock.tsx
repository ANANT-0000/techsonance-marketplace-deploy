'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Clock, Flame, ArrowRight } from 'lucide-react';

export interface ScarcityBlockProps {
  timer_title?: string;
  expires_at?: string; // ISO date string, e.g. '2026-12-31T23:59:59'
  alert_text?: string;
  alert_bg?: string; // Hex color, e.g. '#be185d'
  alert_text_color?: string; // Hex color, e.g. '#ffffff'
  btn_text?: string;
  btn_link?: string;
}

export function ScarcityBlock({
  timer_title = 'FLASH SALE ENDS IN',
  expires_at,
  alert_text = 'Use coupon FIRST10 for an extra 10% off your order!',
  alert_bg = '#ef4444',
  alert_text_color = '#ffffff',
  btn_text = 'Shop the Sale',
  btn_link = '/store'
}: ScarcityBlockProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    // If no expiration date is provided, set a default of 2 hours from now
    const targetDate = expires_at
      ? new Date(expires_at).getTime()
      : new Date().getTime() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000; // 2h 45m default

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expires_at]);

  const padZero = (num: number) => String(num).padStart(2, '0');

  return (
    <section className="py-12 px-6 lg:px-16 xl:px-24 bg-[#faf9f6]">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-6">
        
        {/* Urgent Promo Alert Banner */}
        {alert_text && (
          <div
            style={{ backgroundColor: alert_bg, color: alert_text_color }}
            className="w-full py-4 px-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md relative overflow-hidden group"
          >
            {/* Shimmer Effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center animate-pulse shrink-0">
                <Flame size={16} />
              </span>
              <p className="text-sm font-bold tracking-wide text-center sm:text-left leading-normal">
                {alert_text}
              </p>
            </div>
            
            <Link href={btn_link}>
              <span className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap">
                {btn_text} <ArrowRight size={13} />
              </span>
            </Link>
          </div>
        )}

        {/* Countdown Timer Block */}
        {!timeLeft.isExpired && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <Clock size={24} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 tracking-[0.25em] uppercase mb-1">
                  {timer_title}
                </h3>
                <p className="text-sm text-slate-500">
                  Limited stock available. Secure your favorites before time runs out.
                </p>
              </div>
            </div>

            {/* Timer Digits */}
            <div className="flex items-center gap-3 sm:gap-4 select-none">
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HRS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={item.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 border border-slate-800 text-white rounded-2xl flex items-center justify-center font-mono text-xl sm:text-2xl font-bold shadow-lg shadow-slate-950/10 relative overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2 border-b border-white/5" />
                      {padZero(item.val)}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 tracking-wider mt-2">
                      {item.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <span className="text-2xl font-black text-slate-350 ml-3 sm:ml-4 -mt-6 animate-pulse">
                      :
                    </span>
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
