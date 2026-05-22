'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { SelectedPaymentMethod } from "@/components/customer/SelectedPaymentMethod";
import { PAYMENT_METHODS_FIELDS } from "@/constants";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { CreditCard, Loader2, Tag, CheckCircle2, X, AlertCircle } from "lucide-react";
import { AddressSelector } from "@/components/customer/AddressSelector";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { useCheckoutSession } from "@/hooks/UseCheckoutSession";
import { fetchInitCheckout, fetchVerifyPayment } from "@/utils/customerApiClient-SA";
import { authToken } from "@/utils/authToken";
import { TaxBreakdown, TaxBreakdownPanel, TaxLoadingSkeleton } from "@/components/customer/TaxBreakdownPanel";
import { clearCart } from "@/lib/features/Cart";
import { Coupon } from "@/utils/Types";
import AxiosAPI from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import { set } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantDetails {
  id: string;
  variant_name: string;
  sku: string;
  price: string;
  status: string;
  stock_quantity: number;
}

// ─── Coupon Calculation Helper ────────────────────────────────────────────────

 
function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (!coupon) return 0;

  const discountValue = Number(coupon.discount_value ?? 0);
  const minOrderAmount = Number(coupon.min_order_amount ?? 0);
  const maxDiscountAmount = coupon.max_discount_amount
    ? Number(coupon.max_discount_amount)
    : null;

  // Guard: minimum spend requirement
  if (minOrderAmount > 0 && subtotal < minOrderAmount) return 0;

  const type = (coupon.discount_type ?? '').toLowerCase();

  if (type === 'percentage') {
    const raw = Math.floor((subtotal * discountValue) / 100);
    return maxDiscountAmount !== null ? Math.min(raw, maxDiscountAmount) : raw;
  }

  // 'fixed_cart', 'fixed_product', or any flat type
  return Math.min(discountValue, subtotal); // never discount more than the subtotal
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
const ProductCard = ({ item }: { item:   }) => (
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
            <span className="text-xs text-gray-500">x{item.quantity}</span>
            <p className="text-[11px] text-gray-400">
                ₹{formatCurrency(Number(item.productVariant.price) * item.quantity)}
            </p>
        </div>
    </motion.div>
);
export default function CheckoutPage() {
  const { user } = useAppSelector((state) => state.auth);
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearSession } = useCheckoutSession(`/customerProfile/${params.userId}/cart`);
  const dispatch = useAppDispatch();

  const checkoutType = searchParams.get('type') as 'cart' | 'product' | null;
  const couponId = searchParams.get('couponId');
  const id = searchParams.get('id');
  const isQuickBuy = checkoutType === 'product';

  // ── UI State ──
  const [selectedPaymentMethodState, setSelectedPaymentMethodState] = useState<string>('UPI');
  const [couponCode, setCouponCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const token = authToken();
  const [logs, setLogs] = useState<string[]>([]);
  // ── Coupon State ──
  const [couponApplied, setCouponApplied] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponValidating, setIsCouponValidating] = useState(false);

  // ── Order Data ──
  const [orderData, setOrderData] = useState({
    title: 'Loading...',
    subtotal: 0,
    delivery: 0,
    total: 0,
    cartItems: [] as { variantId: string; quantity: number; price: number }[],
  
    productId: '',  
  });
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // ── Tax State ──
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  const [isTaxLoading, setIsTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [lastTaxAddressId, setLastTaxAddressId] = useState<string>("");

  // ── Derived: coupon discount & grand total ────────────────────────────────

  const couponDiscount = calculateCouponDiscount(couponApplied!, orderData.subtotal);

  const displayedTotal = Math.max(
    0,
    orderData.subtotal +
      orderData.delivery -
      couponDiscount +
      (taxBreakdown?.totalTax ?? 0)
  );

  // ── Load order details ──────────────────────────────────────────────────────

  useEffect(() => {
    if (checkoutType === null || id === null || !token) return;
    if (!checkoutType || !id) {
      router.replace(`/customerProfile/${params.userId}/cart`);
      return;
    }

    const loadCheckoutData = async () => {
      setIsLoadingOrder(true);
      setCheckoutError(null);

      try {
        if (couponId) {
          AxiosAPI.get(`/v1/coupon/${couponId}`)
            .then((res) => {
              if (res.data?.success && res.data?.data) {
                setCouponApplied(res.data.data);
              }
            })
            .catch(() => {
              toast.error("Failed to apply coupon from link. You can try applying it manually.");
            });
        }
        console.log('couponApplied',couponApplied)
        if (isQuickBuy) {
          const res: { data: VariantDetails | undefined; success: boolean; message?: string } =
            await fetchProductVariantDetails(id);
          if (!res.data) throw new Error("No response from server");
          const variantData = res.data;
          const price = parseFloat(variantData.price) || 0;
          const cartItem =[ {
            variantId: variantData.id,
            quantity: 1,
            price,
          }]
          setOrderData({
            title: `${variantData.variant_name} (x1)`,
            subtotal: price,
            delivery: 0,
            total: price,
            cartItems: cartItem,
            productId: variantData.id
          });
        } else {
          const res = await fetchGetCartList(params.userId, token);
          const cartItems = res?.data ?? [];
          if (!res?.success || cartItems.length === 0) throw new Error("Your cart is empty");

          const subtotal = cartItems.reduce(
            (acc: number, item: any) =>
              acc + Number(item.productVariant.price) * item.quantity,
            0
          );

          const mappedItems = cartItems.map((item: any) => ({
            variantId: item.product_variant_id,
            quantity: item.quantity,
            price: Number(item.productVariant.price),
          }));
          setOrderData({
            title: `Cart (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`,
            subtotal,
            delivery: 0,
            total: subtotal,
            cartItems: mappedItems,
            productId:''
          });
        }
        setLogs((prev) => [...prev, `Loaded order details for ${checkoutType === 'product' ? 'product variant' : 'cart'}`]);
      } catch (error: any) {
        setCheckoutError(error.message ?? "Failed to load order details.");
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadCheckoutData();
  }, [id, checkoutType, isQuickBuy, params.userId, token]);

  // ── Tax fetch ───────────────────────────────────────────────────────────────

const fetchTaxBreakdown = async (addressId: string) => {
  setLogs((prev) => [...prev, `Fetching tax breakdown for address ${addressId}...`]);
  setLogs((prev) => [...prev, `Current cart items: ${JSON.stringify(orderData.cartItems)}`]);
  setLogs((prev) => [...prev, `Current subtotal: ${orderData.subtotal}`]);
  setLogs((prev) => [...prev, `Current tax breakdown: ${JSON.stringify(taxBreakdown)}`]); 
  setLogs((prev) => [...prev, `Last tax address ID: ${lastTaxAddressId}`]);
      if (!addressId || !orderData.cartItems.length || addressId === lastTaxAddressId) return;
      setIsTaxLoading(true);
      setTaxError(null);
      setLogs((prev) => [...prev, `setting last tax address ${addressId}`]);
      setLastTaxAddressId(addressId);
      setLogs((prev) => [...prev, `Initiating tax breakdown fetch for address ${addressId}`]);
      try {
        const response = await AxiosAPI.post(`/v1/finances/calculate-order-taxes`, {
          customerAddressId: addressId,
          cartItems: orderData.cartItems,
        }, { headers: {
            Authorization: `Bearer ${token}`,
          }});

        if (!response.status || response.status >= 300) {
          console.warn('Tax calculation failed, proceeding without breakdown');
          setTaxBreakdown(null);
          return;
        }
        const data = response.data.data;
        console.log("Tax breakdown:", response.data);
        setLogs((prev) => [...prev, `Fetched tax breakdown for address ${addressId}`]);
        setLogs((prev) => [...prev, `Tax details: :${response.data} \n CGST ${data.totalCgst}, SGST ${data.totalSgst}, IGST ${data.totalIgst}`]);
        setTaxBreakdown({
          subtotal: Number(data.subTotal ?? data.subtotal ?? orderData.subtotal),
          totalCgst: Number(data.totalCgst ?? 0),
          totalSgst: Number(data.totalSgst ?? 0),
          totalIgst: Number(data.totalIgst ?? 0),
          totalTax: Number(data.totalTax ?? 0),
          grandTotal: Number(data.grandTotal ?? orderData.subtotal),
          isIntraState: data.totalIgst === 0 || data.totalIgst === '0',
          vendorState: data.vendorState,
          customerState: data.customerState,
        });

        setOrderData((prev) => ({
          ...prev,
          total: Number(data.grandTotal ?? prev.subtotal),
        }));
      } catch (err) {
        console.warn('Tax fetch error (non-blocking):', err);
        setTaxBreakdown(null);
      } finally {
        setIsTaxLoading(false);
      }
    };
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== lastTaxAddressId && !isLoadingOrder) {
      fetchTaxBreakdown(selectedAddressId);
    }
  }, [selectedAddressId, isLoadingOrder]);

  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== lastTaxAddressId) {
      setTaxBreakdown(null);
    }
  }, [selectedAddressId]);

  // ── Coupon Apply ────────────────────────────────────────────────────────────

  const handleCouponApply = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setCouponError(null);
    setIsCouponValidating(true);

    try {
      const res = await AxiosAPI.post('/v1/coupon/validate', {
        userId: user?.id,
        code,
        cartTotal: orderData.subtotal,
        productIdsInCart: [orderData.productId],
      });

      const data = res.data.data;
      console.log('Coupon validation response:', res.data);
      // The validate endpoint returns the coupon object directly on success
      // (no wrapping success key — it throws HTTP exceptions on failure)
      if (data && data.code) {
        setCouponApplied(data as Coupon);
        setCouponCode('');

        // Validate min_order_amount client-side for immediate feedback
        const minOrder = Number(data.min_order_amount ?? 0);
        if (minOrder > 0 && orderData.subtotal < minOrder) {
          setCouponError(
            `Add ₹${formatCurrency(minOrder - orderData.subtotal)} more to unlock this offer.`
          );
          setCouponApplied(null);
        }
      } else {
        setCouponError(data?.message ?? "Invalid coupon code.");
      }
    } catch (err: any) {
      // NestJS throws BadRequestException / NotFoundException — extract message
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to apply coupon. Please try again.";
      setCouponError(msg);
    } finally {
      setIsCouponValidating(false);
    }
  };

  const handleCouponRemove = () => {
    setCouponApplied(null);
    setCouponError(null);
    setCouponCode('');
  };

  // ── Payment ─────────────────────────────────────────────────────────────────

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
        ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
      };

      const initData = await fetchInitCheckout(user?.id || '', initPayload, token);

      if (!initData?.success) {
        setCheckoutError(initData?.message ?? "Failed to initiate order.");
        return;
      }

      if (initData.data?.paymentUrl) {
        window.location.href = initData.data.paymentUrl;
        return;
      }

      const userClickedSuccess = window.confirm(
        `SIMULATION: Pay ₹${formatCurrency(displayedTotal)}\n\nOK = Success | Cancel = Failure`
      );

      const verifyData = await fetchVerifyPayment(user?.id || '', {
        discountApplied: couponDiscount,
        couponId: couponApplied?.id,
        orderId: initData.data.orderId,
        isSuccess: userClickedSuccess,
        ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
      }, token);
      console.log("verifyData",verifyData);
      if (!verifyData?.success) {
        setCheckoutError(verifyData?.message ?? "Payment verification failed.");
        return;
      }

      clearSession();

      if (userClickedSuccess && verifyData.success) {
        dispatch(clearCart());
        router.push(`/customerProfile/${params.userId}/orders/${initData.data.orderId}`);
      } else {
        setCheckoutError("Payment failed. Your order has been cancelled.");
        router.push(`/customerProfile/${params.userId}/orders`);
      }
    } catch (error) {
      console.error("Payment error", error);
      setCheckoutError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Loading / Error states ──────────────────────────────────────────────────

  if (isLoadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading checkout…</p>
      </div>
    );
  }

  if (checkoutError && orderData.subtotal === 0) {
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

  // ── Coupon summary label ────────────────────────────────────────────────────

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
    console.log('Coupon validation response:', couponApplied);
    console.log('Coupon value:', val);

    return `₹${formatCurrency(val)} off`;
  })();

  // ── Render ──────────────────────────────────────────────────────────────────
