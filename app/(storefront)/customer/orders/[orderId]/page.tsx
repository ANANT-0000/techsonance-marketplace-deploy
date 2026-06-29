"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency, getUIConfig, normalizeStatus } from "@/lib/utils";
import {
  Map,
  Download,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  XCircle,
  CreditCard,
  MapPin,
  AlertTriangle,
  ChevronDown,
  FileText,
  RotateCcw,
  RefreshCw,
  Ban,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "@/utils/customerApiClient";
import { OrderStatus, ReturnReplaceMode } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import toast, { Toaster } from "react-hot-toast";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { useOrderEligibilityGuard } from "@/hooks/useOrderEligibilityGuard";
import type { GuardOrderItem } from "@/utils/orderEligibilityGuard";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  EXCEPTION_STATUSES,
  ORDER_DETAILS_TEXT,
  STATUS_UI_CONFIG,
  TERMINAL_STATUSES,
} from "@/constants/customerText";
import { TrackingTimeline } from "@/components/customer/TrackingTimeline";
import { ItemActionButtons } from "@/components/customer/ItemActionButtons";

/**
 * used in order detal page gstInvoice feilds are taken from the frontend perspective
 */
export interface GstInvoice {
  cgst_amount: string;
  company_id: string;
  created_at: string;
  gst_amount: string;
  id: string;
  igst_amount: string;
  invoice_date: string;
  invoice_number: string;
  order_id: string;
  sgst_amount: string;
  total_tax: string;
  updated_at: string;
}

/**
 * used in order detal page orderImage feilds are taken from the frontend perspective
 */
export interface OrderImage {
  image_url: string;
}
/**
 * used in order detal page productVariant feilds are taken from the frontend perspective
 */
export interface ProductVariant {
  id: string;
  variant_name: string;
  price: string;
  images: OrderImage[];
  product_id: string;
}

/**
 * used in order detal page returnRequest feilds are taken from the frontend perspective
 */
export interface ReturnRequest {
  id: string;
  status: string;
  store_owner_note: string;
  tracking_id: string | null;
  type: string;
}
/**
 * used in order detal page orderItem feilds are taken from the frontend perspective
 */
export interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  order_status: OrderStatus | string;
  variant: ProductVariant;
  return_request: ReturnRequest | null;
  delivered_at?: string | null;
  policy?: {
    policy_type: string;
    is_returnable: boolean;
    is_replaceable: boolean;
    return_window_days: number | null;
    replacement_window_days: number | null;
    return_replace_mode: ReturnReplaceMode;
  } | null;
}
/**
 * used in order detal page address feilds are taken from the frontend perspective
 */
export interface Address {
  name: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * used in order detal page payment feilds are taken from the frontend perspective
 */
export interface Payment {
  id: string;
  payment_method: string;
  payment_status: string;
  transaction_ref: string;
  amount: string;
}
/**
 * used in order detal page order Invoice feilds are taken from the frontend perspective
 */
export interface Invoice {
  company_id: string;
  order_id: string;
  invoice_url: string;
  invoice_number?: string;
}
/**
 * OrderDetailType for order detal page - feilds are taken from the frontend perspective
 */
export interface OrderDetail {
  id: string;
  user_id: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
  address: Address;
  payment: Payment;
  invoice: Invoice;
  shipping: {
    tracking_url: string | null;
    shipping_status?: string;
    awb_number?: string;
    courier_name?: string;
  } | null;
  gstInvoice: GstInvoice | null;
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { downloadInvoice, isGenerating } = useInvoiceDownload();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileTrackingOpen, setMobileTrackingOpen] = useState(false);

  const router = useRouter();
  const token = authToken();

  const loadOrderDetails = (showRefreshLoader = false) => {
    if (!orderId || !token) return;
    if (showRefreshLoader) setIsRefreshing(true);
    fetchOrderDetails(orderId, token)
      .then((data) => setOrder(data.data))
      .catch(() => toast.error("Error fetching order details"))
      .finally(() => {
        if (showRefreshLoader) setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadOrderDetails();
  }, [orderId, token]);

  useEffect(() => {
    if (!orderId || !token || !order) return;
    const isTerminal = order.items.every((item) =>
      TERMINAL_STATUSES.includes(
        normalizeStatus(item.order_status) as OrderStatus,
      ),
    );
    if (isTerminal) return;

    const interval = setInterval(() => loadOrderDetails(false), 15000);
    return () => clearInterval(interval);
  }, [orderId, token, order]);

  const handleCancelItem = (id: string) =>
    router.push(`/customer/orders/${orderId}/cancel/${id}`);
  const handleReturnItem = (id: string) =>
    router.push(`/customer/support/return/${id}`);
  const handleReplaceItem = (id: string) =>
    router.push(`/customer/support/return/${id}?type=replacement`);

  /** Compute the overarching status. We prioritize the item's order_status if it's terminal (e.g. Returned/Cancelled).
   */
  const itemStatus = normalizeStatus(order?.items?.[0]?.order_status);
  const shippingStatus = normalizeStatus(order?.shipping?.shipping_status);
  const isItemTerminal = TERMINAL_STATUSES.includes(itemStatus as OrderStatus);

  const unifiedStatus = isItemTerminal
    ? itemStatus
    : shippingStatus || itemStatus;
  const itemsTotal =
    order?.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    ) ?? 0;

