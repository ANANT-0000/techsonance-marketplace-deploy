'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { calculateCouponDiscount, formatCurrency, getMinOrderAmount } from "@/lib/utils";
import { SelectedPaymentMethod } from "@/components/customer/SelectedPaymentMethod";
import { PAYMENT_METHODS_FIELDS } from "@/constants";
import { checkAddressExistence, fetchGetCartList } from "@/utils/customerApiClient";
import { AddToCart } from "@/components/customer/AddToCart";
import {
  CreditCard, Loader2, Tag, CheckCircle2, X, AlertCircle,
 
} from "lucide-react";
import { AddressSelector } from "@/components/customer/AddressSelector";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { useCheckoutSession } from "@/hooks/UseCheckoutSession";
import { fetchInitCheckout, fetchVerifyPayment } from "@/utils/customerApiClient-SA";
import { authToken } from "@/utils/authToken";
import { TaxBreakdown, TaxBreakdownPanel, TaxLoadingSkeleton } from "@/components/customer/TaxBreakdownPanel";
import { clearCart } from "@/lib/features/Cart";
import { AddressOperationEnum, AppliedPromotion,  CartItemDisplay,   VariantDetails } from "@/utils/Types";
import AxiosAPI from "@/lib/axios";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";
import { AddressModal } from "@/components/customer/AddressModel";
import { ItemListPanel } from "@/components/customer/ItemListPanel";
 
