"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  X,
  Package,
  MapPin,
  CreditCard,
  Truck,
  User,
  RefreshCcw,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Link2,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { redirect, useParams, useRouter } from "next/navigation";
import {
  fetchAddTrackingUrl,
  fetchUpdateOrderStatus,
  fetchVendorOrderDetails,
} from "@/utils/vendorApiClient";
import { OrderStatus } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import { SessionErrorCard } from "@/components/vendor/SessionErrorCard";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { BASE_API_URL } from "@/constants";
import { UiText } from "@/constants/ui-text";
import { CancelModal } from "@/components/vendor/CancelModal";
import { StatusEditor } from "@/components/vendor/OrderStatusEditor";
import { StatusBadge } from "@/components/vendor/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

export enum TrackingAction {
  ADD = "add",
  UPDATE = "update",
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  order_status: string;
  warehouse: { id: string; name: string } | null;
  tracking_url?: string | null;
  invoice_url?: string | null;
  product_variant: {
    id: string;
    variant_name: string;
    price: string;
    image_url: string;
  };
  return?: {
    id: string;
    type: string;
    status: string;
    reason: string;
    customer_note: string;
    evidence_images: { url: string }[];
  } | null;
  cancel?: {
    id: string;
    reason: string;
    cancelled_by: string;
  } | null;
  refund?: {
    id: string;
    refund_amount: string;
    refund_reason: string;
    refund_status: string;
  } | null;
}
interface Invoice {
  id: string;
  invoice_url: string;
  order_id: string;
  invoice_number: string;
}
interface Order {
  id: string;
  total_amount: string;
  created_at: string;
  is_single_warehouse: boolean;
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
  };
  items: OrderItem[];
  shipping_address: {
    name: string;
    address_line_1: string;

    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  invoice: Invoice;
  payment: { amount: string; payment_method: string } | null;
  shipping: { tracking_url: string | null };
}
interface TrackingEditorProps {
  trackingUrl: string | null | undefined;
  onSave: (url: string, action: TrackingAction) => Promise<void>;
}

