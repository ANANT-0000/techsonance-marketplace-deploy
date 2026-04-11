'use client';
import { Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from '@/lib/features/Wishlist';
import { useMediaQuery } from 'react-responsive'
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchAddWishList, fetchDeleteWishList } from '@/utils/customerApiClient';
import { companyDomain } from '@/config';
import { RootState } from '@/lib/store';
export function WishListBtn({ productVariantId
  , styles, iconSize }: {
    productVariantId
    ?: string, styles?: string, iconSize?: number
  }) {
  const dispatch = useAppDispatch();
  const { wishItems } = useAppSelector((state: RootState) => state.wishlist)
  const { user } = useAppSelector((state: RootState) => state.auth)
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

    console.log("handleAddToWishlist id", variantId);
    console.log("handleAddToWishlist user", user?.id ?? '');
    if (!variantId) {
      console.error('Product ID is missing');
      return;
    }
    if (!user?.role || user?.role.toLowerCase() !== 'customer') {
      router.push('/auth/customerLogin');
      return;
    }

    if (existingWishlistItem) {
      const itemToRemove = wishItems.find(item => item.product_variant_id === variantId);
      dispatch(removeFromWishlist(itemToRemove?.id ?? ''));
      await fetchDeleteWishList(variantId, user?.id ?? '', companyDomain);
      console.log(`Removing product ${productVariantId
        } from wishlist`);
      return;
    }
    const response = await fetchAddWishList(variantId, user?.id ?? '', companyDomain);
    const data: {
      id: string;
      wishlist_id: string;
      product_variant_id: string;
      created_at: string;
      updated_at: string
    } = response.data;
    console.log(response.data)
    dispatch(addToWishlist({
      id: data.id,
      wishlist_id: data.wishlist_id,
      product_variant_id: data.product_variant_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }));
    console.log(`Adding product ${productVariantId
      } to wishlist`);
  }
  return (
    <>
      <motion.button
        onClick={() => handleAddToWishlist(productVariantId ?? '')}
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
      // aria-label={existingWishlistItem ? "Remove from wishlist" : "Add to wishlist"}
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
