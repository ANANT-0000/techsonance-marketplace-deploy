'use client';
import { ShoppingCart, Plus, Minus } from "lucide-react";
import type { RootState } from "@/lib/store";
import { addToCart, removeFromCart, loadCart } from "@/lib/features/Cart";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchAddToCart, fetchRemoveFromCart } from "@/utils/customerApiClient";
import { useEffect, useRef } from "react";
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

     
    const syncingRef = useRef(false);
     
    const rollbackRef = useRef<{ quantity: number; cartItemId?: string; cartId?: string } | null>(null);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(loadCart());
        }
    }, [dispatch]);

    const cartItem = items?.find((item) => item.productVariantId === productVariantId);
    const quantity = cartItem?.quantity ?? 0;

    const isSmall = styles?.includes("small");
    const containerBase = `flex items-center justify-center bg-brand-primary text-white rounded-lg shadow-md overflow-hidden transition-all duration-200`;
    const heightClass = isSmall ? "h-6" : "h-11";

    const handleIncrement = async () => {
        if (!user?.id || !token) {
            router.push('/auth/customerLogin');
            return;
        }
        if (syncingRef.current) return;

        const prevQuantity = quantity;
        const prevCartItemId = cartItem?.cartItemId;
        const prevCartId = cartItem?.cartId;

        // ── 1. Optimistic update — instant UI ────────────────────
        const optimisticQuantity = prevQuantity + 1;
        dispatch(addToCart({
            cartId: cartItem?.cartId ?? '',
            cartItemId: cartItem?.cartItemId ?? '',
            productVariantId,
            quantity: optimisticQuantity,
        }));

        // Open sidebar immediately (no waiting for server)
        if (!path.includes("cart") && !path.includes("wishlist")) {
            dispatch(toggleCartSidebar('open'));
        }

        // ── 2. Sync with server in background ────────────────────
        syncingRef.current = true;
        rollbackRef.current = { quantity: prevQuantity, cartItemId: prevCartItemId, cartId: prevCartId };

        try {
            const response = await fetchAddToCart(productVariantId, optimisticQuantity, user.id, token);
            const cartResponse: CartItemResponse = response?.data;

            if (!cartResponse?.cart_id) throw new Error('Invalid server response');

            // Reconcile with real server data (cart IDs may be new for first add)
            dispatch(addToCart({
                cartId: cartResponse.cart_id,
                cartItemId: cartResponse.cart_item_id,
                productVariantId: cartResponse.product_variant_id,
                quantity: cartResponse.quantity,
            }));
        } catch (error) {
            console.error("Error adding to cart:", error);
            // ── 3. Rollback to pre-click state ────────────────────
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
            syncingRef.current = false;
            rollbackRef.current = null;
        }
    };

    const handleDecrement = async () => {
        if (!user?.id || !cartItem || !token) return;
        if (syncingRef.current) return;

        const prevQuantity = quantity;
        const prevCartItemId = cartItem.cartItemId;
        const prevCartId = cartItem.cartId;

        // ── 1. Optimistic update — instant UI ────────────────────
        if (prevQuantity <= 1) {
            dispatch(removeFromCart({ productVariantId, quantity: 0 }));
        } else {
            dispatch(removeFromCart({ productVariantId, quantity: prevQuantity - 1 }));
        }

        // ── 2. Sync with server in background ────────────────────
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

            // Reconcile: server is source of truth on final quantity
            if (cartResponse.success && !cartResponse.quantity) {
                dispatch(removeFromCart({ productVariantId, quantity: 0 }));
            } else {
                dispatch(removeFromCart({ productVariantId, quantity: cartResponse.quantity }));
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
            // ── 3. Rollback ───────────────────────────────────────
            dispatch(addToCart({
                cartId: prevCartId,
                cartItemId: prevCartItemId,
                productVariantId,
                quantity: prevQuantity,
            }));
        } finally {
            syncingRef.current = false;
            rollbackRef.current = null;
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            className={`${containerBase} ${heightClass} ${styles}`}
        >
            <AnimatePresence mode="wait">
                {quantity === 0 ? (
                    <motion.button
                        key="add-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleIncrement}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="flex h-full w-full items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <ShoppingCart size={isSmall ? 18 : 22} />
                    </motion.button>
                ) : (
                    <motion.div
                        key="counter-ui"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex h-full w-full items-center justify-evenly"
                    >
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleDecrement}
                            className="h-full flex items-center justify-center flex-1 hover:bg-black/10 transition-colors"
                        >
                            <Minus size={16} />
                        </motion.button>

                        <motion.span
                            key={quantity}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="font-bold flex-1 text-xs text-center"
                        >
                            {quantity}
                        </motion.span>

                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleIncrement}
                            className="h-full flex items-center justify-center flex-1 hover:bg-black/10 transition-colors"
                        >
                            <Plus size={16} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}