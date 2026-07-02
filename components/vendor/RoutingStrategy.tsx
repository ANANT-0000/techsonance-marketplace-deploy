"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Save, Route, LayoutList } from "lucide-react";
import { authToken } from "@/utils/authToken";
import {
  fetchLogisticCompanies,
  fetchVendorShippingPreferences,
  updateVendorShippingPreferences,
} from "@/utils/vendorApiClient";
import { ShippingStrategy } from "@/utils/Types";

export default function RoutingStrategy() {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [couriers, setCouriers] = useState<any[]>([]);
  const [fallbackStrategy, setFallbackStrategy] = useState<ShippingStrategy>(
    ShippingStrategy.LOWEST_COST,
  );
  const [strategy, setStrategy] = useState<ShippingStrategy>(
    ShippingStrategy.LOWEST_COST,
  );
  const [priorityList, setPriorityList] = useState<number[]>([]);

  const token = authToken() || "";

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      const [companiesRes, prefsRes] = await Promise.all([
        fetchLogisticCompanies(token),
        fetchVendorShippingPreferences(token),
      ]);

      if (companiesRes?.data) {
        setCouriers(companiesRes.data);
      }

      if (prefsRes?.data || prefsRes) {
        const p = prefsRes.data || prefsRes;
        if (p.primary_strategy)
          setStrategy(p.primary_strategy as ShippingStrategy);
        if (p.priority_list) setPriorityList(p.priority_list);
      }
    };

    loadData();
  }, [token]);

  const toggleCourier = (courierId: number) => {
    setPriorityList((prev) =>
      prev.includes(courierId)
        ? prev.filter((id) => id !== courierId)
        : [...prev, courierId],
    );
  };

  const handleSave = () => {
    setErrorMsg("");
    setSaved(false);

    startTransition(async () => {
      const payload = {
        primary_strategy: strategy,
        fallback_strategy:
          strategy === ShippingStrategy.PRIORITY ? fallbackStrategy : strategy,
        priority_list: priorityList,
        exclusion_rules: { blocked_courier_ids: [] },
      };

      const res = await updateVendorShippingPreferences(payload, token);

      if (res?.success !== false) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(res?.message || "Failed to update routing preferences.");
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8 animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Route className="w-5 h-5 text-blue-600" />
          Fulfillment Routing Strategy
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose how the system selects a courier when dynamic customer rates
          are enabled.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <label
          className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
            strategy === ShippingStrategy.LOWEST_COST
              ? "border-blue-500 bg-blue-50/10 shadow-sm"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">Lowest Cost</span>
            <input
              type="radio"
              checked={strategy === ShippingStrategy.LOWEST_COST}
              onChange={() => setStrategy(ShippingStrategy.LOWEST_COST)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Always pick the cheapest serviceable courier.
          </p>
        </label>

        <label
          className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
            strategy === ShippingStrategy.HYBRID
              ? "border-blue-500 bg-blue-50/10 shadow-sm"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">
              Best Value (Hybrid)
            </span>
            <input
              type="radio"
              checked={strategy === ShippingStrategy.HYBRID}
              onChange={() => setStrategy(ShippingStrategy.HYBRID)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Find the optimal balance between lowest cost and fastest delivery.
          </p>
        </label>
        <label
          className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all md:col-span-1 ${
            strategy === ShippingStrategy.PRIORITY
              ? "border-blue-500 bg-blue-50/10 shadow-sm"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">
              Custom Priority List
            </span>
            <input
              type="radio"
              checked={strategy === ShippingStrategy.PRIORITY}
              onChange={() => setStrategy(ShippingStrategy.PRIORITY)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pick from your preferred couriers in the order you specify below.
          </p>
        </label>
      </div>

      {strategy === ShippingStrategy.PRIORITY && (
        <div className="mb-8 animate-fadeIn">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
            <LayoutList className="w-4 h-4 text-gray-500" />
            Select Preferred Couriers
          </h4>{" "}
          <div className="mb-4 text-sm text-gray-600 bg-blue-50 border border-blue-100 p-3 rounded-lg flex flex-col gap-1">
            <strong>How to prioritize:</strong>
            <span>
              Click the checkboxes below in the exact order you want the system
              to route your orders. The first courier you select gets the #1
              priority spot.
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto no-scrollbar border border-gray-100 rounded-xl p-3 bg-gray-50">
            {couriers.length === 0 ? (
              <p className="text-xs text-gray-400 col-span-full py-4 text-center">
                Loading couriers...
              </p>
            ) : (
              couriers.map((courier) => (
                <label
                  key={courier.courier_company_id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer bg-white transition-all ${
                    priorityList.includes(courier.courier_company_id)
                      ? "border-blue-500 shadow-sm"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={priorityList.includes(courier.courier_company_id)}
                    onChange={() => toggleCourier(courier.courier_company_id)}
                  />
                  <div className="flex flex-col flex-1 truncate">
                    <span
                      className="text-xs font-medium text-gray-800 truncate"
                      title={courier.courier_name}
                    >
                      {courier.courier_name}
                    </span>
                  </div>
                  {priorityList.includes(courier.courier_company_id) && (
                    <span className="shrink-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                      #{priorityList.indexOf(courier.courier_company_id) + 1}
                    </span>
                  )}
                </label>
              ))
            )}
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
              <Route className="w-4 h-4 text-gray-500" />
              Fallback Strategy
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              If none of your preferred couriers are serviceable for a specific
              region, which strategy should the system fall back on?
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="fallback"
                  checked={fallbackStrategy === ShippingStrategy.LOWEST_COST}
                  onChange={() =>
                    setFallbackStrategy(ShippingStrategy.LOWEST_COST)
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                Lowest Cost
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="fallback"
                  checked={fallbackStrategy === ShippingStrategy.FASTEST}
                  onChange={() => setFallbackStrategy(ShippingStrategy.FASTEST)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                Fastest Delivery
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="fallback"
                  checked={fallbackStrategy === ShippingStrategy.HYBRID}
                  onChange={() => setFallbackStrategy(ShippingStrategy.HYBRID)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                Best Value (Hybrid)
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Routing Strategy
        </button>

        {saved && (
          <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
        {errorMsg && (
          <span className="text-sm font-medium text-rose-600 animate-fadeIn">
            ⚠️ {errorMsg}
          </span>
        )}
      </div>
    </div>
  );
}
