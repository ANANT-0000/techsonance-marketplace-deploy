'use client';

import { useEffect, useState } from "react";
import { Address, OrderStatus, OrderStatusEnum } from "@/utils/Types";
import { OrderCard } from "./OrderCard";
import { fetchUserOrderHistory } from "@/utils/customerApiClient";

export interface ProductImageType {
    image_url: string;
}

export interface ProductVariantType {
    id: string;
    variant_name: string;
    price: string;
    images: ProductImageType[];
}

export interface ReturnRequest {
    id: string;
    status: string;
}

export interface OrderItemType {
    id: string;
    quantity: number;
    price: string;
    order_status: OrderStatus;
    variant: ProductVariantType;
    return_request: ReturnRequest | null;
}

export interface PaymentType {
    id: string;
    payment_method: string;
    payment_status: string;
    transaction_ref: string;
    amount: string;
}

export interface ShippingType {
    tracking_url?: string;
}

export interface OrderType {
    id: string;
    user_id: string;
    created_at: string;
    total_amount: string;
    items: OrderItemType[];
    address: Address;
    payment: PaymentType;
    shipping: ShippingType | null;
}

export function OrdersList({
    customerId,
    status,
}: {
    customerId: string;
    status: OrderStatus | 'returns' | null; // null = show all (mobile)
}) {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!customerId) return;
        let isMounted = true;
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await fetchUserOrderHistory(customerId);
                if (isMounted) setOrders(response?.data || []);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchOrders();
        return () => { isMounted = false; };
    }, [customerId]);

    const filteredOrders =
        status === null
            ? orders                                                          // mobile: show all
            : status === 'returns'
                ? orders.filter((o) => o.items.some((i) => i.return_request !== null))
                : orders.filter((o) => o.items.some((i) => i.order_status === status));

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-32 rounded-xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full">
            {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} activeStatus={status} />
            ))}
            {filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="opacity-30">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6M7 4H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1h-3M9 4a1 1 0 011-1h4a1 1 0 011 1v0a1 1 0 01-1 1h-4a1 1 0 01-1-1v0z" />
                    </svg>
                    <p className="text-sm">No orders found in this category.</p>
                </div>
            )}
        </div>
    );
}