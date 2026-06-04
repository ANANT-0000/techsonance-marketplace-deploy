'use client';
import { use, useEffect, useState } from "react";
import { OrderStatus } from "@/utils/Types";
import { OrderCard } from "./OrderCard";
import { authToken } from "@/utils/authToken";
import AxiosAPI from "@/lib/axios";
import { set } from "zod";

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

export interface AddressPayload {
    name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export interface PaymentType {
    id: string;
    payment_method: string;
    payment_status: string;
    transaction_ref: string;
    amount: string;
}

// Interface for the raw JSON payload from the API
export interface OrderItemAPIResponse {
    order_status: OrderStatus;
    quantity: number;
    price: string;
    order: {
        id: string;
        total_amount: string;
        created_at: string;
        address: AddressPayload;
        payment: PaymentType;
    };
    variant: ProductVariantType;
    return_request: ReturnRequest | null;
}

// Constructed types for the UI
export interface OrderItemType {
    id: string;
    quantity: number;
    price: string;
    order_status: OrderStatus;
    variant: ProductVariantType;
    return_request: ReturnRequest | null;
}

export interface ShippingType {
    tracking_url?: string;
}

export interface Invoice {
    company_id: string;
    order_id: string;
    invoice_url: string;
}

export interface OrderType {
    id: string;
    user_id: string;
    created_at: string;
    total_amount: string;
    items: OrderItemType[];
    address: AddressPayload;
    payment: PaymentType;
    invoice: Invoice | null;
    shipping: ShippingType | null;
}

export function OrdersList({
    customerId,
    status,
    setStatus
}: {
    customerId: string;
    status: OrderStatus | 'returns' | null;
    setStatus: (status: OrderStatus | 'returns' | null) => void;
}) {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const token = authToken();
    const [tabChange,setTabChange] = useState(false);
    useEffect(() => {
        if (!customerId || !token) return;
        let isMounted = true;

        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await AxiosAPI.get(`/v1/order-items/user/${customerId}?status=${status ?? ''}&limit=${limit ?? 10}&offset=${offset ?? 0}`, {
                    
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const rawItems: OrderItemAPIResponse[] = response?.data?.data || [];
                
                // Group the flattened items by Order ID
                const orderMap = new Map<string, OrderType>();

                rawItems.forEach((item) => {
                    const orderId = item.order.id;
                    
                    if (!orderMap.has(orderId)) {
                        orderMap.set(orderId, {
                            id: orderId,
                            user_id: customerId,
                            created_at: item.order.created_at,
                            total_amount: item.order.total_amount,
                            address: item.order.address,
                            payment: item.order.payment,
                            invoice: null,  
                            shipping: null,
                            items: []
                        });
                    }

                    orderMap.get(orderId)!.items.push({
                        id: item.variant.id, // using variant id as key
                        quantity: item.quantity,
                        price: item.price,
                        order_status: item.order_status,
                        variant: item.variant,
                        return_request: item.return_request
                    });
                });

                // Convert map to array and sort by created_at descending
                const groupedOrders = Array.from(orderMap.values()).sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                if (isMounted) setOrders(groupedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchOrders();
        return () => { isMounted = false; };
    }, [customerId, token, limit,tabChange,offset]);

useEffect(() => {
    setOffset(0);   
    setTabChange(prev => !prev); 
}, [status])   
    if (isLoading) {
        return (
            <div className="space-y-4 w-full">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-40 rounded-xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }
const showMoreHandle = () => {
    setOffset((prev) => prev + limit);
    
 
}
 

    return (
        <div className="space-y-4 w-full mb-4">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} activeStatus={status} />
            ))}
            {orders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="opacity-30">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6M7 4H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1h-3M9 4a1 1 0 011-1h4a1 1 0 011 1v0a1 1 0 01-1 1h-4a1 1 0 01-1-1v0z" />
                    </svg>
                    <p className="text-sm">No orders found in this category.</p>
                </div>
            )}
            {orders.length > 0 && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={showMoreHandle}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Show More
                    </button>
                </div>
            )}
        </div>
    );
}