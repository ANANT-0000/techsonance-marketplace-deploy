"use client";

import Image from "next/image";
import { AUTH_TEXT } from "@/constants";
import CustomerRegisterForm from "@/components/customer/CustomerRegisterForm";
import { CUSTOMER_REGISTRATION_POSTER } from "@/constants/common";

export default function CustomerRegisterPage() {
  return (
    <main className="flex justify-center items-center min-h-screen w-full p-4">
      <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full">
        {/* Form Section */}
        <div className="flex flex-col px-6 py-8 lg:px-12 lg:py-10 justify-center flex-1">
          <div className="mb-8">
            <h1 className="text-theme-h3 font-bold text-gray-800 mb-2">
              {AUTH_TEXT.REGISTER.TITLE}
            </h1>
            <p className="text-theme-body-sm text-slate-650">
              {AUTH_TEXT.REGISTER.SUBTITLE}
            </p>
          </div>

          <CustomerRegisterForm isModal={false} />
        </div>

        {/* Image Section */}
        <div className="hidden relative flex-1 lg:flex flex-col justify-center items-start bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="flex flex-col justify-center items-center text-white p-12">
            <h2 className="text-theme-h2 font-bold mb-4 text-center">
              {AUTH_TEXT.REGISTER.COMMUNITY_TITLE}
            </h2>
            <p className="text-theme-h6 text-center text-blue-100">
              {AUTH_TEXT.REGISTER.COMMUNITY_SUB}
            </p>
          </div>
          <Image
            src={CUSTOMER_REGISTRATION_POSTER}
            width={800}
            height={800}
            alt="Join our community"
            className="object-contain opacity-90 shadow-2xl rounded-full"
            priority
          />
        </div>
      </div>
    </main>
  );
}
