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
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { loadCart, addToCart, removeFromCart } from "@/lib/features/Cart";
import { openLoginModal } from "@/lib/features/auth/authSlice";
import { createCheckoutSession } from "@/hooks/UseCheckoutSession";
import { authToken } from "@/utils/authToken";
import { AvailableCouponsModal } from "@/components/customer/AvailableCouponsModal";
import { AddToCart } from "@/components/customer/AddToCart";
import { fetchAddToCart, fetchRemoveFromCart } from "@/utils/customerApiClient";
import AxiosAPI from "@/lib/axios";

// Constants
import { CART_PAGE_TEXT } from "@/constants/customerText";

// Core internal types from the codebase
import { Variant, Coupon, User } from "@/utils/Types";

// Shadcn UI components
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

// ─── PriceTicker component for smooth visual count-up/down updates ───────────────
const PriceTicker = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <motion.span
      key={displayValue}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="inline-block font-extrabold text-pink-600 dark:text-pink-400 text-lg sm:text-xl"
    >
      ₹{formatCurrency(displayValue)}
    </motion.span>
  );
};

// ─── Reducer Action types ────────────────────────────────────────────────────────
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

// ─── CartItem Card (Custom Redesigned Layout) ───────────────────────────────────
interface CartItemCardProps {
  item: CartItemListResponse;
  syncingItemId: string | null;
  onUpdateQuantity: (item: CartItemListResponse, newQty: number) => void;
  onRemoveItem: (item: CartItemListResponse) => void;
}

