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
  MapPin,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
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
import { ORDER_DETAILS_TEXT } from "@/constants/customerText";

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

interface OrderImage {
  image_url: string;
}

interface ProductVariant {
  id: string;
  variant_name: string;
  price: string;
  images: OrderImage[];
  product_id: string;
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
}

interface Address {
  name: string;
  address_line_1: string;
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
}

interface Invoice {
  company_id: string;
  order_id: string;
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
  gstInvoice: GstInvoice | null;
}

// ─── Timeline Helper ──────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status: string) {
  return TIMELINE_STEPS.findIndex((s) => s.key === status.toLowerCase());
}

function VerticalTimeline({
  currentStatus,
  date,
}: {
  currentStatus: string;
  date: string;
}) {
  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus.toLowerCase() === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-left">
        <XCircle className="text-destructive mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-bold text-destructive">{ORDER_DETAILS_TEXT.ORDER_CANCELLED}</p>
          <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
            {ORDER_DETAILS_TEXT.ORDER_CANCELLED_DESC}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-8 py-2 text-left">
      {/* The vertical tracking line */}
      <div className="absolute left-[11px] top-3 bottom-4 w-0.5 bg-border z-0"></div>

      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = currentIndex >= index;
        const isCurrent = currentIndex === index;

        return (
          <div key={step.key} className="relative z-10 flex gap-4 items-start">
            {/* Dot */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 outline outline-4 outline-background transition-colors ${isCompleted ? "bg-primary" : "bg-muted"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isCompleted ? "bg-background" : "bg-muted-foreground"}`}
              ></div>
            </div>
            {/* Content */}
            <div className="flex flex-col">
              <span
                className={`text-xs font-bold ${isCurrent ? "text-foreground" : isCompleted ? "text-foreground/80" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
              {isCompleted && (
                <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {step.key === "shipped" && isCurrent && (
                <Badge
                  variant="secondary"
                  className="w-fit mt-2 bg-secondary text-foreground border border-border font-bold uppercase tracking-wider text-[9px]"
                >
                  {ORDER_DETAILS_TEXT.IN_TRANSIT}
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
  const { downloadInvoice, isGenerating } = useInvoiceDownload();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const router = useRouter();
  const token = authToken();

  useEffect(() => {
    let isMounted = true;
    if (!orderId || !token) return;
    fetchOrderDetails(orderId, token)
      .then((data) => {
        if (isMounted) {
          setOrder(data.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error("Error fetching order details:");
        }
      });
    return () => {
      isMounted = false;
    };
  }, [orderId, token]);

  const handleCancelItem = (id: string) =>
    router.push(`/customer/orders/${orderId}/cancel/${id}`);

  // Calculate if all items share the exact same status
  const allItemsSameStatus =
    order?.items && order.items.length > 0
      ? order.items.every(
          (item) => item.order_status === order.items[0].order_status,
        )
      : false;

  const unifiedStatus = allItemsSameStatus
    ? order!.items[0].order_status
    : null;

  // Totals
  const itemsTotal =
    order?.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    ) ?? 0;
  const totalAmount = itemsTotal;

  if (!order) {
    return (
      <div className="min-h-screen pb-12 font-sans rounded-2xl bg-background animate-pulse px-4 md:px-0 lg:px-8 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-secondary rounded" />
            <div className="h-6 w-64 bg-secondary rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-36 bg-secondary rounded-lg" />
            <div className="h-10 w-36 bg-secondary rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="h-72 bg-secondary rounded-2xl" />
            <div className="h-44 bg-secondary rounded-2xl" />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-96 bg-secondary rounded-2xl" />
            <div className="h-60 bg-secondary rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 font-sans rounded-2xl bg-background text-foreground text-left">
      <Toaster />
      <div className="mx-auto lg:px-8 py-4 md:py-8">
        {/* ── Desktop Breadcrumb / Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-4 md:px-0">
          <div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Link
                href="/customer/orders"
                className="hover:text-foreground hover:underline transition-all"
              >
                {ORDER_DETAILS_TEXT.BREADCRUMB_ORDERS}
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">
                {order.id.split("-")[0].toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 hidden md:block">
              {ORDER_DETAILS_TEXT.PLACED_ON_PREFIX}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              • {order.items.length} {ORDER_DETAILS_TEXT.ITEMS_COUNT_SUFFIX}
            </p>
          </div>

          {/* ── Order-Level Actions (Top Right Desktop, Below Status Mobile) ── */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => downloadInvoice(order.id, token!)}
              disabled={isGenerating}
              className="bg-card border-border rounded-xl shadow-sm text-xs font-semibold cursor-pointer active:scale-95 transition-all"
            >
              <Download size={16} className="mr-2" />
              {isGenerating ? ORDER_DETAILS_TEXT.BTN_INVOICE_LOADING : ORDER_DETAILS_TEXT.BTN_DOWNLOAD_INVOICE}
            </Button>
            {order.shipping?.tracking_url && (
              <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer text-xs font-semibold shadow-sm active:scale-95" asChild>
                <a
                  href={order.shipping.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Truck size={16} className="mr-2" /> {ORDER_DETAILS_TEXT.BTN_TRACK_PACKAGE}
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* ── Main Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 md:px-0">
          {/* ── LEFT COLUMN (Status & Address) ── */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-1">
            {/* Unified Status Tracker */}
            {unifiedStatus && (
              <Card className="shadow-sm rounded-2xl border-border bg-card overflow-hidden">
                <CardHeader className="pb-4 border-b border-border bg-transparent">
                  <CardTitle className="text-sm font-bold text-foreground">{ORDER_DETAILS_TEXT.ORDER_STATUS}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <VerticalTimeline
                    currentStatus={unifiedStatus}
                    date={order.created_at}
                  />
                </CardContent>
              </Card>
            )}

            {/* Mobile Order Actions */}
            <div className="flex md:hidden gap-3 w-full">
              {order.shipping?.tracking_url && (
                <Button
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90 h-12 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                  asChild
                >
                  <a
                    href={order.shipping.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Truck size={16} className="mr-2" /> {ORDER_DETAILS_TEXT.BTN_TRACK_SHORT}
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 bg-card border-border h-12 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                onClick={() => downloadInvoice(order.id, token!)}
                disabled={isGenerating}
              >
                <Download size={16} className="mr-2" />
                {ORDER_DETAILS_TEXT.BTN_INVOICE_SHORT}
              </Button>
            </div>

            {/* Shipping Address */}
            <Card className="shadow-sm rounded-2xl border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  {ORDER_DETAILS_TEXT.SHIPPING_ADDRESS}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="text-muted-foreground mt-1 shrink-0" size={20} />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-bold text-foreground mb-1">
                      {order.address.name}
                    </p>
                    <p>{order.address.address_line_1}</p>
                    <p>
                      {order.address.city}, {order.address.state}{" "}
                      {order.address.postal_code}
                    </p>
                    <p>{order.address.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (Items & Payment) ── */}
          <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-2">
            {/* Items Card */}
            <Card className="shadow-sm rounded-2xl border-border bg-card overflow-hidden">
              <CardHeader className="pb-4 border-b border-border bg-transparent flex flex-row justify-between items-center gap-3">
                <CardTitle className="text-sm font-bold text-foreground">
                  {ORDER_DETAILS_TEXT.ITEMS_IN_ORDER}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-secondary text-foreground font-bold border border-border text-[9px] py-0.5 px-2.5"
                >
                  {order.items.length} {ORDER_DETAILS_TEXT.ITEMS_COUNT_SUFFIX}
                </Badge>
              </CardHeader>

              <CardContent className="p-0">
                {order.items.map((item, index) => {
                  const status = item.order_status.toLowerCase();
                  const isCancellable = ["pending", "processing"].includes(
                    status,
                  );
                  const isReturnable = ["delivered"].includes(status);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 text-left ${index !== order.items.length - 1 ? "border-b border-border" : ""}`}
                    >
                      {/* Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-secondary/40 rounded-xl flex-shrink-0 flex items-center justify-center p-3 border border-border/50">
                        <img
                          src={
                            item.variant.images?.[0]?.image_url ||
                            "https://placehold.co/150"
                          }
                          alt={item.variant.variant_name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-bold text-foreground text-xs sm:text-sm line-clamp-2 leading-snug">
                              {item.variant.variant_name}
                            </h3>
                            <span className="font-bold text-foreground text-xs sm:text-sm whitespace-nowrap ml-2">
                              ₹{formatCurrency(Number(item.price))}
                            </span>
                          </div>

                          {!unifiedStatus && (
                            <div className="mt-2">
                              <Badge
                                variant="outline"
                                className="capitalize text-[9px] border-border bg-secondary/30 text-foreground font-bold tracking-wide"
                              >
                                {status}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <Badge
                            variant="secondary"
                            className="rounded-md font-semibold text-[10px] bg-secondary text-muted-foreground border border-border/60 px-2 py-0.5"
                          >
                            {ORDER_DETAILS_TEXT.QTY_LABEL}
                            {item.quantity}
                          </Badge>

                          {isCancellable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelItem(item.id)}
                              className="text-destructive border border-destructive/25 hover:bg-destructive/10 h-7 text-[10px] font-bold px-3 rounded-lg active:scale-95 transition-all cursor-pointer"
                            >
                              {ORDER_DETAILS_TEXT.BTN_CANCEL_ITEM}
                            </Button>
                          )}
                          {isReturnable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/customer/support/return/${item.id}`,
                                )
                              }
                              className="text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 h-7 text-[10px] font-bold px-3 rounded-lg active:scale-95 transition-all cursor-pointer"
                            >
                              {ORDER_DETAILS_TEXT.BTN_RETURN_ITEM}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card className="shadow-sm rounded-2xl border-border bg-card overflow-hidden">
              <CardHeader className="pb-4 border-b border-border bg-transparent">
                <CardTitle className="text-sm font-bold text-foreground">{ORDER_DETAILS_TEXT.PAYMENT_SUMMARY}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  {/* Left: Payment Method */}
                  <div className="bg-secondary/40 rounded-2xl p-4 border border-border/80 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="text-muted-foreground" size={20} />
                      <span className="font-bold text-foreground text-sm">
                        {order.payment.payment_method}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      {ORDER_DETAILS_TEXT.LABEL_STATUS}
                      <span className="font-semibold capitalize text-foreground">
                        {order.payment.payment_status}
                      </span>
                    </p>
                    <Badge
                      variant="outline"
                      className="w-fit bg-card text-[10px] text-muted-foreground border-border font-mono py-0.5 px-2 rounded-md font-bold"
                    >
                      {ORDER_DETAILS_TEXT.LABEL_REF}
                      {order.payment.transaction_ref.slice(0, 10)}
                    </Badge>
                  </div>

                  {/* Right: Line Items */}
                  <div className="space-y-3 text-xs text-muted-foreground flex flex-col justify-center">
                    <div className="flex justify-between">
                      <span>{ORDER_DETAILS_TEXT.LABEL_SUBTOTAL} ({order.items.length} items)</span>
                      <span className="font-medium text-foreground">
                        ₹{formatCurrency(itemsTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{ORDER_DETAILS_TEXT.LABEL_SHIPPING}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/10">
                        {ORDER_DETAILS_TEXT.LABEL_FREE}
                      </span>
                    </div>
                    {order.gstInvoice && (
                      <div className="flex justify-between">
                        <span>{ORDER_DETAILS_TEXT.LABEL_TAX}</span>
                        <span className="font-medium text-foreground">
                          ₹{formatCurrency(Number(order.gstInvoice?.total_tax))}
                        </span>
                      </div>
                    )}

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-foreground text-sm">
                        {ORDER_DETAILS_TEXT.LABEL_TOTAL}
                      </span>
                      <span className="font-black text-sm sm:text-base text-foreground">
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