export default function CheckoutPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { items: reduxCartItems } = useAppSelector((s) => s.cart);
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddressAdded,setIsAddressAdded] = useState(false);
  const { clearSession } = useCheckoutSession(`/customerProfile/${params.userId}/cart`);
  const dispatch = useAppDispatch();
      const [isModalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<AddressOperationEnum>(AddressOperationEnum.ADD);
    const openAdd = () => {
        setModalMode(AddressOperationEnum.ADD);
        setModalOpen(true);
    };
  const checkoutType = searchParams.get('type') as 'cart' | 'product' | null;
  const couponId = searchParams.get('couponId');
  const id = searchParams.get('id');
  const isQuickBuy = checkoutType === 'product';

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedPaymentMethodState, setSelectedPaymentMethodState] = useState<string>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string|null>(null);
  const token = authToken();

  // ── Item Display State ────────────────────────────────────────────────────
  // Cart mode: full cart item list (for display & subtotal calc)
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
  // Quick buy mode: the fetched variant + local qty
  const [quickBuyVariant, setQuickBuyVariant] = useState<VariantDetails | null>(null);
  const [quickBuyQty, setQuickBuyQty] = useState(1);

  // ── Coupon State ──────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<AppliedPromotion | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponValidating, setIsCouponValidating] = useState(false);

  // ── Order Data (for tax + payment payload) ────────────────────────────────
  const [cartItemsForTax, setCartItemsForTax] = useState<
    { variantId: string; quantity: number; price: number }[]
  >([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // ── Tax State ──────────────────────────────────────────────────────────────
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  const [isTaxLoading, setIsTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [lastTaxAddressId, setLastTaxAddressId] = useState<string>("");

  // ── Derived subtotal ──────────────────────────────────────────────────────
  // For cart: use live Redux qty so subtotal updates instantly on +/- clicks
  const subtotal = isQuickBuy
    ? (Number(quickBuyVariant?.price) || 0) * quickBuyQty
    : cartItems.reduce((acc, item) => {
        const liveQty = reduxCartItems.find(i => i.productVariantId === item.product_variant_id)?.quantity ?? item.quantity;
        return acc + Number(item.productVariant.price) * liveQty;
      }, 0);

  const delivery = 0;
  const couponDiscount = calculateCouponDiscount(couponApplied, subtotal);
  const displayedTotal = Math.max(0, subtotal + delivery - couponDiscount );

  // ── Load order details ────────────────────────────────────────────────────
  useEffect(() => {
    if (!checkoutType || !id || !token) return;

    const load = async () => {
      setIsLoadingOrder(true);
      setCheckoutError(null);

      try {
        // Pre-load coupon carried from product page
        if (couponId) {
          AxiosAPI.get(`/v1/coupon/${couponId}`)
            .then(res => {
              if (res.data?.data) setCouponApplied(res.data.data);
            })
            .catch(() => toast.error("Couldn't restore coupon. Apply it manually."));
        }  const checkAddress = await checkAddressExistence(user?.id!, token);
            console.log("checkAddress count:", checkAddress.count);
        
            if (!checkAddress.hasAddresses || checkAddress.count === 0) {             setSelectedAddressId(null);
              console.log('user does not have address');
              
            }

        if (isQuickBuy) {
          const res = await fetchProductVariantDetails(id);
          if (!res.data) throw new Error("Product not found.");
          setQuickBuyVariant(res.data as VariantDetails);
          const price = parseFloat(res.data.price) || 0;
          setCartItemsForTax([{ variantId: res.data.id, quantity: quickBuyQty, price }]);
          setProductIds([res.data.product_id ?? res.data.id]);
        } else {
          const res = await fetchGetCartList(params.userId, token);
          const items: CartItemDisplay[] = res?.data ?? [];
          if (!res?.success || items.length === 0) throw new Error("Your cart is empty.");
          setCartItems(items);

          const mapped = items.map((item: CartItemDisplay) => ({
            variantId: item.product_variant_id,
            quantity: item.quantity,
            price: Number(item.productVariant.price),
          }));
          setCartItemsForTax(mapped);
          setProductIds(items.map((item: CartItemDisplay) => item.productVariant.product_id));
        }
      } catch (err: any) {
        setCheckoutError(err.message ?? "Failed to load order details.");
      } finally {
        setIsLoadingOrder(false);
      }
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, checkoutType, isQuickBuy, params.userId, token]);

  // ── Keep cartItemsForTax in sync with live Redux qty (cart mode) ──────────
  useEffect(() => {
    if (isQuickBuy || cartItems.length === 0) return;
    const updated = cartItems.map(item => {
      const liveQty = reduxCartItems.find(i => i.productVariantId === item.product_variant_id)?.quantity ?? item.quantity;
      return { variantId: item.product_variant_id, quantity: liveQty, price: Number(item.productVariant.price) };
    });
    setCartItemsForTax(updated);
  }, [reduxCartItems, cartItems, isQuickBuy]);

  // ── Keep cartItemsForTax in sync with quickBuyQty (quick buy mode) ────────
  useEffect(() => {
    if (!isQuickBuy || !quickBuyVariant) return;
    setCartItemsForTax([{
      variantId: quickBuyVariant.id,
      quantity: quickBuyQty,
      price: Number(quickBuyVariant.price),
    }]);
  }, [quickBuyQty, quickBuyVariant, isQuickBuy]);

  // ── Tax fetch ─────────────────────────────────────────────────────────────
  const fetchTaxBreakdown = async (addressId: string) => {
    if (!addressId || !cartItemsForTax.length || addressId === lastTaxAddressId) return;
    setIsTaxLoading(true);
    setTaxError(null);
    setLastTaxAddressId(addressId);
    try {
      const res = await AxiosAPI.post('/v1/finances/calculate-order-taxes', {
        customerAddressId: addressId,
        cartItems: cartItemsForTax,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const data = res.data?.data ?? res.data;
      setTaxBreakdown({
        subtotal: Number(data.subTotal ?? data.subtotal ?? subtotal),
        totalCgst: Number(data.totalCgst ?? 0),
        totalSgst: Number(data.totalSgst ?? 0),
        totalIgst: Number(data.totalIgst ?? 0),
        totalTax: Number(data.totalTax ?? 0),
        grandTotal: Number(data.grandTotal ?? subtotal),
        isIntraState: data.totalIgst === 0 || data.totalIgst === '0',
        vendorState: data.vendorState,
        customerState: data.customerState,
      });
    } catch {
      setTaxBreakdown(null);
    } finally {
      setIsTaxLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== lastTaxAddressId && !isLoadingOrder) {
      fetchTaxBreakdown(selectedAddressId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, isLoadingOrder]);

  // Reset tax when address changes
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== lastTaxAddressId) {
      setTaxBreakdown(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId]);

  // ── Coupon Apply ──────────────────────────────────────────────────────────
  const handleCouponApply = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    setIsCouponValidating(true);
    try {
      const res = await AxiosAPI.post('/v1/coupon/validate', {
        userId: user?.id,
        code,
        cartTotal: subtotal,
        productIdsInCart: productIds,
      });
      const data = res.data?.data ?? res.data;
      if (data?.code) {
        const minOrder = Number(data.min_order_amount ?? 0);
        if (minOrder > 0 && subtotal < minOrder) {
          setCouponError(`Add ₹${formatCurrency(minOrder - subtotal)} more to use this coupon.`);
        } else {
          setCouponApplied(data as AppliedPromotion);
          setCouponCode('');
          toast.success("Coupon applied!");
        }
      } else {
        setCouponError(data?.message ?? "Invalid coupon code.");
      }
    } catch (err: any) {
      setCouponError(
        err?.response?.data?.message ?? err?.message ?? "Failed to apply coupon."
      );
    } finally {
      setIsCouponValidating(false);
    }
  };

  const handleCouponRemove = () => {
    setCouponApplied(null);
    setCouponError(null);
    setCouponCode('');
  };

  // ── Payment ───────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (!id || !token) return;

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const initPayload = {
        paymentMethod: selectedPaymentMethodState,
        addressId: selectedAddressId,
        promotionId: couponApplied?.promotion_id,
        ...(isQuickBuy ? { productVariantId: id ,qty:quickBuyQty} : { cartId: id }),
      };

      const initData = await fetchInitCheckout(user?.id || '', initPayload, token);
      if (!initData?.success && initData?.status ===500 ) {
        setCheckoutError(initData?.message ?? "Failed to initiate order.");
        return;
      }
      if(initData?.status === 400){
        setCheckoutError(initData?.message ?? "Invalid request. Please check your order details.");
        toast.error(initData?.message ?? "Invalid request. Please check your order details.");
        return;
      }

      if (initData.data?.paymentUrl) {
        window.location.href = initData.data.paymentUrl;
        return;
      }

      const userClickedSuccess = window.confirm(
        `SIMULATION: Pay ₹${formatCurrency(displayedTotal)}\n\nOK = Success | Cancel = Failure`
      );

      const result = await fetchVerifyPayment(user?.id || '', {
        discountApplied: couponDiscount,
        promotionId: couponApplied?.promotion_id,
        orderId: initData.data.orderId,
        isSuccess: userClickedSuccess,
        ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
      }, token);

      console.log("verify result",result)
      if (!result?.data.success  ) {
        setCheckoutError(result?.message ?? "Payment verification failed.");
        return;
      }

      clearSession();

      if (userClickedSuccess && result.data.success) {
        dispatch(clearCart());
        router.push(`/customerProfile/${params.userId}/orders/${initData.data.orderId}`);
      } else {
        setCheckoutError("Payment failed. Your order has been cancelled.");
        router.push(`/customerProfile/${params.userId}/orders`);
      }
    } catch {
      setCheckoutError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Coupon label ──────────────────────────────────────────────────────────
  const couponLabel = (() => {
    if (!couponApplied) return null;
    const type = (couponApplied.discount_type ?? '').toLowerCase();
    const val = Number(couponApplied.discount_value ?? 0);
    if (type === 'percentage') {
      const cap = couponApplied.max_discount_amount
        ? ` (max ₹${formatCurrency(Number(couponApplied.max_discount_amount))})`
        : '';
      return `${val}% off${cap}`;
    }
    return `₹${formatCurrency(val)} off`;
  })();

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading checkout…</p>
      </div>
    );
  }

  if (checkoutError && subtotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">{checkoutError}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-gray-500 animate-pulse">Loading…</p></div>}>
      <>
      <Toaster />
      <section className="max-w-6xl mx-auto lg:px-4 py-8 min-h-[60vh]">
        <h1 className="text-2xl font-bold text-center mb-1">Secure Checkout</h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          {isQuickBuy ? '⚡ Quick Buy' : '🛒 Cart Checkout'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── LEFT col: Items → Address → Payment ── */}
          <div className="space-y-4 lg:space-y-5">

            {/* Item list */}
            <ItemListPanel
              isQuickBuy={isQuickBuy}
              cartItems={cartItems}
              quickBuyVariant={quickBuyVariant}
              quickBuyQty={quickBuyQty}
              onQuickBuyQtyChange={setQuickBuyQty}
            />

            {/* Address */}
            <AddressSelector
              userId={user?.id || ''}
              onSelect={setSelectedAddressId}
              selectedAddressId={selectedAddressId}
              addNewAddress={openAdd}
              loadingAddresses={isAddressAdded}
            />

            {/* Payment method */}
            <div className="border-2 border-gray-300 rounded-xl lg:p-5 p-3">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-4">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS_FIELDS.map((method) => (
                  <SelectedPaymentMethod
                    key={method.id}
                    method={method.label}
                    selectedMethod={selectedPaymentMethodState}
                    onSelect={(m) => setSelectedPaymentMethodState(m)}
                    description={method.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT col: Order Summary (sticky) ── */}
          <div className="lg:sticky lg:top-4">
            <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-4 space-y-5">
              <h2 className="text-lg font-bold">Order Summary</h2>

              {/* Coupon */}
              <div>
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
                          {couponApplied.code}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {couponLabel} · Saving ₹{formatCurrency(couponDiscount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCouponRemove}
                      className="p-1.5 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                          onKeyDown={e => e.key === 'Enter' && handleCouponApply()}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest font-mono"
                        />
                      </div>
                      <button
                        onClick={handleCouponApply}
                        disabled={isCouponValidating || !couponCode.trim()}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isCouponValidating ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <AlertCircle size={12} className="shrink-0" />
                        {couponError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Line items breakdown */}
              <div className="space-y-2.5 border-t border-gray-100 pt-4">
                {/* Cart mode: each item line */}
                {!isQuickBuy && cartItems.map(item => {
                  const liveQty = reduxCartItems.find(i => i.productVariantId === item.product_variant_id)?.quantity ?? item.quantity;
                  return (
                    <div key={item.id} className="flex justify-between text-xs text-gray-500">
                      <span className="line-clamp-1 max-w-[60%]">
                        {item.productVariant.variant_name} ×{liveQty}
                      </span>
                      <span className="font-medium text-gray-700">
                        ₹{formatCurrency(Number(item.productVariant.price) * liveQty)}
                      </span>
                    </div>
                  );
                })}

                {/* Quick buy mode: single line */}
                {isQuickBuy && quickBuyVariant && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="line-clamp-1 max-w-[60%]">
                      {quickBuyVariant.variant_name} ×{quickBuyQty}
                    </span>
                    <span className="font-medium text-gray-700">
                      ₹{formatCurrency(Number(quickBuyVariant.price) * quickBuyQty)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600 pt-1">
                  <span>Subtotal</span>
                  <span>₹{formatCurrency(subtotal)}</span>
                </div>

                {delivery > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span>₹{formatCurrency(delivery)}</span>
                  </div>
                )}

               {couponApplied && couponDiscount === 0 && (() => {
  const minOrder = getMinOrderAmount(couponApplied);
  return minOrder !== null ? (
    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
      <AlertCircle size={12} className="shrink-0" />
      Min. order ₹{formatCurrency(minOrder)} required.
    </div>
  ) : null;
})()}

              {/* Tax breakdown */}
              <div>
                {isTaxLoading ? <TaxLoadingSkeleton /> : (
                  <TaxBreakdownPanel
                    tax={taxBreakdown}
                    deliveryFee={delivery}
                    discount={couponDiscount}
                  />
                )}
                {taxError && <p className="text-xs text-amber-600 mt-1">{taxError}</p>}
              </div>

              {/* Grand total */}
              <div className="flex justify-between items-center font-bold text-lg border-t-2 border-dashed border-gray-200 pt-4">
                <span>Total</span>
                <motion.span
                  key={displayedTotal}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  ₹{formatCurrency(displayedTotal)}
                </motion.span>
              </div>

              {taxBreakdown && (
                <p className="text-[11px] text-gray-400 text-center -mt-3">
                  ✓ Inclusive of all applicable taxes
                </p>
              )}

              {checkoutError && (
                <p className="text-red-500 text-sm text-center">{checkoutError}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={selectedAddressId === null || isProcessing || isTaxLoading || (couponApplied && couponDiscount === 0) ? true : false}
                className="w-full bg-blue-600 text-white font-semibold lg:py-3.5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 text-sm lg:text-base"
              >
                {isProcessing ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing…</>
                ) : isTaxLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Calculating taxes…</>
                ) : (
                  `Pay ₹${formatCurrency(displayedTotal)} →`
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                🛡️ Safe and Secure Payments. 100% Authentic products
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>
        <AnimatePresence>
                      {isModalOpen && user?.id && (
                          <AddressModal
                              user={user}
                              operation={modalMode}
                              onClose={() => setModalOpen(false)}
                              onSuccess={setIsAddressAdded}
                          />
                      )}
                  </AnimatePresence>
              </>
    </Suspense>
  );
}