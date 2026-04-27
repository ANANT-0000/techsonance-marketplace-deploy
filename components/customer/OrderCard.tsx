'use client';
import { formatCurrency } from "@/lib/utils";
import { Address, OrderStatus, OrderStatusEnum } from "@/utils/Types";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { useState, useRef, useEffect } from "react";
import { OrderItemType, OrderType, ReturnRequest } from "./OrderList";
import { Package, RotateCcw, XCircle, Truck, CheckCircle2 } from "lucide-react";

// ── Per-item status badge ────────────────────
function ItemStatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase();
    if (s === 'delivered')
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle2 size={9} />Delivered</span>;
    if (s === 'pending')
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"><Truck size={9} />Pending</span>;
    if (s === 'cancelled')
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full"><XCircle size={9} />Cancelled</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full capitalize">{status}</span>;
}

// ── Return badge ─────────────────────────────
function ReturnBadge({ returnRequest }: { returnRequest: ReturnRequest }) {
    const colorMap: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        processing: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    const color = colorMap[returnRequest.status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600 border-gray-200';
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full ${color}`}>
            <RotateCcw size={9} />
            Return · {returnRequest.status}
        </span>
    );
}

// ── Single item row ──────────────────────────
function OrderItemRow({ item, highlighted }: { item: OrderItemType; highlighted: boolean }) {
    return (
        <div className={`flex gap-3 rounded-xl overflow-hidden border transition-colors shadow-sm ${highlighted ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-white'
            }`}>
            <div className="w-20 sm:w-24 bg-gray-50 flex-shrink-0 flex items-center justify-center p-2">
                <img
                    src={item.variant.images[0]?.image_url || "https://placehold.co/150x150/f9fafb/333?text=Product"}
                    alt={item.variant.variant_name}
                    className="w-full h-auto object-contain mix-blend-multiply"
                />
            </div>
            <div className="flex-1 py-3 pr-3 flex flex-col justify-between gap-1 min-w-0">
                <Link
                    href={`/shop/product/${item.variant.id}`}
                    className="font-semibold text-gray-900 text-sm line-clamp-2 hover:underline leading-snug"
                >
                    {item.variant.variant_name}
                </Link>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs font-semibold text-gray-800">₹{formatCurrency(Number(item.price))}</span>
                    <ItemStatusBadge status={item.order_status} />
                    {item.return_request && <ReturnBadge returnRequest={item.return_request} />}
                </div>
                {item.order_status === OrderStatusEnum.DELIVERED && !item.return_request && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="self-start mt-1 text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                    >
                        Write Review
                    </motion.button>
                )}
            </div>
        </div>
    );
}

// ── Address dropdown ─────────────────────────
function AddressDropdown({ address, isMobile }: { address: Address; isMobile: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const block = (
        <div className="text-xs sm:text-sm text-gray-700 space-y-0.5">
            <p className="font-semibold text-gray-900">{address.name}</p>
            {address.address_line1 && <p>{address.address_line1}</p>}
            {address.address_line2 && <p>{address.address_line2}</p>}
            <p>{[address.city, address.state, address.postal_code].filter(Boolean).join(', ')}</p>
            <p>{address.country}</p>
        </div>
    );

    if (isMobile) {
        return (
            <div>
                <button
                    className="flex items-center justify-between w-full text-blue-500 hover:text-blue-700 text-sm font-medium focus:outline-none"
                    onClick={() => setOpen((p) => !p)}
                >
                    <span className="truncate max-w-[80%]">{address.name || 'N/A'}</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[10px] ml-1">▼</motion.span>
                </button>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3"
                        >
                            {block}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <button
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium focus:outline-none"
                onClick={() => setOpen((p) => !p)}
            >
                {address.name || 'N/A'}
                <span className="text-[10px]">▼</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-xl p-4 z-50"
                    >
                        {block}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main OrderCard ───────────────────────────
export const OrderCard = ({
    order,
    activeStatus,
}: {
    order: OrderType;
    activeStatus: OrderStatus | 'returns' | null;
}) => {
    const isMobile = useMediaQuery({ maxWidth: 640 });

    // Which items match the current desktop tab?
    const matchingItems =
        activeStatus === null
            ? []
            : activeStatus === 'returns'
                ? order.items.filter((i) => i.return_request !== null)
                : order.items.filter((i) => i.order_status === activeStatus);

    const allMatch = matchingItems.length === order.items.length;

    // Highlight only the relevant items when not all items match the tab
    const isHighlighted = (item: OrderItemType): boolean => {
        if (activeStatus === null || allMatch) return false;
        if (activeStatus === 'returns') return item.return_request !== null;
        return item.order_status === activeStatus;
    };

    // Show "partial match" banner only on desktop when needed
    const showBanner = !isMobile && activeStatus !== null && matchingItems.length > 0 && !allMatch;

    // ── Mobile ───────────────────────────────────
    if (isMobile) {
        return (
            <motion.div className="w-full flex flex-col border border-gray-200 shadow-sm rounded-xl p-4 gap-4 bg-white">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <p className="text-xs text-gray-400">
                        Ordered {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Total</p>
                        <p className="text-sm font-bold text-gray-900">₹{formatCurrency(Number(order.total_amount))}</p>
                    </div>
                </div>

                {/* Ship To */}
                <div className="border-b border-gray-100 pb-3">
                    <p className="text-xs text-gray-400 mb-1">Ship To</p>
                    {order.address && <AddressDropdown address={order.address} isMobile={true} />}
                </div>

                {/* ALL items shown — no filter, no highlight */}
                <div className="flex flex-col gap-3">
                    {order.items.map((item, index) => (
                        <OrderItemRow key={item.id ?? index} item={item} highlighted={false} />
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-1">
                    <Link href={`/shop/order-details/${order.id}`} className="text-xs font-medium text-blue-500 hover:underline">
                        View Details →
                    </Link>
                    {order.shipping?.tracking_url && (
                        <a href={order.shipping.tracking_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
                            <Truck size={12} /> Track
                        </a>
                    )}
                </div>
            </motion.div>
        );
    }

    // ── Desktop ──────────────────────────────────
    return (
        <motion.div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <header className="flex justify-between items-center px-5 py-3.5 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-6 items-center">
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Order Placed</p>
                        <p className="text-sm text-gray-700">
                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
                        <p className="text-sm font-semibold text-gray-800">₹{formatCurrency(Number(order.total_amount))}</p>
                    </div>
                    {order.address && (
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Ship To</p>
                            <AddressDropdown address={order.address} isMobile={false} />
                        </div>
                    )}
                    {order.payment && (
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Payment</p>
                            <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                {order.payment.payment_method}
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${order.payment.payment_status === 'completed' ? 'bg-emerald-50 text-emerald-700'
                                        : order.payment.payment_status === 'refunded' ? 'bg-blue-50 text-blue-700'
                                            : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    {order.payment.payment_status}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
                <div className="text-right flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 font-mono">#{order.id.split('-')[0].toUpperCase()}</p>
                    <div className="flex items-center gap-3 text-sm">
                        <Link href={`/shop/order-details/${order.id}`} className="text-blue-500 hover:underline font-medium">
                            View Details
                        </Link>
                        {order.shipping?.tracking_url && (
                            <a href={order.shipping.tracking_url} target="_blank" rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium">
                                <Truck size={13} /> Track
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Partial-match info banner */}
            {showBanner && (
                <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-medium flex items-center gap-2">
                    <Package size={13} />
                    {matchingItems.length} of {order.items.length} items match this filter — others have a different status.
                </div>
            )}

            <div className="p-5 flex flex-col gap-3">
                {order.items.map((item, index) => (
                    <OrderItemRow key={item.id ?? index} item={item} highlighted={isHighlighted(item)} />
                ))}
            </div>
        </motion.div>
    );
};
