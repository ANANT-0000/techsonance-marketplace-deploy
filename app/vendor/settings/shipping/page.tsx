"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Truck,
  Key,
  Shield,
  HelpCircle,
  Save,
  CheckCircle2,
} from "lucide-react";
import { authToken } from "@/utils/authToken";
import {
  fetchShippingSettings,
  updateShippingSettings,
} from "@/utils/vendorApiClient";
import { LogisticsMode, ShippingChargeStrategy } from "@/utils/Types";

interface ShippingFormValues {
  logistics_mode: LogisticsMode;
  logistics_api_key: string;
  logistics_api_secret: string;
  is_free_shipping_enabled: boolean;
  free_delivery_threshold: string;
  standard_delivery_charge: string;
  shipping_charge_strategy: ShippingChargeStrategy;
}

export default function ShippingSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditingFlatRate, setIsEditingFlatRate] = useState(false);
  const token = authToken() || "";

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<ShippingFormValues>({
      defaultValues: {
        logistics_mode: LogisticsMode.PLATFORM_PROXY,
        logistics_api_key: "",
        logistics_api_secret: "",
        is_free_shipping_enabled: false,
        free_delivery_threshold: "0.00",
        standard_delivery_charge: "50.00",
        shipping_charge_strategy: ShippingChargeStrategy.STANDARD_FLAT_RATE,
      },
    });

  const logisticsMode = watch("logistics_mode");
  const isFreeShippingEnabled = watch("is_free_shipping_enabled");
  const shippingStrategy = watch("shipping_charge_strategy");

  useEffect(() => {
    if (!token) return;
    const loadSettings = async () => {
      const res = await fetchShippingSettings(token);
      if (res?.data || res) {
        const d = res.data || res;
        reset({
          logistics_mode: d.logistics_mode || "PLATFORM_PROXY",
          logistics_api_key: d.has_api_key ? "********" : "",
          logistics_api_secret: d.has_api_secret ? "********" : "",
          is_free_shipping_enabled: d.is_free_shipping_enabled ?? false,
          free_delivery_threshold: Number(
            d.free_delivery_threshold || 0,
          ).toFixed(2),
          standard_delivery_charge: Number(
            d.standard_delivery_charge || 50,
          ).toFixed(2),
          shipping_charge_strategy:
            d.shipping_charge_strategy || ShippingChargeStrategy.STANDARD_FLAT_RATE,
        });
      }
    };
    loadSettings();
  }, [token, reset]);

  const onSubmit = (data: ShippingFormValues) => {
    setErrorMsg("");
    setSaved(false);
    startTransition(async () => {
      const payload = {
        logistics_mode: data.logistics_mode,
        is_free_shipping_enabled: data.is_free_shipping_enabled,
        free_delivery_threshold: data.free_delivery_threshold,
        standard_delivery_charge: data.standard_delivery_charge,
        shipping_charge_strategy: data.shipping_charge_strategy,
        logistics_api_key: data.logistics_api_key,
        logistics_api_secret: data.logistics_api_secret,
      };

      const res = await updateShippingSettings(payload, token);
      if (res?.success || res?.status === 200 || res?.status === 201) {
        setSaved(true);
        setIsEditingFlatRate(false);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(res?.message || "Failed to update shipping settings");
      }
    });
  };

  return (
    <div className="w-full min-h-screen max-h-screen overflow-y-auto no-scrollbar mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-theme-h4 font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Truck className="w-7 h-7 text-blue-600" />
          Shipping & Logistics Settings
        </h1>
        <p className="text-theme-body-sm text-gray-500 mt-1">
          Configure how shipping costs are calculated on your storefront and
          manage fulfillment api credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logistics Mode Selection Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-theme-body font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
            Fulfillment Logistics Mode
          </h3>
          <p className="text-theme-caption text-gray-400 mb-6">
            Determine whether orders are fulfilled under the central platform
            account (Platform Proxy Mode) or using your own Shiprocket
            credentials.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform Proxy Mode Card Option */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                logisticsMode === "PLATFORM_PROXY"
                  ? "border-blue-500 bg-blue-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-theme-body-sm font-bold text-gray-800">
                  Platform Proxy Mode
                </span>
                <input
                  type="radio"
                  value="PLATFORM_PROXY"
                  {...register("logistics_mode")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-theme-caption text-gray-500 mt-2">
                Fulfillment goes through the Platform's Master Shiprocket
                wallet. Shipping costs are recovered via gateway splits.
              </p>
            </label>

            {/* Standalone Mode Card Option */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                logisticsMode === "STANDALONE"
                  ? "border-blue-500 bg-blue-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-theme-body-sm font-bold text-gray-800">
                  Standalone Mode (BYO Credentials)
                </span>
                <input
                  type="radio"
                  value="STANDALONE"
                  {...register("logistics_mode")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-theme-caption text-gray-500 mt-2">
                Fulfilment runs directly on your own Shiprocket account. Enter
                your verified email and password below.
              </p>
            </label>
          </div>
        </div>

        {/* Private API Credentials (STANDALONE ONLY) */}
        {logisticsMode === "STANDALONE" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
            <h3 className="text-theme-body font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              Shiprocket Account Credentials
            </h3>
            <p className="text-theme-caption text-gray-400 mb-4">
              Provide your API logins. These will be encrypted securely using
              AES-256-GCM and will never be exposed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-theme-body-sm font-bold text-gray-700 mb-1">
                  Shiprocket API Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register("logistics_api_key")}
                    placeholder="Enter Shiprocket Account Email"
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-theme-body-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-body-sm font-bold text-gray-700 mb-1">
                  Shiprocket API Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    {...register("logistics_api_secret")}
                    placeholder="Enter Shiprocket Account Password"
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-theme-body-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Delivery Charging Rules & Thresholds */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-theme-body font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
            Storefront Delivery Cost Calculations
          </h3>
          <p className="text-theme-caption text-gray-400">
            Configure how standard courier shipping is charged to customers on
            your storefront.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard flat rate */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                shippingStrategy === ShippingChargeStrategy.STANDARD_FLAT_RATE
                  ? "border-blue-500 bg-blue-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  Standard Flat Rate
                </span>
                <input
                  type="radio"
                  value={ShippingChargeStrategy.STANDARD_FLAT_RATE}
                  {...register("shipping_charge_strategy")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Charge a fixed shipping amount for all orders below the threshold.
              </p>
            </label>

            {/* Dynamic Customer Rate */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                shippingStrategy === ShippingChargeStrategy.DYNAMIC_CUSTOMER_RATE
                  ? "border-blue-500 bg-blue-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  Dynamic Customer Rate
                </span>
                <input
                  type="radio"
                  value={ShippingChargeStrategy.DYNAMIC_CUSTOMER_RATE}
                  {...register("shipping_charge_strategy")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Automatically calculate and charge live shipping rates using Shiprocket.
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Standard flat delivery fee */}
            {shippingStrategy === ShippingChargeStrategy.STANDARD_FLAT_RATE && (
              <div>
                <label className="block text-theme-body-sm font-bold text-gray-700 mb-1">
                  Standard Shipping Flat Rate (₹)
                </label>
                <div className="relative">
                  {watch("standard_delivery_charge") && !isEditingFlatRate ? (
                    <div className="flex items-center justify-between w-full pl-4 pr-3 py-2 border border-emerald-200 bg-emerald-50 rounded-xl text-theme-body-sm">
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          ₹{watch("standard_delivery_charge")} Saved
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingFlatRate(true)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("standard_delivery_charge")}
                        className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-xl text-theme-body-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Flat shipping fee charged if order amount does not reach the
                  free delivery threshold.
                </p>
              </div>
            )}

            {/* Free shipping settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="text-theme-body-sm font-bold text-gray-800 block">
                    Enable Free Shipping Rule
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Unlock free delivery above a cart value threshold.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setValue("is_free_shipping_enabled", !isFreeShippingEnabled)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                    isFreeShippingEnabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isFreeShippingEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1">
                <label
                  className={`block text-theme-body-sm font-bold transition-colors duration-200 ${isFreeShippingEnabled ? "text-gray-700" : "text-gray-400"}`}
                >
                  Free Shipping Order Threshold Value (₹)
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-theme-body-sm font-bold transition-colors duration-200 ${isFreeShippingEnabled ? "text-gray-400" : "text-gray-300"}`}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={!isFreeShippingEnabled}
                    {...register("free_delivery_threshold")}
                    className={`w-full pl-7 pr-4 py-2 border rounded-xl text-theme-body-sm transition-all focus:border-blue-500 focus:ring-blue-500 ${
                      isFreeShippingEnabled
                        ? "border-gray-200 bg-white text-gray-800"
                        : "border-gray-150 bg-gray-50/50 text-gray-400 cursor-not-allowed"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 transition-colors duration-200">
                  {isFreeShippingEnabled
                    ? "Orders at or above this cart total amount will enjoy free delivery."
                    : "Enable the Free Shipping Rule above to configure the threshold value."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Status */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4 border-t border-gray-100">
          <div>
            {saved && (
              <span className="text-theme-body-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5" />
                Shipping settings saved successfully.
              </span>
            )}
            {errorMsg && (
              <span className="text-theme-body-sm font-semibold text-rose-600 animate-fadeIn">
                ⚠️ {errorMsg}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-blue-100"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
