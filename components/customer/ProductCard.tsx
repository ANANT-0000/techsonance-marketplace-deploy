'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { WishListBtn } from './WishListBtn';
import { AddToCart } from './AddToCart';
import { BuyBtn } from './BuyBtn';
import { BuyBtnMode, Product } from '@/utils/Types';
import { formatCurrency } from '@/lib/utils';

export function ProductCard({ product, idx }: { product: Product; idx: number }) {
    const primaryImage = product.variants?.[0]?.images?.[0]?.image_url ?? 'https://placehold.net/400x500.png';
    const variantId = product.variants?.[0]?.id ?? '';

    return (
        <motion.li
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.25 }}
            className="group flex flex-col cursor-pointer bg-white border border-gray-100 rounded-[20px] overflow-hidden hover:shadow-lg transition-all duration-300 relative h-full list-none"
        >
            <div className="relative aspect-square md:aspect-[4/5] bg-[#F8F9FA] overflow-hidden">
                <WishListBtn productVariantId={variantId} styles="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center rounded-full text-gray-600 hover:text-red-500 transition-colors" />
                <Link href={`/shopping/${product.id}`} className="block w-full h-full p-4">
                    <img
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        src={primaryImage}
                        alt={product.name?.trim()}
                    />
                </Link>
            </div>

            <div className="p-4 flex flex-col flex-grow bg-white">
                <div className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
                    {product.category?.name || 'Category'}
                </div>
                <Link href={`/shopping/${product.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-[15px] leading-tight mb-3 line-clamp-2">
                        {product.name}
                    </h3>
                </Link>
                
                <div className="mt-auto">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="font-bold text-gray-900 text-lg">
                                ${formatCurrency(Number(product.base_price))}
                            </span>
                            {Number(product.discount_percent) > 0 && (
                                <span className="text-xs line-through text-gray-400 ml-1.5 font-medium">
                                    ${formatCurrency(Math.floor(Number(product.base_price) / (1 - Number(product.discount_percent) / 100)))}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Always-Visible Action Buttons */}
                    {variantId && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col xl:flex-row gap-2 w-full">
                            <AddToCart 
                                productVariantId={variantId} 
                                styles="flex-1 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors" 
                            />
                            <BuyBtn 
                                id={variantId} 
                                mode={BuyBtnMode.QUICK_BUY} 
                                styles="flex-1 h-10 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg flex items-center justify-center text-gray-900 transition-colors" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.li>
    );
}
