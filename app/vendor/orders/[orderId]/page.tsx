"use client";

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
import { OrderStatus, OrderStatusEnum } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import { UiText } from "@/constants/ui-text";
import { CancelModal } from "@/components/vendor/CancelModal";
import { StatusEditor } from "@/components/vendor/OrderStatusEditor";
import { StatusBadge } from "@/components/vendor/StatusBadge";

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
    address_line_2: string;
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
        {Icon && <Icon className="text-slate-500" size={16} />}
        <h2 className="text-theme-body font-bold text-slate-800">{title}</h2>
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
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    OrderStatusEnum.PROCESSING,
  );
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

  // Per-item local state for multi-warehouse
  const [itemStatuses, setItemStatuses] = useState<Record<string, OrderStatus>>(
    {},
  );
  const token = authToken();
  useEffect(() => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }
  }, [token]);
  const loadOrder = async () => {
    const token = authToken();
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    try {
      const res = await fetchVendorOrderDetails(orderId, token);
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
    } catch {}
  };
  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const isSingleWarehouse = order?.is_single_warehouse ?? true;

  // ── Order-level status save (single warehouse) ─────────────────────────────
  const handleOrderLevelStatusSave = async (newStatus: OrderStatus) => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    const res = await fetchUpdateOrderStatus(orderId, newStatus as any, token);
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
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    const res =
      action === TrackingAction.ADD
        ? await fetchAddTrackingUrl(orderId, url, token)
        : await fetchUpdateOrderStatus(orderId, url, token);
    if (res.success) {
      setOrder((prev) =>
        prev ? { ...prev, shipping: { tracking_url: url } } : prev,
      );
    }
  };

  // ── Cancellation ──────────────────────────────────────────────────────────
  const handleCancelItem = async (reason: string) => {
    if (!cancellingItemId || !token) return;
    const res = await fetchUpdateOrderStatus(
      cancellingItemId,
      "cancelled",
      token,
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
    } catch {}
  };
  if (!order)
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-theme-body-sm">
            {UiText.ORDER_DETAILS.LOADING}
          </span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen  p-4 md:p-6 font-sans text-slate-800">
      {cancellingItemId && (
        <CancelModal
          onConfirm={handleCancelItem}
          onClose={() => setCancellingItemId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-theme-body-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              {UiText.ORDER_DETAILS.BACK_TO_ORDERS}
            </button>
            <h1 className="text-theme-h5 font-bold text-slate-900">
              {UiText.ORDER_DETAILS.TITLE}
            </h1>
            <p className="text-theme-body-sm text-slate-400 mt-0.5 font-mono">
              #{order.id.toUpperCase()}
            </p>
          </div>

          <div className="flex flex-col gap-4 justify-between">
            <div className="hidden sm:flex items-center gap-2 text-theme-caption text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <Clock size={12} />
              {new Date(order.created_at).toLocaleString("en-GB")}
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
        </div>

        {/* ── Multi-warehouse notice ── */}
        {!isSingleWarehouse && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-theme-body-sm text-amber-800">
            <AlertCircle
              size={16}
              className="flex-shrink-0 mt-0.5 text-amber-500"
            />
            <div>
              <span className="font-semibold">
                {UiText.ORDER_DETAILS.MULTI_WAREHOUSE_ALERT}
              </span>{" "}
              {UiText.ORDER_DETAILS.MULTI_WAREHOUSE_DESC}
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
                {order.items.map((item) => {
                  const displayStatus = (itemStatuses?.[item.id] ??
                    item.order_status.toUpperCase()) as OrderStatus;
                  return (
                    <div
                      key={item.id}
                      className="px-5 py-4 flex flex-col gap-3"
                    >
                      {/* Product row */}
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                          <img
                            src={item.product_variant.image_url}
                            alt={item.product_variant.variant_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-theme-body-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                            {item.product_variant.variant_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <span className="text-theme-caption text-slate-400">
                              {UiText.ORDER_DETAILS.QTY}{" "}
                              <span className="text-slate-600 font-medium">
                                {item.quantity}
                              </span>
                            </span>
                            <span className="text-theme-caption text-slate-400">
                              {UiText.ORDER_DETAILS.TOTAL}{" "}
                              <span className="text-slate-700 font-semibold">
                                ₹{formatCurrency(Number(item.line_total))}
                              </span>
                            </span>
                            {item.warehouse && (
                              <span className="inline-flex items-center gap-1 text-theme-caption text-slate-400">
                                <MapPin size={10} />
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
                        <div className="ml-[68px] grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                          {/* Status control */}
                          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                            <p className="text-theme-caption font-semibold text-slate-500 uppercase tracking-wide">
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
                      {displayStatus !== OrderStatusEnum.CANCELLED &&
                        displayStatus !== OrderStatusEnum.DELIVERED && (
                          <div className="ml-[68px]">
                            <button
                              onClick={() => setCancellingItemId(item.id)}
                              className="text-theme-caption text-red-400 hover:text-red-600 hover:underline transition-colors"
                            >
                              {UiText.ORDER_DETAILS.CANCEL_THIS_ITEM}
                            </button>
                          </div>
                        )}
                      {/* ── RETURN, CANCEL & REFUND SECTION ── */}
                      {(item.return || item.cancel || item.refund) && (
                        <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl pb-4 px-4 space-y-4">
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
                                        >
                                          <img
                                            src={img.url}
                                            alt={`Evidence ${idx + 1}`}
                                            className="w-14 h-14 object-cover rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
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
                    </div>
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
                    {order.shipping_address.address_line_2 && (
                      <p>{order.shipping_address.address_line_2}</p>
                    )}
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
                  {orderStatus === OrderStatusEnum.SHIPPED ||
                  orderStatus === OrderStatusEnum.DELIVERED ? (
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
    </div>
  );
}
