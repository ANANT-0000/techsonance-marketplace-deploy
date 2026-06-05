'use client';

import { motion, AnimatePresence } from "framer-motion"; 
import { AddToCart } from "@/components/customer/AddToCart";
import { BuyBtn } from "@/components/customer/BuyBtn";
import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2, ChevronLeft,
    Tag, X, ShoppingBag, ShieldCheck, CreditCard, Lock, Truck
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { BuyBtnMode, Coupon, Variant } from "@/utils/Types";
import { loadCart } from "@/lib/features/Cart";
import { authToken } from "@/utils/authToken";
import { AvailableCouponsModal } from "@/components/customer/AvailableCouponsModal";
import AxiosAPI from "@/lib/axios";

// shadcn/ui imports
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export interface CartItemListResponse {
    id: string;
    cart_id: string;
    product_variant_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    productVariant: Variant;
}

// ─── PriceTicker ──────────────────────────────────────────────────────────────
const PriceTicker = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    useEffect(() => {
        const timeout = setTimeout(() => setDisplayValue(value), 50);
        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <motion.span
            key={displayValue}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block font-bold text-xl text-foreground"
        >
            ₹{formatCurrency(value)}
        </motion.span>
    );
};

// ─── CartItem Card (Fixed Layout) ──────────────────────────────────────────────
const CartItemCard = ({ item }: { item: CartItemListResponse }) => (
    <motion.div
        layout
        key={item.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -40, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-border overflow-hidden mb-4">
            <CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                {/* Image */}
                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-border/50 p-1.5">
                    <img
                        src={item.productVariant.images[0]?.image_url ?? "https://placehold.co/150"}
                        alt={item.productVariant.variant_name}
                        className="w-full h-full object-contain mix-blend-multiply"
                    />
                </div>

                {/* Content Container */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-2 leading-snug">
                        {item.productVariant.variant_name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        Standard Variant
                    </p>
                    
                    <div className="flex items-center justify-between mt-3 gap-2">
                        {/* Price (Truncated so it doesn't break layout if number is huge) */}
                        <p className="text-sm sm:text-base font-bold text-foreground truncate min-w-0">
                            ₹{formatCurrency(Number(item.productVariant.price))}
                        </p>
                        
                        {/* AddToCart Container (Protected by shrink-0 so it never collapses) */}
                        <div className="shrink-0 flex items-center justify-end relative z-10">
                            <AddToCart productVariantId={item.product_variant_id} styles="small w-20 lg:w-24" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

// ─── Coupon Row ───────────────────────────────────────────────────────────────
const CouponRow = ({
    selectedCoupon,
    discountAmount,
    onOpen,
    onRemove,
}: {
    selectedCoupon: Coupon | null;
    discountAmount: number;
    onOpen: () => void;
    onRemove: () => void;
}) => (
    <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm font-semibold text-foreground mb-3">Promo Code</p>
        <AnimatePresence mode="wait">
            {selectedCoupon ? (
                <motion.div
                    key="applied"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide truncate">
                                {selectedCoupon.code}
                            </p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                Saving ₹{formatCurrency(discountAmount)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="text-emerald-600 hover:text-red-600 font-medium text-xs hover:underline transition-colors shrink-0 ml-2"
                    >
                        Remove
                    </button>
                </motion.div>
            ) : (
                <motion.button
                    key="unapplied"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    onClick={onOpen}
                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl px-4 py-3 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <Tag size={18} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">View Available Coupons</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 bg-white border border-gray-200 px-3 py-1 rounded-md shadow-sm">
                        Select
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    </div>
);

// ─── Order Summary Card ───────────────────────────────────────────────────────
const OrderSummary = ({
    cartList,
    totalItemCount,
    totalPrice,
    selectedCoupon,
    couponDiscountAmount,
    onCouponOpen,
    onCouponRemove,
}: {
    cartList: CartItemListResponse[];
    totalItemCount: number;
    totalPrice: number;
    selectedCoupon: Coupon | null;
    couponDiscountAmount: number;
    onCouponOpen: () => void;
    onCouponRemove: () => void;
}) => {
    const finalPrice = Math.max(0, totalPrice - couponDiscountAmount);

    return (
        <div className="space-y-4">
            <Card className="w-full rounded-2xl shadow-sm border-border">
                <CardContent className="p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>

                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="text-foreground">₹{formatCurrency(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimated Shipping</span>
                            <span className="text-foreground">Calculated at next step</span>
                        </div>

                        <AnimatePresence>
                            {couponDiscountAmount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex justify-between text-blue-600 font-medium"
                                >
                                    <span>Discount ({selectedCoupon?.code})</span>
                                    <span>− ₹{formatCurrency(couponDiscountAmount)}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Separator className="my-4" />

                        <div className="flex justify-between items-center text-foreground">
                            <span className="font-bold text-lg">Total</span>
                            <PriceTicker value={finalPrice} />
                        </div>
                    </div>

                    <CouponRow
                        selectedCoupon={selectedCoupon}
                        discountAmount={couponDiscountAmount}
                        onOpen={onCouponOpen}
                        onRemove={onCouponRemove}
                    />

                    <div className="mt-6">
                        <BuyBtn
                            mode={BuyBtnMode.CART}
                            id={cartList[0]?.cart_id}
                            selectedCoupon={selectedCoupon}
                            styles="w-full py-4 text-base font-medium rounded-xl shadow-md bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2 transition-all"
                        />
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-3 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                            <ShieldCheck size={14} /> Secure SSL Checkout
                        </p>
                        <div className="flex items-center gap-3 opacity-60">
                            <CreditCard size={20} />
                            <Lock size={18} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Complimentary Shipping Banner */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <Truck className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Complimentary Shipping</h4>
                    <p className="text-xs text-blue-700 mt-1">Orders over ₹500 qualify for free express delivery worldwide.</p>
                </div>
            </div>
        </div>
    );
};

// ─── CartItemSkeleton ────────────────────────────────────────────────────────
const CartItemSkeleton = () => (
    <Card className="rounded-2xl shadow-sm border-border overflow-hidden mb-4">
        <CardContent className="p-4 sm:p-6 flex flex-row gap-4 sm:gap-6">
            <Skeleton className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl" />
            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex justify-between items-end mt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
            </div>
        </CardContent>
    </Card>
);

// ─── Reducer ──────────────────────────────────────────────────────────────────
interface State {
    isCouponModalOpen: boolean;
    selectedCoupon: Coupon | null;
}

enum ActionType {
    SET_COUPON_MODAL_OPEN = 'SET_COUPON_MODAL_OPEN',
    SET_SELECTED_COUPON = 'SET_SELECTED_COUPON'
}

type Action = 
    | { type: ActionType.SET_COUPON_MODAL_OPEN; payload: boolean }
    | { type: ActionType.SET_SELECTED_COUPON; payload: Coupon | null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ActionType.SET_COUPON_MODAL_OPEN: return { ...state, isCouponModalOpen: action.payload };
        case ActionType.SET_SELECTED_COUPON: return { ...state, selectedCoupon: action.payload };
        default: return state;
    }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CartClient() {
    const { itemList, loading } = useAppSelector((state) => state.cart);
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const dispatchRedux = useAppDispatch();
    const token = authToken();

    const [state, dispatch] = useReducer(reducer, {
        isCouponModalOpen: false,
        selectedCoupon: null
    });

    useEffect(() => {
        if (!user?.id || !token) {
            setTimeout(() => router.push('/auth/customerLogin'), 1000);
            return;
        }
        dispatchRedux(loadCart());
    }, [user?.id, dispatchRedux, token, router]);

    const totalPrice = itemList.reduce((total, item) => {
        return total + (Number(item.productVariant.price) || 0) * item.quantity;
    }, 0);

    const totalItemCount = itemList.reduce((sum, item) => sum + item.quantity, 0);

    const couponDiscountAmount = (() => {
        if (!state.selectedCoupon) return 0;
        if (state.selectedCoupon.discount_type === 'percentage') {
            const raw = Math.floor(totalPrice * (Number(state.selectedCoupon.discount_value) / 100));
            return state.selectedCoupon.max_discount_amount
                ? Math.min(raw, Number(state.selectedCoupon.max_discount_amount))
                : raw;
        }
        return Number(state.selectedCoupon.discount_value);
    })();

    const handleCouponSelect = async (coupon: Coupon) => {
        dispatch({ type: ActionType.SET_SELECTED_COUPON, payload: coupon });
        dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: false });
        const res = await AxiosAPI.post('/v1/coupon/validate', { 
            userId: user?.id,
            code: coupon.code, 
            cartTotal: totalPrice, 
            productIdsInCart: itemList.map(item => item.productVariant.product_id) 
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Coupon validation response:", res.data);
    };

    return (
        <main className="min-h-screen bg-gray-50/30 pb-24 md:pb-12">
            {/* Cleaner Mobile header */}
            <div className="flex items-center gap-3 px-4 pt-6 pb-4 sm:hidden">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shrink-0 shadow-sm"
                >
                    <ChevronLeft size={18} />
                </button>
                <h1 className="font-bold text-xl text-foreground">Your Cart</h1>
                {totalItemCount > 0 && (
                    <span className="ml-auto text-sm font-medium text-muted-foreground">({totalItemCount})</span>
                )}
            </div>

            <div className="max-w-[1200px] mx-auto lg:px-8 px-4 py-2 lg:py-10">
                {/* Desktop title */}
                <div className="hidden sm:block mb-8">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Your Bag</h1>
                    <p className="text-base text-muted-foreground mt-2">Review your selection before checkout.</p>
                </div>

                {loading && itemList.length === 0 ? (
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 xl:col-span-8 w-full space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <CartItemSkeleton key={i} />
                            ))}
                        </div>
                        <div className="lg:col-span-5 xl:col-span-4 w-full">
                            <Skeleton className="h-[400px] rounded-2xl w-full" />
                        </div>
                    </div>
                ) : itemList.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed border-border rounded-2xl bg-white"
                    >
                        <ShoppingBag size={48} className="text-gray-300 mb-4" />
                        <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground mt-1">Add some items to get started</p>
                        <Button
                            onClick={() => router.push('/')}
                            className="mt-6 bg-black text-white hover:bg-gray-800 rounded-xl px-8"
                        >
                            Continue Shopping
                        </Button>
                    </motion.div>
                ) : (
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                        {/* ── Item List ── */}
                        <div className="lg:col-span-7 xl:col-span-8 w-full">
                            <AnimatePresence mode="popLayout">
                                {itemList.map((item) => (
                                    <CartItemCard key={item.id} item={item} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* ── Order Summary ── */}
                        <div className="lg:col-span-5 xl:col-span-4 w-full lg:sticky lg:top-8">
                            <OrderSummary
                                cartList={itemList}
                                totalItemCount={totalItemCount}
                                totalPrice={totalPrice}
                                selectedCoupon={state.selectedCoupon}
                                couponDiscountAmount={couponDiscountAmount}
                                onCouponOpen={() => dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: true })}
                                onCouponRemove={() => dispatch({ type: ActionType.SET_SELECTED_COUPON, payload: null })}
                            />
                        </div>
                    </div>
                )}
            </div>

            <AvailableCouponsModal
                isOpen={state.isCouponModalOpen}
                onClose={() => dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: false })}
                onSelect={handleCouponSelect}
            />
        </main>
    );
}