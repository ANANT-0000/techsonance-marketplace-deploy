'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { SelectedPaymentMethod } from "@/components/customer/SelectedPaymentMethod";
import { BASE_API_URL, PAYMENT_METHODS_FIELDS } from "@/constants";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { MapPin, CreditCard, CheckCircle2, Info, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { AddressSelector } from "@/components/customer/AddressSelector";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { useCheckoutSession } from "@/hooks/UseCheckoutSession";
import { getCompanyDomain } from "@/lib/get-domain";
import { fetchInitCheckout, fetchVerifyPayment } from "@/utils/customerApiClient-SA";
import { authToken } from "@/utils/authToken";
import { TaxBreakdown, TaxBreakdownPanel, TaxLoadingSkeleton } from "@/components/customer/TaxBreakdownPanel";
import { clearCart } from "@/lib/features/Cart";
import { Coupon } from "@/utils/Types";
import AxiosAPI from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantDetails {
  id: string;
  variant_name: string;
  sku: string;
  price: string;
  status: string;
  stock_quantity: number;
}


// ─── Main Checkout Page ───────────────────────────────────────────────────────

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
  console.log("couponId",couponId);
  // ── UI State ──
  const [selectedPaymentMethodState, setSelectedPaymentMethodState] = useState<string>('UPI');
  const [couponCode, setCouponCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const token = authToken();
  const [couponApplied, setCouponApplied] = useState<Coupon | null>(null);
  // ── Order Data ──
  const [orderData, setOrderData] = useState({
    title: 'Loading...',
    subtotal: 0,
    discount: 0,
    delivery: 0,
    total: 0,
    // For cart: store items to pass to tax endpoint
    cartItems: [] as { variantId: string; quantity: number; price: number }[],
  });
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // ── Tax State ──
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  const [isTaxLoading, setIsTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);
  // Track which address we last fetched taxes for (to avoid redundant calls)
  const [lastTaxAddressId, setLastTaxAddressId] = useState<string>("");

  // ── Load order details ──
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
          await AxiosAPI.get(`/v1/coupons/${couponId}`)
            .then((res) => {
              if (res.data?.success && res.data?.data) {
                setCouponApplied(res.data.data);
              } else {  
                console.warn("Failed to fetch coupon details:", res.data?.message);
              } 
            })
            .catch((err) => {              console.error("Error fetching coupon details:", err);            });
        }
        if (isQuickBuy) {
          const res: { data: VariantDetails | undefined; success: boolean; message?: string } =
            await fetchProductVariantDetails(id);
          if (!res.data) throw new Error("No response from server");
          const variantData = res.data;
          const price = parseFloat(variantData.price) || 0;
          setOrderData({
            title: `${variantData.variant_name} (x1)`,
            subtotal: price,
            discount: 0,
            delivery: 0,
            total: price,
            cartItems: [{ variantId: variantData.id, quantity: 1, price }],
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
            discount: 0,
            delivery: 0,
            total: subtotal,
            cartItems: mappedItems,
          });
        }
      } catch (error: any) {
        setCheckoutError(error.message ?? "Failed to load order details.");
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadCheckoutData();
  }, [id, checkoutType, isQuickBuy, params.userId, token]);

  // ── Fetch Tax Breakdown when address changes ──
  const fetchTaxBreakdown = useCallback(
    async (addressId: string) => {
      if (!addressId || !orderData.cartItems.length || addressId === lastTaxAddressId) return;

      setIsTaxLoading(true);
      setTaxError(null);
      setLastTaxAddressId(addressId);

      try {
        const companyDomain = await getCompanyDomain();
        const response = await fetch(`${BASE_API_URL}/v1/finances/calculate-order-taxes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'company-domain': companyDomain,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerAddressId: addressId,
            cartItems: orderData.cartItems,
          }),
        });

        if (!response.ok) {
          // Graceful degradation — don't block checkout if tax calc fails
          console.warn('Tax calculation failed, proceeding without breakdown');
          setTaxBreakdown(null);
          setIsTaxLoading(false);
          return;
        }

        const result = await response.json();
        const data = result.data ?? result;

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

        // Update displayed total to include taxes
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
    },
    [orderData.cartItems, orderData.subtotal, lastTaxAddressId, token]
  );

  // Trigger tax fetch when address is selected
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== lastTaxAddressId && !isLoadingOrder) {
      fetchTaxBreakdown(selectedAddressId);
    }
  }, [selectedAddressId, isLoadingOrder]);

  // Reset tax when address changes to a new one
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== lastTaxAddressId) {
      setTaxBreakdown(null);
    }
  }, [selectedAddressId]);

  // ── Coupon ──
  const handleCouponApply = async () => {
    const companyDomain = await getCompanyDomain();
    if (!couponCode.trim()) return;
    try {
      const response = await fetch(`${BASE_API_URL}checkout/apply-coupon/${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'company-domain': companyDomain,
        },
        body: JSON.stringify({ coupon_code: couponCode }),
      });
      const result = await response.json();
      if (result.success && result.valid) {
        setOrderData((prev) => ({
          ...prev,
          discount: result.discountAmount,
          total: prev.subtotal + prev.delivery - result.discountAmount + (taxBreakdown?.totalTax ?? 0),
        }));
        // Invalidate tax so it refetches with new totals
        setLastTaxAddressId("");
        if (selectedAddressId) fetchTaxBreakdown(selectedAddressId);
      } else {
        alert("Invalid coupon code.");
      }
    } catch (error) {
      console.error("Error applying coupon", error);
    }
  };

  // ── Compute displayed total ──
  const displayedTotal =
    orderData.subtotal +
    orderData.delivery -
    orderData.discount +
    (taxBreakdown?.totalTax ?? 0);

  // ── Payment ──
  const handlePayment = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
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
        orderId: initData.data.orderId,
        isSuccess: userClickedSuccess,
        ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
      }, token);

      if (!verifyData?.success) {
        setCheckoutError(verifyData?.message ?? "Payment verification failed.");
        return;
      }

      clearSession();

      if (userClickedSuccess && verifyData.success) {
        dispatch(clearCart());        router.push(`/customerProfile/${params.userId}/orders/${initData.data.orderId}`);
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

  // ── Loading / Error states ──
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

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500 animate-pulse">Loading…</p>
        </div>
      }
    >
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

            <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-4">
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
            <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-4 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Coupon */}
              <div className="flex flex-wrap gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode.toUpperCase()}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCouponApply}
                  className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Line Items */}
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

                {orderData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{formatCurrency(orderData.discount)}</span>
                  </div>
                )}
              </div>

              {/* Tax Breakdown — the key new section */}
              <div className="mb-4">
                {isTaxLoading ? (
                  <TaxLoadingSkeleton />
                ) : (
                  <TaxBreakdownPanel
                    tax={taxBreakdown}
                    deliveryFee={orderData.delivery}
                    discount={orderData.discount}
                  />
                )}
                {taxError && (
                  <p className="text-xs text-amber-600 mt-1 px-1">{taxError}</p>
                )}
              </div>

              {/* Grand Total */}
              <div className="flex justify-between text-gray-900 py-3 font-bold text-lg border-t-2 mb-4">
                <span>Total</span>
                <span>₹{formatCurrency(displayedTotal)}</span>
              </div>

              {/* Tax note */}
              {taxBreakdown && (
                <p className="text-[11px] text-gray-400 mb-4 text-center">
                  ✓ Inclusive of all applicable taxes
                </p>
              )}

              {/* Inline Error */}
              {checkoutError && (
                <p className="text-red-500 text-sm mb-4 text-center">{checkoutError}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing || isTaxLoading}
                className="w-full bg-blue-600 text-white font-semibold lg:py-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
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
    </Suspense>
  );
}