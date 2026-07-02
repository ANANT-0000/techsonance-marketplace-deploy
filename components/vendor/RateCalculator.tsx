"use client";

import { useState } from "react";
import { Star, Package, MapPin, Calculator, Loader2 } from "lucide-react";
import { fetchCalculateShippingRates } from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";

export default function RateCalculator() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [couriers, setCouriers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    pickup_postcode: "",
    delivery_postcode: "",
    weight: "1",
    declared_value: "1000",
  });

  const handleCalculate = async () => {
    if (!formData.pickup_postcode || !formData.delivery_postcode) {
      setErrorMsg("Pickup and delivery pincodes are required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setCouriers([]);

    const token = authToken() || "";

    const payload = {
      pickup_postcode: Number(formData.pickup_postcode),
      delivery_postcode: Number(formData.delivery_postcode),
      weight: Number(formData.weight),
      cod: 0,
      declared_value: Number(formData.declared_value),
    };

    const res = await fetchCalculateShippingRates(payload, token);

    if (Array.isArray(res?.data) && res.data.length > 0) {
      // Sort by rate ascending by default
      const sortedCouriers = res.data.sort((a: any, b: any) => a.rate - b.rate);
      setCouriers(sortedCouriers);
    } else {
      setErrorMsg(res?.message || "No couriers found for these details.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8 animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Calculate Your Shipping Rates
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Check live estimated rates from our courier partners.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form */}
        <div
          className={`flex-1 transition-all duration-300 ${couriers.length > 0 ? "lg:max-w-[50%]" : "w-full"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <span className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center p-0.5">
                  <span className="w-full h-full bg-blue-500 rounded-full" />
                </span>
                Pickup Pincode
              </label>
              <input
                type="number"
                value={formData.pickup_postcode}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_postcode: e.target.value })
                }
                placeholder="e.g. 395007"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Delivery Pincode
              </label>
              <input
                type="number"
                value={formData.delivery_postcode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_postcode: e.target.value,
                  })
                }
                placeholder="e.g. 394510"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Package Weight
              </label>
              <div className="flex">
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 border-r-0 rounded-l-xl text-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="inline-flex items-center px-4 bg-gray-50 border border-l-0 border-gray-200 rounded-r-xl text-gray-500 sm:text-sm font-medium">
                  kg
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Min. chargeable wt is 0.5kg
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Shipment Value (₹)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 sm:text-sm font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={formData.declared_value}
                  onChange={(e) =>
                    setFormData({ ...formData, declared_value: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-r-xl text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-2.5 px-4 border border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Rates
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        {couriers.length > 0 && (
          <div className="flex-1 overflow-y-auto max-h-[60vh] lg:border-l border-t lg:border-t-0 border-gray-100 pt-8 lg:pt-0 lg:pl-8 animate-fadeIn">
            <h4 className="text-base font-bold text-gray-900 mb-4">
              Serviceable Courier Partners
            </h4>

            <div className="space-y-3">
              {couriers.map((courier, index) => (
                <div
                  key={courier.courier_company_id + index}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-gray-200 rounded-xl shadow-sm transition-all"
                >
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      {courier.courier_name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {courier.rating || 4.5}{" "}
                        <Star className="w-3 h-3 ml-0.5 fill-emerald-600 text-emerald-600" />
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-[11px] text-gray-500">
                        EDD within{" "}
                        <strong className="text-gray-700">
                          {courier.etd_hours
                            ? Math.ceil(courier.etd_hours / 24)
                            : 3}{" "}
                          days
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-gray-900">
                      ₹{Number(courier.rate).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
