"use client";

import { useEffect, useReducer } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  X,
  Copy,
  Loader2,
  ShoppingBag,
  Truck,
  MapPin,
  CreditCard,
  ChevronRight,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { fetchOrderDetails } from "@/utils/customerApiClient";
import { fetchProductProducts } from "@/utils/commonAPiClient";
import { formatCurrency } from "@/lib/utils";
import { authToken } from "@/utils/authToken";
import toast, { Toaster } from "react-hot-toast";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
interface State {
  loading: boolean;
  order: any | null;
  error: string | null;
  suggestions: any[];
  copied: boolean;
}

function reducer(state: State, action: Partial<State>): State {
  return { ...state, ...action };
}

export default function OrderDetailPage() {
  const { orderid } = useParams<{ orderid: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = authToken();
  const { user } = useAppSelector((state) => state.auth);

  const status = searchParams.get("status") || "success";
  const queryMessage = searchParams.get("message");

  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    order: null,
    error: null,
    suggestions: [],
    copied: false,
  });
  const isSuccess = state.order
    ? state.order.items?.[0]?.order_status?.toLowerCase() !== "cancelled"
    : status === "success";
  useEffect(() => {
    if (!orderid) return;

    const loadData = async () => {
      dispatch({ loading: true, error: null });
      try {
        let fetchedOrder = null;
        if (token) {
          const res = await fetchOrderDetails(orderid, token);
          if (res?.success && res?.data) {
            fetchedOrder = res.data;
          }
        }

        // Fetch recommendations (limit to 4)
        const suggestionRes = await fetchProductProducts({ limit: 4 });
        const suggestionList = suggestionRes?.data || [];

        dispatch({
          order: fetchedOrder,
          suggestions: suggestionList,
          loading: false,
        });
      } catch (err: any) {
        dispatch({
          error: err?.message || "Failed to load order details",
          loading: false,
        });
      }
    };

    loadData();
  }, [orderid, token]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderid);
    dispatch({ copied: true });
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => dispatch({ copied: false }), 2000);
  };

  const getOrderStatusLabel = (orderStatus: string) => {
    switch (orderStatus.toLowerCase()) {
      case "pending":
        return "Processing";
      case "processing":
        return "In Progress";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return orderStatus;
    }
  };

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading order details…
        </p>
      </div>
    );
  }

  // Derived variables
  const orderDate = state.order?.created_at
    ? new Date(state.order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const totalAmountStr =
    state.order?.total_amount || searchParams.get("amount") || "0";
  const totalAmount = parseFloat(totalAmountStr);
  const orderItems = state.order?.items || [];
  const shippingAddress = state.order?.address;
  const paymentDetails = state.order?.payment;
  const currentOrderStatus = orderItems[0]?.order_status || "processing";

  const orderStatusesTimeline = [
    { label: "Confirmed", active: true, done: true },
    {
      label: "Processing",
      active:
        currentOrderStatus.toLowerCase() === "processing" ||
        currentOrderStatus.toLowerCase() === "pending",
      done: currentOrderStatus.toLowerCase() !== "pending",
    },
    {
      label: "Shipped",
      active: currentOrderStatus.toLowerCase() === "shipped",
      done: ["shipped", "delivered"].includes(currentOrderStatus.toLowerCase()),
    },
    {
      label: "Delivered",
      active: currentOrderStatus.toLowerCase() === "delivered",
      done: currentOrderStatus.toLowerCase() === "delivered",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* ================= HEADER STATUS SECTION ================= */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center p-0.5 rounded-full mb-6">
            {isSuccess ? (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                <Check className="w-10 h-10 text-blue-600" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-10 h-10 text-red-600" strokeWidth={3} />
              </div>
            )}
          </div>

          <h1 className="text-theme-h3 md:text-theme-h2 font-extrabold tracking-tight text-gray-900 mb-3">
            {isSuccess ? "Your Order Has Been Placed" : "Payment Failed"}
          </h1>

          <p className="text-theme-body-sm md:text-theme-body text-gray-500 max-w-xl mx-auto leading-relaxed">
            {isSuccess ? (
              user?.email ? (
                <>
                  We've sent a confirmation email to{" "}
                  <span className="font-semibold text-gray-700">
                    {user.email}
                  </span>
                </>
              ) : (
                "Thank you for choosing Luxe Market. We've received your order and are preparing it for shipment."
              )
            ) : (
              queryMessage ||
              "We were unable to process your payment. Your order has been placed on hold or cancelled."
            )}
          </p>
        </div>

        {/* ================= ORDER INFORMATION CARD ================= */}
        <Card className="shadow-sm border-gray-200/80 rounded-2xl overflow-hidden mb-6">
          <CardContent className="p-6 md:p-8">
            {/* Top Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left mb-6 pb-6 border-b border-gray-100">
              <div className="space-y-1">
                <p className="text-theme-caption uppercase tracking-widest font-semibold text-gray-400">
                  Order Number
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    #{orderid.slice(0, 10).toUpperCase()}
                  </span>
                  <button
                    onClick={copyOrderId}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="Copy Order ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-theme-caption uppercase tracking-widest font-semibold text-gray-400">
                  Date
                </p>
                <p className="font-semibold text-gray-900">{orderDate}</p>
              </div>

              <div className="space-y-1">
                <p className="text-theme-caption uppercase tracking-widest font-semibold text-gray-400">
                  Total Amount
                </p>
                <p className="font-extrabold text-theme-h5 text-blue-600">
                  ₹{formatCurrency(totalAmount)}
                </p>
              </div>
            </div>

            {/* Success Details / Stepper */}
            {isSuccess ? (
              <div className="space-y-6">
                {/* Desktop Stepper */}
                <div className="hidden md:block">
                  <h3 className="text-theme-body-sm font-bold text-gray-800 mb-6">
                    Delivery Progress
                  </h3>
                  <div className="relative flex justify-between items-center px-4">
                    {/* Progress Bar background */}
                    <div className="absolute top-[7px] left-0 right-0 h-1 bg-gray-100 z-0">
                      <div
                        className="h-full bg-blue-500 transition-all duration-700"
                        style={{
                          width:
                            currentOrderStatus.toLowerCase() === "delivered"
                              ? "100%"
                              : currentOrderStatus.toLowerCase() === "shipped"
                                ? "66%"
                                : "33%",
                        }}
                      />
                    </div>
                    {orderStatusesTimeline.map((s, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center relative z-10"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            s.done
                              ? "bg-blue-600 border-blue-600 shadow-sm shadow-blue-200"
                              : s.active
                                ? "bg-white border-blue-500 animate-pulse"
                                : "bg-white border-gray-300"
                          }`}
                        />
                        <span
                          className={`text-theme-xxs font-bold mt-2 uppercase tracking-wider ${
                            s.active || s.done
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Stepper badge */}
                <div className="flex md:hidden items-center justify-between bg-blue-50/50 border border-blue-100/50 rounded-xl p-3.5">
                  <span className="text-theme-caption font-semibold text-blue-700">
                    Order Status
                  </span>
                  <Badge className="bg-blue-600 text-white border-none font-bold uppercase tracking-wide px-3 py-1">
                    {getOrderStatusLabel(currentOrderStatus)}
                  </Badge>
                </div>

                {/* Delivery Estimate Box */}
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-theme-caption text-gray-400 uppercase tracking-wider font-semibold">
                      Estimated Delivery
                    </p>
                    <p className="text-theme-body-sm font-bold text-gray-800">
                      Within 3-5 Business Days — Standard Delivery
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-theme-body-sm font-bold text-red-900">
                      What happened?
                    </h4>
                    <p className="text-theme-caption text-red-700 leading-relaxed">
                      Your payment authorization was declined or cancelled. We
                      have reserved your checkout configuration, but no funds
                      were captured and the items remain in your cart or have
                      been released.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================= PRIMARY ACTION BUTTONS ================= */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {isSuccess ? (
            <>
              <Button
                asChild
                className="flex-1  h-12 rounded-xl text-theme-body-sm font-bold transition-all shadow-sm border-border text-white bg-black hover:bg-black/70"
              >
                <Link href={`/customer/orders/${orderid}`}>
                  Track Order Details
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-50 h-12 rounded-xl text-theme-body-sm font-bold border-gray-300 transition-all text-gray-700"
              >
                <Link href="/store">Continue Shopping</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 h-12 rounded-xl text-theme-body-sm font-bold transition-all shadow-sm"
              >
                <Link href="/customer/checkout">Try Again</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-50 h-12 rounded-xl text-theme-body-sm font-bold border-gray-300 transition-all text-gray-700"
              >
                <Link href="/customer/cart">Go to Cart</Link>
              </Button>
            </>
          )}
        </div>

        {/* ================= BOTTOM SPLIT SECTIONS (Success state only) ================= */}
        {isSuccess && state.order && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Left Card: Items summary */}
            <Card className="shadow-none border-gray-200/80 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 py-4 border-b border-gray-100">
                <CardTitle className="text-theme-body-sm font-bold text-gray-800">
                  Items in this order
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                {orderItems.map((item: any) => (
                  <div key={item.id} className="py-3.5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1.5 shrink-0">
                      <img
                        src={
                          item.variant?.images?.[0]?.image_url ||
                          "https://placehold.co/150"
                        }
                        alt={item.variant?.variant_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-theme-caption font-bold text-gray-800 truncate">
                        {item.variant?.variant_name}
                      </h4>
                      <p className="text-theme-xxs text-gray-400 mt-0.5">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <span className="text-theme-caption font-bold text-gray-800">
                      ₹{formatCurrency(parseFloat(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right Card: Shipping Address */}
            <Card className="shadow-none border-gray-200/80 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 py-4 border-b border-gray-100">
                <CardTitle className="text-theme-body-sm font-bold text-gray-800">
                  Shipping To
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {shippingAddress ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-theme-caption text-gray-600 leading-relaxed">
                      <p className="font-bold text-gray-900 text-theme-body-sm mb-1">
                        {shippingAddress.name}
                      </p>
                      <p>{shippingAddress.address_line_1}</p>

                      <p>
                        {shippingAddress.city}, {shippingAddress.state}{" "}
                        {shippingAddress.postal_code}
                      </p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-theme-caption text-gray-400">
                    No delivery address loaded.
                  </p>
                )}

                {paymentDetails && (
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-theme-tiny text-gray-400 uppercase tracking-wider font-semibold">
                        Payment Method
                      </p>
                      <p className="text-theme-caption font-bold text-gray-800 uppercase">
                        {paymentDetails.payment_method}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================= SUGGESTIONS CAROUSEL SECTION ================= */}
        {state.suggestions.length > 0 && (
          <section className="mt-10">
            <h3 className="text-theme-body font-extrabold text-gray-900 uppercase tracking-wide mb-6">
              Complete your set
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {state.suggestions.map((product) => {
                const variant = product.variants?.[0];
                const image =
                  variant?.images?.[0]?.image_url ||
                  "https://placehold.co/300x400";
                const price = parseFloat(
                  product.base_price || variant?.price || "0",
                );

                return (
                  <Link
                    key={product.id}
                    href={`/store?search=${encodeURIComponent(product.name)}`}
                    className="flex flex-col bg-white border border-gray-200/80 rounded-xl overflow-hidden p-3 hover:shadow-md transition-shadow group"
                  >
                    <div className="relative aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden mb-3">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="text-theme-caption font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    <span className="text-theme-caption font-extrabold text-gray-900 mt-1">
                      ₹{formatCurrency(price)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
