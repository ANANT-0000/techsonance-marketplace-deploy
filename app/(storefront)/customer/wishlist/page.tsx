"use client";
import type { RootState } from "@/lib/store";
import { ArrowLeft, Trash2, X, HeartCrack } from "lucide-react";
import { AddToCart } from "@/components/customer/AddToCart";
import { addToWishlist, removeFromWishlist } from "@/lib/features/Wishlist";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  fetchCustomerWishlist,
  fetchDeleteWishList,
} from "@/utils/customerApiClient";
import Link from "next/link";
import { authToken } from "@/utils/authToken";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

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
  };
  [key: string]: unknown;
}

export default function WishlistPage() {
  const router = useRouter();
  const wishItems = useAppSelector((state: RootState) => state.wishlist);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();

  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = authToken();

  useEffect(() => {
    const getWishlistProducts = async () => {
      if (!user?.id) {
        toast.error("User ID is missing");
        setIsLoading(false);
        return;
      }
      if (!token) {
        toast.error("Authentication token is missing");
        setIsLoading(false);
        return;
      }

      fetchCustomerWishlist(user.id, token)
        .then((response) => {
          setWishlistItems(response?.data[0]?.items || []);
        })
        .catch((error) => {
          toast.error("Error fetching wishlist products:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    if (user?.id) {
      getWishlistProducts();
    } else {
      setIsLoading(false);
    }
  }, [wishItems, user, token]);

  const isEmpty = wishlistItems.length === 0;

  const deleteItemFromWishlist = async (productVariantId: string) => {
    if (!user?.id || !token) {
      toast.error("User ID or token is missing");
      return;
    }
    const item = wishlistItems.find(
      (i) => i.productVariant.id === productVariantId,
    );
    if (!item) return;

    // Optimistic UI Update
    dispatch(removeFromWishlist(productVariantId));

    const response = await fetchDeleteWishList(
      productVariantId,
      user.id,
      token,
    );
    if (!response?.success) {
      toast.error("Failed to remove item from wishlist:", response?.message);
      // Rollback on failure
      dispatch(
        addToWishlist({
          id: item.id,
          wishlist_id: item.wishlist_id,
          product_variant_id: item.productVariant.id,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 sm:p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-theme-h4 sm:text-theme-h3 font-extrabold text-gray-900 tracking-tight">
              Your Wishlist
            </h1>
            <p className="text-theme-body-sm font-medium text-gray-500 mt-1">
              Review your saved items.
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative animate-pulse shadow-sm"
                >
                  <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl" />
                  <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-11 bg-gray-200 rounded-xl w-full sm:w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <HeartCrack className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-theme-h6 font-bold text-gray-900">
                Your wishlist is empty
              </h2>
              <p className="text-theme-body-sm text-gray-500 mt-1 mb-6">
                Looks like you haven't saved any items yet.
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-[#0f172a] text-white text-theme-body-sm font-bold rounded-xl hover:bg-black transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative transition-all shadow-sm hover:shadow-md"
                >
                  {/* Mobile Remove Button (Absolute) */}
                  <button
                    onClick={() =>
                      deleteItemFromWishlist(item.productVariant.id)
                    }
                    className="absolute top-3 right-3 sm:hidden p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>

                  {/* Product Image */}
                  <Link
                    href={`/store/${item.productVariant.product_id}`}
                    className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden block relative"
                  >
                    <Image
                      src={
                        item.productVariant.images?.[0]?.image_url ||
                        "https://placehold.co/400x400/f8fafc/94a3b8?text=Product"
                      }
                      alt={item.productVariant.variant_name}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      loading="eager"
                      className="object-cover mix-blend-multiply"
                    />
                  </Link>

                  {/* Product Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4 pr-6 sm:pr-0">
                      <div>
                        <Link href={`/store/${item.productVariant.product_id}`}>
                          <h3 className="font-bold text-gray-900 text-theme-body sm:text-theme-h6 line-clamp-2 leading-snug hover:text-indigo-600 transition-colors">
                            {item.productVariant.variant_name}
                          </h3>
                        </Link>
                        <p className="font-extrabold text-gray-900 text-theme-h6 sm:text-theme-h5 mt-1.5">
                          ₹{formatCurrency(Number(item.productVariant.price))}
                        </p>
                      </div>

                      {/* Desktop Remove Button */}
                      <button
                        onClick={() =>
                          deleteItemFromWishlist(item.productVariant.id)
                        }
                        className="hidden sm:flex items-center gap-1.5 text-theme-body-sm font-bold text-red-500 hover:text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 sm:mt-0 pt-4 sm:pt-0">
                      {/* AddToCart component needs to handle its own button styling, 
                                                passing standard width constraint to fit nicely */}
                      <div className="w-full sm:w-40">
                        <AddToCart
                          productVariantId={item.productVariant.id}
                          productVariant={item.productVariant as any}
                          styles="w-full h-11 text-theme-body-sm font-bold rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
