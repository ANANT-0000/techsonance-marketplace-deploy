"use client";

import React, { Dispatch, SetStateAction } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { CONFIRMATION_MODAL_TEXT } from "@/constants/commonText";

export type ActionType =
  | "suspend"
  | "deactivate"
  | "activate"
  | "approve"
  | "danger";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void | Dispatch<SetStateAction<boolean>> | false;
  onConfirm: () => void;
  title: string;
  message: string;
  actionType: ActionType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionType,
  confirmText = CONFIRMATION_MODAL_TEXT.CONFIRM,
  cancelText = CONFIRMATION_MODAL_TEXT.CANCEL,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  // Dynamically set colors and icons based on the action type
  const isDanger = ["suspend", "deactivate", "danger"].includes(actionType);

  const Icon =
    actionType === "activate" || actionType === "approve"
      ? CheckCircle2
      : actionType === "suspend"
        ? ShieldAlert
        : AlertTriangle;

  const iconBgColor = isDanger
    ? "bg-red-100 text-red-600"
    : "bg-emerald-100 text-emerald-600";
  const confirmButtonColor = isDanger
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500";

  return (
    <div className="min-h-screen max-h-screen min-w-screen fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity ">
      {/* Modal Container */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mt-2">
            {/* Dynamic Icon */}
            <div className={`p-4 rounded-full ${iconBgColor} mb-4`}>
              <Icon size={32} strokeWidth={2.5} />
            </div>

            {/* Content */}
            <h3 className="text-theme-h5 font-bold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-theme-body-sm text-gray-500 mb-6 px-2">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-theme-body-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-theme-body-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 ${confirmButtonColor} cursor-pointer`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {CONFIRMATION_MODAL_TEXT.PROCESSING}
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
