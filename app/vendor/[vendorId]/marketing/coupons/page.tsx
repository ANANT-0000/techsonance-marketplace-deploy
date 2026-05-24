"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Search, Ticket, Calendar, Activity } from "lucide-react";
import { Coupon } from "@/utils/Types";
import AxiosAPI from "@/lib/axios";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { Button } from "@/components/ui/button";
import { authToken } from "@/utils/authToken";
import { CouponModel } from "@/components/vendor/CouponModel";

export default function CouponsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);
  const token = authToken();

  const fetchCoupons = async (token: string) => {
    try {
      setLoading(true);
      const res = await AxiosAPI.get(`/v1/coupon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data.data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter uses `code` (was `coupon_code`) — matches new Coupon interface
  const filteredCoupons = coupons.filter(
    (c) =>
      (c.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (!token) {
      router.push("/auth/vendorLogin");
      return;
    }
    fetchCoupons(token as string);
  }, [token, isModalOpen]);

  // Uses flat discount_type / discount_value from new Coupon interface
  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}% OFF${
        coupon.max_discount_amount ? ` (Up to ₹${coupon.max_discount_amount})` : ""
      }`;
    }
    if (coupon.discount_type === "fixed_cart" || coupon.discount_type === "fixed_amount") {
      return `₹${coupon.discount_value} OFF`;
    }
    if (coupon.discount_type === "free_shipping") {
      return "Free Shipping";
    }
    return "Custom Discount";
  };

  const openNewPromoModal = () => {
    setCouponId(null);
    setIsModalOpen(true);
  };

  const openEditPromoModal = (id: string) => {
    setCouponId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full p-6 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage unique promo codes that customers can apply at checkout.
          </p>
        </div>
        <Button
          onClick={openNewPromoModal}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={18} />
          Create Coupon
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by description or code..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[400px]">
          <LoaderSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            // Status derived from is_active boolean + expiry — no CouponStatusEnum needed
            const isExpired = new Date(coupon.valid_to) < new Date();
            const isActive = coupon.is_active && !isExpired;

            return (
              <div
                key={coupon.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
                onClick={() => openEditPromoModal(coupon.id)}
              >
                {/* Header: Code & Status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <Ticket size={20} className="rotate-45" />
                    </div>
                    <span className="font-mono text-lg font-bold tracking-wider text-gray-900">
                      {coupon.code}
                    </span>
                  </div>
                  {/* Status badge uses is_active + expiry — no enum needed */}
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : isExpired
                        ? "bg-gray-50 text-gray-700 border-gray-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                  </span>
                </div>

                {/* Body: Description & Discount */}
                <div className="mb-4 flex-grow">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    {coupon.description ?? "—"}
                  </h3>
                  <div className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded mt-1">
                    {formatDiscount(coupon)}
                  </div>
                </div>

                {/* Footer: Dates & Usage */}
                <div className="space-y-2 border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Calendar size={14} className="mr-2" />
                      <span>Expires: {new Date(coupon.valid_to).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {coupon.total_used !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Activity size={14} className="mr-2" />
                        <span>Redemptions</span>
                      </div>
                      <span className="font-medium text-gray-700">
                        {coupon.total_used}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Progress bar only when both values exist */}
                  {coupon.max_uses && coupon.total_used !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (coupon.total_used / coupon.max_uses) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredCoupons.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-gray-200">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Ticket size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No coupons found
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                You haven't created any promotional codes yet, or none match your search.
              </p>
              <Button onClick={openNewPromoModal} className="flex items-center gap-2">
                Create Your First Coupon
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {(isModalOpen || couponId) && (
        <CouponModel
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          id={couponId}
          vendorId={vendorId}
          setCoupons={setCoupons}
          onSuccess={() => fetchCoupons(token as string)}
        />
      )}
    </div>
  );
}