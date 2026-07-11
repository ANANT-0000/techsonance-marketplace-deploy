import React from "react";
import { STORE_NOT_AVAILABLE_TEXT } from "@/constants";

export default function StoreNotAvailable() {
  return (
    <div className="fixed inset-0 z-[99999] min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {STORE_NOT_AVAILABLE_TEXT.TITLE}
        </h1>
        <p className="text-gray-500 mb-8">
          {STORE_NOT_AVAILABLE_TEXT.DESCRIPTION}
        </p>
      </div>
    </div>
  );
}
