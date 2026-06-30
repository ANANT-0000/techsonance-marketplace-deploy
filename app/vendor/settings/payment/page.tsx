"use client";

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
  shipping_charge_strategy: ShippingChargeStrategy;
  razorpay_key_id: string;
  razorpay_key_secret: string;
}

export default function VendorPaymentPage() {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const token = authToken() || "";

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<PaymentFormValues>({
      defaultValues: {
        logistics_mode: LogisticsMode.STANDALONE,
        shipping_charge_strategy: ShippingChargeStrategy.STANDARD_FLAT_RATE,
        razorpay_key_id: "",
        razorpay_key_secret: "",
      },
    });

  const logisticsMode = watch("logistics_mode");
  const shippingStrategy = watch("shipping_charge_strategy");

  useEffect(() => {
    if (!token) return;
    const loadSettings = async () => {
      const res = await fetchVendorPaymentConfig(token);
      if (res) {
        reset({
          logistics_mode: res.logistics_mode || LogisticsMode.STANDALONE,
          shipping_charge_strategy:
            res.shipping_charge_strategy || "STANDARD_FLAT_RATE",
          razorpay_key_id: res.razorpay_key_id || "",
          razorpay_key_secret: res.razorpay_key_secret_masked || "",
        });
      }
    };
    loadSettings();
  }, [token, reset]);

  const onSubmit = (data: PaymentFormValues) => {
    setErrorMsg("");
    setSaved(false);
    startTransition(async () => {
      const payload = {
        logistics_mode: data.logistics_mode,
        shipping_charge_strategy: data.shipping_charge_strategy,
        razorpay_key_id: data.razorpay_key_id,
        razorpay_key_secret: data.razorpay_key_secret,
      };

      const res = await updateVendorPaymentConfig(payload, token);
      if (res && !res.statusCode) {
        setSaved(true);
        if (res.razorpay_key_secret_masked) {
          setValue("razorpay_key_secret", res.razorpay_key_secret_masked);
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(res?.message || PAYMENT_PAGE_STRINGS.ERROR_FALLBACK);
      }
    });
  };

  return (
    <div className="w-full min-h-screen max-h-screen overflow-y-auto  mx-auto px-4 py-8 bg-gray-50/30">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
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
                logisticsMode === "STANDALONE"
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
                  value="STANDALONE"
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
                logisticsMode === "PLATFORM_PROXY"
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
                  value="PLATFORM_PROXY"
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
            {logisticsMode === "STANDALONE"
              ? PAYMENT_PAGE_STRINGS.INTEGRATION_STANDALONE_DESC
              : PAYMENT_PAGE_STRINGS.INTEGRATION_PROXY_DESC}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {logisticsMode === "STANDALONE"
                  ? PAYMENT_PAGE_STRINGS.LABEL_KEY_ID
                  : PAYMENT_PAGE_STRINGS.LABEL_ACCOUNT_ID}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  {...register("razorpay_key_id")}
                  placeholder={
                    logisticsMode === "STANDALONE" ? "rzp_test_..." : "acc_..."
                  }
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {logisticsMode === "STANDALONE" && (
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

        {/* Shipping strategy configurations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
            {PAYMENT_PAGE_STRINGS.SHIPPING_HEADER}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {PAYMENT_PAGE_STRINGS.SHIPPING_DESC}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard flat rate */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                shippingStrategy === "STANDARD_FLAT_RATE"
                  ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {PAYMENT_PAGE_STRINGS.FLAT_RATE_TITLE}
                </span>
                <input
                  type="radio"
                  value="STANDARD_FLAT_RATE"
                  {...register("shipping_charge_strategy")}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {PAYMENT_PAGE_STRINGS.FLAT_RATE_DESC}
              </p>
            </label>

            {/* Dynamic Customer Rate */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                shippingStrategy === "DYNAMIC_CUSTOMER_RATE"
                  ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {PAYMENT_PAGE_STRINGS.DYNAMIC_RATE_TITLE}
                </span>
                <input
                  type="radio"
                  value="DYNAMIC_CUSTOMER_RATE"
                  {...register("shipping_charge_strategy")}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {PAYMENT_PAGE_STRINGS.DYNAMIC_RATE_DESC}
              </p>
            </label>
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
