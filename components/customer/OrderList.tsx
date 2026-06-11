'use client';

import { useEffect, useReducer } from "react";
import { OrderStatus, OrderStatusEnum } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import AxiosAPI from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Truck, CheckCircle2, Package, RotateCcw, XCircle } from "lucide-react";

// shadcn/ui imports
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { ORDER_LIST_TEXT } from "@/constants/customerText";

// --- TYPES ---
export interface ProductImageType { image_url: string; }
export interface ProductVariantType { id: string; product_id: string; variant_name: string; price: string; images: ProductImageType[]; }
export interface ReturnRequest { id: string; status: string; }
export interface AddressPayload { name: string; address_line_1: string; address_line_2?: string; city: string; state: string; postal_code: string; country: string; }
export interface PaymentType { id: string; payment_method: string; payment_status: string; transaction_ref: string; amount: string; }

export interface OrderItemAPIResponse {
    id?: string; // Appending id if available from the backend item row
    order_status: OrderStatus;
    quantity: number;
    price: string;
    order: { id: string; total_amount: string; created_at: string; address: AddressPayload; payment: PaymentType; };
    variant: ProductVariantType;
    return_request: ReturnRequest | null;
}

// --- STATE REDUCER ---
type OrderState = {
    items: OrderItemAPIResponse[];
    isLoading: boolean;
    limit: number;
    offset: number;
    dateFilter: 'all' | 'last30'; // Simple from-to representation for the UI pills
};

type OrderAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: OrderItemAPIResponse[]; append: boolean }
    | { type: 'FETCH_ERROR' }
    | { type: 'LOAD_MORE' }
    | { type: 'SET_DATE_FILTER'; payload: 'all' | 'last30' }
    | { type: 'RESET_PAGINATION' };

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
    switch (action.type) {
        case 'FETCH_START': return { ...state, isLoading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                items: action.append ? [...state.items, ...action.payload] : action.payload,
                isLoading: false
            };
        case 'FETCH_ERROR': return { ...state, isLoading: false };
        case 'LOAD_MORE': return { ...state, offset: state.offset + state.limit };
        case 'SET_DATE_FILTER': return { ...state, dateFilter: action.payload, offset: 0 };
        case 'RESET_PAGINATION': return { ...state, offset: 0 };
        default: return state;
    }
};

// --- HELPER COMPONENTS ---
function ItemStatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase();
    if (s === 'delivered') return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px] uppercase font-bold tracking-wider"><CheckCircle2 size={10} />{ORDER_LIST_TEXT.DELIVERED}</Badge>;
    if (s === 'shipped' || s === 'in transit') return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[10px] uppercase font-bold tracking-wider"><Truck size={10} />{status}</Badge>;
    if (s === 'pending' || s === 'processing') return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 text-[10px] uppercase font-bold tracking-wider"><Package size={10} />{status}</Badge>;
    if (s === 'cancelled') return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px] uppercase font-bold tracking-wider"><XCircle size={10} />Cancelled</Badge>;
    return <Badge variant="secondary" className="gap-1 text-[10px] uppercase font-bold tracking-wider">{status}</Badge>;
}