const CartItemCard = ({
  item,
  syncingItemId,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemCardProps) => {
  const isSyncing = syncingItemId === item.id;

  return (
    <motion.div
      layout
      key={item.id}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      <Card className="rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 border-border/60 overflow-hidden mb-4 bg-card">
        <CardContent className="p-4 sm:p-5 flex gap-4 items-center relative">
          {/* Gray image container preservation */}
          <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-muted/40 flex items-center justify-center border border-border/40 p-2">
            <img
              src={
                item.productVariant.images?.[0]?.image_url ??
                "https://placehold.co/150"
              }
              alt={item.productVariant.variant_name}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Core Content Container */}
          <div className="flex-1 min-w-0 flex flex-col justify-center pr-8 sm:pr-10">
            <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 leading-snug tracking-tight">
              {item.productVariant.variant_name}
            </h3>
            
            <p className="text-xs text-muted-foreground/80 font-medium mt-1">
              {CART_PAGE_TEXT.STANDARD_VARIANT}
            </p>

            <div className="flex items-end justify-between mt-4">
              <p className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                ₹{formatCurrency(Number(item.productVariant.price))}
              </p>

              {/* Pink Accent Quantity Selector via shared AddToCart component */}
              <AddToCart
                productVariantId={item.product_variant_id}
                productVariant={item.productVariant}
                variant="pink"
                styles="w-24 lg:w-28 h-8"
              />
            </div>
          </div>

          {/* Delete Button (Differentiated visual style top right) */}
          <button
            onClick={() => onRemoveItem(item)}
            disabled={isSyncing}
            className="absolute top-4 right-4 text-pink-600 dark:text-pink-400 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/20 dark:hover:bg-pink-900/30 border border-pink-100 dark:border-pink-900/30 hover:border-pink-200 dark:hover:border-pink-800 rounded-xl p-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Cart Skeleton Loader ──────────────────────────────────────────────────────
const CartItemSkeleton = () => (
  <Card className="rounded-3xl shadow-sm border-border/60 overflow-hidden mb-4 bg-card">
    <CardContent className="p-4 sm:p-5 flex flex-row gap-4 items-center">
      <Skeleton className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between items-end mt-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Cart Client Page Component ────────────────────────────────────────────
export default function CartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatchRedux = useAppDispatch();
  const token = authToken();

  // Avoid hydration mismatch by waiting for mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallbacks to Redux store
  const { itemList, loading } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const [state, dispatch] = useReducer(reducer, {
    isCouponModalOpen: false,
    selectedCoupon: null,
  });

  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sync Cart items on mount
  useEffect(() => {
    dispatchRedux(loadCart());
  }, [dispatchRedux]);

  // Handle auto redirection if URL checkout param exists
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

  // Compute pricing
  const totalPrice = itemList.reduce((total, item) => {
    return total + (Number(item.productVariant.price) || 0) * item.quantity;
  }, 0);

  const totalItemCount = itemList.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = totalPrice >= 500 || totalPrice === 0 ? 0 : 50;
  const estimatedTax = totalPrice - totalPrice / 1.18;

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
    totalPrice + shippingFee - couponDiscountAmount,
  );

  // Cart quantity actions
  const handleUpdateQuantity = async (item: CartItemListResponse, targetQty: number) => {
    if (syncingItemId) return;
    const productVariantId = item.product_variant_id;

    if (targetQty <= 0) {
      handleRemoveItem(item);
      return;
    }

    const prevQuantity = item.quantity;

    // Optimistic Update
    dispatchRedux(
      addToCart({
        cartId: item.cart_id,
        cartItemId: item.id,
        productVariantId,
        quantity: targetQty,
        productVariant: item.productVariant,
      })
    );

    if (!user?.id || !token || (typeof window !== "undefined" && !navigator.onLine)) {
      return;
    }

    setSyncingItemId(item.id);
    try {
      const response = await fetchAddToCart(
        productVariantId,
        targetQty,
        user.id,
        token
      );
      // Backend wraps NestJS controllers in a standard { success: true, data: { ... } } response
      if (response && response.success && response.data) {
        const cartResponse = response.data;
        dispatchRedux(
          addToCart({
            cartId: cartResponse.cart_id,
            cartItemId: cartResponse.cart_item_id,
            productVariantId: cartResponse.product_variant_id,
            quantity: cartResponse.quantity,
            productVariant: item.productVariant,
          })
        );
      } else {
        throw new Error("Failed to update cart quantity on server");
      }
    } catch (err) {
      console.warn("Failed to sync quantity:", err);
      // Rollback on error
      dispatchRedux(
        addToCart({
          cartId: item.cart_id,
          cartItemId: item.id,
          productVariantId,
          quantity: prevQuantity,
          productVariant: item.productVariant,
        })
      );
    } finally {
      setSyncingItemId(null);
    }
  };

  const handleRemoveItem = async (item: CartItemListResponse) => {
    if (syncingItemId) return;
    const productVariantId = item.product_variant_id;
    const prevQuantity = item.quantity;

    // Optimistic delete
    dispatchRedux(
      removeFromCart({
        productVariantId,
        quantity: 0,
      })
    );

    if (!user?.id || !token || (typeof window !== "undefined" && !navigator.onLine)) {
      return;
    }

    setSyncingItemId(item.id);
    try {
      const response = await fetchRemoveFromCart(
        user.id,
        item.cart_id,
        item.id,
        token
      );
      if (!response || !response.success) {
        throw new Error("Failed to delete item from server");
      }
    } catch (err) {
      console.warn("Failed to delete item:", err);
      // Rollback on error
      dispatchRedux(
        addToCart({
          cartId: item.cart_id,
          cartItemId: item.id,
          productVariantId,
          quantity: prevQuantity,
          productVariant: item.productVariant,
        })
      );
    } finally {
      setSyncingItemId(null);
    }
  };

  // Buy Now trigger handler
  const handleBuyNow = async () => {
    if (!itemList || itemList.length === 0) return;
    const cartId = itemList[0]?.cart_id;
    if (!cartId) return;

    if (!user || !user.id || !token) {
      const redirectTarget = `/customer/cart?checkout=true${state.selectedCoupon?.id ? '&couponId=' + state.selectedCoupon.id : ''}`;
      return dispatchRedux(openLoginModal(redirectTarget));
    }

    createCheckoutSession();
    router.push(`/customer/checkout?type=cart&id=${cartId}${state.selectedCoupon?.id ? '&couponId=' + state.selectedCoupon?.id : ''}`);
  };

  // Coupon Select API call
  const handleCouponSelect = async (coupon: Coupon) => {
    dispatch({ type: ActionType.SET_SELECTED_COUPON, payload: coupon });
    dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: false });
    
    if (user?.id && token) {
      try {
        await AxiosAPI.post(
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
      } catch (err) {
        console.warn("Coupon validation call failed:", err);
      }
    }
  };

  // Prevent SSR/CSR hydration markup mismatch by displaying skeleton shell initially
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-background pb-24 lg:pb-12">
        <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {CART_PAGE_TEXT.HEADER_TITLE}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              {CART_PAGE_TEXT.HEADER_SUBTITLE}
            </p>
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7 xl:col-span-8 w-full space-y-4">
              {[...Array(2)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-5 xl:col-span-4 w-full">
              <Skeleton className="h-[420px] rounded-3xl w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 lg:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
        
        {/* Uniform responsive header block */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {CART_PAGE_TEXT.HEADER_TITLE}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
            {CART_PAGE_TEXT.HEADER_SUBTITLE}
          </p>
        </div>

        {loading && itemList.length === 0 ? (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7 xl:col-span-8 w-full space-y-4">
              {[...Array(2)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-5 xl:col-span-4 w-full">
              <Skeleton className="h-[420px] rounded-3xl w-full" />
            </div>
          </div>
        ) : itemList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-3xl bg-card p-6"
          >
            <ShoppingBag size={48} className="text-muted-foreground/40 mb-4" />
            <p className="text-lg font-bold text-foreground">
              {CART_PAGE_TEXT.EMPTY_CART}
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
              {CART_PAGE_TEXT.EMPTY_CART_DESC}
            </p>
            <Button
              onClick={() => router.push("/")}
              className="mt-6 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-2xl px-8 py-5 text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              {CART_PAGE_TEXT.CONTINUE_SHOPPING}
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* ── Item List (with Framer Motion fade exit animations) ── */}
            <div className="lg:col-span-7 xl:col-span-8 w-full">
              <AnimatePresence mode="popLayout">
                {itemList.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    syncingItemId={syncingItemId}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* ── Order Summary Card & Sidebar ── */}
            <div className="lg:col-span-5 xl:col-span-4 w-full space-y-6 lg:sticky lg:top-6">
              <Card className="w-full rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border-border/60 bg-card overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-foreground mb-6">
                    {CART_PAGE_TEXT.ORDER_SUMMARY}
                  </h2>

                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{CART_PAGE_TEXT.SUBTOTAL}</span>
                      <span className="text-foreground font-semibold">
                        ₹{formatCurrency(totalPrice)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>{CART_PAGE_TEXT.SHIPPING}</span>
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full text-xs">
                          {CART_PAGE_TEXT.FREE_SHIPPING}
                        </span>
                      ) : (
                        <span className="text-foreground font-semibold">
                          ₹{formatCurrency(shippingFee)}
                        </span>
                      )}
                    </div>
                    
                    {/* GST responsive presentation */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span>{CART_PAGE_TEXT.ESTIMATED_GST}</span>
                        <span className="text-[11px] text-muted-foreground/70 hidden lg:inline">
                          {CART_PAGE_TEXT.GST_INCLUDED}
                        </span>
                      </div>
                      <span className="text-foreground font-semibold">
                        ₹{formatCurrency(estimatedTax)}
                      </span>
                    </div>

                    <Separator className="my-4 border-border/60" />

                    {/* Pink highlighted total container */}
                    <div className="bg-pink-50/40 dark:bg-pink-950/5 border border-pink-100/40 dark:border-pink-900/20 rounded-2xl p-4 flex items-center justify-between mt-5">
                      <span className="font-bold text-base text-foreground">{CART_PAGE_TEXT.TOTAL}</span>
                      <PriceTicker value={finalPrice} />
                    </div>
                  </div>

                  {/* Promo Coupons selection trigger */}
                  <div className="mt-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-3">
                      {CART_PAGE_TEXT.PROMO_CODE}
                    </p>
                    <AnimatePresence mode="wait">
                      {state.selectedCoupon ? (
                        <motion.div
                          key="applied"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl px-4 py-3.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide truncate">
                                {state.selectedCoupon.code}
                              </p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                Saving ₹{formatCurrency(couponDiscountAmount)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              dispatch({
                                type: ActionType.SET_SELECTED_COUPON,
                                payload: null,
                              })
                            }
                            className="text-emerald-600 dark:text-emerald-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs hover:underline transition-colors shrink-0 ml-2"
                          >
                            {CART_PAGE_TEXT.COUPON_REMOVE}
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="unapplied"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="bg-pink-50/10 dark:bg-pink-950/5 border border-dashed border-pink-200 dark:border-pink-900/30 rounded-2xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-pink-500" />
                            <span className="text-sm font-semibold text-foreground">
                              {CART_PAGE_TEXT.VIEW_COUPONS}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              dispatch({
                                type: ActionType.SET_COUPON_MODAL_OPEN,
                                payload: true,
                              })
                            }
                            className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-foreground border border-border rounded-xl px-4 py-1.5 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            {CART_PAGE_TEXT.COUPON_SELECT}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Black checkout buy button (Desktop only) */}
                  <button
                    onClick={handleBuyNow}
                    className="hidden lg:flex w-full mt-6 py-4 text-sm sm:text-base font-bold rounded-2xl shadow-md bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 items-center justify-center gap-2 transition-all active:scale-[0.98] select-none cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5 text-white dark:text-black" />
                    <span>{CART_PAGE_TEXT.BUY_NOW}</span>
                  </button>

                  {/* SSL and safety indicators */}
                  <div className="mt-5 flex flex-col items-center gap-3 text-xs text-muted-foreground/80">
                    <p className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={14} className="text-muted-foreground/85" /> {CART_PAGE_TEXT.SECURE_CHECKOUT}
                    </p>
                    <div className="flex items-center gap-3 opacity-60">
                      <CreditCard size={18} />
                      <Lock size={16} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Complimentary Shipping Banner (Below sidebar) */}
              <div className="bg-pink-50/30 dark:bg-pink-950/5 border border-pink-100/50 dark:border-pink-900/20 rounded-3xl p-5 flex items-start gap-4">
                <div className="bg-pink-100/50 dark:bg-pink-900/30 p-2 rounded-xl text-pink-600 dark:text-pink-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-pink-950 dark:text-pink-300">
                    {CART_PAGE_TEXT.COMPLIMENTARY_SHIPPING}
                  </h4>
                  <p className="text-xs text-pink-700/90 dark:text-pink-400/90 mt-1 leading-relaxed">
                    {CART_PAGE_TEXT.SHIPPING_BANNER_DESC}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile View Checkout */}
      {itemList.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/80 px-5 py-4 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                ₹{formatCurrency(finalPrice)}
              </span>
              <button
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mt-0.5 cursor-pointer"
              >
                <span>{CART_PAGE_TEXT.VIEW_DETAILS}</span>
                {isDetailsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <button
              onClick={handleBuyNow}
              className="flex-1 max-w-[240px] bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>{CART_PAGE_TEXT.BUY_NOW}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-up Price Details Sheet */}
      <AnimatePresence>
        {isDetailsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            {/* Slide up sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/80 rounded-t-3xl p-6 pb-24 shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
              <h3 className="font-extrabold text-lg text-foreground mb-4">{CART_PAGE_TEXT.PRICE_DETAILS}</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>{CART_PAGE_TEXT.SUBTOTAL}</span>
                  <span className="text-foreground font-semibold">
                    ₹{formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{CART_PAGE_TEXT.SHIPPING}</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full text-xs">
                      {CART_PAGE_TEXT.FREE_SHIPPING}
                    </span>
                  ) : (
                    <span className="text-foreground font-semibold">
                      ₹{formatCurrency(shippingFee)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>{CART_PAGE_TEXT.ESTIMATED_GST}</span>
                  <span className="text-foreground font-semibold">
                    ₹{formatCurrency(estimatedTax)}
                  </span>
                </div>
                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount ({state.selectedCoupon?.code})</span>
                    <span>− ₹{formatCurrency(couponDiscountAmount)}</span>
                  </div>
                )}
                <Separator className="my-4 border-border/60" />
                <div className="flex justify-between items-center text-foreground mt-4">
                  <span className="font-bold text-base">{CART_PAGE_TEXT.TOTAL_AMOUNT}</span>
                  <span className="font-extrabold text-pink-600 dark:text-pink-400 text-lg">
                    ₹{formatCurrency(finalPrice)}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
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
