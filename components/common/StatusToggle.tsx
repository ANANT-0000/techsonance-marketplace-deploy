'use client';

import { useState } from "react";
import { updateProductStatus } from "@/utils/vendorApiClient"; // adjust import to your actual API util

interface StatusToggleProps {
    productId: string;
    vendorId: string;
    initialStatus: string;
}

export function StatusToggle({ productId, vendorId, initialStatus }: StatusToggleProps) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const isActive = status === "active";
    const nextStatus = isActive ? "inactive" : "active";

    const handleConfirm = async () => {
        setLoading(true);
        setShowModal(false);
        try {
            await updateProductStatus(productId, vendorId, nextStatus);
            setStatus(nextStatus);
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Badge / Trigger Button */}
            <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                title={`Click to mark as ${nextStatus}`}
                className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                    ${isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
                    }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${loading ? "animate-pulse" : ""}`} />
                {loading ? "Saving..." : isActive ? "Active" : "Inactive"}
            </button>

            {/* Confirmation Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
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
                                {isActive ? "Deactivate Product?" : "Activate Product?"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {isActive
                                    ? "This product will no longer be visible to customers. You can reactivate it anytime."
                                    : "This product will become visible to customers immediately."}
                            </p>
                        </div>

                        {/* Status change preview */}
                        <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-xl py-3 px-4 border border-gray-100">
                            <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                ● {isActive ? "Active" : "Inactive"}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold border ${!isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                ● {isActive ? "Inactive" : "Active"}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 py-2.5 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 text-sm font-semibold text-white py-2.5 rounded-xl transition-colors ${isActive
                                    ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                                    : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
                                    }`}
                            >
                                {isActive ? "Yes, Deactivate" : "Yes, Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}