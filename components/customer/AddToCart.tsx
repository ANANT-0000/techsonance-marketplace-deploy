'use client';
import { ShoppingCart, Plus, Minus } from "lucide-react";
import type { RootState } from "@/lib/store";
import { addToCart, removeFromCart, loadCart } from "@/lib/features/Cart";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { companyDomain } from "@/config";
import { fetchAddToCart, fetchRemoveFromCart } from "@/utils/customerApiClient";
import { useEffect } from "react";

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
    const { items, loading } = useAppSelector((state: RootState) => state.cart);
    const { user } = useAppSelector((state: RootState) => state.auth);
    const path = usePathname();
    const router = useRouter();


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


    const debounce = (func: () => void, delay = 300) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(func, delay);
        };
    };

    const handleIncrement = async () => {
        if (!user) {
            router.push('/auth/customerLogin');
            return;
        }

        try {
            const newQuantity = quantity === 0 ? 1 : quantity + 1;
            const response = await fetchAddToCart(productVariantId, newQuantity, user.id, companyDomain);
            const cartResponse: CartItemResponse = response.data;


            dispatch(addToCart({
                cartId: cartResponse.cart_id,
                cartItemId: cartResponse.cart_item_id,
                productVariantId: cartResponse.product_variant_id,
                quantity: cartResponse.quantity,
            }));

            if (!path.includes("cart") && !path.includes("wishlist")) {
                debounce(() => dispatch(toggleCartSidebar('open')), 300)();
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    const handleDecrement = async () => {
        if (!user || !cartItem) return;

        try {
            const response = await fetchRemoveFromCart(
                user.id,
                cartItem.cartId,
                cartItem.cartItemId,
                companyDomain
            );
            const cartResponse: CartItemResponse = response.data;

            // If quantity hit 0 → item deleted on server (success: true, no quantity)
            if (cartResponse.success && !cartResponse.quantity) {
                dispatch(removeFromCart({ productVariantId, quantity: 0 }));
            } else {
                dispatch(removeFromCart({ productVariantId, quantity: cartResponse.quantity }));
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
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
                        disabled={loading}
                        className="flex h-full w-full items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
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