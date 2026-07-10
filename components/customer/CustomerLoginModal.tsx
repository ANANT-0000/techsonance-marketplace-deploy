"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { closeLoginModal } from "@/lib/features/auth/authSlice";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import CustomerLoginForm from "./CustomerLoginForm";
import CustomerRegisterForm from "./CustomerRegisterForm";

export function CustomerLoginModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoginModalOpen } = useAppSelector((state: RootState) => state.auth);
  const [view, setView] = useState<"login" | "register">("login");

  useEffect(() => {
    if (isLoginModalOpen) {
      setView("login");
      dispatch(toggleCartSidebar("close"));
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginModalOpen]);

  const handleClose = () => {
    dispatch(closeLoginModal());
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/customer") &&
      window.location.pathname !== "/customer/cart"
    ) {
      router.push("/");
    }
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-default"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10 p-6 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Form */}
            <div className="mt-2">
              {view === "login" ? (
                <CustomerLoginForm
                  isModal={true}
                  onSuccess={handleClose}
                  onToggleRegister={() => setView("register")}
                />
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-theme-h4 font-bold text-gray-800 mb-1.5">
                      Create Account
                    </h2>
                    <p className="text-theme-body-sm text-slate-600">
                      Join us to access checkouts, wishlists, and more.
                    </p>
                  </div>
                  <CustomerRegisterForm
                    isModal={true}
                    onSuccess={handleClose}
                    onToggleLogin={() => setView("login")}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
