'use client';

import { useState } from "react";
import { updateProductVariantStatus } from "@/utils/vendorApiClient"; // adjust import to your actual API util
import { ProductVariantStatus } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import toast, { Toaster } from "react-hot-toast";
import { STATUS_CONFIRMATION_MODAL_TEXT } from "@/constants/commonText";

interface StatusToggleProps {
    productVariantId: string;
    vendorId: string;
    initialStatus: string;
}

export const StatusConfirmationModal = ({ onConfirm, onCancel,isActive }: { onConfirm: () => void; onCancel: () => void; isActive: boolean }) => {
    return (
         <div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => onCancel()}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-6 flex flex-col gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isActive ? "bg-red-50" : "bg-emerald-50"}`}>
                            {isActive ? (
                                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>

                        {/* Text */}
                        <div className="text-center">
                            <h3 className="text-base font-bold text-gray-800 mb-1">
                                {isActive ? STATUS_CONFIRMATION_MODAL_TEXT.DEACTIVATE_PRODUCT : STATUS_CONFIRMATION_MODAL_TEXT.ACTIVATE_PRODUCT}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {isActive
                                    ? STATUS_CONFIRMATION_MODAL_TEXT.DEACTIVATE_DESCRIPTION
                                    : STATUS_CONFIRMATION_MODAL_TEXT.ACTIVATE_DESCRIPTION}
                            </p>
                        </div>

                        {/* Status change preview */}
                        <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-xl py-3 px-4 border border-gray-100">
                            <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                ● {isActive ? STATUS_CONFIRMATION_MODAL_TEXT.ACTIVE : STATUS_CONFIRMATION_MODAL_TEXT.INACTIVE}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold border ${!isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                ● {isActive ? STATUS_CONFIRMATION_MODAL_TEXT.INACTIVE : STATUS_CONFIRMATION_MODAL_TEXT.ACTIVE}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => onCancel()}
                                className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 py-2.5 rounded-xl transition-colors"
                            >
                                {STATUS_CONFIRMATION_MODAL_TEXT.CANCEL}
                            </button>
                            <button
                                onClick={() => onConfirm()}
                                className={`flex-1 text-sm font-semibold text-white py-2.5 rounded-xl transition-colors ${isActive
                                    ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                                    : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
                                    }`}
                            >
                                {isActive ? STATUS_CONFIRMATION_MODAL_TEXT.YES_DEACTIVATE : STATUS_CONFIRMATION_MODAL_TEXT.YES_ACTIVATE}
                            </button>
                        </div>
                    </div>
                </div>
    );
}