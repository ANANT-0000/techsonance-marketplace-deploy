'use client';
import { motion, AnimatePresence } from "motion/react";
import { AddToCart } from "@/components/customer/AddToCart";
import { BuyBtn } from "@/components/customer/BuyBtn";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    CheckCircle2, ChevronLeft, ChevronRight,
    Tag, X, ShoppingBag, Package
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { BuyBtnMode, Coupon, Variant } from "@/utils/Types";
import { setItemList } from "@/lib/features/Cart";
import { authToken } from "@/utils/authToken";
import { AvailableCouponsModal } from "@/components/customer/AvailableCouponsModal";
import AxiosAPI from "@/lib/axios";

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
            className="inline-block font-bold text-xl"
        >
            ₹{formatCurrency(value)}
        </motion.span>
    );
};

// ─── CartItem Card ────────────────────────────────────────────────────────────
const CartItemCard = ({ item }: { item: CartItemListResponse }) => (
    <motion.div
        layout
        key={item.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -40, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 lg:p-4 shadow-sm hover:shadow-md transition-shadow"
    >
        {/* Image */}
        <div className="shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gray-50">
            <img
                src={item.productVariant.images[0]?.image_url ?? "/placeholder.png"}
                alt={item.productVariant.variant_name}
                className="w-full h-full object-cover"
            />
        </div>

        {/* Name + Price */}
        <div className="flex-1 min-w-0">
            <p className="text-xs lg:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                {item.productVariant.variant_name}
            </p>
            <p className="text-brand-primary font-bold text-sm lg:text-base mt-1">
                ₹{formatCurrency(Number(item.productVariant.price))}
            </p>
        </div>

        {/* Qty + Subtotal */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
            <AddToCart productVariantId={item.product_variant_id} styles="small w-20 lg:w-24" />
            <p className="text-[11px] text-gray-400">
                ₹{formatCurrency(Number(item.productVariant.price) * item.quantity)}
            </p>
        </div>
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
    <AnimatePresence mode="wait">
        {selectedCoupon ? (
            <motion.div
                key="applied"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5"
            >
                <div className="flex items-center gap-2.5">
                    <span className="bg-emerald-100 p-1.5 rounded-full text-emerald-600">
                        <CheckCircle2 size={16} />
                    </span>
                    <div>
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                            {selectedCoupon.code} Applied
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium">
                            Saving ₹{formatCurrency(discountAmount)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="p-1.5 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <X size={15} />
                </button>
            </motion.div>
        ) : (
            <motion.button
                key="unapplied"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                onClick={onOpen}
                className="w-full flex items-center justify-between bg-blue-50/60 hover:bg-blue-100/60 border border-dashed border-blue-300 rounded-xl px-3 py-2.5 transition-colors group"
            >
                <div className="flex items-center gap-2.5">
                    <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                        <Tag size={14} />
                    </span>
                    <div className="text-left">
                        <p className="text-xs font-bold text-blue-800">Available Offers</p>
                        <p className="text-[11px] text-blue-500">Tap to view coupons</p>
                    </div>
                </div>
                <ChevronRight size={16} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
        )}
    </AnimatePresence>
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
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full sticky lg:top-8 top-0 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 lg:px-6 lg:py-4 flex items-center gap-2">
                <Package size={18} className="text-gray-500" />
                <h2 className="font-bold text-base lg:text-lg text-gray-800">Order Summary</h2>
                <span className="ml-auto text-xs text-gray-400">{totalItemCount} item{totalItemCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="px-4 py-4 lg:px-6 lg:py-5 space-y-4">
                {/* Coupon */}
                <CouponRow
                    selectedCoupon={selectedCoupon}
                    discountAmount={couponDiscountAmount}
                    onOpen={onCouponOpen}
                    onRemove={onCouponRemove}
                />

                {/* Line items */}
                <div className="space-y-2 max-h-48 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {cartList.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-500">
                            <span className="line-clamp-1 max-w-[60%]">
                                {item.productVariant.variant_name}
                            </span>
                            <span className="font-medium text-gray-700">
                                ₹{formatCurrency(Number(item.productVariant.price) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{formatCurrency(totalPrice)}</span>
                    </div>

                    {couponDiscountAmount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between text-sm text-emerald-600"
                        >
                            <span>Coupon Discount</span>
                            <span>− ₹{formatCurrency(couponDiscountAmount)}</span>
                        </motion.div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="font-bold text-base lg:text-lg text-gray-900">Total</span>
                        <PriceTicker value={finalPrice} />
                    </div>
                </div>

                {/* CTA */}
                <BuyBtn
                    mode={BuyBtnMode.CART}
                    id={cartList[0]?.cart_id}
                    styles="w-full py-3 lg:py-4 text-base lg:text-lg rounded-xl shadow-md mt-1"
                />

                <p className="text-center text-[11px] text-gray-400">
                    Shipping &amp; taxes calculated at checkout
                </p>
            </div>
        </motion.div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CartList() {
    const { items } = useAppSelector((state) => state.cart);
    const { userId }: { userId: string } = useParams();
    const router = useRouter();
    const [cartList, setCartList] = useState<CartItemListResponse[]>([]);
    const [isCouponModalOpen, setCouponModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const dispatch = useAppDispatch();
    const token = authToken();

    useEffect(() => {
        const fetchCartList = async () => {
            if (!userId || !token) {
                setTimeout(() => router.push('/auth/customerLogin'), 1000);
                return;
            }
            try {
                const response = await fetchGetCartList(userId, token);
                if (!response?.data) {
                    setCartList([]);
                    dispatch(setItemList([]));
                    return;
                }
                setCartList(response.data);
                dispatch(setItemList(response.data));
            } catch (error) {
                console.error("Error fetching cart list:", error);
                setCartList([]);
            }
        };
        fetchCartList();
    }, [userId]);
    const enrichedCartList=cartList.map(item=>{
        const liveItem=items.find(i=>i.productVariantId===item.product_variant_id);
        return {
            ...item,
            quantity: liveItem?.quantity ?? item.quantity,
        }
    });
    console.log("Enriched Cart List:", enrichedCartList);
    const totalPrice = enrichedCartList.reduce((total, item) => {
        return total + (Number(item.productVariant.price) || 0) * item.quantity;
    }, 0);

    const totalItemCount = enrichedCartList.reduce((sum, item) => sum + item.quantity, 0);

    const couponDiscountAmount = (() => {
        if (!selectedCoupon) return 0;
        if (selectedCoupon.discount_type === 'percentage') {
            const raw = Math.floor(totalPrice * (Number(selectedCoupon.discount_value) / 100));
            return selectedCoupon.max_discount_amount
                ? Math.min(raw, Number(selectedCoupon.max_discount_amount))
                : raw;
        }
        return Number(selectedCoupon.discount_value);
    })();
const handleCouponSelect =async (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCouponModalOpen(false);
    const res=await AxiosAPI.post('/v1/coupon/validate', { 
    code: coupon.code, 
    cartTotal: totalPrice, 
    productIdsInCart: enrichedCartList.map(item => item.productVariant.product_id) }, {
        headers: { Authorization: `Bearer ${token}` }
});
console.log("Coupon validation response:", res.data);
}
    return (
        <main className="min-h-screen bg-gray-50/50">
            {/* Mobile header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:hidden bg-white border-b border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                <h1 className="font-bold text-lg text-gray-900">My Cart</h1>
                {totalItemCount > 0 && (
                    <span className="ml-auto text-sm text-gray-400">{totalItemCount} items</span>
                )}
            </div>

            <div className="max-w-6xl mx-auto lg:px-8 px-4 py-4 lg:py-8">
                {/* Desktop title */}
                <div className="hidden sm:block mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
                    <p className="text-sm text-gray-400 mt-1">Review your items before checkout</p>
                </div>

                {cartList.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white"
                    >
                        <ShoppingBag size={48} className="text-gray-300 mb-4" />
                        <p className="text-lg font-semibold text-gray-400">Your cart is empty</p>
                        <p className="text-sm text-gray-300 mt-1">Add some items to get started</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Continue Shopping
                        </button>
                    </motion.div>
                ) : (
                    <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 items-start">

                        {/* ── Item List (3/5) ── */}
                        <div className="lg:col-span-3 w-full space-y-3">
                            <AnimatePresence mode="popLayout">
                                {cartList.map((item) => (
                                    <CartItemCard key={item.id} item={item} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* ── Order Summary (2/5) ── */}
                        <div className="lg:col-span-2 w-full">
                            <OrderSummary
                                cartList={cartList}
                                totalItemCount={totalItemCount}
                                totalPrice={totalPrice}
                                selectedCoupon={selectedCoupon}
                                couponDiscountAmount={couponDiscountAmount}
                                onCouponOpen={() => setCouponModalOpen(true)}
                                onCouponRemove={() => setSelectedCoupon(null)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <AvailableCouponsModal
                isOpen={isCouponModalOpen}
                onClose={() => setCouponModalOpen(false)}
                onSelect={handleCouponSelect}
            />
        </main>
    );
}