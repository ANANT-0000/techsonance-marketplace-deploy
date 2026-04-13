'use client';
import { useEffect, useRef, useState } from "react";
import { AddToCart } from "./AddToCart";
import { BuyBtn } from "./BuyBtn";
import { WishListBtn } from "./WishListBtn";
import { Pagination } from "../common/Pagination";
import Link from "next/link";
import { FilterSidebar } from "./FilterSidebar";
import { useMediaQuery } from "react-responsive";
import { ProductSkeleton } from "../common/ProductSkeleton";
import { motion, MotionConfig } from "motion/react";
import type { RootState } from "@/lib/store";

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { ProductType } from "@/utils/Types";
import { formatCurrency } from "@/lib/utils";

export function ShoppingList({
    products, styles
}: {
    products: ProductType[];
    styles?: string;
}) {
    console.log(products)
    const pageSize = 8;
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const [count, setCount] = useState(1);
    const totalPages = Math.ceil(products.length / pageSize);
    const firstIndex = (count - 1) * pageSize;
    const lastIndex = firstIndex + pageSize - 1;
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const sectionRef = useRef<HTMLElement>(null);

    const handleScroll = () => {
        window.scrollTo(
            {
                top: 0,
                behavior: 'smooth'
            }
        )
    }
    console.log("firstIndex, lastIndex", firstIndex, lastIndex);
    const productsToShow: ProductType[] = products
    console.log("productsToShow", productsToShow);
    return (
        <>
            <MotionConfig transition={{ duration: 0.4, ease: "easeInOut" }}>
                <motion.section ref={sectionRef} transition={{ type: 'keyframes', }} className={`w-full  ${styles} `}>
                    <span className="flex gap-8   mb-0">
                        <FilterSidebar PRODUCT_LIST={products} />

                        <ul className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 gap-2 items-start ">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))
                            ) :
                                (
                                    productsToShow.map((product, idx) => (
                                        <li key={idx} className="flex flex-col justify-between text-lg text-gray-700 hover:text-gray-900 cursor-pointer border-2 border-gray-200 rounded-lg p-4 relative  transition-shadow hover:shadow-md "
                                        >

                                            <div className="flex flex-col h-full">
                                                <WishListBtn productVariantId={product.variants && product.variants.length > 0 ? product.variants[0].id : ''} styles="absolute top-2 right-6 z-10" />

                                                <Link href={`/shopping/${product.id}`} className="block overflow-hidden rounded-lg">
                                                    <img loading="lazy"
                                                        className="w-full object-contain lg:aspect-9/14 aspect-9/12 rounded-lg mb-4 transform hover:scale-105 transition-transform duration-300"
                                                        src={product.images[0].image_url ? product.images[0].image_url : "https://placehold.net/10.png"}
                                                        alt={product.name.trim()}
                                                    />
                                                </Link>
                                                <h3 className="font-semibold text-sm lg:line-clamp-1 line-clamp-2 leading-4 mb-1">{product.name}</h3>
                                                <p className="lg:text-sm text-xs  text-gray-500 lg:line-clamp-2 line-clamp-2 leading-5 overflow-hidden mb-4 h-10">
                                                    {product.description}
                                                </p>
                                            </div>


                                            <div className="mt-auto">
                                                <div className="flex items-baseline gap-2   flex-wrap">
                                                    <span className="font-bold  text-gray-900 lg:text-xl text-sm">₹{formatCurrency(Number(product.base_price))}</span>
                                                    {Number(product.discount_percent) > 0 && (
                                                        <>
                                                            <div className="flex gap-2  ">

                                                                <span className="text-xs line-through text-gray-400">
                                                                    ₹{formatCurrency(Math.floor(Number(product.base_price) / (1 - Number(product.discount_percent) / 100)))}
                                                                </span>
                                                                <span className="text-xs font-bold text-green-500">
                                                                    {Math.round(Number(product.discount_percent))}% off
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {
                                                    !isMobile &&
                                                    <div className={`flex gap-2 mt-2   justify-between items-center`}>
                                                        <AddToCart productVariantId={product?.variants && product.variants.length > 0 ? product.variants[0].id : ''} styles="w-full " />
                                                        <BuyBtn productId={product?.variants && product.variants.length > 0 ? product.variants[0].id : ''} styles=" scale-[.9]" />

                                                    </div>
                                                }
                                            </div>
                                        </li>
                                    ))
                                )
                            }
                        </ul>

                    </span>
                    <div className="flex justify-end">
                        <Pagination count={count} setCount={setCount} totalPages={totalPages} onPageChange={handleScroll} />
                    </div>
                </motion.section>
            </MotionConfig>
        </>
    )
}
