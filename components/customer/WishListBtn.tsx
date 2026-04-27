'use client';
import { Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from '@/lib/features/Wishlist';
import { useMediaQuery } from 'react-responsive'
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchAddWishList, fetchDeleteWishList } from '@/utils/customerApiClient';
import { RootState } from '@/lib/store';
import { useState } from 'react';
export function WishListBtn({ productVariantId
  , styles, iconSize }: {
    productVariantId
    ?: string, styles?: string, iconSize?: number
  }) {
  const dispatch = useAppDispatch();
  const { wishItems } = useAppSelector((state: RootState) => state.wishlist)
  const { user, role } = useAppSelector((state: RootState) => state.auth)
  const [isPending, setIsPending] = useState(false);
  const existingWishlistItem = wishItems.some(
    (item) => item.product_variant_id === productVariantId
  );

  console.log("existingWishlistItem", existingWishlistItem);
  console.log(wishItems)
  if (existingWishlistItem) {
    console.log("This item was added on: ", existingWishlistItem);
  }

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const iconSizeValue = iconSize || (isMobile ? 28 : 32);
  const router = useRouter();
  console.log("productVariantId", productVariantId);
  const handleAddToWishlist = async (variantId: string) => {
    if (isPending || !variantId) return;
    if (!user?.id || role?.toLowerCase() !== 'customer') {
      router.push('/auth/customerLogin');
      return;
    }

    setIsPending(true);

    try {
      if (existingWishlistItem) {
        // ── REMOVE PATH ──────────────────────────────────────────
        const itemToRemove = wishItems.find(
          item => item.product_variant_id === variantId
        );
        if (!itemToRemove) return;
        dispatch(removeFromWishlist(itemToRemove.id));

        const response = await fetchDeleteWishList(variantId, user.id);

        if (!response?.success) {
          dispatch(addToWishlist({
            id: itemToRemove.id,
            wishlist_id: itemToRemove.wishlist_id,
            product_variant_id: itemToRemove.product_variant_id,
            created_at: itemToRemove.created_at,
            updated_at: itemToRemove.updated_at,
          }));
        }

      } else {
        // ── ADD PATH ─────────────────────────────────────────────
        const response = await fetchAddWishList(variantId, user.id);

        if (!response?.success || !response?.data) {
          console.error('Add to wishlist failed:', response?.message);
          return;
        }

        const item = response.data;
        console.log("wishlist btn item", item)
        const wishItem = {
          id: item.id,
          wishlist_id: item.wishlist_id,
          product_variant_id: item.product_variant_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
        console.log("wishItem", wishItem)
        dispatch(addToWishlist(wishItem));
      }

    } catch (err) {
      console.error('Wishlist operation failed:', err);
    } finally {
      setIsPending(false);
    }
  };
  return (
    <>
      <motion.button
        onClick={() => handleAddToWishlist(productVariantId ?? '')}
        disabled={isPending}
        style={{ pointerEvents: isPending ? 'none' : 'auto' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`rounded-full transition-colors duration-300 flex items-center justify-center mt-4
        lg:px-2 px-1 lg:py-2 py-1
        ${styles} 
        ${existingWishlistItem
            ? 'bg-pink-100 text-pink-500'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }
      `}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={existingWishlistItem ? "active" : "inactive"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Heart
              size={iconSizeValue}
              color={existingWishlistItem ? "#ec4899" : "currentColor"}
              fill={existingWishlistItem ? "#ec4899" : "none"}
            />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  )
}
