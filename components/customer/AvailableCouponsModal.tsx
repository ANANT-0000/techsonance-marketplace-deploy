import React, { useEffect, useState } from 'react';
import { X, Loader2, Tag, Clock, AlertCircle } from 'lucide-react';
import AxiosAPI from '@/lib/axios';
import { authToken } from '@/utils/authToken';
import toast, { Toaster } from 'react-hot-toast';
import { Coupon } from '@/utils/Types';

interface AvailableCouponsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (coupon: Coupon) => void;
    cartTotal?: number; 
    productId?: string;  
}

export const AvailableCouponsModal = ({ isOpen, onClose, onSelect, cartTotal = 0, productId }: AvailableCouponsModalProps) => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const token = authToken();

    useEffect(() => {
        if (isOpen) {
            const fetchAvailableCoupons = async () => {
                setIsLoading(true);
                try {
                    const res = await AxiosAPI.get(`/v1/coupon/product/${productId ?? null}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { active: true,  } 
                    });
                    setCoupons(res.data.data || []);
                } catch (error) {
                    console.error("Failed to fetch coupons", error);
                    toast.error("Could not load coupons.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAvailableCoupons();
        }
    }, [isOpen, token]);

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="w-full h-full fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
                
                {/* Header (Sticky) */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Tag className="text-blue-600" size={20} />
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">Available Offers</h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-sm">
                        <X size={18} />
                    </button>
                </div>
                
                {/* Coupon List (Scrollable Area) */}
                <div className="overflow-y-auto lg:p-4 p-2 space-y-4 bg-slate-50/50 flex-1 hide-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center lg:py-12 py-6 gap-3">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <p className="text-sm text-gray-500 font-medium">Finding the best offers...</p>
                        </div>
                    ) :coupons && Array.isArray(coupons) &&  coupons.length === 0 ? (
                        <div className="text-center lg:py-12 py-6">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Tag className="text-gray-400" size={28} />
                            </div>
                            <h4 className="text-gray-800 font-bold mb-1">No offers right now</h4>
                            <p className="text-gray-500 text-sm">Check back later for exciting discounts.</p>
                        </div>
                    ) : (
                  coupons && Array.isArray(coupons) &&       coupons.map((coupon) => {
                            const minSpend = Number(coupon.min_order_amount) || 0;
                            const isLocked = cartTotal > 0 && cartTotal < minSpend;
                            const remainingForUnlock = minSpend - cartTotal;

                            return (
                                <div 
                                    key={coupon.id} 
                                    className={`relative bg-white border rounded-2xl lg:py-4 lg:px-4 py-2 px-4 shadow-sm transition-all overflow-hidden flex flex-col gap-3 ${
                                        isLocked 
                                            ? 'border-gray-200 opacity-80' 
                                            : 'border-blue-100 hover:border-blue-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isLocked ? 'bg-gray-300' : 'bg-blue-500'}`} />

                                    {/* Top Row: Discount & Apply Button */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex flex-col">
                                            <span className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${isLocked ? 'text-gray-600' : 'text-blue-700'}`}>
                                                {coupon.discount_type === 'percentage' 
                                                    ? `${coupon.discount_value}% OFF` 
                                                    : `₹${coupon.discount_value} OFF`}
                                            </span>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-gray-700 border border-gray-200 border-dashed uppercase truncate max-w-[120px] sm:max-w-[150px]" title={coupon.code}>
                                                    {coupon.code}
                                                </span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => !isLocked && onSelect(coupon)}
                                            disabled={isLocked}
                                            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex-shrink-0 ${
                                                isLocked 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-900 text-white hover:bg-black hover:shadow-md active:scale-95'
                                            }`}
                                        >
                                            {isLocked ? 'Locked' : 'Apply'}
                                        </button>
                                    </div>

                                    {/* Description */}
                                  {coupon.description &&  <p className="text-[13px] sm:text-sm text-gray-600 font-medium leading-snug">
                                        {coupon.description}
                                    </p>}

                                    {/* Rules Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:mt-1   border-t border-gray-100 border-dashed">
                                        
                                        {/* Min Spend Rule - Takes full width on mobile if needed */}
                                        {coupon.min_order_amount && (
                                            <div className="col-span-1 sm:col-span-2 text-xs text-gray-500 flex items-start sm:items-center gap-1.5 leading-tight">
                                                <AlertCircle size={14} className={`flex-shrink-0 mt-0.5 sm:mt-0 ${isLocked ? "text-amber-500" : "text-gray-400"}`} />
                                                {isLocked ? (
                                                    <span className="text-amber-600 font-semibold">
                                                        Add ₹{remainingForUnlock} more to unlock
                                                    </span>
                                                ) : (
                                                    <span>Valid on orders above ₹{coupon.min_order_amount}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Meta Boxes Container */}
                                        <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-2 mt-1">
                                            {coupon.max_discount_amount && (
                                                <div className="flex-1 min-w-[100px] text-[10px] sm:text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                                    <span className="font-semibold text-gray-700">Max Discount:</span><br/>
                                                    ₹{coupon.max_discount_amount}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-[100px] text-[10px] sm:text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                                <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                    <Clock size={10} className="flex-shrink-0" /> Valid Till:
                                                </span>
                                                {formatDate(coupon.valid_to)}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
                        <Toaster />
            
        </div>
    );
};