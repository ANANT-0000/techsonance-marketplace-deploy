"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import RateCalculator from "../../../../components/vendor/RateCalculator";
import RoutingStrategy from "../../../../components/vendor/RoutingStrategy";
import { useEffect, useReducer, useTransition } from "react";
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
import { SHIPPING_TEXT } from "@/constants/ui-text";

export enum ActionType {
  SET_SAVED = "SET_SAVED",
  SET_ERROR_MSG = "SET_ERROR_MSG",
  SET_IS_EDITING_FLAT_RATE = "SET_IS_EDITING_FLAT_RATE",
  RESET_STATUS = "RESET_STATUS",
}

export type Action =
  | { type: ActionType.SET_SAVED; payload: boolean }
  | { type: ActionType.SET_ERROR_MSG; payload: string }
  | { type: ActionType.SET_IS_EDITING_FLAT_RATE; payload: boolean }
  | { type: ActionType.RESET_STATUS };

// ==========================================
// 2. STATE MANAGEMENT (useReducer)
// ==========================================

interface State {
  saved: boolean;
  errorMsg: string;
  isEditingFlatRate: boolean;
}

const initialState: State = {
  saved: false,
  errorMsg: "",
  isEditingFlatRate: false,
};

function shippingReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_SAVED:
      return { ...state, saved: action.payload };
    case ActionType.SET_ERROR_MSG:
      return { ...state, errorMsg: action.payload };
    case ActionType.SET_IS_EDITING_FLAT_RATE:
      return { ...state, isEditingFlatRate: action.payload };
    case ActionType.RESET_STATUS:
      return { ...state, saved: false, errorMsg: "" };
    default:
      return state;
  }
}

interface ShippingFormValues {
  logistics_mode: LogisticsMode;
  logistics_api_key: string;
  logistics_api_secret: string;
  is_free_shipping_enabled: boolean;
  free_delivery_threshold: string;
  standard_delivery_charge: string;
  shipping_charge_strategy: ShippingChargeStrategy;
}

// ==========================================
// 3. COMPONENTS
// ==========================================

