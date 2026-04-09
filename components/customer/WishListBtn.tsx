'use client';
import { Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from '@/lib/features/Wishlist';
import { useMediaQuery } from 'react-responsive'
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchAddWishList, fetchDeleteWishList } from '@/utils/customerApiClient';
import { companyDomain } from '@/config';
export function WishListBtn({ productVariantId
  , styles, iconSize }: {
    productVariantId
    ?: string, styles?: string, iconSize?: number
  }) {
  const dispatch = useAppDispatch();
  const { wishItems } = useAppSelector((state: any) => state.wishlist)
  const { user } = useAppSelector((state: any) => state.auth)
  const isAlreadyInWishlist = wishItems.some((item: any) => item.productVariantId
    === productVariantId
  );
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const iconSizeValue = iconSize || (isMobile ? 28 : 32);
  const router = useRouter();

  const handleAddToWishlist = async () => {
    if (!productVariantId
    ) {
      console.error('Product ID is missing');
      return;
    }
    if (!user.role || user.role.toLowerCase() !== 'customer') {
      router.push('/auth/customerLogin');
      return;
    }

    if (isAlreadyInWishlist) {
      dispatch(removeFromWishlist(productVariantId
      ));
      await fetchDeleteWishList(productVariantId
        , user.id, companyDomain);
      console.log(`Removing product ${productVariantId
        } from wishlist`);
      return;
    }
    const response = await fetchAddWishList(productVariantId
      , user.id, companyDomain);
    const data: {
      id: string;
      wishlist_id: string | null;
      product_variant_id: string | null;
      created_at: string | null;
      updated_at: string | null
    } = response.data;
    dispatch(addToWishlist({
      id: data.id,
      wishlist_id: data.wishlist_id ?? '',
      product_variant_id: productVariantId,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',

    }));
    console.log(`Adding product ${productVariantId
      } to wishlist`);
  }
  return (
    <>
      <motion.button
        onClick={handleAddToWishlist}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`rounded-full transition-colors duration-300 flex items-center justify-center mt-4
        lg:px-2 px-1 lg:py-2 py-1
        ${styles} 
        ${isAlreadyInWishlist
            ? 'bg-pink-100 text-pink-500'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }
      `}
      // aria-label={isAlreadyInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isAlreadyInWishlist ? "active" : "inactive"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Heart
              size={iconSizeValue}
              color={isAlreadyInWishlist ? "#ec4899" : "currentColor"}
              fill={isAlreadyInWishlist ? "#ec4899" : "none"}
            />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  )
}
