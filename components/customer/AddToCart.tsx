'use client';
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import type { RootState } from "@/lib/store";
import { addToCart, removeFromCart, loadCart } from "@/lib/features/Cart";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchAddToCart, fetchRemoveFromCart } from "@/utils/customerApiClient";
import { useEffect, useRef, useState } from "react";
import { authToken } from "@/utils/authToken";

interface AddToCartProps {
    productVariantId: string;
    styles?: string;
}

export interface CartItemResponse {
    cart_id: string;
    cart_item_id: string;
    quantity: number;
    product_variant_id: string;
    success?: boolean;
    message?: string;
}

export function AddToCart({ productVariantId, styles }: AddToCartProps) {
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state: RootState) => state.cart);
    const { user } = useAppSelector((state: RootState) => state.auth);
    const path = usePathname();
    const router = useRouter();
    const token = authToken();

    const [isSyncing, setIsSyncing] = useState(false);
    const syncingRef = useRef(false);
    const rollbackRef = useRef<{ quantity: number; cartItemId?: string; cartId?: string } | null>(null);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(loadCart());
        }
    }, [dispatch, items.length]);

    const cartItem = items?.find((item) => item.productVariantId === productVariantId);
    const quantity = cartItem?.quantity ?? 0;

    const handleIncrement = async () => {
        if (!user?.id || !token) {
            router.push('/auth/customerLogin');
            return;
        }
        if (isSyncing || syncingRef.current) return;

        const prevQuantity = quantity;
        const prevCartItemId = cartItem?.cartItemId;
        const prevCartId = cartItem?.cartId;
        const optimisticQuantity = prevQuantity + 1;

        dispatch(addToCart({
            cartId: cartItem?.cartId ?? '',
            cartItemId: cartItem?.cartItemId ?? '',
            productVariantId,
            quantity: optimisticQuantity,
        }));

        if (!path.includes("cart") && !path.includes("wishlist")) {
            dispatch(toggleCartSidebar('open'));
        }

        setIsSyncing(true);
        syncingRef.current = true;
        rollbackRef.current = { quantity: prevQuantity, cartItemId: prevCartItemId, cartId: prevCartId };

        try {
            const response = await fetchAddToCart(productVariantId, optimisticQuantity, user.id, token);
            const cartResponse: CartItemResponse = response?.data;
            if (!cartResponse?.cart_id) throw new Error('Invalid server response');
            dispatch(addToCart({
                cartId: cartResponse.cart_id,
                cartItemId: cartResponse.cart_item_id,
                productVariantId: cartResponse.product_variant_id,
                quantity: cartResponse.quantity,
            }));
            if (prevQuantity === 0) {
                dispatch(loadCart());
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            if (prevQuantity === 0) {
                dispatch(removeFromCart({ productVariantId, quantity: 0 }));
            } else {
                dispatch(addToCart({
                    cartId: prevCartId ?? '',
                    cartItemId: prevCartItemId ?? '',
                    productVariantId,
                    quantity: prevQuantity,
                }));
            }
        } finally {
            setIsSyncing(false);
            syncingRef.current = false;
            rollbackRef.current = null;
        }
    };

    const handleDecrement = async () => {
        if (!user?.id || !cartItem || !token) return;
        if (isSyncing || syncingRef.current) return;

        const prevQuantity = quantity;
        const prevCartItemId = cartItem.cartItemId;
        const prevCartId = cartItem.cartId;

        if (prevQuantity <= 1) {
            dispatch(removeFromCart({ productVariantId, quantity: 0 }));
        } else {
            dispatch(removeFromCart({ productVariantId, quantity: prevQuantity - 1 }));
        }

        setIsSyncing(true);
        syncingRef.current = true;
        rollbackRef.current = { quantity: prevQuantity, cartItemId: prevCartItemId, cartId: prevCartId };

        try {
            const response = await fetchRemoveFromCart(
                user.id,
                cartItem.cartId,
                cartItem.cartItemId,
                token
            );
            const cartResponse: CartItemResponse = response?.data;
            if (!cartResponse) throw new Error('Invalid server response');
            if (cartResponse.success && !cartResponse.quantity) {
                dispatch(removeFromCart({ productVariantId, quantity: 0 }));
            } else {
                dispatch(removeFromCart({ productVariantId, quantity: cartResponse.quantity }));
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
            dispatch(addToCart({
                cartId: prevCartId,
                cartItemId: prevCartItemId,
                productVariantId,
                quantity: prevQuantity,
            }));
        } finally {
            setIsSyncing(false);
            syncingRef.current = false;
            rollbackRef.current = null;
        }
    };

    return (
        <div className={`relative flex items-center justify-center overflow-hidden select-none transition-all duration-200 ${styles ?? ''}`}>
            <AnimatePresence mode="wait">
                {quantity === 0 ? (
                    <motion.button
                        key="add-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleIncrement}
                        disabled={isSyncing}
                        whileTap={isSyncing ? {} : { scale: 0.97 }}
                        className="flex h-full w-full items-center justify-center gap-2 px-2 disabled:opacity-50"
                    >
                        {isSyncing ? (
                            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                        ) : (
                            <ShoppingCart className="w-4 h-4 shrink-0" />
                        )}
                        <span className="text-[12px] sm:text-[13px] font-semibold tracking-wide whitespace-nowrap">Add</span>
                    </motion.button>
                ) : (
                    <motion.div
                        key="counter-ui"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-between bg-theme-primary text-theme-primary-foreground px-1 py-1 w-full h-full"
                    >
                        <motion.button
                            whileTap={isSyncing ? {} : { scale: 0.82 }}
                            onClick={handleDecrement}
                            disabled={isSyncing}
                            className="h-full aspect-square flex items-center justify-center rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
                            aria-label="Remove one"
                        >
                            <Minus size={15} strokeWidth={2.5} />
                        </motion.button>

                        <AnimatePresence mode="wait">
                            <motion.span
                                key={quantity}
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 8, opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                className="font-bold text-xs sm:text-sm min-w-[20px] text-center tabular-nums grow"
                            >
                                {quantity}
                            </motion.span>
                        </AnimatePresence>

                        <motion.button
                            whileTap={isSyncing ? {} : { scale: 0.82 }}
                            onClick={handleIncrement}
                            disabled={isSyncing}
                            className="h-full aspect-square flex items-center justify-center rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
                            aria-label="Add one more"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}