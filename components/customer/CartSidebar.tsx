'use client';
import { useEffect, useRef, useState } from "react";

import { AddToCart } from "./AddToCart";

import { X, ShoppingBag } from "lucide-react";
import { BuyBtn } from "./BuyBtn";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useMediaQuery } from "react-responsive";
import { RootState } from "@/lib/store";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { setItemList } from "@/lib/features/Cart";
import { CartItemListResponse } from "@/app/(shop)/customerProfile/[userId]/cart/page";
import { BuyBtnMode } from "@/utils/Types";



export function CartSidebar() {
  const { isCartOpen } = useAppSelector((state: RootState) => state.cartSidebar);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { items, cartId, itemList } = useAppSelector((state: RootState) => state.cart);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [cartList, setCartList] = useState<CartItemListResponse[]>([]);
  useEffect(() => {
    const fetchCartList = async () => {
      if (user?.id) {
        try {
          const response = await fetchGetCartList(user.id);

          setCartList(response.data || []);
        } catch (error) {
          console.error("Error fetching cart list:", error);
        }
      }
    };
    fetchCartList();
  }, [isCartOpen, items]);
  useEffect(() => {
    if (isCartOpen && isMobile) {
      const timeoutId = setTimeout(() => {
        dispatch(toggleCartSidebar('close'));
      }, 2500);
      return () => clearTimeout(timeoutId);
    }
  }, [isCartOpen, isMobile])

  if (isMobile) {
    return (
      <AnimatePresence>
        {
          isCartOpen && (
            <motion.div
              initial={{ opacity: 0, translateY: -30 }}
              animate={{ opacity: 1, translateY: 20 }}
              exit={{ opacity: 0, translateY: -30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              key={cartList.length}
              className="fixed z-70  w-full flex  items-center justify-center gap-6  "
            >

              {
                cartList.length !== 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className=" flex   items-center justify-center left-1/2 right-1/2 bg-brand-primary/50 backdrop-blur-lg   rounded-full  w-20 h-20  gap-4">
                    <ShoppingBag size={24} strokeWidth={1} />
                  </motion.div>
                )
              }
            </motion.div>
          )
        }
      </AnimatePresence>
    )
  }
  return (
    <AnimatePresence>

      {isCartOpen && (
        <>
          <motion.aside
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onMouseLeave={() => dispatch(toggleCartSidebar('close'))}

            className="fixed right-0 top-0 z-[70] h-[100dvh] max-w-xl   bg-white shadow-2xl flex flex-col"
          >

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-primary" />
                <h1 className="text-xl font-bold text-gray-800">Your Cart</h1>
              </div>
              <button
                onClick={() => dispatch(toggleCartSidebar('close'))}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>


            <div className="flex-1 overflow-y-auto p-6">
              {cartList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <ul className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {cartList.map((item, idx) => (
                      <motion.li
                        layout
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex justify-between items-center gap-4"
                      >
                        <div className="flex gap-4 items-center">
                          <img
                            className="aspect-square w-16 h-16 object-cover rounded-xl border border-gray-100"
                            src={item.productVariant.images[0]?.image_url ?? "/placeholder.png"}
                            alt={item.productVariant.variant_name}
                          />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.productVariant.variant_name}</p>
                            <p className="text-brand-primary font-bold text-sm">₹{item.productVariant.price}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <AddToCart productVariantId={item.product_variant_id} styles="small w-24" />
                          <BuyBtn mode={BuyBtnMode.CART} id={item.product_variant_id} styles="small w-24 py-1 " />
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>


            <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <Link
                onClick={() => dispatch(toggleCartSidebar('close'))}
                className="flex justify-center py-3 px-6 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                href={`/customerProfile/${user?.id}/cart`}
              >
                View Full Cart
              </Link>
              <BuyBtn mode={BuyBtnMode.CART} id={cartId} styles="w-full py-1 rounded-xl shadow-lg" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}