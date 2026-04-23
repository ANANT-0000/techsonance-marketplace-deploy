"use client";
import { formatCurrency } from "@/lib/utils";
import { Address, OrderStatusEnum, Product, UserOrder, Variant } from "@/utils/Types";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { useState, useRef, useEffect } from "react";

export interface ProductImageType {
    image_url: string;
}

export interface ProductVariantType {
    id: string;
    variant_name: string;
    price: string;
    images: ProductImageType[];
}

export interface OrderItemType {
    quantity: number;
    price: string;
    productVariant: ProductVariantType;
}

export interface PaymentType {
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

export interface OrderType {
    id: string;
    user_id: string;
    order_status: OrderStatusEnum;
    created_at: string;
    total_amount: string;
    items: OrderItemType[];
    address: Address; // Assuming Address matches the JSON payload structure from earlier
    payment: PaymentType;
    shipping: unknown | null;
}

export const OrderCard = ({ order }: { order: OrderType }) => {
    const isMobile = useMediaQuery({ maxWidth: 640 });

    // 1. State and Ref for the Address Dropdown
    const [showAddress, setShowAddress] = useState(false);
    const addressRef = useRef<HTMLDivElement>(null);

    // 2. Click outside handler to close the dropdown gracefully
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addressRef.current && !addressRef.current.contains(event.target as Node)) {
                setShowAddress(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isMobile) {
        return (
            <motion.div className="w-full flex flex-col border border-gray-200 shadow-sm rounded-xl p-4 gap-4 bg-white">

                {/* 1. Header: Status, Date, and Total */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div className="flex flex-col gap-1">
                        {order.order_status === 'delivered' ? (
                            <p className="text-green-600 font-bold text-sm">Delivered</p>
                        ) : (
                            <p className="text-orange-600 font-bold text-sm">Pending</p>
                        )}
                        <p className="text-xs text-gray-500">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-sm font-bold text-gray-900">₹{formatCurrency(Number(order.total_amount))}</p>
                    </div>
                </div>

                {/* 2. Ship To Address (Accordion Style for Mobile/Tablet) */}
                <div className="border-b border-gray-100 pb-3">
                    <p className="text-xs text-gray-500 mb-1">Ship To</p>
                    <button
                        className="text-blue-500 hover:text-blue-700 text-sm focus:outline-none flex items-center justify-between w-full"
                        onClick={() => setShowAddress(!showAddress)}
                    >
                        <span className="font-medium text-left truncate max-w-[85%]">
                            {order.address ? order.address.name : 'N/A'}
                        </span>

                        <motion.span
                            animate={{ rotate: showAddress ? 180 : 0 }}
                            className="text-[10px]"
                        >
                            &#9660;
                        </motion.span>
                    </button>

                    <AnimatePresence>
                        {showAddress && order.address && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100"
                            >
                                <p className="font-semibold text-gray-800 mb-1">{order.address.name}</p>
                                <p>{order.address.address_line1}</p>
                                {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                                <p>{order.address.city}, {order.address.state} {order.address.postal_code}</p>
                                <p>{order.address.country}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Order Items (UPDATED TO MATCH YOUR IMAGE DESIGN) */}
                <div className="flex flex-col gap-3">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">

                            {/* Image Container: Gray background matching the design */}
                            <div className="w-24 sm:w-28 bg-[#f7f7f7] flex-shrink-0 flex items-center justify-center p-2">
                                <img
                                    src={item.productVariant.images[0]?.image_url || "https://placehold.co/150x150/f9fafb/333333?text=Product"}
                                    alt={item.productVariant.variant_name}
                                    className="w-full h-auto object-contain mix-blend-multiply"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="p-3 flex flex-col justify-center w-full">
                                <Link
                                    href={`/shop/product/${item.productVariant.id}`}
                                    /* line-clamp-1 keeps it to one line on phones, sm:line-clamp-2 allows 2 lines on tablets */
                                    className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 sm:line-clamp-2 hover:underline mb-1"
                                >
                                    {item.productVariant.variant_name}
                                </Link>

                                <span className="text-xs sm:text-sm text-gray-500">
                                    Qty: {item.quantity} | ₹{formatCurrency(Number(item.price))}
                                </span>
                            </div>

                        </div>
                    ))}
                </div>

                {/* 4. Footer Actions */}
                <div className="flex justify-between items-center pt-2 mt-1">
                    <Link href={`/shop/order-details/${order.id}`} className="text-xs sm:text-sm font-medium text-blue-500 hover:underline">
                        View Details
                    </Link>
                    {order.order_status === 'delivered' && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="text-xs sm:text-sm px-4 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 font-medium text-gray-700"
                        >
                            Write Review
                        </motion.button>
                    )}
                </div>

            </motion.div>
        )
    }
    return (
        <motion.div className="w-full border-2 border-gray-300 rounded-xl p-4">
            <header className="flex justify-between items-start mb-4 border-b-2 border-gray-200 pb-2">
                <span className="flex gap-8">
                    <div className="text-gray-500">
                        <h3 className="mb-1 text-xs font-semibold">ORDER PLACED</h3>
                        <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-gray-500">
                        <h3 className="mb-1 text-xs font-semibold">TOTAL AMOUNT</h3>
                        <p className="text-sm">₹{formatCurrency(Number(order.total_amount))}</p>
                    </div>

                    {/* 3. The newly updated SHIP TO section */}
                    <div className="text-gray-500 relative" ref={addressRef}>
                        <h3 className="mb-1 text-xs font-semibold">SHIP TO</h3>
                        <button
                            className="text-blue-500 hover:text-blue-700 text-sm focus:outline-none flex items-center gap-1"
                            onClick={() => setShowAddress(!showAddress)}
                        >
                            {order.address ? order.address.name : 'N/A'}
                            <span className="text-[10px]">&#9660;</span> {/* Tiny down arrow */}
                        </button>

                        {/* Dropdown Content inside AnimatePresence */}
                        <AnimatePresence>
                            {showAddress && order.address && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 shadow-lg rounded-md z-50 w-64 text-sm text-gray-800"
                                >
                                    <p className="font-bold mb-1">{order.address.name}</p>
                                    <p>{order.address.address_line1}</p>
                                    {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                                    <p>{order.address.city}, {order.address.state} {order.address.postal_code}</p>
                                    <p>{order.address.country}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </span>

                <div className="text-right">
                    <h1 className="text-gray-500 text-sm mb-1">ORDER #{order.id}</h1>
                    <span className="space-x-4 text-sm">
                        <Link href={`orders/${order.id}`} className="text-blue-500 hover:underline">View Details</Link>
                        <select name="invoice" className="text-blue-500 bg-transparent cursor-pointer focus:outline-none hover:underline">
                            <option value="invoice">Invoice</option>
                            <option value="receipt">Receipt</option>
                        </select>
                    </span>
                </div>
            </header>

            {order.order_status == 'pending' && (
                <motion.div className="mb-4 text-lg font-semibold text-gray-800">
                    Order will deliver soon
                </motion.div>
            )}

            <div className="flex flex-col gap-4">
                {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center w-full">
                        <div className="flex gap-4">
                            <img
                                src={item.productVariant.images[0]?.image_url || "https://placehold.net/100x100.png"}
                                alt={item.productVariant.variant_name}
                                className="rounded-lg h-20 w-20 object-cover border border-gray-100"
                            />
                            <div className="flex flex-col justify-center items-start gap-1">
                                <Link href={`/shop/product/${item.productVariant.id}`} className="text-blue-600 hover:underline line-clamp-2 max-w-lg font-medium text-sm">
                                    {item.productVariant.variant_name}
                                </Link>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                <p className="text-sm font-semibold text-gray-800">₹{formatCurrency(Number(item.price))}</p>
                            </div>
                        </div>

                        {order.order_status === 'delivered' && (
                            <motion.button className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors self-start mt-2">
                                Write review
                            </motion.button>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    )
}