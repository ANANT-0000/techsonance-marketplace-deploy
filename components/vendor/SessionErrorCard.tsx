"use client";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { UiText } from "@/constants/ui-text";
import { VEDNOR_LOGIN_PATH } from "@/constants";
import { motion } from "framer-motion";

export const SessionErrorCard = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 text-center transition-all duration-300"
      >
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
          {UiText.AUTH.SESSION_CHECK_TITLE}
        </h2>
        <p className="text-slate-500 mb-8 text-[15px] leading-relaxed">
          {UiText.AUTH.SESSION_CHECK_DESC}
        </p>
        <button
          onClick={() => router.replace(VEDNOR_LOGIN_PATH)}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-[15px] font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:-translate-y-0.5"
        >
          {UiText.AUTH.LOG_IN_AGAIN}
        </button>
      </motion.div>
    </div>
  );
};