console.log("logs",logs)
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500 animate-pulse">Loading…</p>
        </div>
      }
    >
        <Toaster  />
        {/* {
          logs && (
            <div className="max-w-6xl mx-auto lg:px-4 py-2">
              <h3 className="text-sm font-semibold mb-1">Debug Logs:</h3>
              {logs.map((log, idx) => (
                <div key={idx} className="text-xs text-gray-600 mb-0.5 whitespace-pre-wrap">
                  {log} </div>
            
              ))}
            </div>
          )
        } */}
      <section className="max-w-6xl mx-auto lg:px-4 py-8 min-h-[60vh]">
        <h1 className="text-2xl font-bold text-center mb-2">Secure Checkout</h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          {isQuickBuy ? '⚡ Quick Buy' : '🛒 Cart Checkout'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Address + Payment ── */}
          <div className="lg:space-y-6 space-y-4">
            <AddressSelector
              userId={user?.id || ''}
              onSelect={setSelectedAddressId}
              selectedAddressId={selectedAddressId}
            />

            <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>
              <div className="lg:space-y-4 space-y-3">
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

          {/* ── RIGHT: Order Summary ── */}
          <div>
            <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-3 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* ── Coupon Section ── */}
              <div className="mb-6">
                {couponApplied ? (
                  /* Applied state */
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl lg:px-4 px-2 lg:py-3 py-1.5">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
                          {couponApplied.code}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium">
                          {couponLabel} · Saving ₹{formatCurrency(couponDiscount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCouponRemove}
                      className="p-1 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  /* Input state */
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleCouponApply()}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest font-mono"
                        />
                      </div>
                      <button
                        onClick={handleCouponApply}
                        disabled={isCouponValidating || !couponCode.trim()}
                        className="bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isCouponValidating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : 'Apply'}
                      </button>
                    </div>

                    {/* Coupon error */}
                    {couponError && (
                      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <AlertCircle size={13} className="shrink-0" />
                        {couponError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Line Items ── */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span className="line-clamp-1">{orderData.title}</span>
                  <span>₹{formatCurrency(orderData.subtotal)}</span>
                </div>

                {orderData.delivery > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>₹{formatCurrency(orderData.delivery)}</span>
                  </div>
                )}

                {/* Coupon discount line */}
                {couponApplied && couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon ({couponApplied.code})</span>
                    <span>−₹{formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                {/* Warn if coupon is applied but discount is 0 (min order not met) */}
                {couponApplied && couponDiscount === 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <AlertCircle size={13} className="shrink-0" />
                    Minimum order of ₹{formatCurrency(Number(couponApplied.min_order_amount))} required for this coupon.
                  </div>
                )}
              </div>

              {/* ── Tax Breakdown ── */}
              <div className="mb-4">
                {isTaxLoading ? (
                  <TaxLoadingSkeleton />
                ) : (
                  <TaxBreakdownPanel
                    tax={taxBreakdown}
                    deliveryFee={orderData.delivery}
                    discount={couponDiscount}
                  />
                )}
                {taxError && (
                  <p className="text-xs text-amber-600 mt-1 px-1">{taxError}</p>
                )}
              </div>

              {/* ── Grand Total ── */}
              <div className="flex justify-between text-gray-900 py-3 font-bold text-lg border-t-2 mb-4">
                <span>Total</span>
                <span>₹{formatCurrency(displayedTotal)}</span>
              </div>

              {taxBreakdown && (
                <p className="text-[11px] text-gray-400 mb-4 text-center">
                  ✓ Inclusive of all applicable taxes
                </p>
              )}

              {checkoutError && (
                <p className="text-red-500 text-sm mb-4 text-center">{checkoutError}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing || isTaxLoading}
                className="w-full bg-blue-600 text-white font-semibold lg:py-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
              >
                {isProcessing ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing…</>
                ) : isTaxLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Calculating taxes…</>
                ) : (
                  `Pay ₹${formatCurrency(displayedTotal)} →`
                )}
              </button>

              <div className="text-center mt-4 text-sm text-gray-600">
                🛡️ Safe and Secure Payments. 100% Authentic products
              </div>
            </div>
          </div>

        </div>
      </section>
      <Toaster />
    </Suspense>
  );
}