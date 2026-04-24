'use client';

import { Suspense, useEffect, useState } from "react";
import { Address, OrderStatusEnum, UserOrder } from "@/utils/Types";
import { OrderCard } from "./OrderCard";
import { fetchUserOrderHistory } from "@/utils/customerApiClient";
import { useMediaQuery } from "react-responsive";
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
    id: string;
    quantity: number;
    price: string;
    order_status: OrderStatusEnum;
    variant: ProductVariantType;
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

    created_at: string;
    total_amount: string;
    items: OrderItemType[];
    address: Address;
    payment: PaymentType;
    shipping: unknown | null;
}

export function OrdersList({
    customerId,
    status,
}: {
    customerId: string,
    status: OrderStatusEnum,
}) {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = useMediaQuery({ maxWidth: 640 });
    const [isMounted, setIsMounted] = useState(true);
    useEffect(() => {
        if (!customerId) return;
        let isMounted = true;
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await fetchUserOrderHistory(customerId);
                if (isMounted) {
                    setOrders(response?.data || []);
                    console.log(response?.data);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchOrders();
        return () => {
            isMounted = false;
        };
    }, [customerId]);
    console.log('order', orders)
    const filteredOrders = !isMobile ? orders.filter(order => order.order_status !== status) : orders;

    return (

        <div className="space-y-4 w-full">
            {filteredOrders.map(order => (
                <div key={order.id}>
                    <OrderCard order={order} />

                </div>
            ))}
            {filteredOrders.length === 0 && (
                <p className="text-gray-500 text-center py-10">
                    No {status} orders found.
                </p>
            )}
        </div>

    );
}