'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getVendorReturnById, updateReturnStatus } from '@/utils/vendorApiClient';
import { toast } from 'react-hot-toast';
import { LoaderSpinner } from '@/components/common/LoaderSpinner';
import { ReturnStatus } from '@/utils/Types';
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    ImageIcon,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Tag,
    Hash,
    Phone,
    Mail,
    ShoppingBag,
} from 'lucide-react';

/* ─────────────────── Types ─────────────────── */
interface Address {
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
}

interface ProductImage {
    image_url: string;
    alt_text?: string;
    is_primary?: boolean;
}

interface Attribute {
    name: string;
    value: string;
}

interface Variant {
    variant_name: string;
    sku: string;
    price: string;
    images: ProductImage[];
    attributes?: Attribute[];
    status?: string;
}

interface OrderItem {
    id: string;
    order_id: string;
    order_status: string;
    price: string;
    quantity: number;
    variant: Variant;
    order: {
        id: string;
        address: Address;
    };
}

interface ReturnUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
}

interface EvidenceImage {
    url: string;
}

interface RequestData {
    id: string;
    type: string;
    status: string;
    reason: string;
    customer_note: string;
    store_owner_note: string | null;
    tracking_id: string | null;
    created_at: string;
    updated_at: string;
    evidence_images: EvidenceImage[];
    orderItem: OrderItem;
    user: ReturnUser;
}

/* ─────────────────── Helpers ─────────────────── */
const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400', label: 'Pending' };
    if (s === 'approved') return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400', label: 'Approved' };
    if (s === 'rejected') return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400', label: 'Rejected' };
    if (s === 'processing') return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400', label: 'Processing' };
    if (s === 'qc_failed') return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400', label: 'QC Failed' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400', label: status };
};

const getTypeConfig = (type: string) => {
    const t = type?.toLowerCase();
    if (t === 'replacement') return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '↺', label: 'Replacement' };
    if (t === 'return') return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '←', label: 'Return' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: '?', label: type };
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
);