export default function ShippingSettingsPage() {
  const companyId = getClientCompanyId();

  const [isPending, startTransition] = useTransition();
  const [state, dispatchState] = useReducer(shippingReducer, initialState);
  const token = authToken() || "";

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<ShippingFormValues>({
      defaultValues: {
        logistics_mode: LogisticsMode.PLATFORM_PROXY,
        logistics_api_key: "",
        logistics_api_secret: "",
        is_free_shipping_enabled: false,
        free_delivery_threshold: SHIPPING_TEXT.DEFAULT_FREE_DELIVERY_THRESHOLD,
        standard_delivery_charge:
          SHIPPING_TEXT.DEFAULT_STANDARD_DELIVERY_CHARGE,
        shipping_charge_strategy: ShippingChargeStrategy.STANDARD_FLAT_RATE,
      },
    });

  const logisticsMode = watch("logistics_mode");
  const isFreeShippingEnabled = watch("is_free_shipping_enabled");
  const shippingStrategy = watch("shipping_charge_strategy");

  useEffect(() => {
    if (!token || !companyId) return;
    const loadSettings = async () => {
      const res = await fetchShippingSettings(token, companyId);
      if (res?.data || res) {
        const d = res.data || res;
        reset({
          logistics_mode: d.logistics_mode || LogisticsMode.PLATFORM_PROXY,
          logistics_api_key: d.has_api_key ? SHIPPING_TEXT.API_SECRET_MASK : "",
          logistics_api_secret: d.has_api_secret
            ? SHIPPING_TEXT.API_SECRET_MASK
            : "",
          is_free_shipping_enabled: d.is_free_shipping_enabled ?? false,
          free_delivery_threshold: Number(
            d.free_delivery_threshold || 0,
          ).toFixed(2),
          standard_delivery_charge: Number(
            d.standard_delivery_charge || 50,
          ).toFixed(2),
          shipping_charge_strategy:
            d.shipping_charge_strategy ||
            ShippingChargeStrategy.STANDARD_FLAT_RATE,
        });
      }
    };
    loadSettings();
  }, [token, reset]);

  const onSubmit = (data: ShippingFormValues) => {
    if (!companyId) return;
    dispatchState({ type: ActionType.RESET_STATUS });
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

      const res = await updateShippingSettings(payload, token, companyId);
      if (res?.success || res?.status === 200 || res?.status === 201) {
        dispatchState({ type: ActionType.SET_SAVED, payload: true });
        dispatchState({
          type: ActionType.SET_IS_EDITING_FLAT_RATE,
          payload: false,
        });
        setTimeout(
          () => dispatchState({ type: ActionType.SET_SAVED, payload: false }),
          SHIPPING_TEXT.SAVE_TIMEOUT_MS,
        );
      } else {
        dispatchState({
          type: ActionType.SET_ERROR_MSG,
          payload: res?.message || SHIPPING_TEXT.ERROR_MSG,
        });
      }
    });
  };

  return (
    <div className="w-full min-h-screen max-h-screen overflow-y-auto no-scrollbar mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-theme-h4 font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Truck className="w-7 h-7 text-blue-600" />
          {SHIPPING_TEXT.PAGE_TITLE}
        </h1>
        <p className="text-theme-body-sm text-gray-500 mt-1">
          {SHIPPING_TEXT.PAGE_DESC}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logistics Mode Selection Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-theme-body font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
            {SHIPPING_TEXT.LOGISTICS_MODE_TITLE}
          </h3>
          <p className="text-theme-caption text-gray-400 mb-6">
            {SHIPPING_TEXT.LOGISTICS_MODE_DESC}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform Proxy Mode Card Option */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                logisticsMode === LogisticsMode.PLATFORM_PROXY
                  ? "border-blue-500 bg-blue-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-theme-body-sm font-bold text-gray-800">
                  {SHIPPING_TEXT.PLATFORM_PROXY_LABEL}
                </span>
                <input
                  type="radio"
                  value={LogisticsMode.PLATFORM_PROXY}
                  {...register("logistics_mode")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-theme-caption text-gray-500 mt-2">
                {SHIPPING_TEXT.PLATFORM_PROXY_DESC}
              </p>
            </label>

            {/* Standalone Mode Card Option */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                logisticsMode === LogisticsMode.STANDALONE
                  ? "border-blue-500 bg-blue-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-theme-body-sm font-bold text-gray-800">
                  {SHIPPING_TEXT.STANDALONE_LABEL}
                </span>
                <input
                  type="radio"
                  value={LogisticsMode.STANDALONE}
                  {...register("logistics_mode")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-theme-caption text-gray-500 mt-2">
                {SHIPPING_TEXT.STANDALONE_DESC}
              </p>
            </label>
          </div>
        </div>

        {/* Private API Credentials (STANDALONE ONLY) */}
        {logisticsMode === LogisticsMode.STANDALONE && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
            <h3 className="text-theme-body font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              {SHIPPING_TEXT.CREDS_TITLE}
            </h3>
            <p className="text-theme-caption text-gray-400 mb-4">
              {SHIPPING_TEXT.CREDS_DESC}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-theme-body-sm font-bold text-gray-700 mb-1">
                  {SHIPPING_TEXT.API_EMAIL_LABEL}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register("logistics_api_key")}
                    placeholder={SHIPPING_TEXT.API_EMAIL_PLACEHOLDER}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-theme-body-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-body-sm font-bold text-gray-700 mb-1">
                  {SHIPPING_TEXT.API_PASSWORD_LABEL}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    {...register("logistics_api_secret")}
                    placeholder={SHIPPING_TEXT.API_PASSWORD_PLACEHOLDER}
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
            {SHIPPING_TEXT.COST_CALC_TITLE}
          </h3>
          <p className="text-theme-caption text-gray-400">
            {SHIPPING_TEXT.COST_CALC_DESC}
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
                  {SHIPPING_TEXT.FLAT_RATE_LABEL}
                </span>
                <input
                  type="radio"
                  value={ShippingChargeStrategy.STANDARD_FLAT_RATE}
                  {...register("shipping_charge_strategy")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {SHIPPING_TEXT.FLAT_RATE_DESC}
              </p>
            </label>

            {/* Dynamic Customer Rate */}
            <label
              className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${
                shippingStrategy ===
                ShippingChargeStrategy.DYNAMIC_CUSTOMER_RATE
                  ? "border-blue-500 bg-blue-50/10 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  {SHIPPING_TEXT.DYNAMIC_RATE_LABEL}
                </span>
                <input
                  type="radio"
                  value={ShippingChargeStrategy.DYNAMIC_CUSTOMER_RATE}
                  {...register("shipping_charge_strategy")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {SHIPPING_TEXT.DYNAMIC_RATE_DESC}
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Standard flat delivery fee */}
            {shippingStrategy === ShippingChargeStrategy.STANDARD_FLAT_RATE && (
              <div>
                <label className="block text-theme-body-sm font-bold text-gray-700 mb-1">
                  {SHIPPING_TEXT.STD_SHIPPING_LABEL}
                </label>
                <div className="relative">
                  {watch("standard_delivery_charge") &&
                  !state.isEditingFlatRate ? (
                    <div className="flex items-center justify-between w-full pl-4 pr-3 py-2 border border-emerald-200 bg-emerald-50 rounded-xl text-theme-body-sm">
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {SHIPPING_TEXT.CURRENCY_SYMBOL}
                          {watch("standard_delivery_charge")}{" "}
                          {SHIPPING_TEXT.SAVED_TEXT}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          dispatchState({
                            type: ActionType.SET_IS_EDITING_FLAT_RATE,
                            payload: true,
                          })
                        }
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
                      >
                        {SHIPPING_TEXT.EDIT_TEXT}
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm font-bold">
                        {SHIPPING_TEXT.CURRENCY_SYMBOL}
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
                  {SHIPPING_TEXT.FLAT_FEE_HINT}
                </p>
              </div>
            )}

            {/* Free shipping settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="text-theme-body-sm font-bold text-gray-800 block">
                    {SHIPPING_TEXT.FREE_SHIPPING_LABEL}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {SHIPPING_TEXT.FREE_SHIPPING_HINT}
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
                  {SHIPPING_TEXT.FREE_SHIPPING_THRESHOLD_LABEL}
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-theme-body-sm font-bold transition-colors duration-200 ${isFreeShippingEnabled ? "text-gray-400" : "text-gray-300"}`}
                  >
                    {SHIPPING_TEXT.CURRENCY_SYMBOL}
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
                    ? SHIPPING_TEXT.FREE_SHIPPING_ACTIVE_HINT
                    : SHIPPING_TEXT.FREE_SHIPPING_INACTIVE_HINT}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Status */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4 border-t border-gray-100">
          <div>
            {state.saved && (
              <span className="text-theme-body-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5" />
                {SHIPPING_TEXT.SUCCESS_MSG}
              </span>
            )}
            {state.errorMsg && (
              <span className="text-theme-body-sm font-semibold text-rose-600 animate-fadeIn">
                ⚠️ {state.errorMsg}
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
            {SHIPPING_TEXT.BTN_SAVE}
          </button>
        </div>
      </form>

      <RoutingStrategy />
      <RateCalculator />
    </div>
  );
}
