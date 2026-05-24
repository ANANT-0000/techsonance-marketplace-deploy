"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Search, Ticket, Calendar, Users, Activity } from "lucide-react";
import { Coupon, CouponStatusEnum } from "@/utils/Types";
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
        const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
        const token=authToken();
  const fetchCoupons = async (token: string) => {
    try {
      setLoading(true);
 
      const res = await AxiosAPI.get(`/v1/coupon`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      setCoupons(res.data.data );
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.coupon_code.toLowerCase().includes(searchTerm.toLowerCase())
  );
    
    
    useEffect(() => {
        if (!token) {
            router.push("/auth/vendorLogin");
            return;
        }
        fetchCoupons(token as string);
    }, [token,isModalOpen]);
  const formatDiscount = (config: { type: string; value: number; cap?: number }) => {
    if (config.type === 'percentage') {
      return `${config.value}% OFF${config.cap ? ` (Up to ₹${config.cap})` : ''}`;
    }
    if (config.type === 'fixed_amount') {
      return `₹${config.value} OFF`;
    }
    if (config.type === 'bogo') {
      return `Buy 1 Get 1 Free`;
    }
    return 'Custom Discount';
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
    <div className="w-full p-6   mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 light:text-white">Discount Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage unique promo codes that customers can apply at checkout.</p>
        </div>
        <Button
          onClick={openNewPromoModal}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={18} />
          Create Coupon
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white light:bg-gray-800 rounded-lg shadow-sm border border-gray-100 light:border-gray-700 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by campaign name or code..."
            className="w-full pl-10 pr-4 py-2 border rounded-md light:bg-gray-900 light:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 light:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[400px]">
          <LoaderSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <div 
              key={coupon.id} 
              className="bg-white light:bg-gray-800 rounded-xl shadow-sm border border-gray-100 light:border-gray-700 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              onClick={() => openEditPromoModal(coupon.id)}
            >
              {/* Header: Code & Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 light:bg-indigo-900/30 rounded-lg text-indigo-600 light:text-indigo-400">
                    <Ticket size={20} className="rotate-45" />
                  </div>
                  <div>
                     <span className="font-mono text-lg font-bold tracking-wider text-gray-900 light:text-white">
                        {coupon.coupon_code}
                     </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  coupon.status ===CouponStatusEnum.ACTIVE ? 'bg-green-50 text-green-700 border-green-200 light:bg-green-900/20 light:border-green-800' :
                  coupon.status === CouponStatusEnum.INACTIVE ? 'bg-yellow-50 text-yellow-700 border-yellow-200 light:bg-yellow-900/20 light:border-yellow-800' :
                  'bg-gray-50 text-gray-700 border-gray-200 light:bg-gray-900 light:border-gray-700'
                }`}>
                  {coupon.status}
                </span>
              </div>

              {/* Body: Name & Discount Logic */}
              <div className="mb-4 flex-grow">
                <h3 className="text-base font-semibold text-gray-800 light:text-gray-100 mb-1">{coupon.name}</h3>
                <div className="inline-block px-2 py-1 bg-blue-50 light:bg-blue-900/20 text-blue-700 light:text-blue-300 text-sm font-medium rounded mt-1">
                  {formatDiscount(coupon.discount_config)}
                </div>
              </div>
              
              {/* Footer: Stats & Dates */}
              <div className="space-y-2 border-t border-gray-100 light:border-gray-700 pt-4 mt-auto">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500 light:text-gray-400">
                    <Calendar size={14} className="mr-2" />
                    <span>Expires: {new Date(coupon.valid_to).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500 light:text-gray-400">
                    <Activity size={14} className="mr-2" />
                    <span>Redemptions</span>
                  </div>
                  <span className="font-medium text-gray-700 light:text-gray-300">
                    {coupon.total_used} {coupon.max_uses_total ? `/ ${coupon.max_uses_total}` : ''}
                  </span>
                </div>
                
                {/* Visual Progress Bar if max_uses exists */}
                {coupon.max_uses_total && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 light:bg-gray-700">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full" 
                      style={{ width: `${Math.min((coupon.total_used / coupon.max_uses_total) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredCoupons.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-white light:bg-gray-800 rounded-xl border border-dashed border-gray-200 light:border-gray-700">
              <div className="p-4 bg-gray-50 light:bg-gray-900 rounded-full mb-4">
                <Ticket size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 light:text-white mb-1">No coupons found</h3>
              <p className="text-gray-500 max-w-md mb-6">You haven't created any promotional codes yet, or none match your search.</p>
              <Button onClick={openNewPromoModal} className="flex items-center gap-2">
                Create Your First Coupon
              </Button>
            </div>
          )}
        </div>
      )}
        {/* Promo Code Creation Modal */}
                  {(isModalOpen || couponId) && (
                      <CouponModel 
                          isModalOpen={isModalOpen} 
                          setIsModalOpen={setIsModalOpen} 
                          id={couponId} 
                          vendorId={vendorId}
                          setCoupons={setCoupons}
                          onSuccess={() => {
                              fetchCoupons(token as string);
                          }} 
                      />
                  )}
    </div>
  );
}