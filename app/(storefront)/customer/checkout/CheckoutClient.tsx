"use client";
export const dynamic = "force-dynamic";
import { useEffect, Suspense, useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  calculateCouponDiscount,
  formatCurrency,
  getMinOrderAmount,
} from "@/lib/utils";
import { SelectedPaymentMethod } from "@/components/customer/SelectedPaymentMethod";
import {
  CartItem,
  PAYMENT_METHODS_FIELDS,
  RAZORPAY_CURRENCY,
  RAZORPAY_MERCHANT_NAME,
  RAZORPAY_PAYMENT_DESCRIPTION,
} from "@/constants";
import {
  checkAddressExistence,
  fetchGetCartList,
} from "@/utils/customerApiClient";
import {
  CreditCard,
  Loader2,
  Tag,
  CheckCircle2,
  X,
  AlertCircle,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Truck,
} from "lucide-react";
import { AddressSelector } from "@/components/customer/AddressSelector";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { useCheckoutSession } from "@/hooks/UseCheckoutSession";
import {
  fetchInitCheckout,
  fetchVerifyPayment,
} from "@/utils/customerApiClient-SA";
import { authToken } from "@/utils/authToken";
import {
  TaxBreakdown,
  TaxBreakdownPanel,
  TaxLoadingSkeleton,
} from "@/components/customer/TaxBreakdownPanel";
import { clearCart } from "@/lib/features/Cart";
import {
  AddressOperation,
  AppliedPromotion,
  CartItemDisplay,
  VariantDetails,
} from "@/utils/Types";
import AxiosAPI from "@/lib/axios";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";
import { AddressModal } from "@/components/customer/AddressModel";
import { ItemListPanel } from "@/components/customer/ItemListPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RootState } from "@/lib/store";

