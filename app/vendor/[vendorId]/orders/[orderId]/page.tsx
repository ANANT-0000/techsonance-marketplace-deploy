"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Assuming you have this utility
import { useParams, useRouter } from "next/navigation";
import { fetchAddTrackingUrl, fetchUpdateOrderStatus, fetchVendorOrderDetails, updateOrderStatus, } from "@/utils/vendorApiClient";
import { OrderStatusEnum } from "@/constants";
import { DynamicIcon } from "lucide-react/dynamic";

// --- MOCK DATA ---
// const mockOrder = {
//     id: "2119",
//     status: "Completed",
//     date: "July 28, 2026, 3:05 pm",
//     earning: "7974.00",
//     customer: {
//         name: "Phalla P",
//         email: "plang_phalla@yahoo.com",
//         phone: "1234567890",
//         ip: "49.156.44.2"
//     },
//     items: [
//         {
//             id: "1",
//             name: "Core i7 Laptop",
//             image: "https://placehold.co/100x100/f9fafb/333333?text=Laptop",
//             cost: "8860.00",
//             qty: 1,
//             total: "8860.00"
//         }
//     ],
//     summary: {
//         discount: "0.00",
//         shipping: "0.00",
//         total: "8860.00",
//         refunded: "0.00"
//     },
//     billingAddress: {
//         name: "Phalla P",
//         line1: "St1",
//         line2: "PP",
//         city: "Cambodia",
//         postal: "12000",
//         country: "Cambodia"
//     },
//     notes: [
//         { id: 1, text: "Order status changed by bulk edit: Order status changed from On hold to Completed.", date: "8 months ago", isSystem: true },
//         { id: 2, text: "Order status changed from Completed to On hold.", date: "8 months ago", isSystem: true },
//         { id: 3, text: "Customer requested expedited shipping.", date: "10 months ago", isSystem: false },
//     ]
// };
const STATUS_CONFIG = {
    PENDING: { label: "Pending", className: "bg-amber-100  text-amber-800" },
    PROCESSING: { label: "Processing", className: "bg-blue-100   text-blue-800" },
    SHIPPED: { label: "Shipped", className: "bg-purple-100 text-purple-800" },
    DELIVERED: { label: "Delivered", className: "bg-green-100  text-green-800" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100    text-red-800" },
} as const

type OrderStatus = keyof typeof STATUS_CONFIG
interface Order {
    id: string;
    order_status: string;
    total_amount: string;
    created_at: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        country_code: string | null;
        phone_number: string | null;
    };
    items: {
        quantity: number;
        price: string;
        productVariant: {
            id: string;
            variant_name: string;
            price: string;
            images: {
                image_url: string;
            }[];
        };
    }[];
    address: {
        name: string;
        address_line1: string;
        address_line2: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    payment: {
        id: string;
        payment_method: string;
        payment_status: string;
        transaction_ref: string;
        amount: string;
        created_at: string;
        updated_at: string;
        order_id: string;
        company_id: string;
    };
    shipping: {
        tracking_url: string | null;
    }
}

export default function VendorOrderDetails() {
    const { orderId } = useParams<{ orderId: string }>();
    const [newTrackingUrl, setNewTrackingUrl] = useState("");
    const router = useRouter();
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [isEditingUrl, setIsEditingUrl] = useState(false);
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState([
        { id: 1, text: "Order status changed by bulk edit: Order status changed from On hold to Completed.", date: "8 months ago", isSystem: true },
        { id: 2, text: "Order status changed from Completed to On hold.", date: "8 months ago", isSystem: true },
        { id: 3, text: "Customer requested expedited shipping.", date: "10 months ago", isSystem: false },
    ]);
    const [order, setOrder] = useState<Order | null>(null);
    useEffect(() => {
        const getOrderDetails = async () => {
            await fetchVendorOrderDetails(orderId).then((res) => {
                console.log("Vendor Order Details:", res);
                setOrder(res.data);
            }
            ).catch((err) => {
                console.error("Error fetching vendor order details:", err);
            })
        }
        getOrderDetails();
    }, [orderId]);

    const handleStatusChange = async () => {
        const response = await fetchUpdateOrderStatus(orderId, status as OrderStatusEnum);
        if (response.success) {
            setOrder((prev) => prev ? { ...prev, order_status: status } : prev);
            setIsEditingStatus(false);
        } else {
            // Handle error (e.g., show a notification)
            console.error("Failed to update order status");
        }
    }
    const handleTrackingUrl = async (action: 'add' | 'update') => {
        // Implement the logic to add or update tracking URL (e.g., API call)
        let response;
        if (action === 'add') {
            response = await fetchAddTrackingUrl(orderId, newTrackingUrl);
        } else {
            response = await fetchUpdateOrderStatus(orderId, newTrackingUrl);
        }
        if (response.success) {
            setOrder((prev) => prev ? { ...prev, shipping: { tracking_url: newTrackingUrl } } : prev);
        }
        setNewTrackingUrl("");
    }
    return (
        <div className="min-h-screen p-4 md:p-6 font-sans text-gray-800">
            <div className="mx-auto">

                {/* --- HEADER --- */}
                <div className="mb-6">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 bg-white rounded text-sm hover:bg-gray-100 transition-colors mb-4">
                        <ArrowLeft size={16} /> Orders
                    </button>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ================= LEFT COLUMN ================= */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. ORDER ITEMS CARD */}
                        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 font-semibold text-gray-700">
                                Order#{order?.id} → Order Items
                            </div>

                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50 text-sm">
                                            <th className="px-4 py-3 font-semibold">Item</th>
                                            <th className="px-4 py-3 font-semibold text-right">Cost</th>
                                            <th className="px-4 py-3 font-semibold text-center">Qty</th>
                                            <th className="px-4 py-3 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order?.items.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                                                <td className="px-4 py-4 flex items-center gap-3">
                                                    <img src={item.productVariant.images[0].image_url} alt={item.productVariant.variant_name} className="w-12 h-12 object-cover border border-gray-200 rounded bg-white p-0.5" />
                                                    <span className="text-blue-600 hover:underline cursor-pointer">{item.productVariant.variant_name}</span>
                                                </td>
                                                <td className="px-4 py-4 text-right text-gray-600">₹{formatCurrency(Number(item.price))}</td>
                                                <td className="px-4 py-4 text-center">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right font-medium text-gray-800">₹{formatCurrency(Number(item.price) * item.quantity)}</td>
                                            </tr>
                                        ))}
                                        {/* Shipping Row */}
                                        <tr className="border-b border-gray-200">
                                            <td colSpan={3} className="px-4 py-3 text-gray-600 flex items-center gap-2">
                                                🚚 Free shipping
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">₹0.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Order Summary Block */}
                            <div className="p-4 bg-white flex justify-end">
                                <div className="w-full sm:w-1/2 text-sm">
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-500">Discount [?]:</span>
                                        {/* <span className="text-gray-800">₹{order?.payment.payment_method}</span> */}
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-500">Shipping [?]:</span>
                                        {/* <span className="text-gray-800">₹{order?.summary.shipping}</span> */}
                                    </div>
                                    <div className="flex justify-between py-1 font-bold text-gray-800">
                                        <span>Order Total:</span>
                                        <span>₹{formatCurrency(Number(order?.payment.amount))}</span>
                                    </div>
                                    {order && "refunded" in order && (
                                        <div className="flex justify-between py-1 text-red-500">
                                            <span>Refunded:</span>
                                            {/* <span>-₹{order.refunded}</span> */}
                                        </div>
                                    )}

                                    <div className="mt-4 text-right">
                                        <button className="px-4 py-2 border border-gray-300 bg-white rounded text-sm hover:bg-gray-50 font-medium text-gray-700">
                                            Request Refund
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. ADDRESSES GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Billing Address */}
                            <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 font-semibold text-gray-700">
                                    Billing Address
                                </div>
                                <div className="p-4 text-sm text-gray-600 leading-relaxed">
                                    <p className="font-semibold text-gray-800">{order?.address.name}</p>
                                    <p>{order?.address.address_line1}</p>
                                    <p>{order?.address.address_line2}</p>
                                    <p>{order?.address.city}</p>
                                    <p>{order?.address.postal_code}</p>
                                    <p>{order?.address.country}</p>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 font-semibold text-gray-700">
                                    Shipping Address
                                </div>
                                <div className="p-4 text-sm text-gray-600 leading-relaxed">
                                    <p className="font-semibold text-gray-800">{order?.address.name}</p>
                                    <p>{order?.address.address_line1}</p>
                                    <p>{order?.address.address_line2}</p>
                                    <p>{order?.address.city}</p>
                                    <p>{order?.address.postal_code}</p>
                                    <p>{order?.address.country}</p>
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* ================= RIGHT COLUMN ================= */}
                    <div className="space-y-6">

                        {/* 3. GENERAL DETAILS CARD */}
                        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 font-semibold text-gray-700">
                                General Details
                            </div>
                            <div className="p-4 text-sm space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm  font-bold">Order status:</span>

                                    {isEditingStatus ? (
                                        <div className="flex items-center gap-1.5">
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                autoFocus
                                                className="text-sm border border-gray-300 rounded-md px-2 py-1
                   focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            >
                                                {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                                                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleStatusChange}
                                                className="text-sm px-2.5 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditingStatus(false)}
                                                className="text-sm px-2 py-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium px-2.5 py-1 rounded-md ${STATUS_CONFIG[order?.order_status as OrderStatus]?.className}`}>
                                                {STATUS_CONFIG[order?.order_status as OrderStatus]?.label}
                                            </span>
                                            <button
                                                onClick={() => setIsEditingStatus(true)}
                                                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                                            >
                                                <Pencil size={16} /> Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800">Order Date:</span> {order?.created_at ? new Date(order.created_at).toLocaleString('en-GB') : "N/A"}
                                </div>
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="font-semibold text-gray-800">Earning From Order:</span> ₹{formatCurrency(Number(order?.total_amount))}
                                </div>

                                {order?.user &&
                                    <span>
                                        <div className="pt-1">
                                            <span className="font-semibold text-gray-800">Customer:</span> <span className="text-red-500 hover:underline cursor-pointer">{order?.user?.first_name} {order?.user?.last_name}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-800">Email:</span> <a href={`mailto:${order?.user?.email}`} className="text-blue-600 hover:underline">{order?.user?.email}</a>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-800">Phone:</span> {order?.user?.phone_number}
                                        </div>
                                    </span>
                                }
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col h-fit">
                            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 font-semibold text-gray-700">
                                Shipping Details
                            </div>

                            <div className="p-4 flex-grow flex flex-col gap-4">
                                {order?.shipping?.tracking_url ? (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-800">Tracking URL</h4>
                                            {/* Edit button toggles the input field */}
                                            {!isEditingUrl && (
                                                <button
                                                    onClick={() => setIsEditingUrl(true)}
                                                    className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors underline decoration-transparent hover:decoration-blue-600"
                                                >
                                                    Edit URL
                                                </button>
                                            )}
                                        </div>

                                        <a
                                            href={order.shipping.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                        >
                                            View Tracking Information
                                        </a>

                                        {/* Conditionally render the update input */}
                                        {isEditingUrl && (
                                            <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Update Tracking URL</h4>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={newTrackingUrl}
                                                        onChange={(e) => setNewTrackingUrl(e.target.value)}
                                                        className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2 text-sm"
                                                        placeholder="Enter new tracking URL..."
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            handleTrackingUrl('update');
                                                            setIsEditingUrl(false); // Hide input after updating
                                                        }}
                                                        className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditingUrl(false)}
                                                        className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="font-semibold text-gray-800 mb-2">Add Tracking URL</h4>
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={newTrackingUrl}
                                                onChange={(e) => setNewTrackingUrl(e.target.value)}
                                                className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2 text-sm"
                                                placeholder="Enter tracking URL..."
                                            />
                                            <button
                                                type="submit"
                                                onClick={() => handleTrackingUrl('add')}
                                                className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                                            >
                                                Add URL
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}