"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
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
  Info,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "@/utils/customerApiClient";
import { OrderStatus } from "@/utils/Types";
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
  /** ISO date string — delivery date if the logistics provider recorded it */
  delivered_at?: string | null;
  /** Policy snapshot from order_item_policy — null for legacy orders */
  policy?: {
    policy_type: string;
    is_returnable: boolean;
    is_replaceable: boolean;
    return_window_days: number | null;
    replacement_window_days: number | null;
    return_replace_mode: "none" | "return_only" | "replace_only" | "both";
  } | null;
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
  shipping: {
    tracking_url: string;
    shipping_status?: string;
    awb_number?: string;
    courier_name?: string;
  } | null;
  gstInvoice: GstInvoice | null;
}

// ─── Production-Grade Dynamic Timeline ────────────────────────────────────────
function TrackingTimeline({
  currentStatus,
  date,
}: {
  currentStatus: OrderStatus;
  date: string;
}) {
  const currentConfig =
    STATUS_UI_CONFIG[currentStatus as OrderStatus] ||
    STATUS_UI_CONFIG[OrderStatus.PENDING as OrderStatus];
  const activeStepIndex = currentConfig.stepIndex;

  // Build the dynamic 5-step skeleton based on the current context
  const buildSteps = () => {
    const steps = [
      {
        index: 0,
        icon: Clock,
        label: "Order Placed",
        isActive: activeStepIndex >= 0,
      },
      {
        index: 1,
        icon: Package,
        label: "Processing",
        isActive: activeStepIndex >= 1,
      },
      {
        index: 2,
        icon: Truck,
        label: "Shipped",
        isActive: activeStepIndex >= 2,
      },
      {
        index: 3,
        icon: Map,
        label: "Out for Delivery",
        isActive: activeStepIndex >= 3,
      },
      {
        index: 4,
        icon: CheckCircle2,
        label: "Delivered",
        isActive: activeStepIndex >= 4,
      },
    ];

    // Inject the specific granular detail into the active step
    if (activeStepIndex <= 4) {
      steps[activeStepIndex].label = currentConfig.label;

      // Handle exception / failure styling overrides
      if (EXCEPTION_STATUSES.includes(currentStatus)) {
        steps[activeStepIndex].icon = AlertTriangle;
      } else if (
        currentStatus === OrderStatus.CANCELLED ||
        currentStatus === OrderStatus.FAILED
      ) {
        steps[activeStepIndex].icon = XCircle;
      }
    }
    return steps;
  };

  const steps = buildSteps();
  const isCancelled = currentStatus === OrderStatus.CANCELLED;

  return (
    <div className="relative space-y-6 py-2 text-left px-2">
      {/* Animated Background Progress Line */}
      <div className="absolute left-[23px] top-4 bottom-8 w-0.5 bg-secondary z-0 rounded-full" />
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`absolute left-[23px] top-4 w-0.5 z-0 rounded-full ${isCancelled ? "bg-destructive" : "bg-primary"}`}
      />

      {steps.map((step, idx) => {
        const isCurrent = activeStepIndex === idx;
        const isCompleted = activeStepIndex > idx;
        const StepIcon = step.icon;

        // Determine colors dynamically
        let iconBg = "bg-secondary text-muted-foreground";
        let iconBorder = "border-secondary";

        if (isCompleted) {
          iconBg = "bg-primary text-primary-foreground";
          iconBorder = "border-primary";
        } else if (isCurrent) {
          iconBg =
            isCancelled || EXCEPTION_STATUSES.includes(currentStatus)
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : "bg-primary text-primary-foreground";
          iconBorder =
            isCancelled || EXCEPTION_STATUSES.includes(currentStatus)
              ? "border-destructive shadow-sm scale-110"
              : "border-primary shadow-md scale-110";
        }

        return (
          <div
            key={idx}
            className={`relative z-10 flex gap-5 items-start ${!step.isActive ? "opacity-60" : "opacity-100"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${iconBg} ${iconBorder}`}
            >
              <StepIcon size={14} strokeWidth={isCurrent ? 2.5 : 2} />
            </div>

            <div className="flex flex-col pt-1">
              <span
                className={`text-sm font-bold transition-all ${isCurrent ? "text-foreground" : isCompleted ? "text-foreground/90" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>

              {/* Show granular details only on the active step or the first step (Order Placed) */}
              {isCurrent && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs mt-1 font-medium ${currentConfig.color}`}
                >
                  {currentConfig.description}
                </motion.p>
              )}

              {idx === 0 && (
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Item Action Buttons (guard-driven) ───────────────────────────────────────
/**
 * Renders Cancel / Return / Replace action buttons for a single order item.
 * All button states are computed by useOrderEligibilityGuard — no hardcoded
 * status logic in this component.
 */
function ItemActionButtons({
  guardItem,
  onCancel,
  onReturn,
  onReplace,
}: {
  guardItem: GuardOrderItem;
  onCancel: () => void;
  onReturn: () => void;
  onReplace: () => void;
}) {
  const { canCancel, canReturn, canReplace, hasAnyAction } =
    useOrderEligibilityGuard(guardItem);

  // Do not render the row at all when there are absolutely no relevant actions
  // (e.g. shipped items that can't be cancelled and haven't been delivered yet)
  if (!hasAnyAction && !canCancel.eligible && !canReturn.eligible && !canReplace.eligible) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-start gap-2 mt-1 w-full">
      {/* ── Cancel button ── */}
      {(canCancel.eligible || guardItem.order_status === "pending" || guardItem.order_status === "processing") && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!canCancel.eligible}
            onClick={canCancel.eligible ? onCancel : undefined}
            className={`h-8 text-xs font-bold px-4 rounded-lg transition-all ${
              canCancel.eligible
                ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                : "text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
            }`}
            title={canCancel.reason ?? "Cancel this item"}
          >
            <Ban size={12} className="mr-1.5" />
            Cancel
          </Button>
          {!canCancel.eligible && canCancel.reason && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1 max-w-[160px] leading-tight">
              <Info size={10} className="shrink-0 text-amber-500" />
              {canCancel.reason}
            </p>
          )}
        </div>
      )}

      {/* ── Return button ── */}
      {(canReturn.eligible || guardItem.order_status === "delivered") && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!canReturn.eligible}
            onClick={canReturn.eligible ? onReturn : undefined}
            className={`h-8 text-xs font-bold px-4 rounded-lg transition-all ${
              canReturn.eligible
                ? "text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                : "text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
            }`}
            title={canReturn.reason ?? "Return this item"}
          >
            <RotateCcw size={12} className="mr-1.5" />
            Return
          </Button>
          {!canReturn.eligible && canReturn.reason && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1 max-w-[160px] leading-tight">
              <Info size={10} className="shrink-0 text-amber-500" />
              {canReturn.reason}
            </p>
          )}
        </div>
      )}

      {/* ── Replace button ── */}
      {(canReplace.eligible || guardItem.order_status === "delivered") && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!canReplace.eligible}
            onClick={canReplace.eligible ? onReplace : undefined}
            className={`h-8 text-xs font-bold px-4 rounded-lg transition-all ${
              canReplace.eligible
                ? "text-blue-600 border-blue-400/30 hover:bg-blue-500/10"
                : "text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
            }`}
            title={canReplace.reason ?? "Request a replacement"}
          >
            <RefreshCw size={12} className="mr-1.5" />
            Replace
          </Button>
          {!canReplace.eligible && canReplace.reason && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1 max-w-[160px] leading-tight">
              <Info size={10} className="shrink-0 text-amber-500" />
              {canReplace.reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { downloadInvoice, isGenerating } = useInvoiceDownload();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
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
      TERMINAL_STATUSES.includes(item.order_status as OrderStatus),
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

  const allItemsSameStatus =
    order?.items?.every(
      (item) => item.order_status === order.items[0].order_status,
    ) ?? false;
  // If shipping_status exists from the logistics provider, prioritize it for the unified tracker. Otherwise fallback to item status.
  const unifiedStatus = (order?.shipping?.shipping_status ||
    (allItemsSameStatus ? order?.items[0].order_status : null)) as OrderStatus;

  const itemsTotal =
    order?.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    ) ?? 0;

  if (!order) {
    return (
      <div className="min-h-screen pb-12 rounded-2xl bg-background animate-pulse px-4 md:px-8 py-8">
        <div className="h-8 w-48 bg-secondary/50 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="h-96 bg-secondary/50 rounded-3xl" />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-[500px] bg-secondary/50 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 font-sans rounded-2xl bg-background text-foreground text-left">
      <Toaster position="top-center" />
      <div className="mx-auto lg:px-8 py-4 md:py-8">
        {/* ── Sticky Action Header ── */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pb-4 pt-2 -mt-2 md:static md:bg-transparent md:p-0 md:m-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-4 md:px-0 border-b border-border md:border-none">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
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
            <p className="text-xs text-muted-foreground">
              {ORDER_DETAILS_TEXT.PLACED_ON_PREFIX}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              <span className="hidden md:inline">
                {" "}
                • {order.items.length} {ORDER_DETAILS_TEXT.ITEMS_COUNT_SUFFIX}
              </span>
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => loadOrderDetails(true)}
              disabled={isRefreshing}
              className="rounded-xl shadow-sm text-xs font-semibold h-9"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{
                  repeat: isRefreshing ? Infinity : 0,
                  duration: 1,
                  ease: "linear",
                }}
                className="mr-2"
              >
                <Clock size={14} />
              </motion.div>
              {isRefreshing
                ? ORDER_DETAILS_TEXT.BTN_REFRESHING
                : ORDER_DETAILS_TEXT.BTN_REFRESH}
            </Button>
            <Button
              onClick={() => downloadInvoice(order.id, token!)}
              disabled={isGenerating}
              className="rounded-xl shadow-sm text-xs font-semibold h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <FileText size={14} className="mr-2" />
              {isGenerating
                ? ORDER_DETAILS_TEXT.BTN_INVOICE_LOADING
                : ORDER_DETAILS_TEXT.BTN_DOWNLOAD_INVOICE}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 md:px-0">
          {/* ── LEFT COLUMN (Status & Shipping) ── */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-1">
            {unifiedStatus && (
              <Card className="shadow-sm rounded-3xl border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Map size={18} className="text-primary" />
                    {ORDER_DETAILS_TEXT.ORDER_STATUS}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden h-8 text-xs font-semibold"
                    onClick={() => setMobileTrackingOpen(!mobileTrackingOpen)}
                  >
                    {mobileTrackingOpen
                      ? ORDER_DETAILS_TEXT.BTN_HIDE_DETAILS
                      : ORDER_DETAILS_TEXT.BTN_VIEW_DETAILS}
                    <ChevronDown
                      className={`ml-1 transition-transform ${mobileTrackingOpen ? "rotate-180" : ""}`}
                      size={14}
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
                      <CardContent className="pt-6 pb-8">
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

            {/* Mobile Action Buttons */}
            <div className="flex flex-col md:hidden gap-3 w-full">
              <div className="flex gap-3 w-full">
                {order.shipping?.tracking_url && (
                  <Button
                    className="flex-1 rounded-xl text-xs font-bold shadow-sm h-11"
                    asChild
                  >
                    <a
                      href={order.shipping.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Truck size={16} className="mr-2" />{" "}
                      {ORDER_DETAILS_TEXT.BTN_TRACK_SHORT}
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-xs font-bold shadow-sm h-11"
                  onClick={() => downloadInvoice(order.id, token!)}
                  disabled={isGenerating}
                >
                  <Download size={16} className="mr-2" />{" "}
                  {ORDER_DETAILS_TEXT.BTN_INVOICE_SHORT}
                </Button>
              </div>
            </div>

            <Card className="shadow-sm rounded-3xl border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  {ORDER_DETAILS_TEXT.SHIPPING_ADDRESS}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
                  <p className="font-bold text-foreground text-base mb-2">
                    {order.address.name}
                  </p>
                  <p>{order.address.address_line_1}</p>
                  <p>
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.postal_code}
                  </p>
                  <p className="font-medium text-foreground pt-1">
                    {order.address.country}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (Items & Payment) ── */}
          <div className="lg:col-span-8 flex flex-col gap-6 order-2">
            <Card className="shadow-sm rounded-3xl border-border bg-card overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50 bg-secondary/20 flex flex-row justify-between items-center gap-3">
                <CardTitle className="text-sm font-bold text-foreground">
                  {ORDER_DETAILS_TEXT.ITEMS_IN_ORDER}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="rounded-md font-bold text-xs py-1 px-3 bg-background border-border shadow-sm"
                >
                  {order.items.length} {ORDER_DETAILS_TEXT.ITEMS_COUNT_SUFFIX}
                </Badge>
              </CardHeader>

              <CardContent className="p-0">
                {order.items.map((item, index) => {
                  const statusEnum = item.order_status as OrderStatus;
                  const itemConfig =
                    STATUS_UI_CONFIG[statusEnum as OrderStatus] ||
                    STATUS_UI_CONFIG[OrderStatus.PENDING as OrderStatus];

                  // Build a GuardOrderItem shape from the page's OrderItem
                  const guardItem: GuardOrderItem = {
                    id: item.id,
                    order_status: item.order_status,
                    created_at: order.created_at,
                    delivered_at: item.delivered_at ?? null,
                    return_request: item.return_request,
                    policy: item.policy ?? null,
                  };

                  return (
                    <div
                      key={item.id}
                      className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6 ${index !== order.items.length - 1 ? "border-b border-border/50" : ""}`}
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary/30 rounded-2xl flex-shrink-0 flex items-center justify-center p-4 border border-border/40">
                        <img
                          src={
                            item.variant.images?.[0]?.image_url ||
                            "https://placehold.co/150"
                          }
                          alt={item.variant.variant_name}
                          className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 leading-snug">
                              {item.variant.variant_name}
                            </h3>
                            <span className="font-bold text-foreground text-sm sm:text-base whitespace-nowrap ml-2">
                              ₹{formatCurrency(Number(item.price))}
                            </span>
                          </div>

                          {/* Item specific status (useful if multi-vendor items ship separately) */}
                          {!unifiedStatus && (
                            <div className="mt-2.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border border-border bg-secondary/50 ${itemConfig.color}`}
                              >
                                {itemConfig.label}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-5">
                          <Badge
                            variant="outline"
                            className="rounded-lg font-semibold text-xs border-border/80 px-3 py-1 bg-secondary/20 text-foreground"
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

            {/* Payment Summary */}
            <Card className="shadow-sm rounded-3xl border-border bg-card overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50 bg-secondary/20">
                <CardTitle className="text-sm font-bold text-foreground">
                  {ORDER_DETAILS_TEXT.PAYMENT_SUMMARY}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="bg-secondary/30 rounded-2xl p-5 border border-border/60 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="text-primary" size={22} />
                      <span className="font-extrabold text-foreground text-base tracking-wide">
                        {order.payment.payment_method}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {ORDER_DETAILS_TEXT.LABEL_STATUS}
                      </span>
                      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none shadow-none font-bold capitalize">
                        {order.payment.payment_status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono bg-background px-3 py-2 rounded-lg border border-border/50 break-all">
                      <span className="font-semibold">
                        {ORDER_DETAILS_TEXT.LABEL_REF}
                      </span>{" "}
                      {order.payment.transaction_ref}
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-muted-foreground flex flex-col justify-center px-2">
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
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600">
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
                    <Separator className="my-1 border-border/60" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground text-base">
                        {ORDER_DETAILS_TEXT.LABEL_TOTAL}
                      </span>
                      <span className="font-black text-lg text-foreground">
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