// ─── Razorpay Script Loader ──────────────────────────────────────────────────
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      const handleLoad = () => resolve(true);
      const handleError = () => resolve(false);

      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      if ((window as any).Razorpay) {
        resolve(true);
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Types ────────────────────────────────────────────────────────────────────

export enum CheckoutActionType {
  SET_CART_ITEMS = "SET_CART_ITEMS",
  SET_ADDRESS_ADDED = "SET_ADDRESS_ADDED",
  OPEN_ADDRESS_MODAL = "OPEN_ADDRESS_MODAL",
  CLOSE_ADDRESS_MODAL = "CLOSE_ADDRESS_MODAL",
  SET_PAYMENT_METHOD = "SET_PAYMENT_METHOD",
  SET_PROCESSING = "SET_PROCESSING",
  SET_CHECKOUT_ERROR = "SET_CHECKOUT_ERROR",
  SET_SELECTED_ADDRESS = "SET_SELECTED_ADDRESS",
  LOAD_ORDER_START = "LOAD_ORDER_START",
  LOAD_ORDER_SUCCESS = "LOAD_ORDER_SUCCESS",
  LOAD_QUICK_BUY_SUCCESS = "LOAD_QUICK_BUY_SUCCESS",
  LOAD_ORDER_ERROR = "LOAD_ORDER_ERROR",
  SET_LOADING_ORDER = "SET_LOADING_ORDER",
  SET_CART_ITEMS_FOR_TAX = "SET_CART_ITEMS_FOR_TAX",
  SET_QUICK_BUY_QTY = "SET_QUICK_BUY_QTY",
  SET_COUPON_CODE = "SET_COUPON_CODE",
  START_COUPON_VALIDATION = "START_COUPON_VALIDATION",
  APPLY_COUPON = "APPLY_COUPON",
  SET_COUPON_ERROR = "SET_COUPON_ERROR",
  SET_COUPON_VALIDATING_STATE = "SET_COUPON_VALIDATING_STATE",
  REMOVE_COUPON = "REMOVE_COUPON",
  SET_TAX_LOADING = "SET_TAX_LOADING",
  SET_TAX_LOADING_STATE = "SET_TAX_LOADING_STATE",
  SET_TAX_BREAKDOWN = "SET_TAX_BREAKDOWN",
  SET_TAX_ERROR = "SET_TAX_ERROR",
}
export enum PaymentMethod {
  COD = "cod",
  NET_BANKING = "netbanking",
  UPI = "upi",
  CARD = "card",
}
export interface CartItemForTaxPayload {
  variantId: string;
  quantity: number;
  price: number;
}

interface State {
  isAddressAdded: boolean;
  isModalOpen: boolean;
  modalMode: AddressOperation;
  editAddressId: string | null;
  selectedPaymentMethodState: PaymentMethod;
  isProcessing: boolean;
  checkoutError: string | null;
  selectedAddressId: string | null;
  cartItems: CartItemDisplay[];
  quickBuyVariant: VariantDetails | null;
  quickBuyQty: number;
  couponCode: string;
  couponApplied: AppliedPromotion | null;
  couponError: string | null;
  isCouponValidating: boolean;
  cartItemsForTax: CartItemForTaxPayload[];
  productIds: string[];
  isLoadingOrder: boolean;
  taxBreakdown: TaxBreakdown | null;
  isTaxLoading: boolean;
  taxError: string | null;
  lastTaxAddressId: string;
}

type Action =
  | { type: CheckoutActionType.SET_ADDRESS_ADDED; payload: boolean }
  | {
      type: CheckoutActionType.OPEN_ADDRESS_MODAL;
      payload: { mode: AddressOperation; editId: string | null };
    }
  | { type: CheckoutActionType.CLOSE_ADDRESS_MODAL }
  | { type: CheckoutActionType.SET_PAYMENT_METHOD; payload: PaymentMethod }
  | { type: CheckoutActionType.SET_PROCESSING; payload: boolean }
  | { type: CheckoutActionType.SET_CHECKOUT_ERROR; payload: string | null }
  | { type: CheckoutActionType.SET_SELECTED_ADDRESS; payload: string | null }
  | { type: CheckoutActionType.LOAD_ORDER_START }
  | {
      type: CheckoutActionType.LOAD_ORDER_SUCCESS;
      payload: {
        cartItems: CartItemDisplay[];
        cartItemsForTax: CartItemForTaxPayload[];
        productIds: string[];
      };
    }
  | {
      type: CheckoutActionType.LOAD_QUICK_BUY_SUCCESS;
      payload: {
        variant: VariantDetails;
        cartItemsForTax: CartItemForTaxPayload[];
        productIds: string[];
      };
    }
  | { type: CheckoutActionType.SET_CART_ITEMS; payload: CartItemDisplay[] }
  | { type: CheckoutActionType.LOAD_ORDER_ERROR; payload: string }
  | { type: CheckoutActionType.SET_LOADING_ORDER; payload: boolean }
  | {
      type: CheckoutActionType.SET_CART_ITEMS_FOR_TAX;
      payload: CartItemForTaxPayload[];
    }
  | { type: CheckoutActionType.SET_QUICK_BUY_QTY; payload: number }
  | { type: CheckoutActionType.SET_COUPON_CODE; payload: string }
  | { type: CheckoutActionType.START_COUPON_VALIDATION }
  | { type: CheckoutActionType.APPLY_COUPON; payload: AppliedPromotion }
  | { type: CheckoutActionType.SET_COUPON_ERROR; payload: string | null }
  | { type: CheckoutActionType.SET_COUPON_VALIDATING_STATE; payload: boolean }
  | { type: CheckoutActionType.REMOVE_COUPON }
  | {
      type: CheckoutActionType.SET_TAX_LOADING;
      payload: { isTaxLoading: boolean; lastTaxAddressId: string };
    }
  | { type: CheckoutActionType.SET_TAX_LOADING_STATE; payload: boolean }
  | { type: CheckoutActionType.SET_TAX_BREAKDOWN; payload: TaxBreakdown | null }
  | { type: CheckoutActionType.SET_TAX_ERROR; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case CheckoutActionType.SET_CART_ITEMS:
      return { ...state, cartItems: action.payload };
    case CheckoutActionType.SET_ADDRESS_ADDED:
      return { ...state, isAddressAdded: action.payload };
    case CheckoutActionType.OPEN_ADDRESS_MODAL:
      return {
        ...state,
        isModalOpen: true,
        modalMode: action.payload.mode,
        editAddressId: action.payload.editId,
      };
    case CheckoutActionType.CLOSE_ADDRESS_MODAL:
      return { ...state, isModalOpen: false };
    case CheckoutActionType.SET_PAYMENT_METHOD:
      return { ...state, selectedPaymentMethodState: action.payload };
    case CheckoutActionType.SET_PROCESSING:
      return { ...state, isProcessing: action.payload };
    case CheckoutActionType.SET_CHECKOUT_ERROR:
      return { ...state, checkoutError: action.payload };
    case CheckoutActionType.SET_SELECTED_ADDRESS:
      return { ...state, selectedAddressId: action.payload };
    case CheckoutActionType.LOAD_ORDER_START:
      return { ...state, isLoadingOrder: true, checkoutError: null };
    case CheckoutActionType.LOAD_ORDER_SUCCESS:
      return {
        ...state,
        isLoadingOrder: false,
        cartItems: action.payload.cartItems,
        cartItemsForTax: action.payload.cartItemsForTax,
        productIds: action.payload.productIds,
      };
    case CheckoutActionType.LOAD_QUICK_BUY_SUCCESS:
      return {
        ...state,
        isLoadingOrder: false,
        quickBuyVariant: action.payload.variant,
        cartItemsForTax: action.payload.cartItemsForTax,
        productIds: action.payload.productIds,
      };
    case CheckoutActionType.LOAD_ORDER_ERROR:
      return { ...state, isLoadingOrder: false, checkoutError: action.payload };
    case CheckoutActionType.SET_LOADING_ORDER:
      return { ...state, isLoadingOrder: action.payload };
    case CheckoutActionType.SET_CART_ITEMS_FOR_TAX:
      return { ...state, cartItemsForTax: action.payload };
    case CheckoutActionType.SET_QUICK_BUY_QTY:
      return { ...state, quickBuyQty: action.payload };
    case CheckoutActionType.SET_COUPON_CODE:
      return { ...state, couponCode: action.payload };
    case CheckoutActionType.START_COUPON_VALIDATION:
      return { ...state, isCouponValidating: true, couponError: null };
    case CheckoutActionType.APPLY_COUPON:
      return {
        ...state,
        isCouponValidating: false,
        couponApplied: action.payload,
        couponCode: "",
        couponError: null,
      };
    case CheckoutActionType.SET_COUPON_ERROR:
      return {
        ...state,
        isCouponValidating: false,
        couponError: action.payload,
      };
    case CheckoutActionType.SET_COUPON_VALIDATING_STATE:
      return { ...state, isCouponValidating: action.payload };
    case CheckoutActionType.REMOVE_COUPON:
      return {
        ...state,
        couponApplied: null,
        couponError: null,
        couponCode: "",
      };
    case CheckoutActionType.SET_TAX_LOADING:
      return {
        ...state,
        isTaxLoading: action.payload.isTaxLoading,
        lastTaxAddressId: action.payload.lastTaxAddressId,
        taxError: null,
      };
    case CheckoutActionType.SET_TAX_LOADING_STATE:
      return { ...state, isTaxLoading: action.payload };
    case CheckoutActionType.SET_TAX_BREAKDOWN:
      return { ...state, taxBreakdown: action.payload };
    case CheckoutActionType.SET_TAX_ERROR:
      return { ...state, taxError: action.payload };
    default:
      return state;
  }
}

// ─── Mobile Summary Sheet ─────────────────────────────────────────────────────