function TrackingEditor({ trackingUrl, onSave }: TrackingEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    await onSave(
      draft,
      trackingUrl ? TrackingAction.UPDATE : TrackingAction.ADD,
    );
    setSaving(false);
    setEditing(false);
    setDraft("");
  };

  if (trackingUrl && !editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-theme-caption text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          <ExternalLink size={12} /> {UiText.ORDER_DETAILS.VIEW_TRACKING}
        </a>
        <button
          onClick={() => {
            setDraft(trackingUrl);
            setEditing(true);
          }}
          className="inline-flex items-center gap-1 text-theme-caption text-slate-400 hover:text-slate-600 transition-colors w-fit"
        >
          <Pencil size={11} /> {UiText.ORDER_DETAILS.UPDATE_URL}
        </button>
      </div>
    );
  }

  if (editing || !trackingUrl) {
    return (
      <div className="flex flex-col gap-2">
        {!editing && !trackingUrl && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-theme-caption text-slate-400 hover:text-blue-500 border border-dashed border-slate-200 hover:border-blue-300 rounded-lg px-2.5 py-1.5 transition-all w-fit"
          >
            <Link2 size={12} /> {UiText.ORDER_DETAILS.ADD_TRACKING_URL}
          </button>
        )}
        {(editing || (!trackingUrl && editing)) && (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              type="url"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={UiText.ORDER_DETAILS.TRACKING_PLACEHOLDER}
              className="flex-1 min-w-0 text-theme-caption border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            />

            <button
              onClick={handleSave}
              disabled={!draft.trim() || saving}
              className="text-theme-caption px-2.5 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition-colors font-medium flex-shrink-0"
            >
              {saving
                ? UiText.ORDER_DETAILS.SAVING
                : trackingUrl
                  ? UiText.ORDER_DETAILS.UPDATE_URL
                  : UiText.ORDER_DETAILS.SAVE}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setDraft("");
              }}
              className="text-theme-caption px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

interface SectionCardProps {
  title: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  children: React.ReactNode;
}

function SectionCard({ title, icon: Icon, children }: SectionCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)]">
      <div className="px-6 py-5 border-b border-slate-50/80 flex items-center gap-2.5 bg-slate-50/40">
        {Icon && <Icon className="text-slate-500" size={18} />}
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export interface OrderDetailsPageLabels {
  LOADING: string;
  BACK_TO_ORDERS: string;
  TITLE: string;
  VIEW_INVOICE: string;
  MULTI_WAREHOUSE_ALERT: string;
  MULTI_WAREHOUSE_DESC: string;
  ITEMS_COUNT: string;
  QTY: string;
  TOTAL: string;
  STATUS: string;
  CANCEL_THIS_ITEM: string;
  PROCESS_RETURN_ARROW: string;
  REASON: string;
  NOTE: string;
  CANCELLATION_DETAILS: string;
  BY: string;
  REFUND_INFO: string;
  AMOUNT: string;
  SHIPPING_ADDRESS: string;
  CUSTOMER: string;
  ORDER_SUMMARY: string;
  ORDER_DATE: string;
  PAYMENT: string;
  FULFILLMENT: string;
  ORDER_STATUS: string;
  TRACKING_URL: string;
  TRACKING_URL_ONLY_AFTER_SHIPPING: string;
  MULTI_WAREHOUSE_FULFILLMENT_DESC: string;
  STATUS_LABELS: {
    PENDING: string;
    PROCESSING: string;
    SHIPPED: string;
    DELIVERED: string;
    CANCELLED: string;
  };
  SAVING: string;
  SAVE: string;
  CANCEL: string;
  EDIT: string;
  VIEW_TRACKING: string;
  UPDATE_URL: string;
  ADD_TRACKING_URL: string;
  TRACKING_PLACEHOLDER: string;
  CANCEL_ITEM_TITLE: string;
  CANT_BE_UNDONE: string;
  CANCELLATION_REASON_PLACEHOLDER: string;
  CONFIRM_CANCELLATION: string;
  CANCELLING: string;
  KEEP_ITEM: string;
  REQUEST_SUFFIX: string;
}

