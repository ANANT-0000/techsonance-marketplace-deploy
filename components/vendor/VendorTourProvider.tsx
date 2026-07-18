"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Joyride, TooltipRenderProps, EventData, STATUS } from "react-joyride";
import {
  dashboardTourSteps,
  ordersTourSteps,
  productsDirectoryTourSteps,
  productCreationTourSteps,
  variantCreationTourSteps,
  cmsTourSteps,
  VendorTourStep,
} from "@/constants/vendorTourSteps";

import { completeVendorTour } from "@/utils/vendorApiClient";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { VendorUser } from "@/utils/Types";
import { updateUserProfile } from "@/lib/features/auth/authSlice";
import { USER_STORAGE_KEY } from "@/constants";

interface VendorTourContextType {
  startVendorTour: (tourName: string) => void;
  // Fallback for easy migration from startOnborda
  startOnborda: (tourName: string) => void;
}

const VendorTourContext = createContext<VendorTourContextType | undefined>(undefined);

export const useVendorTour = () => {
  const context = useContext(VendorTourContext);
  if (!context) {
    throw new Error("useVendorTour must be used within a VendorTourProvider");
  }
  return context;
};

// Custom Tour Card Component for premium aesthetics
const CustomTourCard = ({
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) => {
  // We typecast step to access our custom properties like icon and title
  const customStep = step as VendorTourStep;
  
  return (
    <motion.div
      {...tooltipProps}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-50 max-w-sm rounded-3xl bg-white p-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] border border-slate-100"
    >
      <button
        {...closeProps}
        className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <X size={16} strokeWidth={2.5} />
      </button>

      <div className="mb-5 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-100/50 text-2xl text-indigo-600">
          {customStep.icon || "✨"}
        </span>
        <div>
          <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight">
            {customStep.title}
          </h3>
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
            Step {index + 1} of {size}
          </p>
        </div>
      </div>

      <div className="mb-8 text-[14px] leading-relaxed text-slate-600">
        {step.content}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-1.5">
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-indigo-600"
                  : "w-1.5 bg-slate-100"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2.5">
          {index > 0 && (
            <button
              {...backProps}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-slate-900/5 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200"
          >
            {index === size - 1 ? "Finish Tour" : "Next Step"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function VendorTourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<VendorTourStep[]>([]);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const user = useAppSelector((state) => state.auth.user) as VendorUser | undefined;
  const token = useAppSelector((state) => state.auth.access_token);
  const dispatch = useAppDispatch();
  
  // Provide a map of all tours
  const tourMap: Record<string, VendorTourStep[]> = {
    dashboard: dashboardTourSteps,
    orders: ordersTourSteps,
    products: productsDirectoryTourSteps,
    productCreation: productCreationTourSteps,
    variantCreation: variantCreationTourSteps,
    cms: cmsTourSteps,
  };

  const startVendorTour = useCallback((tourName: string) => {
    if (tourMap[tourName]) {
      setSteps(tourMap[tourName]);
      setCurrentTour(tourName);
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (currentTour && user?.vendor_id && token) {
        completeVendorTour(user.vendor_id, currentTour, token).catch(console.error);

        const updatedPreferences = {
          ...user.preferences,
          completed_tours: [...(user.preferences?.completed_tours || []), currentTour]
        };
        const updatedUser = { ...user, preferences: updatedPreferences };

        dispatch(updateUserProfile({ preferences: updatedPreferences }));

        if (typeof window !== "undefined") {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
      }
      setCurrentTour(null);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <VendorTourContext.Provider value={{ startVendorTour, startOnborda: startVendorTour }}>
      {children}
      {isMounted && (
        <Joyride
          steps={steps}
          run={run}
          continuous={true}
          scrollToFirstStep={true}
          onEvent={handleJoyrideCallback}
          tooltipComponent={CustomTourCard}
          options={{
            zIndex: 10000,
            overlayColor: "rgba(0, 0, 0, 0.8)",
            overlayClickAction: false,
          }}
        />
      )}
    </VendorTourContext.Provider>
  );
}
