'use client';
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import type { RootState } from "@/Redux store/store";
import { PRODUCT_LIST } from "@/constants/customer";
import { AddToCart } from "@/components/customer/AddToCart";
import { BuyBtn } from "@/components/customer/BuyBtn";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftCircle } from "lucide-react";


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
            ₹{displayValue.toLocaleString()}
        </motion.span>
    );
};

export function CartList() {
    const { items } = useSelector((state: RootState) => state.cart);
    const router = useRouter()
    const cartItemsWithDetails = items.map(item => {
        const product = PRODUCT_LIST.find(p => p.id === item.id);
        return {
            ...item,
            name: product?.title || 'Unknown Product',
            price: product?.price || 0,
            imgUrl: product?.imgUrl || ''
        }
    });

    const totalPrice = cartItemsWithDetails.reduce((total, item) => total + item.price * item.quantity, 0);

    return (

        <>
            <ChevronLeftCircle className="my-4 block lg:hidden" size={36} onClick={() => router.back()} />
            <div className="lg:px-8 px-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
                    <p className="mb-8 text-gray-500">Confirm your items before checking out</p>
                </motion.div>
                {cartItemsWithDetails.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 border-2 border-dashed rounded-2xl"
                    >
                        <p className="text-xl text-gray-400">Your cart is empty.</p>
                    </motion.div>
                ) : (
                    <>


                        <section className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start">
                            {/* Item List */}
                            <div className="lg:col-span-2 w-full">
                                <AnimatePresence mode="popLayout">
                                    {cartItemsWithDetails.map(item => (
                                        <motion.div
                                            layout
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex justify-between items-start lg:gap-4 gap-2 border border-gray-200 lg:px-6 p-2 lg:py-4 mb-3  rounded-2xl lg:mb-4 bg-white shadow-sm hover:shadow-md transition-shadow h-full"
                                        >
                                            <div className="flex lg:gap-4 items-start    gap-2">
                                                <img src={item.imgUrl} alt={item.name} className="lg:w-20 lg:h-20 w-16 h-16 object-cover aspect-square rounded-xl   " />
                                                <div className="flex flex-col justify-between lg:full h-16  ">
                                                    <h3 className="lg:font-bold lg:text-lg text-xs lg:line-clamp-3 line-clamp-2 lg:leading-5">{item.name}</h3>
                                                    <p className="text-brand-primary font-semibold lg:text-md text-sm">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <AddToCart productId={item.id} styles="small lg:w-24 w-18" />
                                                <p className="text-xs text-gray-400">Subtotal: ₹{(item.price * item.quantity).toLocaleString()}</p>
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
                                <p className="text-xs text-gray-400 lg:mb-6">Shipping & discounts applied at next step</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total Items</span>
                                        <span>{items.length}</span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {cartItemsWithDetails.map(item => (
                                                    <tr key={item.id} className="text-gray-500">
                                                        <td className="py-1 line-clamp-1 w-32">{item.name}</td>
                                                        <td className="py-1 text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="border-t-2 border-dashed border-gray-200 lg:pt-4 pt-2 mt-4">
                                        <div className="flex justify-between items-center font-bold text-xl text-primary-foreground">
                                            <span className="lg:text-xl text-lg text-primary-foreground ">Subtotal</span>
                                            <PriceTicker value={totalPrice} />
                                        </div>
                                    </div>
                                </div>

                                <BuyBtn styles="lg:mt-8 mt-4  w-full lg:py-4  text-lg rounded-xl shadow-lg  text-primary bg-primary-foreground " />
                            </motion.div>

                        </section>
                    </>
                )}

            </div >
        </>
    );
}

export default function CartPage() {
    return <CartList />;
}