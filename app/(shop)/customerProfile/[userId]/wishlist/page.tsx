'use client';
import type { RootState } from "@/lib/store";
import { ChevronLeftCircle, X } from "lucide-react";
import { PRODUCT_LIST } from "@/constants/customer";
import { AddToCart } from "@/components/customer/AddToCart";
import { removeFromWishlist } from "@/lib/features/Wishlist";
import { useParams, useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { useEffect, useState } from "react";
import { fetchCustomerWishlist, fetchDeleteWishList } from "@/utils/customerApiClient";
import { companyDomain } from "@/config";
import Link from "next/link";
interface WishlistItemType {
    created_at: string;
    id: string;
    product_variant_id: string;
    updated_at: string;
    wishlist_id: string;
    productVariant: {
        id: string;
        variant_name: string;
        sku: string;
        price: string;
        attributes: unknown[];
        product_id: string;
        images: {
            id: string;
            image_url: string;
            product_id: string;
            variant_id: string;
        }[];
    }
    [key: string]: unknown;
};
export default function WishlistPage() {
    const router = useRouter();
    const wishItems = useAppSelector((state: RootState) => state.wishlist);
    const user = useAppSelector((state: RootState) => state.auth.user);
    const dispatch = useAppDispatch();
    const { userId } = useParams();
    console.log("userId", userId)
    const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
    useEffect(() => {
        const getWishlistProducts = () => {
            if (!userId && typeof userId !== 'string') {
                console.error("User ID is missing");
                return;
            }
            fetchCustomerWishlist(userId, companyDomain).then((response) => {
                console.log(response)
                setWishlistItems(response.data[0].items
                );
            }).catch((error) => {
                console.error("Error fetching wishlist products:", error);
            });
        }
        if (user?.id) {
            getWishlistProducts();
        }
    }, [wishItems]);
    console.log("wishlistItems", wishlistItems)
    const isMobileOrTablet = useMediaQuery({ minWidth: 340, maxWidth: 1024 });
    const isEmpty = Array.isArray(wishlistItems) ? wishlistItems.length === 0 : [];
    const deleteItemFromWishlist = async (productVariantId: string) => {
        if (!user?.id) {
            console.error('User ID is missing');
            return;
        }
        dispatch(removeFromWishlist(productVariantId));
        await fetchDeleteWishList(productVariantId, user.id, companyDomain);
        console.log(`Removing product ${productVariantId} from wishlist`);
    }
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
                                        <button onClick={() => deleteItemFromWishlist(item.productVariant.id)} className="text-red-500  h-full flex items-center justify-center cursor-pointer hover:text-red-600 hover:scale-140 transition-transform">
                                            <X />
                                        </button>

                                        <Link href={`/shopping/${item?.productVariant?.product_id}`} className="block lg:w-28 w-20 h-20 lg:h-28 aspect-square rounded-lg">
                                            <img src={item?.productVariant?.images?.[0]?.image_url} alt={item?.productVariant?.variant_name.slice(0, 30) + '...'} className="lg:w-28 w-20 aspect-square object-cover rounded-2xl border-2 border-gray-100" />
                                        </Link>
                                        <div className="flex flex-col gap-2">
                                            <p className="font-semibold lg:text-xl text-xs line-clamp-2">{item?.productVariant?.variant_name}</p>
                                            <p className="lg:text-lg text-sm font-medium">₹ {item?.productVariant?.price}</p>
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
