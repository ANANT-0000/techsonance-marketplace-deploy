"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
    ChevronLeft,
    Download,
    Truck,
    CheckCircle2,
    Package,
    Clock,
    XCircle,
    CreditCard,
    MapPin
} from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "@/utils/customerApiClient";
import { OrderStatus } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import toast, { Toaster } from "react-hot-toast";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


interface GstInvoice {
    cgst_amount: string;
    company_id: string;
    created_at: string; // ISO 8601 date string
    gst_amount: string;
    id: string;
    igst_amount: string;
    invoice_date: string; // YYYY-MM-DD format
    invoice_number: string;
    order_id: string;
    sgst_amount: string;
    total_tax: string;
    updated_at: string; // ISO 8601 date string
}
// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderImage { image_url: string }
interface ProductVariant { id: string; variant_name: string; price: string; images: OrderImage[]; product_id: string; }
interface ReturnRequest { id: string; status: string; store_owner_note: string; tracking_id: string | null; type: string; }
interface OrderItem { id: string; quantity: number; price: string; order_status: OrderStatus; variant: ProductVariant; return_request: ReturnRequest | null; }
interface Address { name: string; address_line_1: string; address_line_2: string; city: string; state: string; postal_code: string; country: string; }
interface Payment { id: string; payment_method: string; payment_status: string; transaction_ref: string; amount: string; }
interface Invoice { company_id: string; order_id: string; invoice_url: string; invoice_number?: string; }
interface OrderDetailType { id: string; user_id: string; total_amount: string; created_at: string; items: OrderItem[]; address: Address; payment: Payment; invoice: Invoice; shipping: { tracking_url: string } | null; gstInvoice: GstInvoice | null; }

// ─── Timeline Helper ──────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "processing", label: "Packed", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status: string) {
    return TIMELINE_STEPS.findIndex(s => s.key === status.toLowerCase());
}

