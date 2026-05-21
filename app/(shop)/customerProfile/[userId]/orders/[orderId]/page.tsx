"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
    HeadphonesIcon,
    Package,
    Star,
    Truck,
    CheckCircle2,
    XCircle,
    RefreshCcw,
    ChevronLeft,
    Clock,
    Download,
    FileText,
    BadgeCheck,
    AlertCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "@/utils/customerApiClient";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import { BASE_API_URL } from "@/constants";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderImage { image_url: string }

interface ProductVariant {
    id: string;
    variant_name: string;
    price: string;
    images: OrderImage[];
}

interface ReturnRequest {
    id: string;
    status: string;
    store_owner_note: string;
    tracking_id: string | null;
    type: string;
}

interface OrderItem {
    id: string;
    quantity: number;
    price: string;
    order_status: OrderStatus;
    variant: ProductVariant;
    return_request: ReturnRequest | null;
    invoice: Invoice | null;
}

interface Address {
    name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface Payment {
    id: string;
    payment_method: string;
    payment_status: string;
    transaction_ref: string;
    amount: string;
    created_at: string;
    updated_at: string;
    order_id: string;
    company_id: string;
}

interface Invoice {
    company_id:string;
order_id:string;
invoice_url: string;
invoice_number?: string;

}
interface OrderDetailType {
    id: string;
    user_id: string;
    total_amount: string;
    created_at: string;
    items: OrderItem[];
    address: Address;
    payment: Payment;
    invoice: Invoice;
    shipping: { tracking_url: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STEPS = ["pending", "shipped", "delivered"] as const;

/** Returns 0–100 progress % for the tracker bar */
function getProgressPercent(status: string): number {
    const idx = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
    if (idx < 0) return 0;
    return Math.round((idx / (STATUS_STEPS.length - 1)) * 100);
}

const PAYMENT_STATUS_CONFIG: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
> = {
    paid: {
        label: "Paid",
        className: "bg-green-50 border-green-200 text-green-700",
        icon: <BadgeCheck size={14} />,
    },
    pending: {
        label: "Payment Pending",
        className: "bg-amber-50 border-amber-200 text-amber-700",
        icon: <Clock size={14} />,
    },
    refunded: {
        label: "Refunded",
        className: "bg-blue-50 border-blue-200 text-blue-700",
        icon: <RefreshCcw size={14} />,
    },
    failed: {
        label: "Payment Failed",
        className: "bg-red-50 border-red-200 text-red-700",
        icon: <AlertCircle size={14} />,
    },
};

function PaymentStatusBadge({ status }: { status: string }) {
    const cfg = PAYMENT_STATUS_CONFIG[status.toLowerCase()] ?? {
        label: status,
        className: "bg-gray-50 border-gray-200 text-gray-700",
        icon: <AlertCircle size={14} />,
    };
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.className}`}
        >
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

// ─── Per-item status tracker (only for active / non-cancelled items) ──────────

function ItemStatusTracker({ status }: { status: string }) {
    const progress = getProgressPercent(status);
    return (
        <div className="mt-4 mb-2">
            <div className="relative flex justify-between items-center w-full">
                {/* grey rail */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
                {/* green fill */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full z-0 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
                {STATUS_STEPS.map((step, idx) => {
                    const stepProgress = Math.round((idx / (STATUS_STEPS.length - 1)) * 100);
                    const completed = progress >= stepProgress;
                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-colors
                  ${completed ? "border-green-500 text-green-500" : "border-gray-300 text-gray-400"}`}
                            >
                                {idx === 0 && <Package size={15} />}
                                {idx === 1 && <Truck size={15} />}
                                {idx === 2 && <CheckCircle2 size={15} />}
                            </div>
                            <span
                                className={`text-[10px] font-semibold capitalize text-center leading-tight max-w-[56px] ${completed ? "text-gray-800" : "text-gray-400"}`}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Inline status badge for items in transit ─────────────────────────────────

function InTransitBadge({ status }: { status: string }) {
    type Config = { wrapper: string; iconColor: string; titleColor: string; subtitleColor: string; icon: React.ElementType; title: string; subtitle: string };
    const map: Record<string, Config> = {
        pending: { wrapper: "bg-amber-50 border-amber-200", iconColor: "text-amber-500", titleColor: "text-amber-900", subtitleColor: "text-amber-700", icon: Clock, title: "Order Placed", subtitle: "Waiting for confirmation." },
        processing: { wrapper: "bg-blue-50 border-blue-200", iconColor: "text-blue-500", titleColor: "text-blue-900", subtitleColor: "text-blue-700", icon: Package, title: "Order Processing", subtitle: "Preparing your item." },
        shipped: { wrapper: "bg-indigo-50 border-indigo-200", iconColor: "text-indigo-500", titleColor: "text-indigo-900", subtitleColor: "text-indigo-700", icon: Truck, title: "In Transit", subtitle: "Your item is on the way." },
    };
    const cfg = map[status.toLowerCase()];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
        <div className={`flex items-center gap-3 py-2 px-3 rounded-xl border ${cfg.wrapper}`}>
            <Icon size={20} className={cfg.iconColor} strokeWidth={2.5} />
            <div className="flex flex-col">
                <span className={`text-sm font-bold ${cfg.titleColor}`}>{cfg.title}</span>
                <span className={`text-xs font-medium ${cfg.subtitleColor}`}>{cfg.subtitle}</span>
            </div>
        </div>
    );
}

// ─── Cancelled item card ──────────────────────────────────────────────────────

function CancelledBadge() {
    return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 w-fit">
            <XCircle size={16} className="text-red-500 shrink-0" />
            <div>
                <p className="text-sm font-bold text-red-800">Item Cancelled</p>
                <p className="text-xs text-red-600">This item was cancelled before shipment.</p>
            </div>
        </div>
    );
}

