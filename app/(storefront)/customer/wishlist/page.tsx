"use client";

import type { RootState } from "@/lib/store";
import { ArrowLeft, Trash2, X, HeartCrack } from "lucide-react";
import { AddToCart } from "@/components/customer/AddToCart";
import { addToWishlist, removeFromWishlist } from "@/lib/features/Wishlist";
import { useRouter } from "next/navigation";
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
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { WISHLIST_PAGE_TEXT } from "@/constants/customerText";
import { WishlistPageSkeleton } from "@/components/customer/WishlistPageSkeleton";

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
    <div className="min-h-screen bg-background py-6 sm:py-12 text-left font-sans">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {WISHLIST_PAGE_TEXT.TITLE}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {WISHLIST_PAGE_TEXT.SUBTITLE}
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <WishlistPageSkeleton />
          ) : isEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-2xl bg-card p-6"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <HeartCrack className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {WISHLIST_PAGE_TEXT.EMPTY_TITLE}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
                {WISHLIST_PAGE_TEXT.EMPTY_DESC}
              </p>
              <Link
                href="/"
                className="mt-6 bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 py-2.5 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer block"
              >
                {WISHLIST_PAGE_TEXT.START_SHOPPING}
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative transition-all shadow-sm hover:shadow-md hover:border-primary/20"
                >
                  {/* Mobile Remove Button (Absolute) */}
                  <button
                    onClick={() =>
                      deleteItemFromWishlist(item.productVariant.id)
                    }
                    className="absolute top-3 right-3 sm:hidden p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>

                  {/* Product Image */}
                  <Link
                    href={`/store/${item.productVariant.product_id}`}
                    className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-secondary/40 rounded-xl border border-border/50 overflow-hidden block relative"
                  >
                    <Image
                      src={
                        item.productVariant.images?.[0]?.image_url ||
                        "https://placehold.co/400x400/f8fafc/94a3b8?text=Product"
                      }
                      alt={item.productVariant.variant_name}
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      loading="eager"
                      className="object-cover mix-blend-multiply"
                    />
                  </Link>

                  {/* Product Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 pr-6 sm:pr-0">
                      <div className="min-w-0">
                        <Link href={`/store/${item.productVariant.product_id}`}>
                          <h3 className="font-bold text-foreground text-xs sm:text-sm line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                            {item.productVariant.variant_name}
                          </h3>
                        </Link>
                        <p className="font-bold text-foreground text-xs sm:text-sm mt-1.5">
                          ₹{formatCurrency(Number(item.productVariant.price))}
                        </p>
                      </div>

                      {/* Desktop Remove Button */}
                      <button
                        onClick={() =>
                          deleteItemFromWishlist(item.productVariant.id)
                        }
                        className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-destructive hover:text-destructive/80 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 size={16} />
                        {WISHLIST_PAGE_TEXT.REMOVE}
                      </button>
                    </div>

                    <div className="mt-2 sm:mt-2 pt-2 sm:pt-0">
                      <div className="w-full sm:w-40">
                        <AddToCart
                          productVariantId={item.productVariant.id}
                          productVariant={item.productVariant as any}
                          styles="w-full h-10 rounded-full bg-theme-primary border border-gray-200 hover:bg-theme-secondary text-theme-primary-foreground transition-colors cursor-pointer "
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
