"use client";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addToWishlist } from "@/lib/features/Wishlist";
import { getCompanyDomain } from "@/lib/get-domain";
import { RootState } from "@/lib/store";
import { fetchCustomerWishlist } from "@/utils/customerApiClient";
import { get } from "http";
import { useEffect, useRef } from "react";

export const WishlistServerSync = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
    const syncedForUser = useRef<string | null>(null);

    useEffect(() => {
        // Reset on logout
        if (!user?.id) {
            syncedForUser.current = null;
            return;
        }

        // Already synced for this user this session — skip
        if (syncedForUser.current === user.id) return;

        const sync = async () => {
            try {
                if (!user?.id) return;
                const domain = await getCompanyDomain();
                if (!domain) {
                    console.warn('Could not determine company domain for wishlist sync');
                    return;
                }
                const response = await fetchCustomerWishlist(user.id);
                const serverItems: {
                    id: string;
                    wishlist_id: string;
                    product_variant_id: string;
                    created_at: string;
                    updated_at: string;
                }[] = response?.data?.[0]?.items ?? [];

                // Mark as synced before dispatching to prevent re-runs
                syncedForUser.current = user.id;

                serverItems.forEach(item => {
                    // Skip items already loaded from localStorage to avoid duplicates
                    const alreadyInStore = wishItems.some(
                        w => w.product_variant_id === item.product_variant_id
                    );
                    if (!alreadyInStore) {
                        dispatch(addToWishlist({
                            id: item.id,
                            wishlist_id: item.wishlist_id,
                            product_variant_id: item.product_variant_id,
                            created_at: item.created_at,
                            updated_at: item.updated_at,
                        }));
                    }
                });
            } catch (err) {
                console.error('Wishlist server sync failed:', err);
            }
        };

        sync();
    }, [user?.id]); // only re-runs on user change (login / logout)

    return null;
}