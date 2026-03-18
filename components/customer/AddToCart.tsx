'use client';
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/Redux store/store";
import { addToCart, removeFromCart, updateQuantity } from "@/Redux store/features/Cart";
import { toggleCartSidebar } from "@/Redux store/features/CartSidebar";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface AddToCartProps {
    productId: string;
    styles?: string;
}

export function AddToCart({ productId, styles }: AddToCartProps) {
    const dispatch = useDispatch();
    const { items } = useSelector((state: RootState) => state.cart);
    const { user } = useSelector((state: RootState) => state.auth);
    const path = usePathname();
    const router = useRouter();

    const cartItem = items?.find(item => item.id === productId);
    const quantity = cartItem ? cartItem.quantity : 0;

    const isSmall = styles?.includes("small");

    const containerBase = `flex items-center justify-center bg-brand-primary text-white rounded-lg shadow-md overflow-hidden transition-all duration-200`;
    const heightClass = isSmall ? "h-6" : "h-11";
    const debounceFunction = ({ func, delay = 300 }: { func: () => void, delay: number }) => {
        let timeoutId: any;
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func();
            }, delay);
        };
    }


    const handleIncrement = () => {
        if (!user) {
            router.push('/auth/customerLogin');
            return;
        }

        dispatch(addToCart({ id: productId, user_id: user.user_id }));

        // Only open sidebar if we aren't already on the cart page
        if (!path.includes("cart") && !path.includes("wishlist")) {
            debounceFunction({ func: () => dispatch(toggleCartSidebar('open')), delay: 300 })();
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            dispatch(updateQuantity({ id: productId, quantity: quantity - 1, user_id: user?.user_id }));

        } else {
            dispatch(removeFromCart({ id: productId, user_id: user?.user_id }));
        }
    };

    return (
        <motion.div whileHover={{ scale: 1.1 }} className={`${containerBase} ${heightClass} ${styles}  `}>
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
                        className="flex h-full w-full items-center justify-center gap-2  whitespace-nowrap"
                    >
                        <ShoppingCart size={isSmall ? 18 : 22} />

                    </motion.button>
                ) : (
                    <motion.div
                        key="counter-ui"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex  h-full w-full items-center justify-evenly "
                    >
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleDecrement}
                            className="h-full   flex items-center justify-center flex-1 hover:bg-black/10 transition-colors"
                        >
                            <Minus size={16} />
                        </motion.button>

                        <motion.span
                            key={quantity}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="font-bold   flex-1 text-xs  text-center"
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