function VerticalTimeline({ currentStatus, date }: { currentStatus: string, date: string }) {
    const currentIndex = getStepIndex(currentStatus);
    const isCancelled = currentStatus.toLowerCase() === "cancelled";

    if (isCancelled) {
        return (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <XCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                <div>
                    <p className="font-bold text-red-900">Order Cancelled</p>
                    <p className="text-sm text-red-700 mt-1">This order was cancelled and will not be delivered.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative pl-6 space-y-8 py-2">
            {/* The vertical tracking line */}
            <div className="absolute left-[11px] top-3 bottom-4 w-0.5 bg-gray-100 z-0"></div>

            {TIMELINE_STEPS.map((step, index) => {
                const isCompleted = currentIndex >= index;
                const isCurrent = currentIndex === index;

                return (
                    <div key={step.key} className="relative z-10 flex gap-4 items-start">
                        {/* Dot */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 outline outline-4 outline-white transition-colors ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}>
                            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-white' : 'bg-gray-400'}`}></div>
                        </div>
                        {/* Content */}
                        <div className="flex flex-col">
                            <span className={`font-bold ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                            {isCompleted && (
                                <span className="text-xs text-gray-500 mt-0.5">
                                    {/* Mocking times for the UI feel; would map to actual timestamps if available */}
                                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            )}
                            {step.key === "shipped" && isCurrent && (
                                <Badge variant="secondary" className="w-fit mt-2 bg-blue-50 text-blue-700 border-blue-200 font-bold uppercase tracking-wider text-[10px]">
                                    In Transit
                                </Badge>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderDetailsPage() {
    const { orderId } = useParams<{ orderId: string }>();
    // const orderId = 
    const { downloadInvoice, isGenerating } = useInvoiceDownload();
    const [order, setOrder] = useState<OrderDetailType | null>(null);
    const router = useRouter();
    const token = authToken();

    useEffect(() => {
        if (!orderId || !token) return;
        fetchOrderDetails(orderId, token)
            .then((data) => setOrder(data.data))
            .catch((err) => console.error("Error fetching order details:", err));
    }, [orderId, token]);
    console.log('order', order);
    const handleCancelItem = (id: string) => router.push(`/customer/orders/${orderId}/cancel/${id}`);

    // --- Derived Logic ---
    // Calculate if all items share the exact same status
    const allItemsSameStatus = order?.items && order.items.length > 0
        ? order.items.every(item => item.order_status === order.items[0].order_status)
        : false;

    const unifiedStatus = allItemsSameStatus ? order!.items[0].order_status : null;

    // Totals
    const itemsTotal = order?.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) ?? 0;
    const taxAmount = 35.04; // Placeholder: Replace with order.tax_amount when mapped
    const totalAmount = itemsTotal + taxAmount; // Adjusted to include tax per mockup

    if (!order) return null; // Or a loading skeleton

    return (
        <div className="min-h-screen pb-12 font-sans rounded-2xl bg-gray-50/30">
            <div className="mx-auto lg:px-8 py-4 md:py-8">

                {/* ── Desktop Breadcrumb / Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-4 md:px-0">
                    <div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Link href="/customer/orders" className="hover:text-black transition-colors">Orders</Link>
                            <span className="text-black">/ {order.id.split("-")[0].toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                            Placed on {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • {order.items.length} Items
                        </p>
                    </div>

                    {/* ── Order-Level Actions (Top Right Desktop, Below Status Mobile) ── */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => downloadInvoice(order.id, token!)}
                            disabled={isGenerating}
                            className="bg-white"
                        >
                            <Download size={16} className="mr-2" />
                            {isGenerating ? "Loading..." : "Download Invoice"}
                        </Button>
                        {order.shipping?.tracking_url && (
                            <Button className="bg-black text-white hover:bg-gray-800" asChild>
                                <a href={order.shipping.tracking_url} target="_blank" rel="noopener noreferrer">
                                    <Truck size={16} className="mr-2" /> Track Package
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Main Grid Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 md:px-0">

                    {/* ── LEFT COLUMN (Status & Address) ── */}
                    <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-1">

                        {/* Unified Status Tracker (Only shows if all items have same status) */}
                        {unifiedStatus && (
                            <Card className="shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-gray-50/50 pb-4 border-b border-border">
                                    <CardTitle className="text-lg">Order Status</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2 md:pt-6">
                                    <VerticalTimeline currentStatus={unifiedStatus} date={order.created_at} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Mobile Order Actions (Only shows on mobile, right under status) */}
                        <div className="flex md:hidden gap-3 w-full">
                            {order.shipping?.tracking_url && (
                                <Button className="flex-1 bg-black text-white hover:bg-gray-800 h-12 rounded-xl" asChild>
                                    <a href={order.shipping.tracking_url} target="_blank" rel="noopener noreferrer">
                                        <Truck size={16} className="mr-2" /> Track
                                    </a>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="flex-1 bg-white h-12 rounded-xl"
                                onClick={() => downloadInvoice(order.id, token!)}
                                disabled={isGenerating}
                            >
                                <Download size={16} className="mr-2" />
                                Invoice
                            </Button>
                        </div>

                        {/* Shipping Address */}
                        <Card className="shadow-sm rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-blue-600 mt-1 shrink-0" size={20} />
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        <p className="font-bold text-gray-900 mb-1">{order.address.name}</p>
                                        <p>{order.address.address_line_1}</p>
                                        {order.address.address_line_2 && <p>{order.address.address_line_2}</p>}
                                        <p>{order.address.city}, {order.address.state} {order.address.postal_code}</p>
                                        <p>{order.address.country}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── RIGHT COLUMN (Items & Payment) ── */}
                    <div className="lg:col-span-8 flex flex-col gap-3 order-2 lg:order-2">

                        {/* Items Card */}
                        <Card className="shadow-sm rounded-2xl overflow-hidden px-2 py-2 ">
                            <CardHeader className="bg-gray-50/50 flex flex-row justify-between items-center ">
                                <CardTitle className="text-lg">Items In This Order</CardTitle>
                                <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700 font-semibold border-blue-100 border-b">
                                    {order.items.length} Items
                                </Badge>
                            </CardHeader>

                            <CardContent className="p-0">
                                {order.items.map((item, index) => {
                                    const status = item.order_status.toLowerCase();
                                    const isCancellable = ["pending", "processing"].includes(status);

                                    return (
                                        <div key={item.id} className={`p-2 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 ${index !== order.items.length - 1 ? 'border-b border-border' : ''}`}>
                                            {/* Image */}
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-3 border border-border/50">
                                                <img
                                                    src={item.variant.images?.[0]?.image_url || "https://placehold.co/150"}
                                                    alt={item.variant.variant_name}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h3 className="font-bold text-gray-900 text-base md:text-lg line-clamp-2">
                                                            {item.variant.variant_name}
                                                        </h3>
                                                        <span className="font-bold text-gray-900 whitespace-nowrap">₹{formatCurrency(Number(item.price))}</span>
                                                    </div>

                                                    {/* Fallback item status if they don't match globally */}
                                                    {!unifiedStatus && (
                                                        <div className="mt-2">
                                                            <Badge variant="outline" className="capitalize text-xs">{status}</Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                                    <Badge variant="secondary" className="rounded-md font-medium text-xs bg-gray-100 px-2 py-1">
                                                        Qty: {item.quantity}
                                                    </Badge>

                                                    {/* Item-Level Cancel Button (Only shows if cancellable) */}
                                                    {isCancellable && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCancelItem(item.id)}
                                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-7 text-xs rounded-md"
                                                        >
                                                            Cancel Item
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        {/* Payment Summary Card */}
                        <Card className="shadow-sm rounded-2xl overflow-hidden py-2.5">
                            <CardHeader className="bg-gray-50/50   border-b border-border">
                                <CardTitle className="text-lg">Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left: Payment Method */}
                                    <div className="bg-blue-50/50 rounded-lg px-3 py-2.5 border border-blue-100/50 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CreditCard className="text-blue-600" size={24} />
                                            <span className="font-bold text-gray-900">{order.payment.payment_method}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Status: <span className="font-semibold capitalize text-gray-900">{order.payment.payment_status}</span>
                                        </p>
                                        <Badge variant="outline" className="w-fit bg-white text-[10px] text-gray-500 border-gray-200 font-mono">
                                            Ref: {order.payment.transaction_ref.slice(0, 10)}
                                        </Badge>
                                    </div>

                                    {/* Right: Line Items */}
                                    <div className="space-y-3 text-sm text-gray-600 flex flex-col justify-center">
                                        <div className="flex justify-between">
                                            <span>Subtotal ({order.items.length} items)</span>
                                            <span className="font-medium text-gray-900">₹{formatCurrency(itemsTotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping & Handling</span>
                                            <span className="font-bold text-blue-600 uppercase tracking-wider text-xs mt-0.5">Free</span>
                                        </div>
                                        {order.gstInvoice && <div className="flex justify-between">
                                            <span>Estimated Tax</span>
                                            <span className="font-medium text-gray-900">₹{formatCurrency(Number(order.gstInvoice?.total_tax))}</span>
                                        </div>}

                                        <Separator className="my-2" />

                                        <div className="flex justify-between items-center pt-1">
                                            <span className="font-bold text-gray-900 text-base">Order Total</span>
                                            <span className="font-black text-xl text-gray-900">
                                                ₹{formatCurrency(totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
}