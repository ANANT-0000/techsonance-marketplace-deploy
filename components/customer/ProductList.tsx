'use client';
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useAnimate, } from "motion/react";
import { useMediaQuery } from "react-responsive";
import { AddToCart } from "./AddToCart";
import { BuyBtn } from "./BuyBtn";
import { WishListBtn } from "./WishListBtn";
import Link from "next/link";
import { ProductType } from "@/utils/Types";

export function ProductList({ products = [], styles }: { products?: ProductType[], styles?: string }) {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
    const [scope, animate] = useAnimate()
    const itemsPerPage = isMobile ? 1 : isTablet ? 2 : 4
    const [currentIndex, setCurrentIndex] = useState(0);
    const maxIndex = Math.max(0, products.length - itemsPerPage);
    const canScrollPrev = currentIndex > 0;
    const canScrollNext = currentIndex < maxIndex;
    const scrollTo = (index: number) => {
        let newIndex = index;
        if (index < 0) newIndex = 0;
        if (index > maxIndex) newIndex = maxIndex;

        setCurrentIndex(newIndex);
    };
    // Update animation whenever index changes
    useEffect(() => {
        animate(scope.current, {
            x: `-${currentIndex * (100 / itemsPerPage)}%`,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        })
        return () => {
            animate(scope.current, { x: 0 })
        }
    }, [currentIndex, itemsPerPage, scope]);
    if (!products || products.length === 0) return null;
    return (
        <section className={`w-full mx-auto relative group ${styles} my-8`}>
            <div className="flex items-center justify-end gap-2 mb-4 px-4">
                <button
                    disabled={!canScrollPrev}
                    onClick={() => scrollTo(currentIndex - 1)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center border transition-all
                        ${canScrollPrev
                            ? 'bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 shadow-sm'
                            : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    disabled={!canScrollNext}
                    onClick={() => scrollTo(currentIndex + 1)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center border transition-all
                        ${canScrollNext
                            ? 'bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 shadow-sm'
                            : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            <div className="overflow-hidden w-full px-4 py-2">
                <motion.ul
                    ref={scope}
                    className="flex gap-4"
                    drag="x"
                    dragConstraints={{
                        right: 0,
                        left: -((products.length - itemsPerPage) * (isMobile ? 300 : 280)) // Approximate width for drag limits
                    }}
                    style={{
                        width: `${(products.length / itemsPerPage) * 100}%`,
                        cursor: "grab"
                    }}
                    whileTap={{ cursor: "grabbing" }}
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            className="relative "
                            style={{
                                width: `calc(${isMobile ? 55 : 100 / products.length}% - 16px)`, // 16px accounts for gap
                            }}
                        >
                            <ProductCard product={product} isMobile={isMobile} />
                        </motion.div>
                    ))}
                </motion.ul>
            </div>
        </section>
    );
}

function ProductCard({ product, isMobile }: { product: ProductType, isMobile: boolean }) {
    return (
        <li className="flex flex-col justify-between text-lg text-gray-700 hover:text-gray-900 cursor-pointer border-2 border-gray-200 rounded-lg p-4 relative  transition-shadow hover:shadow-md"
        >

            <div className="flex flex-col h-full">
                <WishListBtn productId={product.id} styles="absolute top-2 right-6 z-10" />

                <Link href={`/shopping/${product.id}`} className="block overflow-hidden rounded-lg">
                    <img
                        className="w-full object-cover lg:aspect-9/14 aspect-9/12 rounded-lg mb-4 transform hover:scale-105 transition-transform duration-300"
                        src={product.images && product.images.length > 0 ? product.images[0].image_url : "https://placehold.net/10.png"}
                        alt={product.name.trim()}
                    />
                </Link>
                <h3 className="font-semibold text-sm lg:line-clamp-1 line-clamp-2 leading-4 mb-1">{product.title}</h3>
                <p className="lg:text-sm text-xs  text-gray-500 lg:line-clamp-2 line-clamp-2 leading-5 overflow-hidden mb-4 h-10">
                    {product.description}
                </p>
            </div>


            <div className="mt-auto">
                <div className="flex items-baseline gap-2   flex-wrap">
                    <span className="font-bold  text-gray-900 lg:text-xl text-sm">₹{product.price}</span>
                    {product.discount > 0 && (
                        <>
                            <div className="flex gap-2  ">

                                <span className="text-xs line-through text-gray-400">
                                    ₹{Math.floor(product.price / (1 - product.discount / 100))}
                                </span>
                                <span className="text-xs font-bold text-green-500">
                                    {Math.round(product.discount)}% off
                                </span>
                            </div>
                        </>
                    )}
                </div>
                {
                    !isMobile &&
                    <div className={`flex gap-2 mt-2   justify-between items-center`}>
                        <AddToCart productId={product.id} styles="w-full " />
                        <BuyBtn productId={product.id} styles=" scale-[.9]" />

                    </div>
                }
            </div>
        </li>
    );
}