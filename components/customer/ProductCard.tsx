'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { WishListBtn } from './WishListBtn';
import { AddToCart } from './AddToCart';
import { BuyBtn } from './BuyBtn';
import { BuyBtnMode, Product } from '@/utils/Types';
import { formatCurrency } from '@/lib/utils';
import { useThemeData } from '@/hooks/useThemeData';

export function ProductCard({ product, idx }: { product: Product; idx: number }) {
    const { themeData } = useThemeData();
    const primaryImage = product.variants?.[0]?.images?.[0]?.image_url ?? 'https://placehold.net/400x500.png';
    const variantId = product.variants?.[0]?.id ?? '';

    const isGlass = themeData.card_style === 'glassmorphic';
    const cardCls = isGlass 
      ? "bg-white/45 backdrop-blur-lg border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.06)] hover:shadow-xl hover:bg-white/55"
      : "bg-white border border-gray-100 hover:shadow-lg";

    return (
        <motion.li
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.25 }}
            className={`group flex flex-col cursor-pointer overflow-hidden transition-all duration-300 relative h-full rounded-[var(--radius)] ${cardCls} shadow`}
        >
            <div className="relative aspect-square md:aspect-[4/5] bg-black/5 overflow-hidden">
                <WishListBtn productVariantId={variantId} styles="absolute md:top-3 top-0 md:right-3 right-1 z-10 md:w-9 md:h-9 w-7 h-7 bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center rounded-full text-gray-600 hover:text-red-500 transition-colors" />
                <Link href={`/store/${product.id}`} className="block w-full h-full p-4">
                    <img
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 rounded-xl"
                        src={primaryImage}
                        alt={product.name?.trim()}
                    />
                </Link>
            </div>

            <div className={`p-4 flex flex-col flex-grow ${isGlass ? 'bg-transparent' : 'bg-white'}`}>
                <div className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">
                    {product.category?.name || 'Category'}
                </div>
                <Link href={`/store/${product.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-[15px] leading-tight mb-3 line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="font-bold text-gray-900 text-lg">
                                ₹{formatCurrency(Number(product.base_price))}
                            </span>
                            {Number(product.discount_percent) > 0 && (
                                <span className="text-xs line-through text-gray-400 ml-1.5 font-medium">
                                    ₹{formatCurrency(Math.floor(Number(product.base_price) / (1 - Number(product.discount_percent) / 100)))}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Always-Visible Action Buttons (Mobile Stacked Pill Style) */}
                    {variantId && (
                        <div className="hidden lg:flex xl:flex mt-3 pt-3  justify-between items-center border-t border-gray-100  gap-2.5 w-full">
                            <AddToCart
                                productVariantId={variantId}
                                /* [&_span]:hidden hides the text so only the cart icon shows, matching the image exactly */
                                styles="w-full h-10 rounded-full bg-theme-primary border border-gray-200 hover:bg-theme-secondary text-theme-primary-foreground transition-colors cursor-pointer "
                            />
                            <BuyBtn
                                id={variantId}
                                mode={BuyBtnMode.QUICK_BUY}
                                styles="w-full h-10 bg-black border border-gray-200 hover:bg-black/90 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                                iconStyles="text-white"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.li>
    );
}