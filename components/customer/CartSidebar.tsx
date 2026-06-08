'use client';
import { useEffect, useRef, useState } from "react";
import { AddToCart } from "./AddToCart";
import { BuyBtn } from "./BuyBtn";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useMediaQuery } from "react-responsive";
import { RootState } from "@/lib/store";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
 
import { BuyBtnMode } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import { X, ShoppingBag, ArrowRight, Package, Tag, ChevronRight } from "lucide-react";

import { loadCart } from "@/lib/features/Cart";
import { CartItemListResponse } from "@/app/(storefront)/customer/cart/CartClient";

// ─── Skeleton for cart items while loading ────────────────────────────────────
const CartItemSkeleton = () => (
    <div className="flex items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="w-24 h-9 rounded-xl bg-gray-100 shrink-0" />
    </div>
);

// ─── Empty cart illustration ──────────────────────────────────────────────────
const EmptyCart = () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <ShoppingBag size={36} strokeWidth={1.2} className="text-gray-300" />
            </div>
        </div>
        <div>
            <p className="text-base font-bold text-gray-800">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                Looks like you haven't added anything yet.
            </p>
        </div>
    </div>
);

// ─── Mobile toast notification ────────────────────────────────────────────────
const MobileToast = ({ item }: { item: CartItemListResponse | undefined }) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 z-[80] flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-2xl"
    >
        {/* Thumbnail */}
        {item?.productVariant?.images?.[0]?.image_url ? (
            <img
                src={item.productVariant.images[0].image_url}
                alt={item.productVariant.variant_name}
                className="w-10 h-10 rounded-xl object-cover shrink-0 bg-white/10"
            />
        ) : (
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShoppingBag size={16} className="text-white/60" />
            </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Added to cart</p>
            <p className="text-sm font-bold text-white truncate mt-0.5">
                {item?.productVariant?.variant_name ?? 'Item'}
            </p>
        </div>

        {/* Checkmark */}
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function CartSidebar() {
    const { isCartOpen } = useAppSelector((state: RootState) => state.cartSidebar);
    const isMobile = useMediaQuery({ maxWidth: 768 }); 
    const { itemList, loading: isLoading, cartId } = useAppSelector((state: RootState) => state.cart);
    const dispatch = useAppDispatch();
    const token = authToken();

    // Fetch cart list whenever sidebar opens
    useEffect(() => {
        if (isCartOpen) {
            dispatch(loadCart());
        }
    }, [isCartOpen, dispatch]);

    // Auto-dismiss mobile toast after 2.5 s
    useEffect(() => {
        if (isCartOpen && isMobile) {
            const id = setTimeout(() => dispatch(toggleCartSidebar('close')), 2500);
            return () => clearTimeout(id);
        }
    }, [isCartOpen, isMobile, dispatch]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isCartOpen) dispatch(toggleCartSidebar('close'));
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isCartOpen, dispatch]);

    // ── Computed values ───────────────────────────────────────────────────────
    const subtotal = itemList.reduce((sum, item) => {
        const price = Number(item.productVariant?.price ?? 0);
        return sum + price * item.quantity;
    }, 0);

    const itemCount = itemList.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
    const lastAddedItem = itemList[itemList.length - 1];

    // ── Mobile: pill toast ────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <AnimatePresence>
                {isCartOpen && <MobileToast item={lastAddedItem} />}
            </AnimatePresence>
        );
    }

    // ── Desktop: slide-in sidebar ─────────────────────────────────────────────
    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => dispatch(toggleCartSidebar('close'))}
                        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
                        aria-hidden="true"
                    />

                    {/* Sidebar panel */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 260 }}
                        className="fixed right-0 top-0 z-[70] h-[100dvh] w-full max-w-[420px] bg-white shadow-2xl flex flex-col"
                        aria-label="Shopping cart"
                    >
                        {/* ── Header ─────────────────────────────────────────── */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-gray-900 rounded-xl">
                                    <ShoppingBag size={16} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 leading-tight">Your Cart</h2>
                                    {itemCount > 0 && (
                                        <p className="text-xs text-gray-400 font-medium">
                                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => dispatch(toggleCartSidebar('close'))}
                                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-colors"
                                aria-label="Close cart"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* ── Item list ──────────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {isLoading && itemList.length === 0 ? (
                                <div className="space-y-5">
                                    {[...Array(3)].map((_, i) => <CartItemSkeleton key={i} />)}
                                </div>
                            ) : itemList.length === 0 ? (
                                <EmptyCart />
                            ) : (
                                <ul className="space-y-1">
                                    <AnimatePresence mode="popLayout">
                                        {itemList.map((item, idx) => {
                                            const lineTotal = Number(item.productVariant?.price ?? 0) * item.quantity;

                                            return (
                                                <motion.li
                                                    layout
                                                    key={item.product_variant_id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="relative shrink-0">
                                                        <img
                                                            src={item.productVariant?.images?.[0]?.image_url ?? "/placeholder.png"}
                                                            alt={item.productVariant?.variant_name}
                                                            className="w-[68px] h-[68px] rounded-2xl object-cover bg-gray-50 border border-gray-100"
                                                        />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                                                            {item.productVariant?.variant_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                ₹{Number(item.productVariant?.price ?? 0).toLocaleString('en-IN')}
                                                            </span>
                                                            {item.quantity > 1 && (
                                                                <span className="text-xs text-gray-400">
                                                                    × {item.quantity} = ₹{lineTotal.toLocaleString('en-IN')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Quantity stepper — inline below name */}
                                                        <div className="mt-2.5">
                                                            <AddToCart
                                                                productVariantId={item.product_variant_id}
                                                                styles="h-8 w-28 rounded-xl border border-gray-200 bg-white text-gray-800 text-xs font-semibold"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.li>
                                            );
                                        })}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </div>

                        {/* ── Footer: Summary + CTAs ─────────────────────────── */}
                        {!isLoading && itemList.length > 0 && (
                            <div className="shrink-0 border-t border-gray-100 bg-white px-6 pt-4 pb-6 space-y-4">

                                {/* Order summary */}
                                <div className="bg-gray-50 rounded-2xl px-4 py-3.5 space-y-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Subtotal
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            ₹{subtotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Shipping
                                        </span>
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            Free
                                        </span>
                                    </div>
                                    <div className="h-px bg-gray-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-900">Total</span>
                                        <span className="text-lg font-black text-gray-900 tracking-tight">
                                            ₹{subtotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* View full cart link */}
                                <Link
                                    href="/customer/cart"
                                    onClick={() => dispatch(toggleCartSidebar('close'))}
                                    className="flex items-center justify-between w-full px-4 py-3 rounded-2xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
                                >
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                                        View full cart
                                    </span>
                                    <ChevronRight
                                        size={16}
                                        className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all"
                                    />
                                </Link>

                                {/* Checkout CTA */}
                                <BuyBtn
                                    mode={BuyBtnMode.CART}
                                    id={cartId}
                                    styles="w-full h-12 rounded-2xl bg-gray-900 text-white hover:bg-black font-bold text-sm transition-all duration-200 shadow-lg shadow-gray-900/20"
                                />

                                {/* Trust micro-copy */}
                                <p className="text-center text-[11px] text-gray-400 font-medium">
                                    🔒 Secure checkout · Free returns · GST invoice
                                </p>
                            </div>
                        )}

                        {/* Empty cart CTA */}
                        {!isLoading && itemList.length === 0 && (
                            <div className="shrink-0 px-6 pb-6 pt-4">
                                <Link
                                    href="/"
                                    onClick={() => dispatch(toggleCartSidebar('close'))}
                                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all"
                                >
                                    Continue Shopping
                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}