  if (!order) {
    return (
      <div className="min-h-screen pb-6 bg-background animate-pulse px-4 py-4 md:py-5 max-w-6xl mx-auto">
        <div className="h-5 w-32 bg-secondary/50 rounded mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="h-64 bg-secondary/50 rounded-2xl" />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="h-96 bg-secondary/50 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 font-sans bg-background text-foreground text-left max-w-6xl mx-auto">
      <Toaster position="top-center" />
      <div className="px-4 md:px-0 py-4 md:py-5">
        {/* ── Header ── */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md   pt-2 mt-2 md:static md:bg-transparent md:p-0 md:m-0 flex flex-row items-center justify-between gap-2 md:mb-4 mb-2 border-border md:border-none  ">
          <div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-0.5">
              <Link
                href="/customer/orders"
                className="hover:text-primary transition-colors"
              >
                {ORDER_DETAILS_TEXT.BREADCRUMB_ORDERS}
              </Link>
              <span>/</span>
              <span className="text-foreground font-bold tracking-tight">
                {order.id.split("-")[0].toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {ORDER_DETAILS_TEXT.PLACED_ON_PREFIX}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              <span className="hidden sm:inline">
                {" "}
                • {order.items.length} {ORDER_DETAILS_TEXT.ITEMS_COUNT_SUFFIX}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* <Button
              variant="outline"
              onClick={() => loadOrderDetails(true)}
              disabled={isRefreshing}
              className="rounded-lg shadow-sm text-xs font-semibold h-7 px-2.5"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{
                  repeat: isRefreshing ? Infinity : 0,
                  duration: 1,
                  ease: "linear",
                }}
                className="mr-1.5"
              >
                <RefreshCcwDot size={12} />
              </motion.div>
            </Button> */}
            <Button
              onClick={() => downloadInvoice(order.id, token!)}
              disabled={isGenerating}
              className="rounded-lg shadow-sm text-xs font-semibold h-7 px-2.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <FileText size={12} className="mr-1.5" />
              <span className="hidden sm:inline">
                {isGenerating
                  ? ORDER_DETAILS_TEXT.BTN_INVOICE_LOADING
                  : ORDER_DETAILS_TEXT.BTN_DOWNLOAD_INVOICE}
              </span>
              <span className="sm:hidden">Invoice</span>
            </Button>
          </div>
        </div>

        {/* ── Tightened Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-4 flex flex-col gap-4 order-1">
            {unifiedStatus && (
              <Card className="shadow-sm rounded-sm py-2 md:py-4 px-4 md:px-6 gap-2 md:rounded-2xl border-border bg-card overflow-hidden">
                <CardHeader className="py-0 px-0 border-border/50 bg-secondary/20 flex flex-row items-center justify-between">
                  <CardTitle className="md:text-md text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Map size={14} className="text-primary" />
                    {ORDER_DETAILS_TEXT.ORDER_STATUS}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden h-6 px-1.5 text-[10px] font-semibold"
                    onClick={() => setMobileTrackingOpen(!mobileTrackingOpen)}
                  >
                    {mobileTrackingOpen
                      ? ORDER_DETAILS_TEXT.BTN_HIDE_DETAILS
                      : ORDER_DETAILS_TEXT.BTN_VIEW_DETAILS}
                    <ChevronDown
                      className={`ml-1 transition-transform ${mobileTrackingOpen ? "rotate-180" : ""}`}
                      size={12}
                    />
                  </Button>
                </CardHeader>

                <AnimatePresence initial={false}>
                  {(mobileTrackingOpen ||
                    (typeof window !== "undefined" &&
                      window.innerWidth >= 768)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden md:!h-auto md:!opacity-100"
                    >
                      <CardContent className="px-2 ">
                        <TrackingTimeline
                          currentStatus={unifiedStatus}
                          date={order.created_at}
                        />
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}

            {order.shipping?.tracking_url && (
              <Button
                className="w-full rounded-xl text-xs font-bold shadow-sm h-9"
                asChild
              >
                <a
                  href={order.shipping.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Truck size={14} className="mr-1.5" />{" "}
                  {ORDER_DETAILS_TEXT.BTN_TRACK_PACKAGE}
                </a>
              </Button>
            )}

            <Card className="shadow-sm rounded-sm py-2 md:py-4 px-4 md:px-6 gap-2 md:rounded-2xl border-border bg-card">
              <CardHeader className="p-0    border-border/50 bg-secondary/20">
                <CardTitle className="md:text-md text-sm font-bold text-foreground flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary-foreground" />
                  {ORDER_DETAILS_TEXT.SHIPPING_ADDRESS}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="md:text-sm text-xs text-muted-foreground leading-snug space-y-0.5">
                  <p className="font-bold text-foreground md:text-sm text-xs mb-1">
                    {order.address.name}
                  </p>
                  <p>{order.address.address_line_1}</p>
                  <p>
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.postal_code}
                  </p>
                  <p className="font-medium text-foreground pt-0.5">
                    {order.address.country}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-8 gap-4  flex flex-col order-2">
            <Card className="sshadow-sm rounded-sm py-2 md:py-4 px-4 md:px-6 gap-2 md:rounded-2xl border-border bg-card ">
              <CardHeader className="p-0   border-border bg-secondary/20 flex flex-row justify-between items-center gap-2">
                <CardTitle className="md:text-md text-sm font-bold text-foreground">
                  {ORDER_DETAILS_TEXT.ITEMS_IN_ORDER}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="rounded-md font-bold text-sm py-0.5 px-1.5 bg-background border-border shadow-sm"
                >
                  {order.items.length} {ORDER_DETAILS_TEXT.ITEMS_COUNT_SUFFIX}
                </Badge>
              </CardHeader>

              <CardContent className="p-0 overflow-y-scroll">
                {order.items.map((item, index) => {
                  const normItemStatus = normalizeStatus(item.order_status);
                  const itemConfig = getUIConfig(normItemStatus);

                  const guardItem: GuardOrderItem = {
                    id: item.id,
                    order_status: item.order_status as OrderStatus,
                    created_at: order.created_at,
                    delivered_at: item.delivered_at ?? null,
                    return_request: item.return_request,
                    policy: item.policy ?? null,
                  };

                  return (
                    <div
                      key={item.id}
                      className={`pt-2 md:pt-4 px-2 md:px-4 flex flex-row gap-2 md:gap-4 ${index !== order.items.length - 1 ? "border-border" : ""}`}
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary/30 rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-border shadow-sm">
                        <img
                          src={
                            item.variant.images?.[0]?.image_url ||
                            "https://placehold.co/150"
                          }
                          alt={item.variant.variant_name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-foreground text-xs md:text-[13px] line-clamp-2 leading-tight">
                              {item.variant.variant_name}
                            </h3>
                            <span className="font-bold text-foreground text-xs md:text-[13px] whitespace-nowrap ml-2">
                              ₹{formatCurrency(Number(item.price))}
                            </span>
                          </div>

                          {/* UNCONDITIONALLY RENDER ITEM STATUS BADGE */}
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-sm uppercase tracking-wider font-bold border border-border bg-secondary/40 ${itemConfig.color}`}
                            >
                              {itemConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <Badge
                            variant="outline"
                            className="rounded-md font-semibold text-[10px] border-border/80 px-1.5 py-0.5 bg-secondary/10 text-foreground"
                          >
                            {ORDER_DETAILS_TEXT.QTY_LABEL}
                            {item.quantity}
                          </Badge>

                          <ItemActionButtons
                            guardItem={guardItem}
                            onCancel={() => handleCancelItem(item.id)}
                            onReturn={() => handleReturnItem(item.id)}
                            onReplace={() => handleReplaceItem(item.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-sm py-2 md:py-4 px-4 md:px-6 gap-2 md:rounded-2xl border-border bg-card overflow-hidden">
              <CardHeader className="border-border bg-secondary/20">
                <CardTitle className="md:text-sm text-xs font-bold text-foreground">
                  {ORDER_DETAILS_TEXT.PAYMENT_SUMMARY}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:px-4 md:py-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-secondary/20 rounded-xl p-3 border border-border/50 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CreditCard className="text-primary" size={14} />
                      <span className="font-extrabold text-foreground text-[13px] tracking-wide">
                        {order.payment.payment_method}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-muted-foreground">
                        {ORDER_DETAILS_TEXT.LABEL_STATUS}
                      </span>
                      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none shadow-none font-bold text-[9px] capitalize">
                        {order.payment.payment_status}
                      </Badge>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono bg-background px-1.5 py-1 rounded border border-border/50 break-all">
                      <span className="font-semibold">
                        {ORDER_DETAILS_TEXT.LABEL_REF}
                      </span>{" "}
                      {order.payment.transaction_ref}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-muted-foreground flex flex-col justify-center px-1">
                    <div className="flex justify-between">
                      <span>
                        {ORDER_DETAILS_TEXT.LABEL_SUBTOTAL} (
                        {order.items.length} items)
                      </span>
                      <span className="font-semibold text-foreground">
                        ₹{formatCurrency(itemsTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{ORDER_DETAILS_TEXT.LABEL_SHIPPING}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600">
                        {ORDER_DETAILS_TEXT.LABEL_FREE}
                      </span>
                    </div>
                    {order.gstInvoice && (
                      <div className="flex justify-between">
                        <span>{ORDER_DETAILS_TEXT.LABEL_TAX}</span>
                        <span className="font-semibold text-foreground">
                          ₹{formatCurrency(Number(order.gstInvoice?.total_tax))}
                        </span>
                      </div>
                    )}
                    <Separator className="my-1 border-border/50" />
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="font-bold text-foreground text-[13px]">
                        {ORDER_DETAILS_TEXT.LABEL_TOTAL}
                      </span>
                      <span className="font-black text-sm text-foreground">
                        ₹{formatCurrency(itemsTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
