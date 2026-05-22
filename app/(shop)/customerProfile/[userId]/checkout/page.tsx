'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { SelectedPaymentMethod } from "@/components/customer/SelectedPaymentMethod";
import { PAYMENT_METHODS_FIELDS } from "@/constants";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { AddToCart } from "@/components/customer/AddToCart";
import {
  CreditCard, Loader2, Tag, CheckCircle2, X, AlertCircle,
  Plus, Minus, ShoppingBag, Package
} from "lucide-react";
import { AddressSelector } from "@/components/customer/AddressSelector";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { useCheckoutSession } from "@/hooks/UseCheckoutSession";
import { fetchInitCheckout, fetchVerifyPayment } from "@/utils/customerApiClient-SA";
import { authToken } from "@/utils/authToken";
import { TaxBreakdown, TaxBreakdownPanel, TaxLoadingSkeleton } from "@/components/customer/TaxBreakdownPanel";
import { clearCart } from "@/lib/features/Cart";
import { Coupon, Variant } from "@/utils/Types";
import AxiosAPI from "@/lib/axios";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantDetails {
  id: string;
  variant_name: string;
  sku: string;
  price: string;
  status: string;
  stock_quantity: number;
  images?: { image_url: string }[] | string;
  product_id?: string;
}

interface CartItemDisplay {
  id: string;
  cart_id: string;
  product_variant_id: string;
  quantity: number;
  productVariant: Variant;
}

// ─── Coupon Calculation ───────────────────────────────────────────────────────

function calculateCouponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  const discountValue = Number(coupon.discount_value ?? 0);
  const minOrderAmount = Number(coupon.min_order_amount ?? 0);
  const maxDiscountAmount = coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null;

  if (minOrderAmount > 0 && subtotal < minOrderAmount) return 0;

  const type = (coupon.discount_type ?? '').toLowerCase();
  if (type === 'percentage') {
    const raw = Math.floor((subtotal * discountValue) / 100);
    return maxDiscountAmount !== null ? Math.min(raw, maxDiscountAmount) : raw;
  }
  return Math.min(discountValue, subtotal);
}

// ─── Cart Item Row (uses AddToCart for live qty sync) ────────────────────────

function CartItemRow({ item }: { item: CartItemDisplay }) {
  const { items } = useAppSelector((s) => s.cart);
  const liveQty = items.find(i => i.productVariantId === item.product_variant_id)?.quantity ?? item.quantity;
  const subtotal = Number(item.productVariant.price) * liveQty;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
    >
      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-50">
        <img
          src={item.productVariant.images[0]?.image_url ?? "/placeholder.png"}
          alt={item.productVariant.variant_name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {item.productVariant.variant_name}
        </p>
        <p className="text-xs text-brand-primary font-bold mt-0.5">
          ₹{formatCurrency(Number(item.productVariant.price))} each
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {/* Live qty control — syncs with cart Redux state */}
        <AddToCart
          productVariantId={item.product_variant_id}
          styles="small w-20"
        />
        <p className="text-[10px] text-gray-400">
          ₹{formatCurrency(subtotal)}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Quick Buy Item Row (local qty, never touches cart) ───────────────────────

function QuickBuyItemRow({
  variant,
  qty,
  onQtyChange,
}: {
  variant: VariantDetails;
  qty: number;
  onQtyChange: (n: number) => void;
}) {
  const subtotal = Number(variant.price) * qty;
  const maxStock = variant.stock_quantity ?? 99;
console.log("  variant details in quick buy row", variant);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
    >
      {variant?.images && (
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-50">
          <img src={typeof variant.images === 'string' && variant.images  ? variant.images : 'https://imgs.search.brave.com/pnBIeHCYZeyfGKnruwbCQdsNxNOBpZP893nGmlSNntk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbGFj/ZWhvbGQubmV0L3By/b2R1Y3QtZGlhbG9n/LnBuZw'} 
            alt={variant.variant_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {variant.variant_name}
        </p>
        <p className="text-xs text-brand-primary font-bold mt-0.5">
          ₹{formatCurrency(Number(variant.price))} each
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {/* Local qty control — isolated from cart */}
        <div className="flex items-center bg-brand-primary rounded-lg overflow-hidden h-6">
          <button
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            className="px-2 h-full text-white hover:bg-black/10 transition-colors flex items-center"
          >
            <Minus size={12} />
          </button>
          <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
            {qty}
          </span>
          <button
            onClick={() => onQtyChange(Math.min(maxStock, qty + 1))}
            className="px-2 h-full text-white hover:bg-black/10 transition-colors flex items-center"
          >
            <Plus size={12} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400">
          ₹{formatCurrency(subtotal)}
        </p>
        {qty >= maxStock && (
          <p className="text-[9px] text-amber-500">Max stock</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Item List Panel ──────────────────────────────────────────────────────────

function ItemListPanel({
  isQuickBuy,
  cartItems,
  quickBuyVariant,
  quickBuyQty,
  onQuickBuyQtyChange,
}: {
  isQuickBuy: boolean;
  cartItems: CartItemDisplay[];
  quickBuyVariant: VariantDetails | null;
  quickBuyQty: number;
  onQuickBuyQtyChange: (n: number) => void;
}) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 lg:p-5 space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-1">
        <ShoppingBag size={16} className="text-gray-500" />
        {isQuickBuy ? 'Your Item' : `Cart Items (${cartItems.length})`}
      </h2>

      {isQuickBuy ? (
        quickBuyVariant ? (
          <QuickBuyItemRow
            variant={quickBuyVariant}
            qty={quickBuyQty}
            onQtyChange={onQuickBuyQtyChange}
          />
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Loading item…</p>
        )
      ) : (
        <AnimatePresence>
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <CartItemRow key={item.id} item={item} />
            ))
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { items: reduxCartItems } = useAppSelector((s) => s.cart);
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearSession } = useCheckoutSession(`/customerProfile/${params.userId}/cart`);
  const dispatch = useAppDispatch();

  const checkoutType = searchParams.get('type') as 'cart' | 'product' | null;
  const couponId = searchParams.get('couponId');
  const id = searchParams.get('id');
  const isQuickBuy = checkoutType === 'product';

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedPaymentMethodState, setSelectedPaymentMethodState] = useState<string>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const token = authToken();

  // ── Item Display State ────────────────────────────────────────────────────
  // Cart mode: full cart item list (for display & subtotal calc)
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
  // Quick buy mode: the fetched variant + local qty
  const [quickBuyVariant, setQuickBuyVariant] = useState<VariantDetails | null>(null);
  const [quickBuyQty, setQuickBuyQty] = useState(1);

  // ── Coupon State ──────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<Coupon | null>(null);
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
          setCouponApplied(data as Coupon);
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

                {couponApplied && couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Coupon ({couponApplied.code})</span>
                    <span>−₹{formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                {couponApplied && couponDiscount === 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <AlertCircle size={12} className="shrink-0" />
                    Min. order ₹{formatCurrency(Number(couponApplied.min_order_amount))} required.
                  </div>
                )}
              </div>

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
                disabled={isProcessing || isTaxLoading ||(couponApplied && couponDiscount === 0)? true : false}
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
      </section>
    </Suspense>
  );
}