const OrderItemCard = ({ item }: { item: OrderItemAPIResponse }) => {
    const formattedDate = new Date(item.order.created_at).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );

    const formattedTime = new Date(item.order.created_at).toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );

    const totalPrice =
        Number(item.price) * Number(item.quantity);

    const isDelivered =
        item.order_status.toLowerCase() === "delivered";

    return (
        <Card className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">

            {/* ================= DESKTOP ================= */}
            <div className="hidden md:block">

                <div className="px-6 py-5">
                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-10">

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {ORDER_LIST_TEXT.ORDER_ID}
                                </p>
                                <p className="mt-1 font-bold">
                                    #{item.order.id.split("-")[0].toUpperCase()}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {ORDER_LIST_TEXT.PLACED_ON}
                                </p>
                                <p className="mt-1">
                                    {formattedDate}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {ORDER_LIST_TEXT.TOTAL_AMOUNT}
                                </p>
                                <p className="mt-1 font-bold text-primary">
                                    ₹{formatCurrency(Number(item.order.total_amount))}
                                </p>
                            </div>

                        </div>

                        <ItemStatusBadge status={item.order_status} />
                    </div>
                </div>

                <Separator />

                <CardContent className="p-6">

                    <div className="flex gap-5">

                        <Link
                            href={`/store?productId=${item.variant.product_id}&variantId=${item.variant.id}`}
                            className="shrink-0"
                        >
                            <div className="w-28 h-28 rounded-2xl border bg-muted/30 p-3">
                                <Image
                                    src={
                                        item.variant.images?.[0]?.image_url ||
                                        "https://placehold.co/300x300"
                                    }
                                    alt={item.variant.variant_name}
                                    width={120}
                                    height={120}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </Link>

                        <div className="flex-1 min-w-0">

                            <Link
                                href={`/store?productId=${item.variant.product_id}&variantId=${item.variant.id}`}
                            >
                                <h3 className="md:text-lg text-base font-bold line-clamp-2">
                                    {item.variant.variant_name}
                                </h3>
                            </Link>

                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{ORDER_LIST_TEXT.QTY} {item.quantity}</span>
                                <span>•</span>
                                <span>
                                    {ORDER_LIST_TEXT.UNIT} ₹{formatCurrency(Number(item.price))}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-muted-foreground">
                                {ORDER_LIST_TEXT.ORDERED_ON} {formattedDate} {ORDER_LIST_TEXT.AT} {formattedTime}
                            </p>

                        </div>

                        <div className="w-[180px] flex flex-col gap-2 justify-center">

                            <Button
                                variant="outline"
                                asChild
                                className=" rounded-xl"
                            >
                                <Link href={`/customer/orders/${item.order.id}`}>
                                    {ORDER_LIST_TEXT.VIEW_DETAILS}
                                </Link>
                            </Button>
                            {isDelivered ?
                                <Link href={`/store?productId=${item.variant.product_id}&variantId=${item.variant.id}`} className="py-1.5 rounded-xl bg-black hover:bg-black/90 text-white flex items-center justify-center">
                                    {ORDER_LIST_TEXT.BUY_AGAIN}
                                </Link>
                                :
                                <Link href={`/customer/orders/${item.order.id}`} className="py-1.5 rounded-xl bg-black hover:bg-black/90 text-white flex  items-center justify-center">
                                    {ORDER_LIST_TEXT.TRACK_ORDER}
                                </Link>
                            }

                        </div>

                    </div>

                </CardContent>

            </div>

            {/* ================= MOBILE ================= */}

            <div className="md:hidden p-4">

                {/* Header */}

                <div className="flex items-center justify-between mb-4">

                    <div>
                        <p className="text-sm text-muted-foreground">
                            {ORDER_LIST_TEXT.ORDER} #{item.order.id.split("-")[0].toUpperCase()}
                        </p>
                    </div>

                    <ItemStatusBadge status={item.order_status} />
                </div>

                {/* Product Row */}

                <div className="flex gap-3">

                    <Link
                        href={`/store?productId=${item.variant.product_id}&variantId=${item.variant.id}`}
                        className="shrink-0"
                    >
                        <div className="w-20 h-20 rounded-xl border bg-muted/30 p-2">
                            <Image
                                src={
                                    item.variant.images?.[0]?.image_url ||
                                    "https://placehold.co/300x300"
                                }
                                alt={item.variant.variant_name}
                                width={80}
                                height={80}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </Link>

                    <div className="flex-1 min-w-0">

                        <Link
                            href={`/store?productId=${item.variant.product_id}&variantId=${item.variant.id}`}
                        >
                            <h3 className="font-bold text-base leading-tight line-clamp-2">
                                {item.variant.variant_name}
                            </h3>
                        </Link>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {formattedDate}, {formattedTime}
                        </p>

                        <p className="mt-2 text-xl font-bold">
                            ₹{formatCurrency(totalPrice)}
                        </p>

                    </div>

                </div>

                {/* Actions */}

                <div className="grid grid-cols-2 gap-2 mt-4">

                    <Button
                        variant="outline"
                        asChild
                        className=" rounded-xl"
                    >
                        <Link href={`/customer/orders/${item.order.id}`}>
                            {ORDER_LIST_TEXT.VIEW_DETAILS}
                        </Link>
                    </Button>
                    {isDelivered ?
                        <Link href={`/store?productId=${item.variant.product_id}&variantId=${item.variant.id}`} className="py-1.5 rounded-xl bg-black hover:bg-black/90 text-white flex items-center justify-center">
                            {ORDER_LIST_TEXT.BUY_AGAIN}
                        </Link>
                        :
                        <Link href={`/customer/orders/${item.order.id}`} className="py-1.5 rounded-xl bg-black hover:bg-black/90 text-white flex  items-center justify-center">
                            {ORDER_LIST_TEXT.TRACK_ORDER}
                        </Link>
                    }

                </div>

            </div>

        </Card>
    );
};
// --- MAIN LIST COMPONENT ---
export function OrdersList({
    customerId,
    status,
    setStatus,
}: {
    customerId: string | null | undefined;
    status: OrderStatus | 'returns' | null;
    setStatus: (status: OrderStatus | 'returns' | null) => void;
}) {
    const [state, dispatch] = useReducer(orderReducer, {
        items: [],
        isLoading: true,
        limit: 10,
        offset: 0,
        dateFilter: 'all',
    });

    const token = authToken();

    // Fetch Logic
    useEffect(() => {
        if (!customerId || !token) return;
        let isMounted = true;

        const fetchOrderItems = async () => {
            if (!customerId || !token) {
                dispatch({ type: 'FETCH_ERROR' });
                return;
            }
            if (state.offset === 0) dispatch({ type: 'FETCH_START' });

            try {
                // Pass domain or date filters as needed to match your backend signature
                const dateQuery = state.dateFilter === 'last30' ? `&date=last30days` : '';
                const response = await AxiosAPI.get(
                    `/v1/order-items/user/${customerId}?status=${status ?? ''}&limit=${state.limit}&offset=${state.offset}${dateQuery}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const rawItems: OrderItemAPIResponse[] = response?.data?.data || [];

                if (isMounted) {
                    dispatch({
                        type: 'FETCH_SUCCESS',
                        payload: rawItems,
                        append: state.offset > 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch order items:", error);
                if (isMounted) dispatch({ type: 'FETCH_ERROR' });
            }
        };

        fetchOrderItems();
        return () => { isMounted = false; };
    }, [customerId, token, state.limit, state.offset, status, state.dateFilter]);

    // Reset pagination when parent status changes
    useEffect(() => {
        dispatch({ type: 'RESET_PAGINATION' });
    }, [status]);

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Filter Pills Header */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                    variant={status === null && state.dateFilter === 'all' ? "default" : "secondary"}
                    className={`rounded-full h-8 text-xs font-semibold px-4 shrink-0 ${status === null && state.dateFilter === 'all' ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => { setStatus(null); dispatch({ type: 'SET_DATE_FILTER', payload: 'all' }); }}
                >
                    {ORDER_LIST_TEXT.ALL_ORDERS}
                </Button>
                <Button
                    variant={state.dateFilter === 'last30' ? "default" : "secondary"}
                    className={`rounded-full h-8 text-xs font-semibold px-4 shrink-0 ${state.dateFilter === 'last30' ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => { setStatus(null); dispatch({ type: 'SET_DATE_FILTER', payload: 'last30' }); }}
                >
                    {ORDER_LIST_TEXT.LAST_30_DAYS}
                </Button>
                <Button
                    variant={status === OrderStatusEnum.DELIVERED ? "default" : "secondary"}
                    className={`rounded-full h-8 text-xs font-semibold px-4 shrink-0 ${status === OrderStatusEnum.DELIVERED ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setStatus(OrderStatusEnum.DELIVERED)}
                >
                    {ORDER_LIST_TEXT.DELIVERED}
                </Button>
            </div>

            {/* List Body */}
            {state.isLoading && state.offset === 0 ? (
                <div className="space-y-4 w-full">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="w-full h-48 md:h-56 rounded-2xl bg-gray-100" />)}
                </div>
            ) : (
                // Added pb-24 here specifically to ensure it clears the mobile TabNavBar!
                <div className="space-y-4 w-full pb-24 md:pb-8">
                    {state.items.map((item, index) => (
                        <OrderItemCard key={item.id ?? `${item.order.id}-${item.variant.id}-${index}`} item={item} />
                    ))}

                    {state.items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 border border-dashed border-border rounded-2xl bg-gray-50/50">
                            <Package size={40} className="text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">{ORDER_LIST_TEXT.NO_ORDER_ITEMS}</p>
                        </div>
                    )}

                    {/* Load More Button 
                      Logic changed: Now shows if the current items fetched is equal to or greater than the limit,
                      meaning there is likely another page to fetch. 
                    */}
                    {state.items.length >= state.limit && (
                        <div className="flex justify-center mt-6 pt-4">
                            <Button
                                onClick={() => dispatch({ type: 'LOAD_MORE' })}
                                variant="secondary"
                                className="w-full md:w-auto px-8 h-12 md:h-10 rounded-full bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-semibold border border-blue-100/50 shadow-sm"
                                disabled={state.isLoading}
                            >
                                {state.isLoading ? ORDER_LIST_TEXT.LOADING : ORDER_LIST_TEXT.LOAD_PREVIOUS}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}