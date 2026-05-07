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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { redirect, useParams, useRouter } from "next/navigation";
import {
    fetchAddTrackingUrl,
    fetchUpdateOrderStatus,
    fetchVendorOrderDetails,
} from "@/utils/vendorApiClient";
import { fetchCancelOrderItem } from "@/utils/customerApiClient";
import { getCompanyDomain } from "@/lib/get-domain";
import { OrderStatusEnum } from "@/utils/Types";
import { authToken } from "@/utils/authToken";

// ─── Types ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
        icon: Clock,
        dot: "bg-amber-400",
    },
    PROCESSING: {
        label: "Processing",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
        icon: Package,
        dot: "bg-blue-400",
    },
    SHIPPED: {
        label: "Shipped",
        className: "bg-violet-50 text-violet-700 border border-violet-200",
        icon: Truck,
        dot: "bg-violet-400",
    },
    DELIVERED: {
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: CheckCircle2,
        dot: "bg-emerald-400",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: XCircle,
        dot: "bg-red-400",
    },
} as const;

type OrderStatus = keyof typeof STATUS_CONFIG;
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
    payment: { amount: string; payment_method: string } | null;
    shipping: { tracking_url: string | null };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ─── Status Editor ────────────────────────────────────────────────────────────

interface StatusEditorProps {
    status: OrderStatus;
    onSave: (s: OrderStatus) => Promise<void>;
    setOrderStatus?: React.Dispatch<React.SetStateAction<OrderStatus>>;
    setItemStatuses?: React.Dispatch<React.SetStateAction<Record<string, OrderStatus>>>;
}