function MobileSummarySheet({
  isExpanded,
  onToggle,
  displayedTotal,
  subtotal,
  couponDiscount,
  delivery,
  taxBreakdown,
  isTaxLoading,
  taxError,
  couponApplied,
  couponLabel,
  couponCode,
  couponError,
  isCouponValidating,
  onCouponCodeChange,
  onCouponApply,
  onCouponRemove,
  onCouponKeyDown,
  isProcessing,
  selectedAddressId,
  onPay,
  cartItems,
  quickBuyVariant,
  quickBuyQty,
  isQuickBuy,
  reduxCartItems,
  shippingInfo,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  displayedTotal: number;
  subtotal: number;
  couponDiscount: number;
  delivery: number;
  taxBreakdown: TaxBreakdown | null;
  isTaxLoading: boolean;
  taxError: string | null;
  couponApplied: AppliedPromotion | null;
  couponLabel: string | null;
  couponCode: string;
  couponError: string | null;
  isCouponValidating: boolean;
  onCouponCodeChange: (val: string) => void;
  onCouponApply: () => void;
  onCouponRemove: () => void;
  onCouponKeyDown: (e: React.KeyboardEvent) => void;
  isProcessing: boolean;
  selectedAddressId: string | null;
  onPay: () => void;
  cartItems: CartItemDisplay[];
  quickBuyVariant: VariantDetails | null;
  quickBuyQty: number;
  isQuickBuy: boolean;
  reduxCartItems: any[];
  shippingInfo: any;
}) {
  return (
    <div className="fixed bottom-[calc(48px+env(safe-area-inset-bottom))] left-0 right-0 z-40 lg:hidden">
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-40 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] border-t border-gray-100"
        animate={{ height: isExpanded ? "auto" : "auto" }}
      >
        {/* Drag handle + collapsed summary row */}
        <button
          onClick={onToggle}
          className="w-full flex flex-col items-center pt-2.5 pb-3 px-5 focus:outline-none"
          aria-label={
            isExpanded ? "Collapse order summary" : "Expand order summary"
          }
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 mb-3" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-theme-caption-lg font-semibold text-gray-700">
                Order Summary
              </span>
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronUp size={14} className="text-gray-400" />
              )}
            </div>
            <motion.span
              key={displayedTotal}
              initial={{ y: 4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-theme-body-plus font-bold text-gray-900"
            >
              ₹{formatCurrency(displayedTotal)}
            </motion.span>
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-2 space-y-4 max-h-[55vh] overflow-y-auto">
                {/* Coupon section */}
                <div>
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          size={15}
                          className="text-emerald-600 shrink-0"
                        />
                        <div>
                          <p className="text-theme-caption font-bold text-emerald-800 uppercase tracking-wide">
                            {couponApplied.code}
                          </p>
                          <p className="text-theme-xxs text-emerald-600">
                            {couponLabel} · Saving ₹
                            {formatCurrency(couponDiscount)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onCouponRemove}
                        className="p-1.5 text-emerald-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <Input
                            type="text"
                            placeholder="COUPON CODE"
                            value={couponCode}
                            onChange={(e) =>
                              onCouponCodeChange(e.target.value.toUpperCase())
                            }
                            onKeyDown={onCouponKeyDown}
                            className="pl-8 h-9 text-theme-caption font-mono tracking-widest uppercase border-gray-200 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
                          />
                        </div>
                        <button
                          onClick={onCouponApply}
                          disabled={isCouponValidating || !couponCode.trim()}
                          className="bg-gray-900 text-white px-4 h-9 rounded-lg text-theme-caption font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                        >
                          {isCouponValidating ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <div className="flex items-center gap-1.5 text-theme-xxs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <AlertCircle size={11} className="shrink-0" />
                          {couponError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-100" />

                {/* Line items */}
                <div className="space-y-2">
                  {!isQuickBuy &&
                    cartItems
                      .filter((item) => {
                        const qty =
                          reduxCartItems.find(
                            (i: any) =>
                              i.productVariantId === item.product_variant_id,
                          )?.quantity ?? item.quantity;
                        return qty > 0;
                      })
                      .map((item) => {
                        const liveQty =
                          reduxCartItems.find(
                            (i: any) =>
                              i.productVariantId === item.product_variant_id,
                          )?.quantity ?? item.quantity;
                        return (
                          <div
                            key={item.id}
                            className="flex justify-between text-theme-xxs text-gray-500"
                          >
                            <span className="line-clamp-1 max-w-[60%]">
                              {item.productVariant.variant_name} ×{liveQty}
                            </span>
                            <span className="font-medium text-gray-700">
                              ₹
                              {formatCurrency(
                                Number(item.productVariant.price) * liveQty,
                              )}
                            </span>
                          </div>
                        );
                      })}
                  {isQuickBuy && quickBuyVariant && (
                    <div className="flex justify-between text-theme-xxs text-gray-500">
                      <span className="line-clamp-1 max-w-[60%]">
                        {quickBuyVariant.variant_name} ×{quickBuyQty}
                      </span>
                      <span className="font-medium text-gray-700">
                        ₹
                        {formatCurrency(
                          Number(quickBuyVariant.price) * quickBuyQty,
                        )}
                      </span>
                    </div>
                  )}
                  {shippingInfo?.isFreeShippingEnabled &&
                    !shippingInfo.isFreeShipping &&
                    shippingInfo.nudgeAmount > 0 && (
                      <div className="bg-blue-50 border border-blue-100 text-blue-700 text-[11px] rounded-xl p-3 flex items-center gap-2 mb-3">
                        <Truck className="w-4 h-4 shrink-0 text-blue-600 animate-pulse" />
                        <span>
                          Spend{" "}
                          <strong>
                            ₹{formatCurrency(shippingInfo.nudgeAmount)}
                          </strong>{" "}
                          more to unlock <strong>Free Shipping!</strong>
                        </span>
                      </div>
                    )}
                  {shippingInfo?.isFreeShippingEnabled &&
                    shippingInfo.isFreeShipping && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] rounded-xl p-3 flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>
                          🎉 <strong>Free Shipping</strong> unlocked!
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between text-theme-caption text-gray-600 pt-1">
                    <span>Subtotal</span>
                    <span>₹{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-theme-caption text-gray-600">
                    <span>Delivery</span>
                    <span
                      className={
                        delivery === 0
                          ? "text-emerald-600 font-semibold animate-fadeIn"
                          : "font-medium"
                      }
                    >
                      {delivery === 0 ? "Free" : `₹${formatCurrency(delivery)}`}
                    </span>
                  </div>
                  {couponApplied &&
                    couponDiscount === 0 &&
                    (() => {
                      const minOrder = getMinOrderAmount(couponApplied);
                      return minOrder !== null ? (
                        <div className="flex items-center gap-1.5 text-theme-xxs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          <AlertCircle size={11} className="shrink-0" />
                          Min. order ₹{formatCurrency(minOrder)} required.
                        </div>
                      ) : null;
                    })()}
                  <div>
                    {isTaxLoading ? (
                      <TaxLoadingSkeleton />
                    ) : (
                      <TaxBreakdownPanel
                        tax={taxBreakdown}
                        deliveryFee={delivery}
                        discount={couponDiscount}
                      />
                    )}
                    {taxError && (
                      <p className="text-theme-xxs text-amber-600 mt-1">
                        {taxError}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="border-dashed border-gray-200" />

                <div className="flex justify-between items-center">
                  <span className="text-theme-body-sm font-bold text-gray-900">
                    Total
                  </span>
                  <motion.span
                    key={displayedTotal}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-theme-h6 font-bold text-gray-900"
                  >
                    ₹{formatCurrency(displayedTotal)}
                  </motion.span>
                </div>
                {taxBreakdown && (
                  <p className="text-theme-tiny text-gray-400 text-center -mt-2">
                    ✓ Inclusive of all applicable taxes
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pay button — always visible */}
        <div className="px-5 pt-3 pb-5 space-y-2.5">
          <button
            onClick={onPay}
            disabled={
              selectedAddressId === null || isProcessing || isTaxLoading
            }
            className="w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-black hover:translate-y-1 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-theme-body-plus shadow-sm shadow--black"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : isTaxLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Calculating taxes…
              </>
            ) : (
              <>
                <ShieldCheck size={16} strokeWidth={2} />
                Pay ₹{formatCurrency(displayedTotal)}
              </>
            )}
          </button>
          <p className="text-center text-theme-xxs text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck size={11} className="text-gray-400" />
            Safe & Secure · 100% Authentic products
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10 space-y-2">
        <div className="h-7 w-48 bg-gray-100 rounded-lg mx-auto animate-pulse" />
        <div className="h-4 w-32 bg-gray-100 rounded mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Inner Component ──────────────────────────────────────────────────────────

function CheckoutClientInner() {
  const { user } = useAppSelector((state) => state.auth);
  const { items: reduxCartItems } = useAppSelector((s: RootState) => s.cart);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearSession } = useCheckoutSession(`/customer/cart`);
  const dispatchRedux = useAppDispatch();
  const qty = searchParams.get("qty") as string;
  const checkoutType = searchParams.get("type") as "cart" | "product" | null;
  const couponId = searchParams.get("couponId");
  const id = searchParams.get("id");
  const isQuickBuy = checkoutType === "product";
  const token = authToken();

  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);

  useEffect(() => {
    // Preload Razorpay script on mount
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (isMobileSummaryExpanded) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isMobileSummaryExpanded]);

  // ─── Main reducer (unchanged) ───────────────────────────────────────────────
  const [state, dispatch] = useReducer(reducer, {
    isAddressAdded: false,
    isModalOpen: false,
    modalMode: AddressOperation.ADD,
    editAddressId: null,
    selectedPaymentMethodState: PaymentMethod.UPI,
    isProcessing: false,
    checkoutError: null,
    selectedAddressId: null,
    cartItems: [],
    quickBuyVariant: null,
    quickBuyQty: Number(qty ?? 1),
    couponCode: "",
    couponApplied: null,
    couponError: null,
    isCouponValidating: false,
    cartItemsForTax: [],
    productIds: [],
    isLoadingOrder: true,
    taxBreakdown: null,
    isTaxLoading: false,
    taxError: null,
    lastTaxAddressId: "",
  });

  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [shippingInfo, setShippingInfo] = useState<{
    isFreeShippingEnabled: boolean;
    freeDeliveryThreshold: number;
    isFreeShipping: boolean;
    nudgeAmount: number;
  } | null>(null);

  const fetchShippingRate = async (addressId: string) => {
    if (!addressId || !token || !id) return;
    try {
      const body: any = { addressId };
      if (isQuickBuy) {
        body.productVariantId = id;
        body.qty = state.quickBuyQty;
      } else {
        body.cartId = id;
      }

      const res = await AxiosAPI.post(
        `/v1/checkout/calculate-shipping/${user?.id || ""}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const shippingData = res.data?.data;
      if (shippingData) {
        setDeliveryFee(Number(shippingData.shippingCost || 0));
        setShippingInfo({
          isFreeShippingEnabled: shippingData.isFreeShippingEnabled,
          freeDeliveryThreshold: Number(
            shippingData.freeDeliveryThreshold || 0,
          ),
          isFreeShipping: shippingData.isFreeShipping,
          nudgeAmount: Number(shippingData.nudgeAmount || 0),
        });
      }
    } catch {
      toast.error("Failed to calculate shipping rates");
    }
  };

  useEffect(() => {
    if (state.selectedAddressId && !state.isLoadingOrder) {
      fetchShippingRate(state.selectedAddressId);
    }
  }, [
    state.selectedAddressId,
    state.quickBuyQty,
    state.cartItemsForTax,
    state.isLoadingOrder,
  ]);

  const openAdd = () => {
    dispatch({
      type: CheckoutActionType.OPEN_ADDRESS_MODAL,
      payload: { mode: AddressOperation.ADD, editId: null },
    });
  };

  const openEdit = async (addressId: string) => {
    dispatch({
      type: CheckoutActionType.OPEN_ADDRESS_MODAL,
      payload: { mode: AddressOperation.EDIT, editId: addressId },
    });
  };
  const subtotal = isQuickBuy
    ? (Number(state.quickBuyVariant?.price) || 0) * state.quickBuyQty
    : state.cartItems.reduce((acc, item) => {
        const liveQty =
          reduxCartItems.find(
            (i) => i.productVariantId === item.product_variant_id,
          )?.quantity ?? 0; // 0 when removed from Redux (spliced out)
        return acc + Number(item.productVariant.price) * liveQty;
      }, 0);

  // Items that still have qty > 0 in Redux — drives both the UI and redirect logic
  const liveCartItems = isQuickBuy
    ? state.cartItems
    : state.cartItems.filter((item) => {
        const qty =
          reduxCartItems.find(
            (i) => i.productVariantId === item.product_variant_id,
          )?.quantity ?? 0; // 0 when removed from Redux
        return qty > 0;
      });

  const delivery = deliveryFee;
  const couponDiscount = calculateCouponDiscount(state.couponApplied, subtotal);
  const displayedTotal = Math.max(0, subtotal + delivery - couponDiscount);

  // ─── Effects (all unchanged) ────────────────────────────────────────────────
  useEffect(() => {
    if (!checkoutType || !id || !token) return;
    const load = async () => {
      dispatch({ type: CheckoutActionType.LOAD_ORDER_START });
      try {
        if (couponId) {
          AxiosAPI.get(`/v1/coupon/${couponId}`)
            .then((res) => {
              if (res.data?.data)
                dispatch({
                  type: CheckoutActionType.APPLY_COUPON,
                  payload: res.data.data,
                });
            })
            .catch(() =>
              toast.error("Couldn't restore coupon. Apply it manually."),
            );
        }
        const checkAddress = await checkAddressExistence(user?.id!, token);
        if (!checkAddress.hasAddresses || checkAddress.count === 0) {
          dispatch({
            type: CheckoutActionType.SET_SELECTED_ADDRESS,
            payload: null,
          });
        }
        if (isQuickBuy) {
          const res = await fetchProductVariantDetails(id);
          if (!res.data) throw new Error("Product not found.");
          const price = parseFloat(res.data.price) || 0;
          dispatch({
            type: CheckoutActionType.LOAD_QUICK_BUY_SUCCESS,
            payload: {
              variant: res.data as VariantDetails,
              cartItemsForTax: [
                { variantId: res.data.id, quantity: state.quickBuyQty, price },
              ],
              productIds: [res.data.product_id ?? res.data.id],
            },
          });
        } else {
          const res = await fetchGetCartList(user?.id || "", token);
          const items: CartItemDisplay[] = res?.data ?? [];
          if (!res?.success || items.length === 0)
            throw new Error("Your cart is empty.");
          const mapped = items.map((item: CartItemDisplay) => ({
            variantId: item.product_variant_id,
            quantity: item.quantity,
            price: Number(item.productVariant.price),
          }));
          dispatch({
            type: CheckoutActionType.LOAD_ORDER_SUCCESS,
            payload: {
              cartItems: items,
              cartItemsForTax: mapped,
              productIds: items.map(
                (item: CartItemDisplay) => item.productVariant.product_id,
              ),
            },
          });
        }
      } catch (err: any) {
        dispatch({
          type: CheckoutActionType.LOAD_ORDER_ERROR,
          payload: err.message ?? "Failed to load order details.",
        });
      } finally {
        dispatch({
          type: CheckoutActionType.SET_LOADING_ORDER,
          payload: false,
        });
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, checkoutType, isQuickBuy, user?.id, token]);

  // ─── Auto-redirect when cart becomes completely empty ──────────────────────
  useEffect(() => {
    dispatch({
      type: CheckoutActionType.SET_CART_ITEMS,
      payload: state.cartItems.filter((item) =>
        reduxCartItems.some(
          (i) => i.productVariantId === item.product_variant_id,
        ),
      ),
    });
  }, [reduxCartItems]);

  useEffect(() => {
    // Only apply for cart checkout (not quick-buy), and only after initial load
    if (isQuickBuy || state.isLoadingOrder || state.cartItems.length === 0)
      return;

    const allEmpty = state.cartItems.every((item) => {
      const qty =
        reduxCartItems.find(
          (i) => i.productVariantId === item.product_variant_id,
        )?.quantity ?? item.quantity;
      return qty === 0;
    });

    if (allEmpty) {
      toast("Your cart is empty — going back.", { icon: "🛒" });
      clearSession();
      // Small delay so the toast is visible before navigation
      const t = setTimeout(() => router.back(), 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxCartItems, state.cartItems, state.isLoadingOrder, isQuickBuy]);

  useEffect(() => {
    if (isQuickBuy || state.cartItems.length === 0) return;
    const updated = state.cartItems.map((item) => {
      const liveQty =
        reduxCartItems.find(
          (i) => i.productVariantId === item.product_variant_id,
        )?.quantity ?? item.quantity;
      return {
        variantId: item.product_variant_id,
        quantity: liveQty,
        price: Number(item.productVariant.price),
      };
    });
    dispatch({
      type: CheckoutActionType.SET_CART_ITEMS_FOR_TAX,
      payload: updated,
    });
  }, [reduxCartItems, state.cartItems, isQuickBuy]);

  useEffect(() => {
    if (!isQuickBuy || !state.quickBuyVariant) return;
    dispatch({
      type: CheckoutActionType.SET_CART_ITEMS_FOR_TAX,
      payload: [
        {
          variantId: state.quickBuyVariant.id,
          quantity: state.quickBuyQty,
          price: Number(state.quickBuyVariant.price),
        },
      ],
    });
  }, [state.quickBuyQty, state.quickBuyVariant, isQuickBuy]);

  // ─── fetchTaxBreakdown (unchanged) ─────────────────────────────────────────
  const fetchTaxBreakdown = async (addressId: string) => {
    if (
      !addressId ||
      !state.cartItemsForTax.length ||
      addressId === state.lastTaxAddressId
    )
      return;
    dispatch({
      type: CheckoutActionType.SET_TAX_LOADING,
      payload: { isTaxLoading: true, lastTaxAddressId: addressId },
    });
    try {
      const res = await AxiosAPI.post(
        "/v1/finances/calculate-order-taxes",
        {
          customerAddressId: addressId,
          cartItems: state.cartItemsForTax,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data?.data;
      dispatch({
        type: CheckoutActionType.SET_TAX_BREAKDOWN,
        payload: {
          subtotal: Number(data.subTotal ?? data.subtotal ?? subtotal),
          totalCgst: Number(data.totalCgst ?? 0),
          totalSgst: Number(data.totalSgst ?? 0),
          totalIgst: Number(data.totalIgst ?? 0),
          totalTax: Number(data.totalTax ?? 0),
          grandTotal: Number(data.grandTotal ?? subtotal),
          isIntraState: data.totalIgst === 0 || data.totalIgst === "0",
          vendorState: data.vendorState,
          customerState: data.customerState,
        },
      });
    } catch {
      dispatch({ type: CheckoutActionType.SET_TAX_BREAKDOWN, payload: null });
    } finally {
      dispatch({
        type: CheckoutActionType.SET_TAX_LOADING_STATE,
        payload: false,
      });
    }
  };

  useEffect(() => {
    if (
      state.selectedAddressId &&
      state.selectedAddressId !== state.lastTaxAddressId &&
      !state.isLoadingOrder
    ) {
      fetchTaxBreakdown(state.selectedAddressId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedAddressId, state.isLoadingOrder]);

  useEffect(() => {
    if (
      state.selectedAddressId &&
      state.selectedAddressId !== state.lastTaxAddressId
    ) {
      dispatch({ type: CheckoutActionType.SET_TAX_BREAKDOWN, payload: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedAddressId]);

  // ─── Coupon handlers (unchanged) ───────────────────────────────────────────
  const handleCouponApply = async () => {
    const code = state.couponCode.trim().toUpperCase();
    if (!code) return;
    dispatch({ type: CheckoutActionType.START_COUPON_VALIDATION });
    try {
      const res = await AxiosAPI.post("/v1/coupon/validate", {
        userId: user?.id,
        code,
        cartTotal: subtotal,
        productIds: state.productIds,
      });
      const data = res.data?.data ?? res.data;
      if (data?.code) {
        const minOrder = Number(data.min_order_amount ?? 0);
        if (minOrder > 0 && subtotal < minOrder) {
          dispatch({
            type: CheckoutActionType.SET_COUPON_ERROR,
            payload: `Add ₹${formatCurrency(minOrder - subtotal)} more to use this coupon.`,
          });
        } else {
          dispatch({
            type: CheckoutActionType.APPLY_COUPON,
            payload: data as AppliedPromotion,
          });
          toast.success("Coupon applied!");
        }
      } else {
        dispatch({
          type: CheckoutActionType.SET_COUPON_ERROR,
          payload: data?.message ?? "Invalid coupon code.",
        });
      }
    } catch (err: any) {
      dispatch({
        type: CheckoutActionType.SET_COUPON_ERROR,
        payload:
          err?.response?.data?.message ??
          err?.message ??
          "Failed to apply coupon.",
      });
    } finally {
      dispatch({
        type: CheckoutActionType.SET_COUPON_VALIDATING_STATE,
        payload: false,
      });
    }
  };

  const handleCouponRemove = () => {
    dispatch({ type: CheckoutActionType.REMOVE_COUPON });
  };

  // ─── Payment handler (unchanged) ───────────────────────────────────────────
  const handlePayment = async () => {
    if (!state.selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (!id || !token) return;
    dispatch({ type: CheckoutActionType.SET_PROCESSING, payload: true });
    dispatch({ type: CheckoutActionType.SET_CHECKOUT_ERROR, payload: null });
    try {
      const initPayload = {
        paymentMethod: state.selectedPaymentMethodState,
        addressId: state.selectedAddressId,
        promotionId: state.couponApplied?.promotion_id,
        ...(isQuickBuy
          ? { productVariantId: id, qty: state.quickBuyQty }
          : { cartId: id }),
      };
      const initData = await fetchInitCheckout(
        user?.id || "",
        initPayload,
        token,
      );
      if (
        !initData ||
        !initData.success ||
        initData.statusCode ||
        initData.error
      ) {
        const errorMsg =
          initData?.message || initData?.error || "Failed to initiate order.";
        dispatch({
          type: CheckoutActionType.SET_CHECKOUT_ERROR,
          payload: errorMsg,
        });
        toast.error(errorMsg);
        return;
      }
      // Unwrap nested data if wrapped by ResponseInterceptor
      const paymentData =
        initData.data && initData.data.data
          ? initData.data.data
          : initData.data;

      if (paymentData?.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
        return;
      }

      // If Razorpay order details are returned, initiate overlay checkout
      if (paymentData?.razorpayOrderId) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error(
            "Failed to load Razorpay SDK. Please check your network connection.",
          );
          dispatch({ type: CheckoutActionType.SET_PROCESSING, payload: false });
          return;
        }

        const options = {
          key: paymentData.razorpayKeyId,
          amount: Math.round(Number(paymentData.totalAmount) * 100),
          currency: RAZORPAY_CURRENCY,
          name: RAZORPAY_MERCHANT_NAME,
          description: RAZORPAY_PAYMENT_DESCRIPTION,
          order_id: paymentData.razorpayOrderId,
          handler: async (response: any) => {
            dispatch({
              type: CheckoutActionType.SET_PROCESSING,
              payload: true,
            });
            try {
              const result = await fetchVerifyPayment(
                user?.id || "",
                {
                  discountApplied: couponDiscount,
                  promotionId: state.couponApplied?.promotion_id,
                  orderId: paymentData.orderId,
                  isSuccess: true,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
                },
                token,
              );
              clearSession();
              if (result?.data?.success || result?.success) {
                dispatchRedux(clearCart());
                router.push(
                  `/customer/checkout/${paymentData.orderId}?status=success`,
                );
              } else {
                const errorMsg =
                  result?.data?.message ||
                  result?.message ||
                  "Payment verification failed.";
                router.push(
                  `/customer/checkout/${paymentData.orderId}?status=failed&message=${encodeURIComponent(errorMsg)}`,
                );
              }
            } catch (err: any) {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
              router.push(
                `/customer/checkout/${paymentData.orderId}?status=failed&message=${encodeURIComponent(err.message || "Verification failed")}`,
              );
            } finally {
              dispatch({
                type: CheckoutActionType.SET_PROCESSING,
                payload: false,
              });
            }
          },
          prefill: {
            name: `${user?.first_name || ""} ${user?.last_name || ""}`,
            email: user?.email || "",
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: async () => {
              dispatch({
                type: CheckoutActionType.SET_PROCESSING,
                payload: true,
              });
              try {
                const result = await fetchVerifyPayment(
                  user?.id || "",
                  {
                    discountApplied: couponDiscount,
                    promotionId: state.couponApplied?.promotion_id,
                    orderId: paymentData.orderId,
                    isSuccess: false,
                    ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
                  },
                  token,
                );
                clearSession();
                const errorMsg =
                  result?.data?.message ||
                  result?.message ||
                  "Payment cancelled by user.";
                router.push(
                  `/customer/checkout/${paymentData.orderId}?status=failed&message=${encodeURIComponent(errorMsg)}`,
                );
              } catch (err) {
                router.push(
                  `/customer/checkout/${paymentData.orderId}?status=failed&message=Payment cancelled`,
                );
              } finally {
                dispatch({
                  type: CheckoutActionType.SET_PROCESSING,
                  payload: false,
                });
              }
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // COD
      const isCod = state.selectedPaymentMethodState === PaymentMethod.COD;
      if (isCod) {
        const result = await fetchVerifyPayment(
          user?.id || "",
          {
            discountApplied: couponDiscount,
            promotionId: state.couponApplied?.promotion_id,
            orderId: paymentData.orderId,
            isSuccess: true,
            ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
          },
          token,
        );
        clearSession();
        if (result?.data?.success || result?.success) {
          dispatchRedux(clearCart());
          router.push(
            `/customer/checkout/${paymentData.orderId}?status=success`,
          );
        } else {
          const errorMsg =
            result?.data?.message ||
            result?.message ||
            "Failed to complete Cash on Delivery order.";
          router.push(
            `/customer/checkout/${paymentData.orderId}?status=failed&message=${encodeURIComponent(errorMsg)}`,
          );
        }
      } else {
        throw new Error(
          "Payment gateway failed to initialize. Please try again or choose a different payment method.",
        );
      }
    } catch (err: any) {
      dispatch({
        type: CheckoutActionType.SET_CHECKOUT_ERROR,
        payload:
          err?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      dispatch({ type: CheckoutActionType.SET_PROCESSING, payload: false });
    }
  };

  // ─── Coupon label (unchanged) ───────────────────────────────────────────────
  const couponLabel = (() => {
    if (!state.couponApplied) return null;
    const type = (state.couponApplied.discount_type ?? "").toLowerCase();
    const val = Number(state.couponApplied.discount_value ?? 0);
    if (type === "percentage") {
      const cap = state.couponApplied.max_discount_amount
        ? ` (max ₹${formatCurrency(Number(state.couponApplied.max_discount_amount))})`
        : "";
      return `${val}% off${cap}`;
    }
    return `₹${formatCurrency(val)} off`;
  })();

  // ─── Guard renders ──────────────────────────────────────────────────────────
  if (state.isLoadingOrder) return <CheckoutSkeleton />;

  if (state.checkoutError && subtotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="text-red-400" size={26} />
        </div>
        <p className="text-gray-700 font-medium text-center">
          {state.checkoutError}
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-theme-body-sm font-semibold text-gray-700 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "var(--font-size-theme-caption-lg)",
            fontWeight: "500",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          },
        }}
      />

      {/* Page header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-blue-500" />
            <span className="text-theme-body-plus font-bold text-gray-900 tracking-tight">
              Secure Checkout
            </span>
          </div>
        </div>
      </div>

      {/* Main content — padded bottom on mobile for sticky sheet */}
      <section className="max-w-6xl mx-auto px-4 py-6 pb-[160px] lg:pb-8 min-h-[60vh]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Items panel — only shown while there are live items */}
            {(!isQuickBuy ? liveCartItems.length > 0 : true) && (
              <ItemListPanel
                isQuickBuy={isQuickBuy}
                cartItems={liveCartItems}
                quickBuyVariant={state.quickBuyVariant}
                quickBuyQty={state.quickBuyQty}
                reduxCartItems={reduxCartItems}
                onQuickBuyQtyChange={(qty) =>
                  dispatch({
                    type: CheckoutActionType.SET_QUICK_BUY_QTY,
                    payload: qty,
                  })
                }
              />
            )}

            {/* Address selector */}
            <AddressSelector
              userId={user?.id || ""}
              onSelect={(id) =>
                dispatch({
                  type: CheckoutActionType.SET_SELECTED_ADDRESS,
                  payload: id,
                })
              }
              selectedAddressId={state.selectedAddressId}
              addNewAddress={openAdd}
              onEditAddress={openEdit}
              loadingAddresses={state.isAddressAdded}
            />

            {/* Payment method */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4 lg:px-5">
                <CardTitle className="flex items-center gap-2 text-theme-body-plus font-semibold text-gray-900">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <CreditCard className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-5 pb-4 space-y-2.5">
                {PAYMENT_METHODS_FIELDS.map((method) => (
                  <SelectedPaymentMethod
                    key={method.id}
                    method={method.label}
                    selectedMethod={
                      method.id === state.selectedPaymentMethodState
                        ? method.label
                        : ""
                    }
                    onSelect={() =>
                      dispatch({
                        type: CheckoutActionType.SET_PAYMENT_METHOD,
                        payload: method.id as PaymentMethod,
                      })
                    }
                    description={method.description}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ── Right column — desktop Order Summary (hidden on mobile) ───────── */}
          <div className="hidden lg:block lg:sticky lg:top-[65px]">
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-theme-body font-bold text-gray-900">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {/* Coupon */}
                <div>
                  {state.couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2
                          size={16}
                          className="text-emerald-600 shrink-0"
                        />
                        <div>
                          <p className="text-theme-caption font-bold text-emerald-800 uppercase tracking-wide">
                            {state.couponApplied.code}
                          </p>
                          <p className="text-theme-xxs text-emerald-600">
                            {couponLabel} · Saving ₹
                            {formatCurrency(couponDiscount)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCouponRemove}
                        className="p-1.5 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <Input
                            type="text"
                            placeholder="COUPON CODE"
                            value={state.couponCode}
                            onChange={(e) => {
                              dispatch({
                                type: CheckoutActionType.SET_COUPON_CODE,
                                payload: e.target.value.toUpperCase(),
                              });
                              dispatch({
                                type: CheckoutActionType.SET_COUPON_ERROR,
                                payload: null,
                              });
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleCouponApply()
                            }
                            className="pl-8 h-9 text-theme-caption font-mono tracking-widest uppercase border-gray-200 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
                          />
                        </div>
                        <button
                          onClick={handleCouponApply}
                          disabled={
                            state.isCouponValidating || !state.couponCode.trim()
                          }
                          className="bg-gray-900 text-white px-4 h-9 rounded-lg text-theme-caption font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                        >
                          {state.isCouponValidating ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                      {state.couponError && (
                        <div className="flex items-center gap-1.5 text-theme-xxs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <AlertCircle size={11} className="shrink-0" />
                          {state.couponError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {shippingInfo?.isFreeShippingEnabled &&
                  !shippingInfo.isFreeShipping &&
                  shippingInfo.nudgeAmount > 0 && (
                    <div className="bg-blue-50 border border-blue-100 text-blue-700 text-theme-caption rounded-xl p-3 flex items-center gap-2 animate-fadeIn">
                      <Truck className="w-4 h-4 shrink-0 text-blue-600 animate-pulse" />
                      <span>
                        Spend{" "}
                        <strong>
                          ₹{formatCurrency(shippingInfo.nudgeAmount)}
                        </strong>{" "}
                        more to unlock <strong>Free Shipping!</strong>
                      </span>
                    </div>
                  )}
                {shippingInfo?.isFreeShippingEnabled &&
                  shippingInfo.isFreeShipping && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-theme-caption rounded-xl p-3 flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        🎉 <strong>Free Shipping</strong> unlocked!
                      </span>
                    </div>
                  )}

                <Separator className="bg-gray-100" />

                {/* Line items */}
                <LineItem
                  state={state}
                  reduxCartItems={reduxCartItems}
                  isQuickBuy={isQuickBuy}
                  subtotal={subtotal}
                  couponDiscount={couponDiscount}
                  delivery={delivery}
                />

                <Separator className="border-dashed border-gray-200" />

                <div className="flex justify-between items-center">
                  <span className="text-theme-body-sm font-bold text-gray-900">
                    Total
                  </span>
                  <motion.span
                    key={displayedTotal}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-theme-h5 font-bold text-gray-900"
                  >
                    ₹{formatCurrency(displayedTotal)}
                  </motion.span>
                </div>
                {state.taxBreakdown && (
                  <p className="text-theme-tiny text-gray-400 text-center -mt-2">
                    ✓ Inclusive of all applicable taxes
                  </p>
                )}

                {state.checkoutError && (
                  <div className="flex items-center gap-2 text-theme-caption text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                    <AlertCircle size={13} className="shrink-0" />
                    {state.checkoutError}
                  </div>
                )}

                {/* Desktop pay button */}
                <button
                  onClick={handlePayment}
                  disabled={
                    state.selectedAddressId === null ||
                    state.isProcessing ||
                    state.isTaxLoading
                  }
                  className="w-full bg-black text-white font-semibold py-3.5 rounded-xl   hover:translate-y-1 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-theme-body-plus shadow-sm shadow-black cursor-pointer"
                >
                  {state.isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing…
                    </>
                  ) : state.isTaxLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Calculating taxes…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} strokeWidth={2} />
                      Pay ₹{formatCurrency(displayedTotal)}
                    </>
                  )}
                </button>

                <p className="text-center text-theme-xxs text-gray-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={11} className="text-gray-400" />
                  Safe & Secure · 100% Authentic products
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile sticky bottom summary sheet */}
      <MobileSummarySheet
        isExpanded={isMobileSummaryExpanded}
        onToggle={() => setIsMobileSummaryExpanded((p) => !p)}
        displayedTotal={displayedTotal}
        subtotal={subtotal}
        couponDiscount={couponDiscount}
        delivery={delivery}
        taxBreakdown={state.taxBreakdown}
        isTaxLoading={state.isTaxLoading}
        taxError={state.taxError}
        couponApplied={state.couponApplied}
        couponLabel={couponLabel}
        couponCode={state.couponCode}
        couponError={state.couponError}
        isCouponValidating={state.isCouponValidating}
        onCouponCodeChange={(val) => {
          dispatch({ type: CheckoutActionType.SET_COUPON_CODE, payload: val });
          dispatch({
            type: CheckoutActionType.SET_COUPON_ERROR,
            payload: null,
          });
        }}
        onCouponApply={handleCouponApply}
        onCouponRemove={handleCouponRemove}
        onCouponKeyDown={(e) => e.key === "Enter" && handleCouponApply()}
        isProcessing={state.isProcessing}
        selectedAddressId={state.selectedAddressId}
        onPay={handlePayment}
        cartItems={state.cartItems}
        quickBuyVariant={state.quickBuyVariant}
        quickBuyQty={state.quickBuyQty}
        isQuickBuy={isQuickBuy}
        reduxCartItems={reduxCartItems}
        shippingInfo={shippingInfo}
      />

      {/* Address modal */}
      <AnimatePresence>
        {state.isModalOpen && user?.id && (
          <AddressModal
            user={user}
            operation={state.modalMode}
            addressId={state.editAddressId}
            onClose={() =>
              dispatch({ type: CheckoutActionType.CLOSE_ADDRESS_MODAL })
            }
            onSuccess={(val) =>
              dispatch({
                type: CheckoutActionType.SET_ADDRESS_ADDED,
                payload: val,
              })
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Export wrapper ────────────────────────────────────────────────────────────

export default function CheckoutClient() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutClientInner />
    </Suspense>
  );
}

export const LineItem = ({
  state,
  reduxCartItems,
  isQuickBuy,
  subtotal,
  couponDiscount,
  delivery,
}: {
  state: State;
  reduxCartItems: any[];
  isQuickBuy: boolean;
  subtotal: number;
  couponDiscount: number;
  delivery: number;
}) => {
  return (
    <div className="space-y-2">
      {!isQuickBuy &&
        state.cartItems
          .filter((item) => {
            const qty =
              reduxCartItems.find(
                (i) => i.productVariantId === item.product_variant_id,
              )?.quantity ?? item.quantity;
            return qty > 0;
          })
          .map((item) => {
            const liveQty =
              reduxCartItems.find(
                (i) => i.productVariantId === item.product_variant_id,
              )?.quantity ?? item.quantity;
            return (
              <div
                key={item.id}
                className="flex justify-between text-theme-xxs text-gray-500"
              >
                <span className="line-clamp-1 max-w-[60%]">
                  {item.productVariant.variant_name} ×{liveQty}
                </span>
                <span className="font-medium text-gray-700">
                  ₹{formatCurrency(Number(item.productVariant.price) * liveQty)}
                </span>
              </div>
            );
          })}

      <div className="flex justify-between text-theme-body-sm text-gray-600 pt-1">
        <span>Subtotal</span>
        <span className="font-medium">₹{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex justify-between text-theme-body-sm text-gray-600">
        <span>Delivery</span>
        <span
          className={
            delivery === 0
              ? "text-emerald-600 font-semibold animate-fadeIn"
              : "font-medium"
          }
        >
          {delivery === 0 ? "Free" : `₹${formatCurrency(delivery)}`}
        </span>
      </div>

      {state.couponApplied &&
        couponDiscount === 0 &&
        (() => {
          const minOrder = getMinOrderAmount(state.couponApplied);
          return minOrder !== null ? (
            <div className="flex items-center gap-1.5 text-theme-xxs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <AlertCircle size={11} className="shrink-0" />
              Min. order ₹{formatCurrency(minOrder)} required.
            </div>
          ) : null;
        })()}

      <div>
        {state.isTaxLoading ? (
          <TaxLoadingSkeleton />
        ) : (
          <TaxBreakdownPanel
            tax={state.taxBreakdown}
            deliveryFee={delivery}
            discount={couponDiscount}
          />
        )}
        {state.taxError && (
          <p className="text-theme-xxs text-amber-600 mt-1">{state.taxError}</p>
        )}
      </div>
    </div>
  );
};
