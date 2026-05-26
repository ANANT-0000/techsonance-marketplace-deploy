import React, { useEffect, useRef } from 'react';
import { Loader2, Tag, Calendar, Clock, Zap, Users, ShoppingCart, Calculator } from "lucide-react";
import { Coupon } from '@/utils/Types';

export interface CouponCardListProps {
    coupons: Coupon[];
    isLoading: boolean;
    onEdit: (id: string) => void;
}

export const CouponCardList = ({ coupons, isLoading, onEdit }: CouponCardListProps) => {
    
    // Date Formatter helper
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const scrollContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }
    };

    // Use { passive: false } to allow e.preventDefault()
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
        container.removeEventListener("wheel", handleWheel);
    };
}, []);
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Tag size={20} className="text-blue-600" /> Active Promotions
                </h2>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-10 bg-white border border-gray-200 rounded-2xl">
                    <Loader2 className="animate-spin text-gray-400" size={30} />
                </div>
            ) : !coupons || coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white border border-gray-200 rounded-2xl border-dashed">
                    <Tag size={40} className="text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-600">No promotions available</p>
                    <p className="text-xs text-gray-400 mt-1">Create a promo code to offer discounts to your customers.</p>
                </div>
            ) : (
                // Used Tailwind arbitrary variants to hide the scrollbar cleanly
               <div 
  ref={scrollContainerRef} 
  className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar"
>
                    { coupons && coupons.map((coupon) => {
                        const isExpired = new Date(coupon.valid_to) < new Date();
                        const isActive = coupon.is_active !== false && !isExpired;
                        const isAutoApplied = coupon.is_auto_applied === true;

                        return (
                            <div 
                                key={coupon.id} 
                                className="min-w-[340px] max-w-[340px] bg-white border border-gray-200 rounded-2xl p-5 shadow-sm snap-start flex-shrink-0 relative flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                                <div>
                                    {/* Header: Code & Badges */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="max-w-[70%]">
                                            <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase border-b-2 border-dashed border-gray-200 inline-block pb-1 truncate w-full">
                                                {coupon.code}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium mt-1.5 line-clamp-1"  >
                                                {coupon.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                                                isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {isActive ? 'Active' : 'Expired'}
                                            </span>
                                            {isAutoApplied && (
                                                <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md bg-blue-100 text-blue-700 flex items-center gap-1">
                                                    <Zap size={10} fill="currentColor" /> Auto
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        {/* Primary Highlight */}
                                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex justify-between items-center">
                                            <span className="text-blue-800 font-semibold text-sm">Discount</span>
                                            <span className="font-black text-blue-600 text-lg">
                                                {coupon.discount_type === 'percentage' 
                                                    ? `${coupon.discount_value}% OFF` 
                                                    : `₹${coupon.discount_value} OFF`}
                                            </span>
                                        </div>

                                        {/* Detailed Conditions Grid */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {/* Dates */}
                                            <div className="col-span-2 flex items-center justify-between text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                <span className="flex items-center gap-1.5 font-medium"><Calendar size={13}/> Validity</span>
                                                <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
                                                    {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_to)}
                                                </span>
                                            </div>

                                            {/* Min/Max Financials */}
                                            {(coupon.min_order_amount || coupon.max_discount_amount) && (
                                                <div className="col-span-2 grid grid-cols-2 gap-2">
                                                    {coupon.min_order_amount && (
                                                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex flex-col justify-center">
                                                            <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wide">Min Spend</span>
                                                            <span className="font-semibold text-gray-800 mt-0.5">₹{coupon.min_order_amount}</span>
                                                        </div>
                                                    )}
                                                    {coupon.max_discount_amount && (
                                                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex flex-col justify-center">
                                                            <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wide">Max Cap</span>
                                                            <span className="font-semibold text-gray-800 mt-0.5">₹{coupon.max_discount_amount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Usage Limits */}
                                            {(coupon.max_uses || coupon.max_uses_per_user) && (
                                                <div className="col-span-2 flex flex-wrap gap-x-4 gap-y-2 mt-1 px-1">
                                                    {coupon.max_uses_per_user && (
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <Users size={13} /> 
                                                            <span><strong className="text-gray-700">{coupon.max_uses_per_user}</strong> / user</span>
                                                        </div>
                                                    )}
                                                    {coupon.max_uses && (
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <ShoppingCart size={13} /> 
                                                            <span><strong className="text-gray-700">{coupon.max_uses}</strong> total</span>
                                                        </div>
                                                    )}
                                                     {coupon.total_used !== undefined && (
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                           <Calculator size={13} />
                                                            <span><strong className="text-gray-700">{coupon.total_used}</strong> used</span>
                                                        </div> 
                                                    )}
                                                 
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onEdit(coupon.id)}
                                    className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors border border-gray-200 shadow-sm mt-2"
                                >
                                    Edit Rules
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};