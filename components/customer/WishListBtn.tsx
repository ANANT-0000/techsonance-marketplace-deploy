'use client';
import { Heart } from 'lucide-react';
import { COLOR_PINK } from "@/constants";
import { addToWishlist, removeFromWishlist } from '@/lib/features/Wishlist';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchAddWishList, fetchDeleteWishList } from '@/utils/customerApiClient';
import { RootState } from '@/lib/store';
import { useRef, useState } from 'react';
import { authToken } from '@/utils/authToken';

export function WishListBtn({
    productVariantId,
    styles,
    iconSize,
}: {
    productVariantId?: string;
    styles?: string;
    iconSize?: number;
}) {
    const dispatch = useAppDispatch();
    const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
    const { user } = useAppSelector((state: RootState) => state.auth);
    const router = useRouter();
    const token = authToken();

    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const iconSizeValue = iconSize ?? (isMobile ? 24 : 32);

    // Prevent stacking concurrent requests for the same item
    const syncingRef = useRef(false);

    const existingItem = wishItems.find(
        (item) => item.product_variant_id === productVariantId,
    );
    const isWishlisted = !!existingItem;

    const handleToggle = async () => {
        if (syncingRef.current || !productVariantId) return;

        if (!user?.id || !token || (typeof window !== 'undefined' && !navigator.onLine)) {
            if (isWishlisted && existingItem) {
                dispatch(removeFromWishlist(existingItem.id));
            } else {
                const tempId = `local_${productVariantId}_${Date.now()}`;
                dispatch(addToWishlist({
                    id: tempId,
                    wishlist_id: '',
                    product_variant_id: productVariantId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }));
            }
            return;
        }

        syncingRef.current = true;

        // ── REMOVE ──────────────────────────────────────────────────────────
        if (isWishlisted && existingItem) {
            // 1. Optimistic remove — instant UI
            dispatch(removeFromWishlist(existingItem.id));

            try {
                const response = await fetchDeleteWishList(productVariantId, user.id, token);

                if (!response?.success) {
                    // 2a. Server rejected — roll back
                    dispatch(addToWishlist({
                        id: existingItem.id,
                        wishlist_id: existingItem.wishlist_id,
                        product_variant_id: existingItem.product_variant_id,
                        created_at: existingItem.created_at,
                        updated_at: existingItem.updated_at,
                    }));
                }
                // 2b. Server confirmed — already removed, nothing to do
            } catch {
                // 3. Network error — roll back
                dispatch(addToWishlist({
                    id: existingItem.id,
                    wishlist_id: existingItem.wishlist_id,
                    product_variant_id: existingItem.product_variant_id,
                    created_at: existingItem.created_at,
                    updated_at: existingItem.updated_at,
                }));
            } finally {
                syncingRef.current = false;
            }

            return;
        }

        // ── ADD ──────────────────────────────────────────────────────────────
        // 1. Optimistic add with a temporary placeholder ID
        const tempId = `temp_${productVariantId}_${Date.now()}`;
        const tempItem = {
            id: tempId,
            wishlist_id: '',
            product_variant_id: productVariantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        dispatch(addToWishlist(tempItem));

        try {
            const response = await fetchAddWishList(productVariantId, user.id, token);

            if (!response?.success || !response?.data) {
                // 2a. Server rejected — roll back by removing the temp item
                dispatch(removeFromWishlist(tempId));
            } else {
                // 2b. Server confirmed — replace temp item with real server data
                dispatch(removeFromWishlist(tempId));
                dispatch(addToWishlist({
                    id: response.data.id,
                    wishlist_id: response.data.wishlist_id,
                    product_variant_id: response.data.product_variant_id,
                    created_at: response.data.created_at,
                    updated_at: response.data.updated_at,
                }));
            }
        } catch {
            // 3. Network error — roll back
            dispatch(removeFromWishlist(tempId));
        } finally {
            syncingRef.current = false;
        }
    };

    return (
        <motion.button
            onClick={handleToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`rounded-full transition-colors duration-300 flex items-center justify-center mt-4
                lg:px-2 px-1 lg:py-2 py-1
                ${styles}
                ${isWishlisted
                    ? 'bg-pink-100 text-pink-500'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isWishlisted ? 'active' : 'inactive'}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <Heart
                        size={iconSizeValue}
                        color={isWishlisted ? COLOR_PINK : 'currentColor'}
                        fill={isWishlisted ? COLOR_PINK : 'none'}
                    />
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
}