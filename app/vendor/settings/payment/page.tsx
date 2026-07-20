"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  CreditCard,
  Key,
  Shield,
  HelpCircle,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { authToken } from "@/utils/authToken";
import {
  fetchVendorPaymentConfig,
  updateVendorPaymentConfig,
} from "@/utils/vendorApiClient";
import { LogisticsMode, ShippingChargeStrategy } from "@/utils/Types";
import { PAYMENT_PAGE_STRINGS } from "@/constants/vendorText";

interface PaymentFormValues {
  logistics_mode: LogisticsMode;
  razorpay_key_id: string;
  razorpay_key_secret: string;
}

export default function VendorPaymentPage() {
  const companyId = getClientCompanyId();

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isEditingKeyId, setIsEditingKeyId] = useState(false);
  const token = authToken() || "";

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<PaymentFormValues>({
      defaultValues: {
        logistics_mode: LogisticsMode.STANDALONE,
        razorpay_key_id: "",
        razorpay_key_secret: "",
      },
    });

  const logisticsMode = watch("logistics_mode");

  useEffect(() => {
    if (!token || !companyId) return;
    const loadSettings = async () => {
      const res = await fetchVendorPaymentConfig(token, companyId);
      if (res && res.data) {
        const d = res.data;
        reset({
          logistics_mode: d.logistics_mode || LogisticsMode.STANDALONE,
          razorpay_key_id: d.razorpay_key_id || "",
          razorpay_key_secret: d.razorpay_key_secret_masked || "",
        });
      }
    };
    loadSettings();
  }, [token, reset]);

  const onSubmit = (data: PaymentFormValues) => {
    if (!companyId) return;
    setErrorMsg("");
    setSaved(false);
    startTransition(async () => {
      const payload = {
        logistics_mode: data.logistics_mode,
        razorpay_key_id: data.razorpay_key_id,
        razorpay_key_secret: data.razorpay_key_secret,
      };

      const res = await updateVendorPaymentConfig(payload, token, companyId);
      if (res && res.success) {
        setSaved(true);
        setIsEditingKeyId(false);
        if (res.data?.razorpay_key_secret_masked) {
          setValue("razorpay_key_secret", res.data.razorpay_key_secret_masked);
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(res?.message || PAYMENT_PAGE_STRINGS.ERROR_FALLBACK);
      }
    });
  };

  return (
    <div className="w-full min-h-screen max-h-screen overflow-y-auto mx-auto px-4 py-8 bg-gray-50/30">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          {PAYMENT_PAGE_STRINGS.TITLE}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {PAYMENT_PAGE_STRINGS.SUBTITLE}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logistics & Payment Mode Cards */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
            {PAYMENT_PAGE_STRINGS.FULFILLMENT_HEADER}
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            {PAYMENT_PAGE_STRINGS.FULFILLMENT_DESC}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standalone Mode */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                logisticsMode === LogisticsMode.STANDALONE
                  ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {PAYMENT_PAGE_STRINGS.STANDALONE_TITLE}
                </span>
                <input
                  type="radio"
                  value={LogisticsMode.STANDALONE}
                  {...register("logistics_mode")}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {PAYMENT_PAGE_STRINGS.STANDALONE_DESC}
              </p>
            </label>

            {/* Platform Proxy Mode */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                logisticsMode === LogisticsMode.PLATFORM_PROXY
                  ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {PAYMENT_PAGE_STRINGS.PROXY_TITLE}
                </span>
                <input
                  type="radio"
                  value={LogisticsMode.PLATFORM_PROXY}
                  {...register("logistics_mode")}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {PAYMENT_PAGE_STRINGS.PROXY_DESC}
              </p>
            </label>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
            {PAYMENT_PAGE_STRINGS.INTEGRATION_HEADER}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {logisticsMode === LogisticsMode.STANDALONE
              ? PAYMENT_PAGE_STRINGS.INTEGRATION_STANDALONE_DESC
              : PAYMENT_PAGE_STRINGS.INTEGRATION_PROXY_DESC}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {logisticsMode === LogisticsMode.STANDALONE
                  ? PAYMENT_PAGE_STRINGS.LABEL_KEY_ID
                  : PAYMENT_PAGE_STRINGS.LABEL_ACCOUNT_ID}
              </label>
              <div className="relative">
                {watch("razorpay_key_id") && !isEditingKeyId ? (
                  <div className="flex items-center justify-between w-full pl-4 pr-3 py-2 border border-emerald-200 bg-emerald-50 rounded-xl text-sm">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {logisticsMode === LogisticsMode.STANDALONE
                          ? "API Key Saved"
                          : "Account ID Saved"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingKeyId(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      {...register("razorpay_key_id")}
                      placeholder={
                        logisticsMode === LogisticsMode.STANDALONE
                          ? "rzp_test_..."
                          : "acc_..."
                      }
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    />
                  </>
                )}
              </div>
            </div>

            {logisticsMode === LogisticsMode.STANDALONE && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {PAYMENT_PAGE_STRINGS.LABEL_KEY_SECRET}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type={showSecret ? "text" : "password"}
                    {...register("razorpay_key_secret")}
                    placeholder="••••••••••••••••"
                    className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Status alerts */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4 border-t border-gray-200">
          <div>
            {saved && (
              <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5" />
                {PAYMENT_PAGE_STRINGS.SUCCESS_MSG}
              </span>
            )}
            {errorMsg && (
              <span className="text-sm font-semibold text-rose-600 flex items-center gap-1 animate-fadeIn">
                <AlertTriangle className="w-4 h-4" /> {errorMsg}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-sm hover:shadow-indigo-100"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {PAYMENT_PAGE_STRINGS.SAVE_BUTTON}
          </button>
        </div>
      </form>
    </div>
  );
}
