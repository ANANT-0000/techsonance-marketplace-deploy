'use client';
import { motion, AnimatePresence } from "motion/react";
import { AddToCart } from "@/components/customer/AddToCart";
import { BuyBtn } from "@/components/customer/BuyBtn";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeftCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import { companyDomain } from "@/config";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { VariantsType } from "@/utils/Types";
import { setItemList } from "@/lib/features/Cart";


export interface CartItemListResponse {
    id: string;
    cart_id: string;
    product_variant_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    productVariant: VariantsType;
}

// ─── PriceTicker ──────────────────────────────────────────────────────────────

const PriceTicker = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setDisplayValue(value), 50);
        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <motion.span
            key={displayValue}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block lg:text-xl text-lg text-primary-foreground"
        >
            ₹{formatCurrency(value)}
        </motion.span>
    );
};

export default function CartList() {
    const { items } = useAppSelector((state) => state.cart);
    const { userId }: { userId: string } = useParams();
    const router = useRouter();
    const [cartList, setCartList] = useState<CartItemListResponse[]>([]);
    const dispatch = useAppDispatch();
    useEffect(() => {
        const fetchCartList = async () => {
            try {
                const response = await fetchGetCartList(userId, companyDomain);

                if (!response?.data) {
                    console.warn("fetchGetCartList: unexpected response shape", response);
                    setCartList([]);
                    dispatch(setItemList([]));
                    return;
                }

                setCartList(response.data);
                dispatch(setItemList(response.data));
            } catch (error) {
                console.error("Error fetching cart list:", error);
                setCartList([]);
            }
        };

        fetchCartList();
    }, [items, userId]);

    const totalPrice = cartList.reduce((total, item) => {
        const price = Number(item.productVariant.price) || 0;
        return total + price * item.quantity;
    }, 0);

    const totalItemCount = cartList.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <main  >
            <ChevronLeftCircle
                className="my-4 block lg:hidden"
                size={36}
                onClick={() => router.back()}
            />


            <div className="lg:px-8 px-2 w-full">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
                    <p className="mb-8 text-gray-500">Confirm your items before checking out</p>
                </motion.div>
            </div>

            <div className="lg:px-8 px-2">
                {cartList.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 border-2 border-dashed rounded-2xl"
                    >
                        <p className="text-xl text-gray-400">Your cart is empty.</p>
                    </motion.div>
                ) : (
                    <section className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">

                        {/* ── Item List ── */}
                        < div className="lg:col-span-1 w-full">
                            <AnimatePresence mode="popLayout">
                                {cartList.map((item) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="flex justify-between items-start lg:gap-4 gap-2 border border-gray-200 lg:px-6 p-2 lg:py-4 mb-3 rounded-2xl lg:mb-4 bg-white shadow-sm hover:shadow-md transition-shadow h-full"
                                    >
                                        <div className="flex lg:gap-4 items-start gap-2">

                                            <img
                                                src={item.productVariant.images[0]?.image_url ?? "/placeholder.png"}
                                                alt={item.productVariant.variant_name}
                                                className="lg:w-20 lg:h-20 w-16 h-16 object-cover aspect-square rounded-xl"
                                            />
                                            <div className="flex flex-col justify-between lg:full h-16">
                                                <h3 className="lg:font-bold lg:text-lg text-xs lg:line-clamp-3 line-clamp-2 lg:leading-5">
                                                    {item.productVariant.variant_name}
                                                </h3>
                                                <p className="text-brand-primary font-semibold lg:text-md text-sm">
                                                    ₹{formatCurrency(Number(item.productVariant.price))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start gap-1">
                                            <AddToCart
                                                productVariantId={item.product_variant_id}
                                                styles="small lg:w-24 w-18"
                                            />
                                            <p className="text-xs text-gray-400">
                                                Subtotal: ₹{formatCurrency(Number(item.productVariant.price) * item.quantity)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                      
                        <motion.div
                            layout
                            className="lg:col-span-1 w-full sticky lg:top-8 top-2 border border-gray-200 lg:py-6 py-2 lg:px-6 px-2 rounded-2xl bg-gray-50/50 shadow-sm"
                        >
                            <h2 className="lg:text-xl text-lg font-bold mb-1">Order Summary</h2>
                            <p className="text-xs text-gray-400 lg:mb-6">
                                Shipping &amp; discounts applied at next step
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Items</span>
                                    <span>{totalItemCount}</span>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {cartList.map((item) => (
                                                <tr key={item.id} className="text-gray-500">
                                                    <td className="py-1 line-clamp-1 w-32">
                                                        {item.productVariant.variant_name}
                                                    </td>
                                                    <td className="py-1 text-right">
                                                        ₹{formatCurrency(Number(item.productVariant.price) * item.quantity)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="border-t-2 border-dashed border-gray-200 lg:pt-4 pt-2 mt-4">
                                    <div className="flex justify-between items-center font-bold text-xl text-primary-foreground">
                                        <span className="lg:text-xl text-lg text-primary-foreground">
                                            Total
                                        </span>
                                        <PriceTicker value={totalPrice} />
                                    </div>
                                </div>
                            </div>

                            <BuyBtn styles="lg:mt-8 mt-4 w-full lg:py-4 text-lg rounded-xl shadow-lg text-primary bg-primary-foreground"  />
                        </motion.div>

                    </section>
                )
                }
            </div >
        </main>
    );
}
