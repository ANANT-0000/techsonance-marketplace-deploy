"use client";

import { Suspense } from "react";
import { CUSTOMER_LOGIN_POSTER } from "@/constants/common";
import Image from "next/image";
import CustomerLoginForm from "@/components/customer/CustomerLoginForm";

function CustomerLoginWrapper() {
  return (
    <main className="w-full flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full">
        {/* Poster Image */}
        <div className="hidden md:block relative md:w-5/12 lg:w-1/2">
          <Image
            src={CUSTOMER_LOGIN_POSTER}
            alt="Login"
            className="h-full w-full object-cover"
            loading="eager"
            width={1920}
            height={1080}
            priority
            quality={100}
          />
        </div>

        {/* Form Section */}
        <div className="flex flex-col px-6 py-8 lg:px-12 lg:py-10 justify-center md:w-7/12 lg:w-1/2">
          <CustomerLoginForm />
        </div>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <CustomerLoginWrapper />
    </Suspense>
  );
}
