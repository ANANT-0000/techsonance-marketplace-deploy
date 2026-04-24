"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
    ArrowLeft,
    Download,
    FileText,
    HeadphonesIcon,
    Package,
    Star,
    Truck,
    CheckCircle2,
    XCircle,
    RefreshCcw
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "@/utils/customerApiClient";
import { useRouter } from "next/navigation";
import { OrderStatus, OrderStatusEnum } from "@/utils/Types";

interface OrderImage {
    image_url: string;
}

interface ProductVariant {
    id: string;
    variant_name: string;
    price: string;
    images: OrderImage[];
}

interface OrderItem {
    id: string;
    quantity: number;
    price: string;
    order_status: OrderStatus;
    variant: ProductVariant;
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

interface OrderDetailType {
    id: string;
    user_id: string;
    total_amount: string;
    created_at: string;
    items: OrderItem[];
    address: Address;
    payment: Payment;
    shipping: {
        tracking_url: string;
    } | null;
}

export default function OrderDetailsPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderDetailType | null>(null);
    const router = useRouter();
    const [orderStatus, setOrderStatus] = useState('');
    const getStatusSteps = (currentStatus: OrderStatus) => {
        console.log("currentStatus", currentStatus)
        const steps = ['pending', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(order?.items[0].order_status || '');
        return steps.map((step, index) => ({
            name: step.replace(/_/g, ' ').toUpperCase(),
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    useEffect(() => {
        if (!orderId) return;
        const getOrderDetails = async () => {
            await fetchOrderDetails(orderId)
                .then((data) => {
                    console.log("Order Details:", data);
                    setOrder(data.data);
                    setOrderStatus(data.data.items[1].order_status);
                })
                .catch((error) => {
                    console.error("Error fetching order details:", error);
                });
        }
        getOrderDetails();
    }, [orderId]);

    const handleCancelItem = (orderItemId: string) => {
        console.log("orderItemId", orderItemId)
        router.push(`${orderId}/cancel/${orderItemId}`);
    };
    const handleReturnReplace = (orderItemId: string) => {
        console.log("orderItemId", orderItemId)

        router.push(`${orderId}/return/${orderItemId}`);
    };
    const handleWriteReview = (orderItemId: string) => {
        console.log("orderItemId", orderItemId)
        const userId = order?.user_id;
        router.push(`/customerProfile/${userId}/orders/${orderId}/review/${orderItemId}`);
    };
    return (
        <div className="min-h-screen pb-12 font-sans rounded-2xl">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 mb-6 ">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-sm text-gray-500 mt-1">Order #{order?.id?.split('-')[0]?.toUpperCase()} • {order?.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* --- LEFT COLUMN: Tracking & Items --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status Tracker */}
                        {order?.items && order?.items.length === 0 &&
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                            >

                                <h2 className="text-lg font-bold text-gray-900 mb-6">Delivery Status</h2>
                                <div className="relative flex justify-between items-center w-full">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 z-0 rounded-full transition-all duration-500"
                                        style={{ width: order?.items && order?.items.length === 0 && order?.items[0].order_status === 'delivered' ? '100%' : '50%' }}
                                    ></div>

                                    {order?.items[0].order_status && getStatusSteps(order?.items[0].order_status).map((step, idx) => (
                                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 bg-white transition-colors
                                            ${step.completed ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-400'}`}>
                                                {idx === 0 && <Package size={18} />}
                                                {idx === 1 && <Truck size={18} />}
                                                {idx === 2 && <CheckCircle2 size={18} />}
                                            </div>
                                            <span className={`text-[10px] sm:text-xs font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-400'} text-center max-w-[60px] sm:max-w-none leading-tight`}>
                                                {step.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        }

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Items in this Order</h2>
                            <div className="space-y-4">
                                {order?.items.map((item, index) => {
                                    const CANCELLABLE_STATUSES = ['pending', 'processing'];
                                    const isCancellable = CANCELLABLE_STATUSES.includes(item.order_status);
                                    const isShipped = item.order_status === 'shipped';
                                    const isCancelled = item.order_status === 'cancelled';
                                    const isDelivered = item.order_status === 'delivered';

                                    const cancelHint = isShipped
                                        ? 'Cannot cancel — item has already shipped.'
                                        : isCancelled
                                            ? 'This item has been cancelled.'
                                            : 'Items can be canceled before shipment.';
                                    return (
                                        <div key={index} className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="relative z-10 flex flex-col items-center gap-2">

                                                {/* Image */}
                                                <div className="w-full sm:w-32 bg-[#f7f7f7] rounded-xl flex flex-col  items-center justify-center p-3">
                                                    <img
                                                        src={item.variant.images[0]?.image_url}
                                                        alt={item.variant.variant_name}
                                                        className="w-full h-24 object-contain mix-blend-multiply"
                                                    />
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 bg-white transition-colors
                                            `}>
                                                        {item.order_status === 'pending' && <Package size={14} />}
                                                        {isShipped && <Truck size={14} />}
                                                        {isDelivered && <CheckCircle2 size={14} />}
                                                    </div>
                                                    <span className={`text-[10px] sm:text-xs font-semibold text-center max-w-[60px] sm:max-w-none leading-tight`}>
                                                        {item.order_status.replace(/_/g, ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow flex flex-col justify-between">
                                                <div className="mb-1">
                                                    <Link href={`/shopping/${item.variant.id}`} className="font-bold text-gray-900 text-sm sm:text-base hover:text-blue-600 line-clamp-2 transition-colors">
                                                        {item.variant.variant_name}
                                                    </Link>
                                                    <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</p>
                                                    <p className="text-gray-900 font-semibold mt-1">₹{formatCurrency(Number(item.price))}</p>
                                                </div>

                                                {/* Action Buttons (Contextual based on status) */}
                                                <div className="flex flex-wrap gap-2 xl:mt-4 lg:mt-4 mt-1 items-center">

                                                    {/* Cancel button — active or disabled */}
                                                    {!isDelivered && (
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                onClick={isCancellable ? () => handleCancelItem(item.id) : undefined}
                                                                disabled={!isCancellable}
                                                                className={`flex items-center w-fit gap-1.5 text-sm lg:px-4 px-2  py-1 lg:py-2 rounded-xl font-medium border transition-colors
          ${isCancellable
                                                                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 cursor-pointer'
                                                                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                <XCircle size={14} />
                                                                Cancel Item
                                                            </button>
                                                            <span className="text-xs text-gray-400 px-1">{cancelHint}</span>
                                                        </div>
                                                    )}

                                                    {/* Post-delivery actions */}
                                                    {isDelivered && (
                                                        <>
                                                            <button
                                                                onClick={() => handleReturnReplace(item.id)}
                                                                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-white border border-orange-200 text-orange-700 font-medium rounded-xl hover:bg-orange-50 transition-colors"
                                                            >
                                                                <RefreshCcw size={14} /> Return / Replace
                                                            </button>
                                                            <button className="text-sm px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors">
                                                                Buy Again
                                                            </button>
                                                            <button
                                                                onClick={() => handleWriteReview(item.id)}
                                                                className="text-sm px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                                            >
                                                                Write a Review
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                                }
                            </div>
                        </motion.div>

                        {/* Delivery Experience Rating */}
                        {order?.items[0].order_status === 'delivered' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="font-bold text-gray-900">How was your delivery?</h3>
                                    <p className="text-sm text-gray-600 mt-1">Your feedback helps us improve our logistics.</p>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} className="p-1 hover:scale-110 transition-transform">
                                            <Star size={28} className="text-gray-300 hover:text-yellow-400 hover:fill-yellow-400" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: Summary, Address, Actions --- */}
                    <div className="space-y-6">

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-3 text-sm text-gray-600 border-b border-gray-100 pb-4 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{formatCurrency(Number(order?.total_amount))}</span>
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
                                <span className="font-bold text-xl text-gray-900">₹{formatCurrency(Number(order?.total_amount))}</span>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                <p className="text-sm font-semibold text-gray-800">{order?.payment?.payment_method}</p>
                                <p className="text-xs text-gray-500 mt-1">Ref: {order?.payment?.transaction_ref}</p>
                            </div>

                            {/* Download Buttons */}
                            <div className="flex flex-col gap-2">
                                <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                                    <Download size={16} /> Download Invoice
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <FileText size={16} /> Request Warranty Slip
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping Address</h2>
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <p className="font-bold text-gray-900 mb-1">{order?.address?.name}</p>
                                <p>{order?.address?.address_line_1}</p>
                                {order?.address?.address_line_2 && <p>{order?.address?.address_line_2}</p>}
                                <p>{order?.address?.city}, {order?.address?.state} {order?.address?.postal_code}</p>
                                <p>{order?.address?.country}</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-3"
                        >
                            <h2 className="text-sm font-bold text-gray-900">Need help with this order?</h2>
                            <button className="flex items-center gap-3 text-sm text-blue-600 font-medium hover:underline w-fit">
                                <HeadphonesIcon size={18} /> Contact Customer Support
                            </button>
                            {/* Fallback support options just in case */}
                            <button className="flex items-center gap-3 text-sm text-blue-600 font-medium hover:underline w-fit">
                                <RefreshCcw size={18} /> View Return Policy
                            </button>
                        </motion.div>

                    </div>
                </div>
            </div >
        </div >
    );
}