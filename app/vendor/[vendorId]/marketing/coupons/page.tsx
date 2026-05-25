"use client";
 
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Search, Ticket, Calendar, Activity, Tag, TrendingUp, Zap } from "lucide-react";
import { Coupon, User } from "@/utils/Types";
import AxiosAPI from "@/lib/axios";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { Button } from "@/components/ui/button";
import { authToken } from "@/utils/authToken";
import { CouponModel } from "@/components/vendor/CouponModel";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";

export default function CouponsPage() {
  
  const router = useRouter();
  const {user}=useAppSelector((state:RootState) => state.auth);
const userId= user && 'user_id' in user  ? user.user_id : user && 'id' in user ? user.id : '';
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
    // Summary counts
  const activeCoupons = coupons.filter(
    (c) => c.is_active && new Date(c.valid_to) >= new Date()
  ).length;
  const expiredCoupons = coupons.filter(
    (c) => new Date(c.valid_to) < new Date()
  ).length;
  const totalRedemptions = coupons.reduce(
    (sum, c) => sum + (c.total_used ?? 0),
    0
  );
  return (
    <div className="w-full p-6 mx-auto">
      {/* ── Page header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Discount Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage promo codes customers apply at checkout.
          </p>
        </div>
        <Button
          onClick={openNewPromoModal}
          className="flex items-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 px-5 py-2.5"
        >
          <Plus size={18} />
          Create Coupon
        </Button>
      </header>
 
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Coupons
            </span>
            <span className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
              <Zap size={18} />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {loading ? "—" : activeCoupons}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Currently live
          </p>
        </div>
 
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Expired
            </span>
            <span className="bg-gray-100 text-gray-500 p-2 rounded-lg">
              <Calendar size={18} />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {loading ? "—" : expiredCoupons}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">Past validity</p>
        </div>
 
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Redemptions
            </span>
            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <TrendingUp size={18} />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {loading ? "—" : totalRedemptions}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">All-time uses</p>
        </div>
      </div>
 
      {/* ── Search & filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by code or description…"
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
 
      {/* ── Main grid ── */}
      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[400px]">
          <LoaderSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoupons.map((coupon) => {
            const isExpired = new Date(coupon.valid_to) < new Date();
            const isActive = coupon.is_active && !isExpired;
            const usagePct =
              coupon.max_uses && coupon.total_used !== undefined
                ? Math.min((coupon.total_used / coupon.max_uses) * 100, 100)
                : null;
 
            return (
              <div
                key={coupon.id}
                onClick={() => openEditPromoModal(coupon.id)}
                className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              >
                {/* Top row: code + status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                      <Tag size={18} />
                    </div>
                    <span className="font-mono text-base font-bold tracking-widest text-gray-900 truncate">
                      {coupon.code}
                    </span>
                  </div>
                  <span
                    className={`flex-shrink-0 ml-2 px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isExpired
                        ? "bg-gray-50 text-gray-500 border-gray-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                  </span>
                </div>
 
                {/* Description + discount pill */}
                <div className="mb-4 flex-grow">
                  <p className="text-sm font-semibold text-gray-800 mb-2 leading-snug">
                    {coupon.description ?? <span className="text-gray-400 italic">No description</span>}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                    {formatDiscount(coupon)}
                  </span>
                </div>
 
                {/* Footer: expiry + usage */}
                <div className="border-t border-gray-100 pt-4 space-y-2.5 mt-auto">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      Expires
                    </span>
                    <span className="font-medium text-gray-700">
                      {new Date(coupon.valid_to).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
 
                  {coupon.total_used !== undefined && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Activity size={13} />
                        Redemptions
                      </span>
                      <span className="font-medium text-gray-700">
                        {coupon.total_used}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                      </span>
                    </div>
                  )}
 
                  {usagePct !== null && (
                    <div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            usagePct >= 90
                              ? "bg-red-400"
                              : usagePct >= 60
                              ? "bg-amber-400"
                              : "bg-indigo-500"
                          }`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
 
          {/* Empty state */}
          {filteredCoupons.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                <Ticket size={32} className="text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                No coupons found
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                {searchTerm
                  ? "No coupons match your search. Try a different code or description."
                  : "You haven't created any promo codes yet. Start with your first one."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={openNewPromoModal}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 px-5"
                >
                  <Plus size={16} />
                  Create Your First Coupon
                </Button>
              )}
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
          userId={userId}
          setCoupons={setCoupons}
          onSuccess={() => fetchCoupons(token as string)}
        />
      )}
    </div>
  );
}