// ─── Return / replacement tracking block ─────────────────────────────────────

function ReturnRequestBlock({ req }: { req: ReturnRequest }) {
    const isReturn = req.type.toUpperCase() === "RETURN";
    const status = req.status.toUpperCase();

    const trackingLabel = isReturn ? "Track Return Pickup ↗" : "Track Replacement ↗";

    const hintMap: Record<string, string> = {
        APPROVED: isReturn
            ? "Waiting for courier to pick up your return."
            : "Waiting for vendor to dispatch the new item.",
        IN_TRANSIT: isReturn
            ? "Your return is on its way back to the vendor."
            : "Your replacement item is on the way!",
        DELIVERED: "Item reached the vendor. Pending Quality Check.",
        QC_PASSED: isReturn
            ? "Quality Check passed. Refund is being processed."
            : "Quality Check passed. Replacement cycle complete.",
    };

    return (
        <div className="py-3 px-4 rounded-xl border border-orange-200 bg-orange-50 flex flex-col gap-2 w-full mt-2">
            <div>
                <p className="text-sm font-bold text-orange-800 uppercase tracking-wide">
                    {isReturn ? "Return" : "Replacement"} Status: {status.replace(/_/g, " ")}
                </p>
                {hintMap[status] && (
                    <p className="text-xs font-medium text-orange-600 mt-0.5">{hintMap[status]}</p>
                )}
            </div>

            {req.tracking_id ? (
                <a
                    href={req.tracking_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-fit bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                    <Truck size={14} /> {trackingLabel}
                </a>
            ) : (
                status === "APPROVED" && (
                    <p className="text-sm font-medium text-orange-600">
                        Tracking Link:{" "}
                        <span className="italic text-orange-500 opacity-80">Available once dispatched…</span>
                    </p>
                )
            )}

            {req.store_owner_note && ["REJECTED", "QC_FAILED"].includes(status) && (
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-700">
                        <span className="font-bold">Message from Seller:</span> {req.store_owner_note}
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Single Order Item row ────────────────────────────────────────────────────

interface OrderItemRowProps {
    item: OrderItem;
    isSingleItem: boolean;
    onCancel: (id: string) => void;
    onReturnReplace: (id: string) => void;
    onWriteReview: (id: string) => void;
    handleDownload: (url: string, filename: string) => void;
}

function OrderItemRow({ item, isSingleItem, onCancel, onReturnReplace, onWriteReview ,handleDownload}: OrderItemRowProps) {
    const status = item.order_status.toLowerCase();

    const isCancelled = status === "cancelled";
    const isCancellable = ["pending", "processing"].includes(status);
    const isShipped = status === "shipped";
    const isPastDelivery = ["delivered", "returned", "replaced"].includes(status);

    const hasActiveReturnRequest = !!item.return_request;
    const canInitiateReturn = status === "delivered" && !hasActiveReturnRequest;

    const cancelHint = isShipped
        ? "Cannot cancel — item has already shipped."
        : isCancelled
            ? ""
            : item.return_request?.type.toLowerCase() === "return"
                ? "This item is being returned."
                : item.return_request?.type.toLowerCase() === "replacement"
                    ? "This item is being replaced."
                    : "Items can be cancelled before shipment.";

    return (
        <div className="flex flex-col gap-4 py-5 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Product image */}
                <div className="w-full sm:w-28 shrink-0 bg-[#f7f7f7] rounded-xl flex items-center justify-center p-3">
                    <img
                        src={item.variant.images[0]?.image_url}
                        alt={item.variant.variant_name}
                        className="w-full h-24 object-contain mix-blend-multiply"
                    />
                </div>

                {/* Details */}

                <div className="flex-grow flex flex-col justify-between gap-3">
                    <div>
                        <Link
                            href={`/shopping/${item.variant.id}`}
                            className="font-bold text-gray-900 text-sm sm:text-base hover:text-blue-600 line-clamp-2 transition-colors"
                            >
                            {item.variant.variant_name}
                        </Link>
                <div className="flex justify-between w-full">
                    <span >
                        <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</p>
                        <p className="text-gray-900 font-semibold mt-0.5">
                            ₹{formatCurrency(Number(item.price))}
                        </p>
   </span>
                           {/* { item.invoice && item?.invoice?.invoice_url && (
                                     <button 
      onClick={() => handleDownload(
         item.invoice.invoice_url,
        item.invoice.invoice_number ?? "invoice.pdf"
      )}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-1 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                                    >
                                        <Download size={16} /> Download Invoice
                                    </button>
                                )} */}
                            </div>
                    </div>
                  

                    {/* ── Per-item tracker (only shown when there are multiple items OR single non-cancelled) */}
                    {!isCancelled && !isPastDelivery && (
                        <ItemStatusTracker status={status} />
                    )}

                    {/* ── Action area ── */}
                    <div className="flex flex-wrap gap-2 items-center justify-between">

                        {/* Cancelled */}
                        {isCancelled && <CancelledBadge />}

                        {/* In-transit badge */}
                        {!isPastDelivery && !isCancelled && <InTransitBadge status={status} />}

                        {/* Cancel button */}
                        {!isPastDelivery && !isCancelled && (
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={isCancellable ? () => onCancel(item.id) : undefined}
                                    disabled={!isCancellable}
                                    className={`flex items-center w-fit gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium border transition-colors ${isCancellable
                                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 cursor-pointer"
                                        : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <XCircle size={14} /> Cancel Item
                                </button>
                                {cancelHint && (
                                    <span className="text-xs text-gray-400 px-1">{cancelHint}</span>
                                )}
                            </div>
                        )}

                        {/* Post-delivery — no active return yet */}
                        {canInitiateReturn && (
                            <>
                                <button
                                    onClick={() => onReturnReplace(item.id)}
                                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-white border border-orange-200 text-orange-700 font-medium rounded-xl hover:bg-orange-50 transition-colors"
                                >
                                    <RefreshCcw size={14} /> Return / Replace
                                </button>
                                <button className="text-sm px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors">
                                    Buy Again
                                </button>
                                <button
                                    onClick={() => onWriteReview(item.id)}
                                    className="text-sm px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Write a Review
                                </button>
                            </>
                        )}

                        {/* Active return / replacement tracking */}
                        {hasActiveReturnRequest && item.return_request && (
                            <ReturnRequestBlock req={item.return_request} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Single-item top-level tracker (shown above all cards when only 1 item) ───

function SingleItemTracker({ status }: { status: string }) {
    const isCancelled = status === "cancelled";
    if (isCancelled) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
        >
            <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery Status</h2>
            <ItemStatusTracker status={status} />
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderDetailsPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderDetailType | null>(null);
    const router = useRouter();
    const token=authToken(); 
    useEffect(() => {
        if (!orderId || !token) return;
        fetchOrderDetails(orderId, token)
            .then((data) => {
                setOrder(data.data);
                console.log("order details", data);
            })
            .catch((err) => console.error("Error fetching order details:", err));
    }, [orderId, token]);
    console.log("order",order)
    const handleCancelItem = (id: string) => router.push(`${orderId}/cancel/${id}`);
    const handleReturnReplace = (id: string) => router.push(`${orderId}/return/${id}`);
    const handleWriteReview = (id: string) =>
        router.push(`/customerProfile/${order?.user_id}/orders/${orderId}/review/${id}`);

    // ── Derived values
    const isSingleItem = (order?.items?.length ?? 0) === 1;

    // Real total: sum of item prices (server total_amount can be 0 after cancellation)
    const itemsTotal =
        order?.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) ?? 0;

    const paymentStatus = order?.payment?.payment_status ?? "";
    console.log('paymentStatus', order?.payment.payment_status
)

const handleDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
};const processMultipleDownloads = async (urls: string[]) => {
  if (!urls || urls.length === 0) return;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const extractedFilename = url.substring(url.lastIndexOf('/') + 1);
    
    await handleDownload(url, extractedFilename);
    await new Promise(resolve => setTimeout(resolve, 300)); 
  }
};
 const handleOrderWarrantiesDownload = async (orderId: string) => {
  try {
    // Replace this URL with your actual server endpoint
    const response = await fetch(`${BASE_API_URL}/v1/orders/warranty/${orderId}`); 
    const result = await response.json();

    // Check if the response matches your expected format
    if (result.success && result.data && result.data.length > 0) {
      // Trigger the downloads with the array of URLs
      await processMultipleDownloads(result.data);
      toast.success('Warranty documents downloaded successfully!');
    } else {
      console.warn('No warranties found or request failed:', result.message);
      toast.error('No warranties found or request failed.');
    }
  } catch (error) {
    console.error('Failed to fetch warranty URLs from server:', error);
    // Optional: Show an error toast/alert to the user here
  }
};


    return (
        <div className="min-h-screen pb-12 font-sans rounded-2xl">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Header ── */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
                        aria-label="Go back"
                    >
                        <ChevronLeft size={22} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Order #{order?.id?.split("-")[0]?.toUpperCase()} •{" "}
                            {order?.created_at
                                ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })
                                : ""}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* ── LEFT: Tracker + Items ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Top-level tracker — only when 1 item and not cancelled */}
                        {/* {isSingleItem && order?.items[0] && (
                            <SingleItemTracker status={order.items[0].order_status} />
                        )} */}

                        {/* Items card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                {isSingleItem ? "Item" : `Items (${order?.items.length})`}
                            </h2>

                            {order?.items.map((item) => (
                                <OrderItemRow
                                    key={item.id}
                                    item={item}
                                    isSingleItem={isSingleItem}
                                    onCancel={handleCancelItem}
                                    onReturnReplace={handleReturnReplace}
                                    onWriteReview={handleWriteReview}
                                    handleDownload={handleDownload}
                                />
                            ))}
                        </motion.div>

                        {/* Delivery rating — only if ALL items delivered */}
                        {order?.items.every((i) => i.order_status === "delivered") && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="font-bold text-gray-900">How was your delivery?</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Your feedback helps us improve our logistics.
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} className="p-1 hover:scale-110 transition-transform">
                                            <Star
                                                size={28}
                                                className="text-gray-300 hover:text-yellow-400 hover:fill-yellow-400"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── RIGHT: Summary, Address, Support ── */}
                    <div className="space-y-6">

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 text-sm text-gray-600 border-b border-gray-100 pb-4 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">
                                        ₹{formatCurrency(itemsTotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span className="font-medium text-gray-900">₹0.00</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-6">
                                <span className="font-bold text-gray-900 text-base">Total</span>
                                <span className="font-bold text-xl text-gray-900">
                                    ₹{formatCurrency(itemsTotal)}
                                </span>
                            </div>

                            {/* Payment info */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-gray-500">Payment Method</p>
                                    {paymentStatus && <PaymentStatusBadge status={paymentStatus} />}
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {order?.payment?.payment_method}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 break-all">
                                    Ref: {order?.payment?.transaction_ref}
                                </p>
                            </div>

                            {/* Refund note */}
                            {paymentStatus === "refunded" && (
                                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700">
                                    <RefreshCcw size={13} className="shrink-0 mt-0.5" />
                                    <span>
                                        A refund of{" "}
                                        <strong>₹{formatCurrency(Number(order?.payment?.amount))}</strong> has
                                        been initiated to your original payment method. It may take 5–7 business
                                        days to reflect.
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                {order?.invoice?.invoice_url && (
                                     <button 
      onClick={() => handleDownload(
        order.invoice.invoice_url,
        order.invoice.invoice_number ?? "invoice.pdf"
      )}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                                    >
                                        <Download size={16} /> Download Invoice
                                    </button>
                                )}
                                <button onClick={()=>handleOrderWarrantiesDownload(orderId)} className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                                    <FileText size={16} /> Request Warranty Slip
                                </button>
                            </div>
                        </motion.div>

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping Address</h2>
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <p className="font-bold text-gray-900 mb-1">{order?.address?.name}</p>
                                <p>{order?.address?.address_line_1}</p>
                                {order?.address?.address_line_2 && <p>{order?.address?.address_line_2}</p>}
                                <p>
                                    {order?.address?.city}, {order?.address?.state}{" "}
                                    {order?.address?.postal_code}
                                </p>
                                <p>{order?.address?.country}</p>
                            </div>
                        </motion.div>

                        {/* Support */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-3"
                        >
                            <h2 className="text-sm font-bold text-gray-900">Need help with this order?</h2>
                            <button className="flex items-center gap-3 text-sm text-blue-600 font-medium hover:underline w-fit">
                                <HeadphonesIcon size={18} /> Contact Customer Support
                            </button>
                            <button className="flex items-center gap-3 text-sm text-blue-600 font-medium hover:underline w-fit">
                                <RefreshCcw size={18} /> View Return Policy
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
}