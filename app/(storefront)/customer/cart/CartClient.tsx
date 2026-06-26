"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Tag,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Lock,
  Truck,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { addToCart, removeFromCart } from "@/lib/features/Cart";
import { authToken } from "@/utils/authToken";
import { AvailableCouponsModal } from "@/components/customer/AvailableCouponsModal";
import { BuyBtn } from "@/components/customer/BuyBtn";
import { fetchRemoveFromCart } from "@/utils/customerApiClient";
import AxiosAPI from "@/lib/axios";
import { Variant, Coupon, BuyBtnMode } from "@/utils/Types";

// shadcn/ui imports
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToCart } from "@/components/customer/AddToCart";

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
      className="inline-block font-bold text-theme-h5 text-foreground"
    >
      ₹{formatCurrency(value)}
    </motion.span>
  );
};

// ─── CartItem Card (Redesigned matching Screenshot) ───────────────────────────
interface CartItemCardProps {
  item: CartItemListResponse;
  syncingItemId: string | null;
  onRemoveItem: (item: CartItemListResponse) => void;
}

const CartItemCard = ({
  item,
  syncingItemId,
  onRemoveItem,
}: CartItemCardProps) => {
  const isSyncing = syncingItemId === item.id;

  return (
    <motion.div
      layout
      key={item.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-border overflow-hidden mb-4 bg-card group relative">
        <CardContent className="p-4 flex gap-4 items-center">
          {/* Image Container */}
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-secondary/40 flex items-center justify-center border border-border/50 p-2 transition-transform duration-300 group-hover:scale-[1.02]">
            <img
              src={
                item.productVariant.images?.[0]?.image_url ??
                "https://placehold.co/150"
              }
              alt={item.productVariant.variant_name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Content Container */}
          <div className="flex-1 min-w-0 flex flex-col justify-center pr-8">
            <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug tracking-tight">
              {item.productVariant.variant_name}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Standard Variant
            </p>

            <div className="flex items-center justify-between mt-3 gap-2">
              {/* Price */}
              <p className="text-xs sm:text-sm font-bold text-foreground truncate min-w-0">
                ₹{formatCurrency(Number(item.productVariant.price))}
              </p>

              {/* AddToCart Container */}
              <div className="shrink-0 flex items-center justify-end relative z-10">
                <AddToCart
                  productVariantId={item.product_variant_id}
                  styles="small w-20 lg:w-24"
                />
              </div>
            </div>
          </div>

          {/* Delete Button (Pink accent matches visual screenshot) */}
          <button
            onClick={() => onRemoveItem(item)}
            disabled={isSyncing}
            className="absolute top-4 right-4 text-theme-primary bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/20 hover:border-theme-primary/30 rounded-xl p-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Coupon Row ───────────────────────────────────────────────────────────────
const CouponRow = ({
  selectedCoupon,
  discountAmount,
  onOpen,
  onRemove,
  isMobileFooter = false,
}: {
  selectedCoupon: Coupon | null;
  discountAmount: number;
  onOpen: () => void;
  onRemove: () => void;
  isMobileFooter?: boolean;
}) => (
  <div
    className={
      isMobileFooter
        ? "text-left mb-3 pb-3 border-b border-border/80"
        : "mt-5 pt-5 border-t border-border text-left"
    }
  >
    {!isMobileFooter && (
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Promo Code
      </p>
    )}
    <AnimatePresence mode="wait">
      {selectedCoupon ? (
        <motion.div
          key="applied"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-center justify-between bg-success/15 border border-success/20 rounded-xl px-3 py-2.5"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 size={16} className="text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-success uppercase tracking-wide truncate">
                {selectedCoupon.code}
              </p>
              <p className="text-[10px] text-success/90 font-medium mt-0.5">
                Saving ₹{formatCurrency(discountAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-success hover:text-destructive font-semibold text-[11px] hover:underline transition-colors shrink-0 ml-2 cursor-pointer"
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
          className="w-full flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 border border-dashed border-border rounded-xl px-4 py-2.5 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Tag size={16} className="text-theme-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              View Available Coupons
            </span>
          </div>
          <span className="text-[10px] font-bold text-foreground bg-card border border-border px-2.5 py-1 rounded-md shadow-sm transition-all active:scale-95">
            Select
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  </div>
);

// ─── Order Summary Card (Sidebar) ─────────────────────────────────────────────
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
  const shippingFee = totalPrice >= 500 || totalPrice === 0 ? 0 : 50;
  const estimatedTax = totalPrice - totalPrice / 1.18;
  const finalPrice = Math.max(
    0,
    totalPrice + shippingFee - couponDiscountAmount,
  );

  return (
    <div className="space-y-4">
      <Card className="w-full rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
        <CardContent className="p-5 sm:p-6 text-left">
          <h2 className="text-base font-bold text-foreground tracking-tight mb-5">
            Order Summary
          </h2>

          <div className="space-y-4 text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-foreground font-medium">
                ₹{formatCurrency(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Estimated Shipping</span>
              {shippingFee === 0 ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/10">
                  Free
                </span>
              ) : (
                <span className="text-foreground font-medium">
                  ₹{formatCurrency(shippingFee)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span>Estimated GST (18% Included)</span>
              <span className="text-foreground font-medium">
                ₹{formatCurrency(estimatedTax)}
              </span>
            </div>

            <AnimatePresence>
              {couponDiscountAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between items-center text-theme-primary font-medium"
                >
                  <span>Discount ({selectedCoupon?.code})</span>
                  <span>− ₹{formatCurrency(couponDiscountAmount)}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Separator className="my-4" />

            {/* Highlighted Total Box */}
            <div className="bg-theme-primary/5 dark:bg-theme-primary/10 border border-theme-primary/20 dark:border-theme-primary/10 rounded-2xl p-4 flex items-center justify-between mt-5">
              <span className="font-bold text-sm sm:text-base text-foreground">
                Total
              </span>
              <PriceTicker value={finalPrice} />
            </div>
          </div>

          <CouponRow
            selectedCoupon={selectedCoupon}
            discountAmount={couponDiscountAmount}
            onOpen={onCouponOpen}
            onRemove={onCouponRemove}
          />

          <div className="mt-6 active:scale-[0.98] transition-transform">
            <BuyBtn
              mode={BuyBtnMode.CART}
              id={cartList[0]?.cart_id}
              selectedCoupon={selectedCoupon}
              styles="w-full py-3 text-xs sm:text-sm font-semibold rounded-xl shadow-sm bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center gap-2 transition-all cursor-pointer"
            />
          </div>

          <div className="mt-5 flex flex-col items-center gap-2.5 text-[10px] text-muted-foreground/80">
            <p className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={13} className="text-muted-foreground" /> Secure
              SSL Checkout
            </p>
            <div className="flex items-center gap-3 opacity-60">
              <CreditCard size={18} />
              <Lock size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complimentary Shipping Banner */}
      <div className="bg-secondary/30 border border-border rounded-2xl p-4 flex items-start gap-3 text-left">
        <Truck className="text-theme-primary shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-xs font-bold text-foreground">
            Complimentary Shipping
          </h4>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Orders over ₹500 qualify for free express delivery worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── CartItemSkeleton ────────────────────────────────────────────────────────
const CartItemSkeleton = () => (
  <Card className="rounded-2xl shadow-sm border-border overflow-hidden mb-4 bg-card">
    <CardContent className="p-4 flex flex-row gap-4">
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
  SET_COUPON_MODAL_OPEN = "SET_COUPON_MODAL_OPEN",
  SET_SELECTED_COUPON = "SET_SELECTED_COUPON",
}

type Action =
  | { type: ActionType.SET_COUPON_MODAL_OPEN; payload: boolean }
  | { type: ActionType.SET_SELECTED_COUPON; payload: Coupon | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_COUPON_MODAL_OPEN:
      return { ...state, isCouponModalOpen: action.payload };
    case ActionType.SET_SELECTED_COUPON:
      return { ...state, selectedCoupon: action.payload };
    default:
      return state;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CartClient() {
  const { itemList, loading } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatchRedux = useAppDispatch();
  const token = authToken();

  // Avoid hydration mismatch by waiting for mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [state, dispatch] = useReducer(reducer, {
    isCouponModalOpen: false,
    selectedCoupon: null,
  });

  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isDetailsOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isDetailsOpen]);

  useEffect(() => {
    const checkoutParam = searchParams.get("checkout");
    if (checkoutParam === "true" && user?.id && token && itemList.length > 0) {
      const cartId = itemList[0]?.cart_id;
      if (cartId) {
        const couponIdParam = searchParams.get("couponId")
          ? `&couponId=${searchParams.get("couponId")}`
          : "";
        router.push(
          `/customer/checkout?type=cart&id=${cartId}${couponIdParam}`,
        );
      }
    }
  }, [itemList, user?.id, token, searchParams, router]);

  const totalPrice = itemList.reduce((total, item) => {
    return total + (Number(item.productVariant.price) || 0) * item.quantity;
  }, 0);

  const totalItemCount = itemList.reduce((sum, item) => sum + item.quantity, 0);

  const couponDiscountAmount = (() => {
    if (!state.selectedCoupon) return 0;
    if (state.selectedCoupon.discount_type === "percentage") {
      const raw = Math.floor(
        totalPrice * (Number(state.selectedCoupon.discount_value) / 100),
      );
      return state.selectedCoupon.max_discount_amount
        ? Math.min(raw, Number(state.selectedCoupon.max_discount_amount))
        : raw;
    }
    return Number(state.selectedCoupon.discount_value);
  })();

  const finalPrice = Math.max(
    0,
    totalPrice +
      (totalPrice >= 500 || totalPrice === 0 ? 0 : 50) -
      couponDiscountAmount,
  );

  const handleRemoveItem = async (item: CartItemListResponse) => {
    if (syncingItemId) return;

    const prevQuantity = item.quantity;

    // Optimistic full removal
    dispatchRedux(
      removeFromCart({
        productVariantId: item.product_variant_id,
        quantity: 0,
      }),
    );

    if (
      !user?.id ||
      !token ||
      (typeof window !== "undefined" && !navigator.onLine)
    ) {
      return;
    }

    setSyncingItemId(item.id);
    try {
      const response = await AxiosAPI.delete(
        `/v1/cart/item/${user.id}/${item.id}`,
      );
    } catch (err) {
      dispatchRedux(
        addToCart({
          cartId: item.cart_id,
          cartItemId: item.id,
          productVariantId: item.product_variant_id,
          quantity: prevQuantity,
          productVariant: item.productVariant,
        }),
      );
    } finally {
      setSyncingItemId(null);
    }
  };

  const handleCouponSelect = async (coupon: Coupon) => {
    dispatch({ type: ActionType.SET_SELECTED_COUPON, payload: coupon });
    dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: false });
    const res = await AxiosAPI.post(
      "/v1/coupon/validate",
      {
        userId: user?.id,
        code: coupon.code,
        cartTotal: totalPrice,
        productIdsInCart: itemList.map(
          (item) => item.productVariant.product_id,
        ),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-background pb-24 lg:pb-12">
        <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
          <div className="mb-6 sm:mb-8 text-left">
            <Skeleton className="h-8 w-48 rounded mb-2" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 xl:col-span-8 w-full space-y-4">
              {[...Array(2)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-5 xl:col-span-4 w-full">
              <Skeleton className="h-[400px] rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Mobile Title Block */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 sm:hidden text-left">
        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Your Cart
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Review items in your cart
          </p>
        </div>
        {totalItemCount > 0 && (
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
            {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      <div className="mx-auto lg:px-8 px-4 py-2 lg:py-10 pb-24 lg:pb-10">
        {/* Desktop title */}
        <div className="hidden sm:block mb-6 text-left">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Your Bag
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review your selection before checkout.
          </p>
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
            className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-2xl bg-card p-6"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Your cart is empty
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
              Add some items to get started
            </p>
            <Button
              onClick={() => router.push("/")}
              className="mt-6 bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 py-2 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
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
                  <CartItemCard
                    key={item.id}
                    item={item}
                    syncingItemId={syncingItemId}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* ── Order Summary ── */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 w-full lg:sticky lg:top-8">
              <OrderSummary
                cartList={itemList}
                totalItemCount={totalItemCount}
                totalPrice={totalPrice}
                selectedCoupon={state.selectedCoupon}
                couponDiscountAmount={couponDiscountAmount}
                onCouponOpen={() =>
                  dispatch({
                    type: ActionType.SET_COUPON_MODAL_OPEN,
                    payload: true,
                  })
                }
                onCouponRemove={() =>
                  dispatch({
                    type: ActionType.SET_SELECTED_COUPON,
                    payload: null,
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile Checkout */}
      {itemList.length > 0 && (
        <div className="lg:hidden fixed bottom-[calc(48px+env(safe-area-inset-bottom))] left-0 right-0 z-50 bg-background border-t border-border/80 px-5 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          <div className="max-w-[1200px] mx-auto">
            <CouponRow
              selectedCoupon={state.selectedCoupon}
              discountAmount={couponDiscountAmount}
              isMobileFooter={true}
              onOpen={() =>
                dispatch({
                  type: ActionType.SET_COUPON_MODAL_OPEN,
                  payload: true,
                })
              }
              onRemove={() =>
                dispatch({
                  type: ActionType.SET_SELECTED_COUPON,
                  payload: null,
                })
              }
            />
          </div>
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold text-foreground tracking-tight">
                ₹{formatCurrency(finalPrice)}
              </span>
              <button
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground mt-0.5 cursor-pointer select-none"
              >
                <span>View Details</span>
                {isDetailsOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </button>
            </div>

            <BuyBtn
              mode={BuyBtnMode.CART}
              id={itemList[0]?.cart_id}
              selectedCoupon={state.selectedCoupon}
              styles="flex-1 max-w-[240px] w-full py-3 text-xs sm:text-sm font-semibold rounded-xl shadow-sm bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center gap-2 transition-all cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Mobile Details Drawer Sheet */}
      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            key="details-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDetailsOpen(false)}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />
        )}
        {isDetailsOpen && (
          <motion.div
            key="details-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border rounded-t-3xl p-6 pb-[260px] shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            <h3 className="font-bold text-base text-foreground text-left mb-4">
              Price Details
            </h3>
            <div className="space-y-4 text-xs text-muted-foreground text-left">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-foreground font-semibold">
                  ₹{formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated Shipping</span>
                {totalPrice >= 500 || totalPrice === 0 ? (
                  <span className="text-success font-bold bg-success/15 border border-success/10 px-2 py-0.5 rounded-full text-xs">
                    Free
                  </span>
                ) : (
                  <span className="text-foreground font-semibold">₹50.00</span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18% Included)</span>
                <span className="text-foreground font-semibold">
                  ₹{formatCurrency(totalPrice - totalPrice / 1.18)}
                </span>
              </div>
              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-theme-primary font-semibold">
                  <span>Discount ({state.selectedCoupon?.code})</span>
                  <span>− ₹{formatCurrency(couponDiscountAmount)}</span>
                </div>
              )}
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-foreground mt-4">
                <span className="font-bold text-sm">Total</span>
                <span className="font-bold text-theme-h5 text-theme-primary">
                  ₹{formatCurrency(finalPrice)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AvailableCouponsModal
        isOpen={state.isCouponModalOpen}
        onClose={() =>
          dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: false })
        }
        onSelect={handleCouponSelect}
      />
    </main>
  );
}
