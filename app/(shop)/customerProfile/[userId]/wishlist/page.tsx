'use client';
import type { RootState } from "@/lib/store";
import { ChevronLeftCircle, X } from "lucide-react";
import { PRODUCT_LIST } from "@/constants/customer";
import { AddToCart } from "@/components/customer/AddToCart";
import { removeFromWishlist } from "@/lib/features/Wishlist";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

export default function WishlistPage() {
    const router = useRouter();
    const wishItems = useAppSelector((state: RootState) => state.wishlist);
    const wishlistItems = Array.isArray(wishItems) ? PRODUCT_LIST.filter(item => wishItems.some((wishItem: any) => wishItem.productId === item.id)) : [];
    const isMobileOrTablet = useMediaQuery({ minWidth: 340, maxWidth: 1024 });
    const isEmpty = Array.isArray(wishItems) ? wishItems.length === 0 : [];
    const dispatch = useAppDispatch();

    return (
        <>
            <ChevronLeftCircle className="my-4 block lg:hidden" size={36} onClick={() => router.back()} />
            <section className="w-full mb-[20vh] lg:ml-6">
                <h1 className="text-2xl font-bold">WishList</h1>
                <div>
                    {isEmpty ? (
                        <p className="text-gray-500 my-2">Your wishlist is empty.</p>
                    ) : (
                        <ul className="mt-2 mb-6">
                            {wishlistItems.map((item, idx) => (
                                <li key={idx} className="flex justify-between lg:px-6 px-2 lg:py-4 py-2 lg:my-4 my-2 lg:gap-6 gap-2 border-2 border-gray-200 rounded-2xl">
                                    <span className="flex lg:gap-4 gap-2 items-start">
                                        <button onClick={() => dispatch(removeFromWishlist(item.id))} className="text-gray-500 hover:text-gray-700 h-full flex items-center justify-center">
                                            <X />
                                        </button>
                                        <img src={item?.imgUrl} alt={item?.title} className="lg:w-28 w-20 aspect-square object-cover rounded-2xl" />
                                        <div className="flex flex-col gap-2">
                                            <p className="font-semibold lg:text-xl text-xs line-clamp-2">{item?.title}</p>
                                            <p className="lg:text-lg text-sm font-medium">₹ {item?.price}</p>
                                        </div>
                                    </span>
                                    <div className="flex justify-end items-center">
                                        <AddToCart productId={item.id} styles={`lg:w-24 w-16 ${isMobileOrTablet ? 'small' : ''}`} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    )
}
