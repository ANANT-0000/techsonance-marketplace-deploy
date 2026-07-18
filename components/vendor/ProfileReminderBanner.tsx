"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { VendorUser } from "@/utils/Types";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { PROFILE_REMINDER_BANNER_TEXT } from "@/constants/vendorText";

export function ProfileReminderBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    const vendorUser = user as VendorUser;
    
    if (vendorUser && vendorUser.vendor_id && vendorUser.is_verified === false) {
      const isDismissed = sessionStorage.getItem("profileReminderDismissed");
      if (!isDismissed) {
        setIsVisible(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("profileReminderDismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative overflow-hidden rounded-2xl mb-6 shadow-xl border border-amber-500/20"
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 dark:from-amber-950/40 dark:via-orange-900/20 dark:to-amber-950/40" />
          
          {/* Shimmer Effect overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.3),transparent)] dark:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.05),transparent)] bg-[length:200%_100%] animate-shimmer" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center p-5 gap-4">
            {/* Icon Box */}
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
              <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg text-white">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100">
                {PROFILE_REMINDER_BANNER_TEXT.TITLE}
              </h3>
              <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-200/80 leading-relaxed max-w-2xl">
                {PROFILE_REMINDER_BANNER_TEXT.DESCRIPTION}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2 sm:mt-0 ml-16 sm:ml-0 w-full sm:w-auto">
              <Link href="/vendor/settings/companyIdentity" className="w-full sm:w-auto block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md transition-all gap-2"
                >
                  {PROFILE_REMINDER_BANNER_TEXT.BTN_VERIFY}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDismiss}
                className="p-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 rounded-full hover:bg-amber-500/10 transition-colors ml-auto sm:ml-0"
              >
                <span className="sr-only">{PROFILE_REMINDER_BANNER_TEXT.BTN_DISMISS}</span>
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
