'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { companyDomain } from "@/config";
import { SelectedPaymentMethod } from "@/components/customer/SelectedPaymentMethod";
import { BASE_API_URL, PAYMENT_METHODS_FIELDS } from "@/constants";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { MapPin, CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AddressSelector } from "@/components/customer/AddressSelector";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { useCheckoutSession } from "@/hooks/UseCheckoutSession";
interface VariantDetails {
  id: string;
  variant_name: string;
  sku: string;
  price: string;
  status: string;
  stock_quantity: number;
}

function CheckoutContent() {
  const { user } = useAppSelector((state) => state.auth);
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearSession } = useCheckoutSession(`/customerProfile/${params.userId}/cart`);
  // --- Parse search params ---
  // URLs:
  //   /checkout?type=cart&id=abc123
  //   /checkout?type=product&id=xyz789
  const checkoutType = searchParams.get('type') as 'cart' | 'product' | null;
  console.log('checkoutType:', checkoutType);
  const id = searchParams.get('id');
  console.log('id:', id);
  // const isCartCheckout = checkoutType === 'cart';
  const isQuickBuy = checkoutType === 'product';
  console.log("isQuickBuy", isQuickBuy)
  // --- UI & Payment State ---
  const [selectedPaymentMethodState, setSelectedPaymentMethodState] = useState<string>('UPI');
  const [couponCode, setCouponCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [logger, setLogger] = useState<string[]>([]);
  // --- Address State ---
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // --- Dynamic Order State ---
  const [orderData, setOrderData] = useState({
    title: 'Loading...',
    subtotal: 0,
    discount: 0,
    delivery: 50,
    total: 0,
  });
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // --- Guard: redirect if params are invalid ---

  // --- Fetch order data based on type ---
  console.log('effect fetching')
  useEffect(() => {
    setLogger(prev => [...prev, `useEffect triggered with checkoutType=${checkoutType} and id=${id}`]);
    if (checkoutType === null || id === null) return;
    if (!checkoutType || !id) {
      router.replace(`/customerProfile/${params.userId}/cart`);
    }

    const loadCheckoutData = async () => {
      setLogger(prev => [...prev, `Loading checkout data for type=${checkoutType} and id=${id}`]);
      setIsLoadingOrder(true);
      setCheckoutError(null);
      try {
        console.log('fetching product variant isQuickBuy', isQuickBuy)
        if (isQuickBuy) {
          setLogger(prev => [...prev, `Fetching product variant details for ID: ${id}`]);
          // Fetch single product variant
          const res: { data: VariantDetails | undefined; success: boolean; message?: string } = await fetchProductVariantDetails(id);
          if (!res.data) {
            throw new Error("No response from server");
          }
          const variantData: VariantDetails = res?.data;
          const price = parseFloat(variantData?.price) || 0;

          console.log("Actual Price:", price);

          setLogger(prev => [
            ...prev,
            `Fetched product variant details: ${JSON.stringify(variantData)}`,
            `Calculated price for quick buy: ${price}`
          ]);
          setOrderData({
            title: `${variantData.variant_name} (x1)`,
            subtotal: price,
            discount: 0,
            delivery: 50,
            total: price + 50,
          });
          // setLogger(prev => [...prev, `Set order data for quick buy: ${JSON.stringify({ title: `${variantData.variant_name} (x1)`, subtotal: price, discount: 0, delivery: 50, total: price + 50 })}`]);
        } else {
          // Fetch cart items
          setLogger(prev => [...prev, `Fetching cart items for user: ${params.userId}`]);
          const res = await fetchGetCartList(params.userId, companyDomain);
          const cartItems = res?.data ?? [];

          if (!res?.success || cartItems.length === 0) {
            throw new Error("Your cart is empty");
          }

          const subtotal = cartItems.reduce(
            (acc: number, item: any) =>
              acc + Number(item.productVariant.price) * item.quantity,
            0
          );

          setOrderData({
            title: `Cart (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`,
            subtotal,
            discount: 0,
            delivery: 50,
            total: subtotal + 50,
          });
        }
      } catch (error: any) {
        console.error("Failed to load checkout data", error);
        setLogger(prev => [...prev, `Failed to load checkout data: ${error.message}`]);
        console.error("FULL ERROR:", error);
        console.error("ERROR MESSAGE:", error?.message);
        console.error("ERROR STACK:", error?.stack);
        setCheckoutError(error.message ?? "Failed to load order details.");
      } finally {
        setLogger(prev => [...prev, `Finished loading checkout data for type=${checkoutType} and id=${id}`]);
        console.log('Finished loading checkout data', { logger });
        setIsLoadingOrder(false);
      }
    };

    loadCheckoutData();
  }, [id, checkoutType, isQuickBuy, params.userId]);
  console.log("orderData", orderData)
  // --- Coupon ---
  const handleCouponApply = async () => {
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
          total: prev.subtotal + prev.delivery - result.discountAmount,
        }));
      } else {
        alert("Invalid coupon code.");
      }
    } catch (error) {
      console.error("Error applying coupon", error);
    }
  };

  // --- Payment ---
  const handlePayment = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }
    if (!id) return;

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // Step A: Build payload — only send the relevant ID
      const initPayload = {
        paymentMethod: selectedPaymentMethodState,
        addressId: selectedAddressId,
        ...(isQuickBuy ? { productVariantId: id } : { cartId: id }),
      };
      setLogger(prev => [...prev, `Initiating checkout with payload: ${JSON.stringify(initPayload)}`]);
      // Step B: Create a PENDING order on the backend
      const initResponse = await fetch(
        `${BASE_API_URL}checkout/${params.userId}/initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'company-domain': companyDomain,
          },
          body: JSON.stringify(initPayload),
        }
      );

      const initData = await initResponse.json();
      setLogger(prev => [...prev, `Received response from initiate endpoint: ${JSON.stringify(initData)}`]);
      if (!initData?.success) {
        setCheckoutError(initData?.message ?? "Failed to initiate order.");
        return;
      }

      // Step C: Handle payment gateway redirect or simulate
      if (initData.data?.paymentUrl) {
        window.location.href = initData.data.paymentUrl;
        return;
      }

      // Simulation fallback (remove in production)
      const userClickedSuccess = window.confirm(
        `SIMULATION: Pay ₹${formatCurrency(orderData.total)}\n\nOK = Success | Cancel = Failure`
      );
      setLogger(prev => [...prev, `User clicked success: ${userClickedSuccess}`]);
      const verifyResponse = await fetch(`${BASE_API_URL}checkout/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'company-domain': companyDomain,
        },
        body: JSON.stringify({
          orderId: initData.data.orderId,
          isSuccess: userClickedSuccess,
          ...(isQuickBuy
            ? { productVariantId: id }
            : { cartId: id }),
        }),
      });
      const verifyData = await verifyResponse.json();
      setLogger(prev => [...prev, `Received response from verify endpoint: ${JSON.stringify(verifyData)}`]);
      if (!verifyData?.success) {
        setCheckoutError(verifyData?.message ?? "Payment verification failed.");
        return;
      }
      // Step E: Redirect based on outcome and clear session 
      clearSession();

      if (userClickedSuccess && verifyData.success) {
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
  console.log('CheckoutContent rendered'); // add this
  console.log('searchParams type:', searchParams.get('type')); // add this
  console.log('searchParams id:', searchParams.get('id')); // add this
  // --- Loading State ---
  if (isLoadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading checkout...</p>
      </div>
    );
  }

  // --- Error State ---
  if (checkoutError && orderData.subtotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">{checkoutError}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto lg:px-4 py-8 min-h-[60vh]">{
      logger.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Log:</h3>
          <ul className="text-xs text-gray-700">
            {logger.map((log, index) => (
              <li key={index}>- {log}</li>
            ))}
          </ul>
        </div>
      )
    }
      <h1 className="text-2xl font-bold text-center mb-8">Secure Checkout</h1>

      {/* Checkout type badge */}
      <p className="text-center text-sm text-gray-500 mb-6">
        {isQuickBuy ? '⚡ Quick Buy' : '🛒 Cart Checkout'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Address + Payment */}
        <div className="lg:space-y-6 space-y-4">

          {/* Address */}
          <AddressSelector userId={user?.id || ''} onSelect={setSelectedAddressId} selectedAddressId={selectedAddressId} />

          {/* Payment Methods */}
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

        {/* RIGHT: Order Summary */}
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

            {/* Line items */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span className="line-clamp-1">{orderData.title}</span>
                <span>₹{formatCurrency(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>₹{formatCurrency(orderData.delivery)}</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{formatCurrency(orderData.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 py-3 font-bold text-lg border-t-2">
                <span>Total</span>
                <span>₹{formatCurrency(orderData.total)}</span>
              </div>
            </div>

            {/* Inline error */}
            {checkoutError && (
              <p className="text-red-500 text-sm mb-4 text-center">{checkoutError}</p>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white font-semibold lg:py-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              {isProcessing ? 'Processing...' : `Pay ₹${formatCurrency(orderData.total)}`}
              {!isProcessing && <span>→</span>}
            </button>

            <div className="text-center mt-4 text-sm text-gray-600">
              🛡️ Safe and Secure Payments. 100% Authentic products
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}