export default function VendorOrderDetails({}) {
  const companyId = getClientCompanyId();

  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    OrderStatus.PROCESSING,
  );
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

  const [sessionError, setSessionError] = useState(false);
  const [error, setError] = useState(false);

  // Per-item local state for multi-warehouse
  const [itemStatuses, setItemStatuses] = useState<Record<string, OrderStatus>>(
    {},
  );
  const token = authToken();
  useEffect(() => {
    if (!token || !companyId) {
      setSessionError(true);
    }
  }, [token, companyId]);
  const loadOrder = async () => {
    const token = authToken();
    if (!token || !companyId) {
      setSessionError(true);
      return;
    }
    setError(false);
    try {
      const res = await fetchVendorOrderDetails(orderId, token, companyId);
      const data: Order = res.data;
      setOrder(data);

      if (data.items && data.items?.[0]?.order_status) {
        setOrderStatus(data.items[0].order_status.toUpperCase() as OrderStatus);
      }
      const statusMap: Record<string, OrderStatus> = {};
      data.items.forEach((item) => {
        statusMap[item.id] = item.order_status.toUpperCase() as OrderStatus;
      });
      setItemStatuses(statusMap);
    } catch {
      setError(true);
      toast.error(UiText.ORDER_DETAILS.TOAST_LOAD_FAILED, {
        style: { borderRadius: "12px", background: "#333", color: "#fff" },
      });
    }
  };
  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const isSingleWarehouse = order?.is_single_warehouse ?? true;

  // ── Order-level status save (single warehouse) ─────────────────────────────
  const handleOrderLevelStatusSave = async (newStatus: OrderStatus) => {
    if (!token || !companyId) {
      setSessionError(true);
      return;
    }
    const res = await fetchUpdateOrderStatus(
      orderId,
      newStatus as string,
      token,
      companyId as string,
    );
    if (res.success) {
      setOrderStatus(newStatus);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => ({
                ...i,
                order_status: newStatus.toLowerCase(),
              })),
            }
          : prev,
      );
    }
  };

  // ── Per-item status save (multi-warehouse) ─────────────────────────────────
  const handleItemStatusSave = async (
    itemId: string,
    newStatus: OrderStatus,
  ) => {
    setItemStatuses((prev) => ({ ...prev, [itemId]: newStatus }));
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.id === itemId
                ? { ...i, order_status: newStatus.toLowerCase() }
                : i,
            ),
          }
        : prev,
    );
  };

  // ── Tracking URL ──────────────────────────────────────────────────────────
  const handleOrderTrackingUrl = async (
    url: string,
    action: TrackingAction,
  ) => {
    if (!token || !companyId) {
      setSessionError(true);
      return;
    }
    try {
      const res =
        action === TrackingAction.ADD
          ? await fetchAddTrackingUrl(orderId, url, token, companyId)
          : await fetchUpdateOrderStatus(orderId, url, token, companyId);
      if (res.success) {
        setOrder((prev) =>
          prev ? { ...prev, shipping: { tracking_url: url } } : prev,
        );
      } else {
        toast.error(UiText.ORDER_DETAILS.TOAST_TRACKING_FAILED, {
          style: { borderRadius: "12px", background: "#333", color: "#fff" },
        });
      }
    } catch {
      toast.error(UiText.ORDER_DETAILS.TOAST_TRACKING_FAILED, {
        style: { borderRadius: "12px", background: "#333", color: "#fff" },
      });
    }
  };

  // ── Cancellation ──────────────────────────────────────────────────────────
  const handleCancelItem = async (reason: string) => {
    if (!token || !companyId) {
      setSessionError(true);
      return;
    }
    if (!cancellingItemId) return;
    try {
      const res = await fetchUpdateOrderStatus(
        cancellingItemId,
        "cancelled",
        token,
        companyId,
      );
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === cancellingItemId
                  ? { ...i, order_status: "cancelled" }
                  : i,
              ),
            }
          : prev,
      );
      if (res?.data?.success) await loadOrder();
      setCancellingItemId(null);
    } catch {
      toast.error(UiText.ORDER_DETAILS.TOAST_CANCEL_FAILED, {
        style: { borderRadius: "12px", background: "#333", color: "#fff" },
      });
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "invoice.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error(
        UiText.ORDERS.FAILED_DOWNLOAD_INVOICES || "Failed to download invoice.",
        {
          style: { borderRadius: "12px", background: "#333", color: "#fff" },
        },
      );
    }
  };

  if (sessionError || !token || !companyId) {
    return <SessionErrorCard />;
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6 w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center max-w-md mx-auto text-center bg-white p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
        >
          <div className="h-20 w-20 bg-rose-50/80 text-rose-500 border border-rose-100/50 shadow-sm rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
            {UiText.ORDER_DETAILS.ERROR_LOAD_FAILED_TITLE}
          </h3>
          <p className="text-[15px] text-slate-500 mb-8 text-balance leading-relaxed">
            {UiText.ORDER_DETAILS.ERROR_LOAD_FAILED_DESC}
          </p>
          <button
            onClick={() => loadOrder()}
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-[14px] font-medium rounded-2xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100/50 transition-all shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5"
          >
            {UiText.ORDER_DETAILS.TRY_AGAIN}
          </button>
        </motion.div>
      </div>
    );
  }

  if (!order)
    return (
      <div className="min-h-screen p-4 md:p-6 w-full">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 bg-slate-100/80 rounded-full animate-pulse" />
              <Skeleton className="h-8 w-48 bg-slate-100/80 rounded-xl animate-pulse" />
              <Skeleton className="h-4 w-32 bg-slate-100/80 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-32 bg-slate-100/80 rounded-xl animate-pulse" />
              <Skeleton className="h-10 w-32 bg-slate-100/80 rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-[400px]">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <Skeleton className="h-5 w-32 bg-slate-100/80 rounded-full animate-pulse" />
                </div>
                <div className="p-5 space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-14 w-14 bg-slate-100/80 rounded-xl animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-2/3 bg-slate-100/80 rounded-full animate-pulse" />
                        <Skeleton className="h-4 w-1/3 bg-slate-100/80 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-[200px]">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <Skeleton className="h-5 w-40 bg-slate-100/80 rounded-full animate-pulse" />
                  </div>
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4 bg-slate-100/80 rounded-full animate-pulse" />
                    <Skeleton className="h-4 w-1/2 bg-slate-100/80 rounded-full animate-pulse" />
                    <Skeleton className="h-4 w-2/3 bg-slate-100/80 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-[200px]">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <Skeleton className="h-5 w-32 bg-slate-100/80 rounded-full animate-pulse" />
                  </div>
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-2/3 bg-slate-100/80 rounded-full animate-pulse" />
                    <Skeleton className="h-4 w-3/4 bg-slate-100/80 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-5">
              <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-[250px]">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <Skeleton className="h-5 w-32 bg-slate-100/80 rounded-full animate-pulse" />
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 bg-slate-100/80 rounded-full animate-pulse" />
                    <Skeleton className="h-4 w-20 bg-slate-100/80 rounded-full animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 bg-slate-100/80 rounded-full animate-pulse" />
                    <Skeleton className="h-4 w-24 bg-slate-100/80 rounded-full animate-pulse" />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Skeleton className="h-5 w-16 bg-slate-100/80 rounded-full animate-pulse" />
                    <Skeleton className="h-6 w-24 bg-slate-100/80 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-[200px]">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <Skeleton className="h-5 w-32 bg-slate-100/80 rounded-full animate-pulse" />
                </div>
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-100/80 rounded-full animate-pulse" />
                  <Skeleton className="h-10 w-full bg-slate-100/80 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen max-h-screen overflow-y-scroll scroll-smooth p-4 md:p-6 font-sans text-slate-800"
    >
      {cancellingItemId && (
        <CancelModal
          onConfirm={handleCancelItem}
          onClose={() => setCancellingItemId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6 pb-2">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 hover:text-slate-800 mb-4 transition-all group bg-white border border-slate-200 hover:border-slate-300 rounded-full px-5 py-2.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-slate-600"
              />
              {UiText.ORDER_DETAILS.BACK_TO_ORDERS}
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {UiText.ORDER_DETAILS.TITLE}
            </h1>
            <p className="text-[14px] text-slate-500 mt-2 font-mono bg-slate-100/70 px-2.5 py-1 rounded-md inline-block font-medium">
              #{order.id.toUpperCase()}
            </p>
          </div>

          <div className="flex flex-col gap-3 justify-end items-end">
            <div className="hidden sm:flex items-center gap-2 text-[13px] font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <Clock size={14} className="text-slate-400" />
              {new Date(order.created_at).toLocaleString("en-GB", { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
            {order.invoice && (
              <button
                onClick={() =>
                  handleDownload(
                    order.invoice.invoice_url,
                    `${order.invoice.invoice_number}.pdf`,
                  )
                }
                className="bg-indigo-50 border border-indigo-100/80 rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-[14px] font-semibold text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-[0_2px_10px_rgb(79,70,229,0.1)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <FileText
                  size={16}
                />
                {UiText.ORDER_DETAILS.VIEW_INVOICE}
              </button>
            )}
          </div>
        </div>

        {/* ── Multi-warehouse notice ── */}
        {!isSingleWarehouse && (
          <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-100/80 rounded-2xl px-5 py-4 text-[14px] text-amber-800 shadow-[0_2px_10px_rgb(251,191,36,0.05)]">
            <AlertCircle
              size={18}
              className="flex-shrink-0 mt-0.5 text-amber-500"
            />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-900">
                {UiText.ORDER_DETAILS.MULTI_WAREHOUSE_ALERT}
              </span>{" "}
              <span className="text-amber-700">
                {UiText.ORDER_DETAILS.MULTI_WAREHOUSE_DESC}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items card */}
            <SectionCard
              title={UiText.ORDER_DETAILS.ITEMS_COUNT.replace(
                "{count}",
                order.items.length.toString(),
              )}
              icon={Package}
            >
              <div className="divide-y divide-slate-100">
                {order.items.map((item, index) => {
                  const displayStatus = (itemStatuses?.[item.id] ??
                    item.order_status.toUpperCase()) as OrderStatus;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                      key={item.id}
                      className="px-6 py-5 flex flex-col gap-4 group/item hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Product row */}
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 flex-shrink-0 shadow-sm">
                          <Image
                            src={item.product_variant.image_url}
                            alt={item.product_variant.variant_name}
                            className="object-cover group-hover/item:scale-105 transition-transform duration-500"
                            fill
                            loading="eager"
                            sizes="64px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-slate-800 line-clamp-2 leading-snug">
                            {item.product_variant.variant_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                            <span className="text-[13px] text-slate-500">
                              {UiText.ORDER_DETAILS.QTY}{" "}
                              <span className="text-slate-700 font-medium">
                                {item.quantity}
                              </span>
                            </span>
                            <span className="text-[13px] text-slate-500">
                              {UiText.ORDER_DETAILS.TOTAL}{" "}
                              <span className="text-slate-900 font-semibold">
                                ₹{formatCurrency(Number(item.line_total))}
                              </span>
                            </span>
                            {item.warehouse && (
                              <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                                <MapPin size={12} className="text-slate-400" />
                                {item.warehouse.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status badge (always visible) */}
                        <div className="flex-shrink-0 pt-0.5">
                          <StatusBadge status={displayStatus} />
                        </div>
                      </div>

                      {/* Per-item fulfillment controls — ONLY for multi-warehouse */}
                      {!isSingleWarehouse && (
                        <div className="ml-[80px] grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                          {/* Status control */}
                          <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 space-y-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              {UiText.ORDER_DETAILS.STATUS}
                            </p>
                            <StatusEditor
                              status={displayStatus}
                              onSave={(s) => handleItemStatusSave(item.id, s)}
                              setItemStatuses={setItemStatuses}
                            />
                          </div>
                          {order.invoice && (
                            <button
                              onClick={() =>
                                handleDownload(
                                  order.invoice.invoice_url,
                                  `${order.invoice.invoice_number}.pdf`,
                                )
                              }
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 inline-flex items-center gap-1.5 text-theme-body-sm text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"
                            >
                              <FileText
                                size={14}
                                className="group-hover:-translate-x-0.5 transition-transform"
                              />
                              {UiText.ORDER_DETAILS.VIEW_INVOICE}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Cancel button */}
                      {displayStatus !== OrderStatus.CANCELLED &&
                        displayStatus !== OrderStatus.DELIVERED && (
                          <div className="ml-[80px]">
                            <button
                              onClick={() => setCancellingItemId(item.id)}
                              className="text-[13px] font-medium text-red-400 hover:text-red-600 hover:underline transition-colors"
                            >
                              {UiText.ORDER_DETAILS.CANCEL_THIS_ITEM}
                            </button>
                          </div>
                        )}
                      {/* ── RETURN, CANCEL & REFUND SECTION ── */}
                      {(item.return || item.cancel || item.refund) && (
                        <div className="mt-3 ml-[80px] bg-slate-50/80 border border-slate-100 rounded-2xl pb-5 px-5 space-y-5">
                          {/* Return/Replacement Info */}
                          {item.return && (
                            <div className="">
                              <div className="flex justify-between items-start gap-2 mb-2 bg-gray-50">
                                <div className="flex items-center gap-2 text-theme-body-sm font-semibold text-slate-800 capitalize mt-4">
                                  <RefreshCcw
                                    size={16}
                                    className="text-blue-500"
                                  />
                                  {item.return.type}{" "}
                                  {UiText.ORDER_DETAILS.REQUEST_SUFFIX}
                                </div>

                                <button
                                  onClick={() =>
                                    router.push(`backOrders/${item.id}`)
                                  }
                                  className="inline-flex items-center gap-2.5 group cursor-pointer mt-4"
                                >
                                  <span className="text-theme-caption uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:border-blue-300 transition-colors">
                                    {item.return.status}
                                  </span>
                                  <span className="text-theme-body-sm font-medium text-blue-600 group-hover:text-blue-800 group-hover:underline underline-offset-4 transition-all">
                                    {UiText.ORDER_DETAILS.PROCESS_RETURN_ARROW}
                                  </span>
                                </button>
                              </div>
                              <div className="text-theme-caption text-slate-600 space-y-1 bg-white border border-slate-100 p-3 rounded-lg">
                                <p>
                                  <span className="font-medium text-slate-700">
                                    {UiText.ORDER_DETAILS.REASON}
                                  </span>{" "}
                                  {item.return.reason}
                                </p>
                                {item.return.customer_note && (
                                  <p>
                                    <span className="font-medium text-slate-700">
                                      {UiText.ORDER_DETAILS.NOTE}
                                    </span>{" "}
                                    {item.return.customer_note}
                                  </p>
                                )}
                              </div>
                              {item.return.evidence_images &&
                                item.return.evidence_images.length > 0 && (
                                  <div className="flex gap-2 pt-1">
                                    {item.return.evidence_images.map(
                                      (img, idx) => (
                                        <a
                                          key={idx}
                                          href={img.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="relative w-14 h-14 block"
                                        >
                                          <Image
                                            src={img.url}
                                            alt={`Evidence ${idx + 1}`}
                                            className="object-cover rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                                            loading="eager"
                                            fill
                                            sizes="64px"
                                            style={{ objectFit: "contain" }}
                                          />
                                        </a>
                                      ),
                                    )}
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Cancellation Info */}
                          {item.cancel && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2 text-theme-body-sm font-semibold text-slate-800">
                                  <XCircle size={16} className="text-red-500" />
                                  {UiText.ORDER_DETAILS.CANCELLATION_DETAILS}
                                </div>
                                <span className="text-theme-tiny uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                                  {UiText.ORDER_DETAILS.BY}{" "}
                                  {item.cancel.cancelled_by}
                                </span>
                              </div>
                              <div className="text-theme-caption text-slate-600 bg-white border border-slate-100 p-3 rounded-lg">
                                <p>
                                  <span className="font-medium text-slate-700">
                                    {UiText.ORDER_DETAILS.REASON}
                                  </span>{" "}
                                  {item.cancel.reason}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Refund Info */}
                          {item.refund && (
                            <div
                              className={`space-y-2 ${item.return || item.cancel ? "pt-4 border-t border-slate-200" : ""}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2 text-theme-body-sm font-semibold text-slate-800">
                                  <CreditCard
                                    size={16}
                                    className="text-emerald-500"
                                  />
                                  {UiText.ORDER_DETAILS.REFUND_INFO}
                                </div>
                                <span
                                  className={`text-theme-tiny uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${
                                    item.refund.refund_status === "processed"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {item.refund.refund_status}
                                </span>
                              </div>
                              <div className="text-theme-caption text-slate-600 bg-white border border-slate-100 p-3 rounded-lg flex flex-col gap-1">
                                <p>
                                  <span className="font-medium text-slate-700">
                                    {UiText.ORDER_DETAILS.AMOUNT}
                                  </span>{" "}
                                  ₹
                                  {formatCurrency(
                                    Number(item.refund.refund_amount),
                                  )}
                                </p>
                                <p>
                                  <span className="font-medium text-slate-700">
                                    {UiText.ORDER_DETAILS.REASON}
                                  </span>{" "}
                                  {item.refund.refund_reason}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Address & Customer row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.shipping_address && (
                <SectionCard
                  title={UiText.ORDER_DETAILS.SHIPPING_ADDRESS}
                  icon={MapPin}
                >
                  <div className="px-5 py-4 text-theme-body-sm space-y-0.5 text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800">
                      {order.shipping_address.name}
                    </p>
                    <p>{order.shipping_address.address_line_1}</p>

                    <p>
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state}{" "}
                      {order.shipping_address.postal_code}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                </SectionCard>
              )}

              {order.customer && (
                <SectionCard title={UiText.ORDER_DETAILS.CUSTOMER} icon={User}>
                  <div className="px-5 py-4 text-theme-body-sm space-y-1 text-slate-600">
                    <p className="font-semibold text-slate-800 capitalize">
                      {order.customer.first_name} {order.customer.last_name}
                    </p>
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-blue-500 hover:underline block"
                    >
                      {order.customer.email}
                    </a>
                    {order.customer.phone_number && (
                      <p>{order.customer.phone_number}</p>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">
            {/* Order Summary */}
            <SectionCard
              title={UiText.ORDER_DETAILS.ORDER_SUMMARY}
              icon={CreditCard}
            >
              <div className="px-5 py-4 space-y-3 text-theme-body-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>{UiText.ORDER_DETAILS.ORDER_DATE}</span>
                  <span className="text-slate-800 font-medium text-right">
                    {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {order.payment && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{UiText.ORDER_DETAILS.PAYMENT}</span>
                    <span className="text-slate-800 font-medium capitalize">
                      {order.payment.payment_method}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-800">
                    {UiText.ORDER_DETAILS.TOTAL}
                  </span>
                  <span className="font-bold text-slate-900 text-theme-body">
                    ₹{formatCurrency(Number(order.total_amount))}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Order Status & Tracking — ONLY for single warehouse */}
            {isSingleWarehouse && (
              <SectionCard
                title={UiText.ORDER_DETAILS.FULFILLMENT}
                icon={Truck}
              >
                <div className="px-5 py-4 space-y-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <p className="text-theme-caption font-semibold text-slate-500 uppercase tracking-wide">
                      {UiText.ORDER_DETAILS.ORDER_STATUS}
                    </p>
                    <StatusEditor
                      status={orderStatus}
                      onSave={handleOrderLevelStatusSave}
                      setOrderStatus={setOrderStatus}
                    />
                  </div>

                  {/* Tracking URL */}
                  {orderStatus === OrderStatus.SHIPPED ||
                  orderStatus === OrderStatus.DELIVERED ? (
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <p className="text-theme-caption font-semibold text-slate-500 uppercase tracking-wide">
                        {UiText.ORDER_DETAILS.TRACKING_URL}
                      </p>
                      <TrackingEditor
                        trackingUrl={order.shipping?.tracking_url}
                        onSave={handleOrderTrackingUrl}
                      />
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <p className="text-theme-caption font-semibold text-slate-500 uppercase tracking-wide">
                        {UiText.ORDER_DETAILS.TRACKING_URL_ONLY_AFTER_SHIPPING}
                      </p>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* If multi-warehouse, show informational card instead */}
            {!isSingleWarehouse && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700">
                  <Truck size={14} />
                  <span className="text-theme-caption font-semibold uppercase tracking-wide">
                    {UiText.ORDER_DETAILS.FULFILLMENT}
                  </span>
                </div>
                <p className="text-theme-caption text-amber-700 leading-relaxed">
                  {UiText.ORDER_DETAILS.MULTI_WAREHOUSE_FULFILLMENT_DESC}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