/* ─────────────────── Component ─────────────────── */
export default function BackOrderDetailPage() {
    const router = useRouter();
    const { returnId } = useParams<{ returnId: string }>();
    const [requestData, setRequestData] = useState<RequestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState<ReturnStatus | ''>('');
    const [vendorNote, setVendorNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);
    const [trackingUrl, setTrackingUrl] = useState('');
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const res = await getVendorReturnById(returnId);
                setRequestData(res.data);
                setNewStatus(res.data.status as ReturnStatus);
                setVendorNote(res.data.store_owner_note || '');
            } catch {
                toast.error('Failed to load request details');
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [returnId]);

    const handleUpdateSubmit = async () => {
        if (!newStatus) return toast.error('Please select a status');
        if (
            (newStatus === ReturnStatus.REJECTED || newStatus === ReturnStatus.QC_FAILED) &&
            !vendorNote.trim()
        ) {
            return toast.error('A note is required for rejections or QC failures');
        }
        setUpdating(true);
        try {   
            if (newStatus === ReturnStatus.SHIPPED) {
                await updateReturnStatus(returnId, { status: newStatus, store_owner_note: vendorNote, tracking_id: trackingUrl });
            } else {
                await updateReturnStatus(returnId, { status: newStatus, store_owner_note: vendorNote });
            }
            toast.success('Status updated successfully');
            router.back();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !requestData) {
        return (
            <div className="p-8 flex justify-center">
                <LoaderSpinner />
            </div>
        );
    }

    const { orderItem, user, evidence_images } = requestData;
    const variant = orderItem?.variant;
    const address = orderItem?.order?.address;
    const primaryImage = variant?.images?.find((img) => img.is_primary) ?? variant?.images?.[0];
    const statusCfg = getStatusConfig(requestData.status);
    const typeCfg = getTypeConfig(requestData.type);
    const needsNote =
        newStatus === ReturnStatus.REJECTED || newStatus === ReturnStatus.QC_FAILED;
    const isUnchanged = newStatus === requestData.status && vendorNote === (requestData.store_owner_note || '');

    return (
        <>
            {/* Lightbox */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <img
                        src={lightboxImg}
                        alt="Evidence"
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
                    />
                    <button
                        className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300 transition"
                        onClick={() => setLightboxImg(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="w-full px-1 py-6 max-w-6xl mx-auto">

                {/* ── Back + Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Back Orders
                    </button>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
                            {typeCfg.icon} {typeCfg.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                        </span>
                        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                            #{requestData.id.split('-')[0].toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ══════════ LEFT COLUMN ══════════ */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* ── Product Card ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                                <ShoppingBag size={15} className="text-blue-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Product</h2>
                            </div>
                            <div className="p-5 flex gap-4">
                                {primaryImage?.image_url ? (
                                    <img
                                        src={primaryImage.image_url}
                                        alt={primaryImage.alt_text || 'Product'}
                                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 shrink-0"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                        <Package size={24} className="text-gray-300" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2">
                                        {variant?.variant_name || 'N/A'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono">
                                            <Tag size={10} />
                                            {variant?.sku}
                                        </span>
                                        {variant?.attributes?.map((attr) => (
                                            <span key={attr.name} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md capitalize">
                                                {attr.name}: {attr.value}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 mt-3">
                                        <InfoRow label="Unit Price" value={`₹${Number(orderItem?.price).toLocaleString()}`} />
                                        <InfoRow label="Qty" value={orderItem?.quantity ?? 1} />
                                        <InfoRow
                                            label="Order Status"
                                            value={
                                                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md capitalize">
                                                    {orderItem?.order_status}
                                                </span>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 pb-4">
                                <span className="text-xs text-gray-400">Order ID: </span>
                                <span className="font-mono text-xs text-gray-600">#{orderItem?.order_id?.split('-')[0].toUpperCase()}</span>
                            </div>
                        </div>

                        {/* ── Request Details ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                                <ClipboardList size={15} className="text-blue-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Request Details</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <InfoRow label="Request Type" value={<span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-md border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border} capitalize`}>{requestData.type}</span>} />
                                    <InfoRow label="Submitted" value={new Date(requestData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                                    <InfoRow label="Last Updated" value={new Date(requestData.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                                    {requestData.tracking_id && (
                                        <InfoRow label="Tracking ID" value={<span className="font-mono">{requestData.tracking_id}</span>} />
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Reason</p>
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                        <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-amber-800 font-medium">{requestData.reason}</p>
                                    </div>
                                </div>

                                {requestData.customer_note && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Customer Note</p>
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 italic">
                                            "{requestData.customer_note}"
                                        </div>
                                    </div>
                                )}

                                {requestData.store_owner_note && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Store Owner Note</p>
                                        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                            <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                            <p className="text-sm text-blue-800">{requestData.store_owner_note}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Evidence Images ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                                <ImageIcon size={15} className="text-blue-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Evidence Photos</h2>
                                {evidence_images?.length > 0 && (
                                    <span className="ml-auto text-xs text-gray-400">{evidence_images.length} image{evidence_images.length > 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <div className="p-5">
                                {!evidence_images || evidence_images.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                                        <ImageIcon size={28} className="opacity-30" />
                                        <p className="text-sm">No evidence photos provided.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {evidence_images.map((img, index) => (
                                            <div
                                                key={index}
                                                className="relative group w-28 h-28 rounded-xl border border-gray-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                                onClick={() => setLightboxImg(img.url)}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                    <ExternalLink size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ══════════ RIGHT COLUMN ══════════ */}
                    <div className="space-y-5">

                        {/* ── Customer Info ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                                <User size={15} className="text-blue-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Customer</h2>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shrink-0">
                                        {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-xs text-gray-400 font-mono">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={13} className="text-gray-400 shrink-0" />
                                        <span className="truncate">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={13} className="text-gray-400 shrink-0" />
                                        <span>{user?.phone_number || <span className="text-gray-400 text-xs italic">No phone</span>}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Delivery Address ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                                <MapPin size={15} className="text-blue-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Delivery Address</h2>
                            </div>
                            <div className="p-5">
                                {address ? (
                                    <div className="text-sm text-gray-700 space-y-0.5 leading-relaxed">
                                        {address.address_line_1 && <p>{address.address_line_1}</p>}
                                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                                        {(address.city || address.state) && (
                                            <p>{[address.city, address.state].filter(Boolean).join(', ')}</p>
                                        )}
                                        {(address.country || address.postal_code) && (
                                            <p className="text-gray-500">{[address.country, address.postal_code].filter(Boolean).join(' – ')}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No address on file.</p>
                                )}
                            </div>
                        </div>

                        {/* ── Action Panel ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                                <CheckCircle2 size={15} className="text-blue-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Resolution</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Update Status</label>
                                    <select
                                        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition-colors cursor-pointer"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value as ReturnStatus)}
                                    >
                                        {Object.values(ReturnStatus).map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                {
                                    newStatus === ReturnStatus.SHIPPED && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                                                Tracking URL
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                                                value={trackingUrl}
                                                onChange={(e) => setTrackingUrl(e.target.value)}
                                                placeholder="Enter tracking URL"
                                            />
                                        </div>
                                    )
                                }
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                                        Internal Note
                                        {needsNote && <span className="text-red-500 ml-1">*required</span>}
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none placeholder:text-gray-400"
                                        rows={4}
                                        value={vendorNote}
                                        onChange={(e) => setVendorNote(e.target.value)}
                                        placeholder={needsNote ? 'Required: provide reason...' : 'Optional note for customer or records...'}
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateSubmit}
                                    disabled={updating || isUnchanged}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors shadow-sm"
                                >
                                    {updating ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Confirm Update'
                                    )}
                                </button>

                                {isUnchanged && (
                                    <p className="text-center text-xs text-gray-400">No changes to save.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}