function StatusEditor({ status, onSave, setOrderStatus, setItemStatuses }: StatusEditorProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(status);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(draft);
        if (setOrderStatus) {
            setOrderStatus(draft);
        }
        if (setItemStatuses) {
            setItemStatuses((prev) => ({ ...prev, draft }))
        }
        setSaving(false);
        setEditing(false);
    };

    if (!editing) {
        return (
            <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                <button
                    onClick={() => { setDraft(status); setEditing(true); }}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <Pencil size={11} /> Edit
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            <select
                value={draft}
                onChange={(e) => setDraft(e.target.value as OrderStatus)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            >
                {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
            </select>
            <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 transition-colors font-medium"
            >
                {saving ? "Saving…" : "Save"}
            </button>
            <button
                onClick={() => setEditing(false)}
                className="text-xs px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
                Cancel
            </button>
        </div>
    );
}

// ─── Tracking URL Editor ──────────────────────────────────────────────────────

interface TrackingEditorProps {
    trackingUrl: string | null | undefined;
    onSave: (url: string, action: "add" | "update") => Promise<void>;
}

function TrackingEditor({ trackingUrl, onSave }: TrackingEditorProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!draft.trim()) return;
        setSaving(true);
        await onSave(draft, trackingUrl ? "update" : "add");
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
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                    <ExternalLink size={12} /> View tracking
                </a>
                <button
                    onClick={() => { setDraft(trackingUrl); setEditing(true); }}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors w-fit"
                >
                    <Pencil size={11} /> Update URL
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
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 border border-dashed border-slate-200 hover:border-blue-300 rounded-lg px-2.5 py-1.5 transition-all w-fit"
                    >
                        <Link2 size={12} /> Add tracking URL
                    </button>
                )}
                {(editing || (!trackingUrl && editing)) && (
                    <div className="flex items-center gap-1.5">
                        <input
                            autoFocus
                            type="url"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="https://track.carrier.com/…"
                            className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                        />
                        <button
                            onClick={handleSave}
                            disabled={!draft.trim() || saving}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition-colors font-medium flex-shrink-0"
                        >
                            {saving ? "…" : trackingUrl ? "Update" : "Add"}
                        </button>
                        <button
                            onClick={() => { setEditing(false); setDraft(""); }}
                            className="text-xs px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
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

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

interface CancelModalProps {
    onConfirm: (reason: string) => Promise<void>;
    onClose: () => void;
}

function CancelModal({ onConfirm, onClose }: CancelModalProps) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) return;
        setSubmitting(true);
        await onConfirm(reason);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-slate-100">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-slate-800">Cancel item</h2>
                        <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                        <X size={16} />
                    </button>
                </div>
                <textarea
                    className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 resize-none outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition bg-slate-50"
                    rows={3}
                    placeholder="Reason for cancellation…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim() || submitting}
                        className="flex-1 bg-red-500 text-white text-sm rounded-xl px-3 py-2.5 hover:bg-red-600 disabled:opacity-60 font-medium transition-colors"
                    >
                        {submitting ? "Cancelling…" : "Confirm cancellation"}
                    </button>
                    <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 px-3 font-medium">
                        Keep item
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <Icon size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">{title}</span>
            </div>
            {children}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorOrderDetails() {
    const { orderId } = useParams<{ orderId: string }>();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatusEnum.PROCESSING as OrderStatus);
    const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

    // Per-item local state for multi-warehouse
    const [itemStatuses, setItemStatuses] = useState<Record<string, OrderStatus>>({});
    const token = authToken();
    useEffect(() => {
        if (!token) {
            redirect("/auth/vendorLogin")
        }
    }, [])
    const loadOrder = async () => {
        const token = authToken();
        if (!token) {
            redirect("/auth/vendorLogin")
        }
        try {
            const res = await fetchVendorOrderDetails(orderId, token);
            const data: Order = res.data;
            setOrder(data);
            if (data.items?.[0]?.order_status) {
                setOrderStatus(data.items[0].order_status.toUpperCase() as OrderStatus);
            }
            const statusMap: Record<string, OrderStatus> = {};
            data.items.forEach((item) => {
                statusMap[item.id] = item.order_status.toUpperCase() as OrderStatus;
            });
            setItemStatuses(statusMap);
        } catch (err) {
            console.error("Error fetching vendor order details:", err);
        }
    };

    useEffect(() => { loadOrder(); }, []);

    const isSingleWarehouse = order?.is_single_warehouse ?? true;

    // ── Order-level status save (single warehouse) ─────────────────────────────
    const handleOrderLevelStatusSave = async (newStatus: OrderStatus) => {
        if (!token) {
            redirect("/auth/vendorLogin")
        }
        const res = await fetchUpdateOrderStatus(orderId, newStatus as OrderStatus, token);
        if (res.success) {
            setOrderStatus(newStatus);
            setOrder((prev) =>
                prev ? { ...prev, items: prev.items.map((i) => ({ ...i, order_status: newStatus.toLowerCase() })) } : prev
            );
        }
    };

    // ── Per-item status save (multi-warehouse) ─────────────────────────────────
    const handleItemStatusSave = async (itemId: string, newStatus: OrderStatus) => {
        setItemStatuses((prev) => ({ ...prev, [itemId]: newStatus }));
        setOrder((prev) =>
            prev
                ? { ...prev, items: prev.items.map((i) => i.id === itemId ? { ...i, order_status: newStatus.toLowerCase() } : i) }
                : prev
        );
    };

    // ── Tracking URL ──────────────────────────────────────────────────────────
    const handleOrderTrackingUrl = async (url: string, action: "add" | "update") => {
        if (!token) {
            redirect("/auth/vendorLogin")
        }
        const res = action === "add"
            ? await fetchAddTrackingUrl(orderId, url, token)
            : await fetchUpdateOrderStatus(orderId, url, token);
        if (res.success) {
            setOrder((prev) => prev ? { ...prev, shipping: { tracking_url: url } } : prev);
        }
    };

    const handleItemTrackingUrl = async (itemId: string, url: string) => {
        if (!token) {
            redirect("/auth/vendorLogin")
        }
        const response = await fetchAddTrackingUrl(itemId, url, token);
        if (response?.success) {
            setOrder((prev) =>
                prev
                    ? { ...prev, items: prev.items.map((i) => i.id === itemId ? { ...i, tracking_url: url } : i) }
                    : prev
            );
        }
    };

    // ── Cancellation ──────────────────────────────────────────────────────────
    const handleCancelItem = async (reason: string) => {

        if (!cancellingItemId || !token) return;
        const result = await fetchUpdateOrderStatus(cancellingItemId, 'cancelled', token);
        if (result?.data?.success) await loadOrder();
        setCancellingItemId(null);
    };

    if (!order)
        return (
            <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
                    <span className="text-sm">Loading order…</span>
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
                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Back to Orders
                        </button>
                        <h1 className="text-xl font-bold text-slate-900">Order Details</h1>
                        <p className="text-sm text-slate-400 mt-0.5 font-mono">
                            #{order.id.toUpperCase()}
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <Clock size={12} />
                        {new Date(order.created_at).toLocaleString("en-GB")}
                    </div>
                </div>

                {/* ── Multi-warehouse notice ── */}
                {!isSingleWarehouse && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
                        <div>
                            <span className="font-semibold">Multiple warehouses detected.</span>{" "}
                            Order status and tracking URLs are managed individually per item below.
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Items card */}
                        <SectionCard title={`Items (${order.items.length})`} icon={Package}>
                            <div className="divide-y divide-slate-100">
                                {order.items.map((item) => {
                                    const displayStatus = (itemStatuses?.[item.id] ?? item.order_status.toUpperCase()) as OrderStatus;
                                    return (
                                        <div key={item.id} className="px-5 py-4 flex flex-col gap-3">
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
                                                    <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                                                        {item.product_variant.variant_name}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                                        <span className="text-xs text-slate-400">
                                                            Qty: <span className="text-slate-600 font-medium">{item.quantity}</span>
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            Total:{" "}
                                                            <span className="text-slate-700 font-semibold">
                                                                ₹{formatCurrency(Number(item.line_total))}
                                                            </span>
                                                        </span>
                                                        {item.warehouse && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
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
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                                                        <StatusEditor
                                                            status={displayStatus}
                                                            onSave={(s) => handleItemStatusSave(item.id, s)}
                                                            setItemStatuses={setItemStatuses}
                                                        />
                                                    </div>
                                                    {/* Tracking URL */}
                                                    {(displayStatus.toLowerCase() === OrderStatusEnum.SHIPPED.toLowerCase() || displayStatus.toLowerCase() === OrderStatusEnum.DELIVERED.toLowerCase()) ? <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                            Tracking URL
                                                        </p>
                                                        <TrackingEditor
                                                            trackingUrl={item.tracking_url}
                                                            onSave={(url) => handleItemTrackingUrl(item.id, url)}
                                                        />
                                                    </div> :
                                                        (<div className="border-t border-slate-100 pt-4 space-y-2">
                                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                                Tracking URL    (Only after shipping)
                                                            </p>
                                                        </div>)
                                                    }
                                                </div>
                                            )}

                                            {/* Cancel button */}
                                            {displayStatus !== "CANCELLED" && displayStatus !== "DELIVERED" && (
                                                <div className="ml-[68px]">
                                                    <button
                                                        onClick={() => setCancellingItemId(item.id)}
                                                        className="text-xs text-red-400 hover:text-red-600 hover:underline transition-colors"
                                                    >
                                                        Cancel this item
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
                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 capitalize mt-4">
                                                                    <RefreshCcw size={16} className="text-blue-500" />
                                                                    {item.return.type} Request
                                                                </div>

                                                                <button
                                                                    onClick={() => router.push(`backOrders/${item.id}`)}
                                                                    className="inline-flex items-center gap-2.5 group cursor-pointer mt-4"
                                                                >
                                                                    <span className="text-[12px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:border-blue-300 transition-colors">
                                                                        {item.return.status}
                                                                    </span>
                                                                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 group-hover:underline underline-offset-4 transition-all">
                                                                        Process Return →
                                                                    </span>
                                                                </button>
                                                            </div>
                                                            <div className="text-xs text-slate-600 space-y-1 bg-white border border-slate-100 p-3 rounded-lg">
                                                                <p><span className="font-medium text-slate-700">Reason:</span> {item.return.reason}</p>
                                                                {item.return.customer_note && (
                                                                    <p><span className="font-medium text-slate-700">Note:</span> {item.return.customer_note}</p>
                                                                )}
                                                            </div>
                                                            {item.return.evidence_images && item.return.evidence_images.length > 0 && (
                                                                <div className="flex gap-2 pt-1">
                                                                    {item.return.evidence_images.map((img, idx) => (
                                                                        <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer">
                                                                            <img
                                                                                src={img.url}
                                                                                alt={`Evidence ${idx + 1}`}
                                                                                className="w-14 h-14 object-cover rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                                                                            />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Cancellation Info */}
                                                    {item.cancel && (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                                                    <XCircle size={16} className="text-red-500" />
                                                                    Cancellation Details
                                                                </div>
                                                                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                                                                    By {item.cancel.cancelled_by}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-600 bg-white border border-slate-100 p-3 rounded-lg">
                                                                <p><span className="font-medium text-slate-700">Reason:</span> {item.cancel.reason}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Refund Info */}
                                                    {item.refund && (
                                                        <div className={`space-y-2 ${(item.return || item.cancel) ? 'pt-4 border-t border-slate-200' : ''}`}>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                                                    <CreditCard size={16} className="text-emerald-500" />
                                                                    Refund Information
                                                                </div>
                                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${item.refund.refund_status === 'processed'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-white text-slate-600 border-slate-200'
                                                                    }`}>
                                                                    {item.refund.refund_status}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-600 bg-white border border-slate-100 p-3 rounded-lg flex flex-col gap-1">
                                                                <p><span className="font-medium text-slate-700">Amount:</span> ₹{formatCurrency(Number(item.refund.refund_amount))}</p>
                                                                <p><span className="font-medium text-slate-700">Reason:</span> {item.refund.refund_reason}</p>
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
                                <SectionCard title="Shipping Address" icon={MapPin}>
                                    <div className="px-5 py-4 text-sm space-y-0.5 text-slate-600 leading-relaxed">
                                        <p className="font-semibold text-slate-800">{order.shipping_address.name}</p>
                                        <p>{order.shipping_address.address_line_1}</p>
                                        {order.shipping_address.address_line_2 && (
                                            <p>{order.shipping_address.address_line_2}</p>
                                        )}
                                        <p>
                                            {order.shipping_address.city}, {order.shipping_address.state}{" "}
                                            {order.shipping_address.postal_code}
                                        </p>
                                        <p>{order.shipping_address.country}</p>
                                    </div>
                                </SectionCard>
                            )}

                            {order.customer && (
                                <SectionCard title="Customer" icon={User}>
                                    <div className="px-5 py-4 text-sm space-y-1 text-slate-600">
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
                        <SectionCard title="Order Summary" icon={CreditCard}>
                            <div className="px-5 py-4 space-y-3 text-sm">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Order date</span>
                                    <span className="text-slate-800 font-medium text-right">
                                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                                            day: "2-digit", month: "short", year: "numeric",
                                        })}
                                    </span>
                                </div>
                                {order.payment && (
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Payment</span>
                                        <span className="text-slate-800 font-medium capitalize">
                                            {order.payment.payment_method}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                                    <span className="font-semibold text-slate-800">Total</span>
                                    <span className="font-bold text-slate-900 text-base">
                                        ₹{formatCurrency(Number(order.total_amount))}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Order Status & Tracking — ONLY for single warehouse */}
                        {isSingleWarehouse && (
                            <SectionCard title="Fulfillment" icon={Truck}>
                                <div className="px-5 py-4 space-y-4">
                                    {/* Status */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Order Status
                                        </p>
                                        <StatusEditor
                                            status={orderStatus}
                                            onSave={handleOrderLevelStatusSave}
                                            setOrderStatus={setOrderStatus}
                                        />
                                    </div>

                                    {/* Tracking URL */}
                                    {orderStatus.toLowerCase() === OrderStatusEnum.SHIPPED.toLowerCase() || orderStatus.toLowerCase() === OrderStatusEnum.DELIVERED.toLowerCase() ? <div className="border-t border-slate-100 pt-4 space-y-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Tracking URL
                                        </p>
                                        <TrackingEditor
                                            trackingUrl={order.shipping?.tracking_url}
                                            onSave={handleOrderTrackingUrl}
                                        />
                                    </div>
                                        : (<div className="border-t border-slate-100 pt-4 space-y-2">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                Tracking URL    (Only after shipping)
                                            </p>
                                        </div>)}
                                </div>
                            </SectionCard>
                        )}

                        {/* If multi-warehouse, show informational card instead */}
                        {!isSingleWarehouse && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 space-y-1.5">
                                <div className="flex items-center gap-2 text-amber-700">
                                    <Truck size={14} />
                                    <span className="text-xs font-semibold uppercase tracking-wide">Fulfillment</span>
                                </div>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Status and tracking are managed per item since this order ships from multiple warehouses. See the items panel on the left.
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}