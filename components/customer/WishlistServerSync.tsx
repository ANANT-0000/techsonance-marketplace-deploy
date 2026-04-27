import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addToWishlist } from "@/lib/features/Wishlist";
import { getCompanyDomain } from "@/lib/get-domain";
import { RootState } from "@/lib/store";
import { fetchCustomerWishlist } from "@/utils/customerApiClient";
import { useEffect, useRef } from "react";

// components/customer/WishlistServerSync.tsx
export const WishlistServerSync = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
    const syncedForUser = useRef<string | null>(null);

    // Pass wishItems as a ref so the async closure always reads current value
    const wishItemsRef = useRef(wishItems);
    useEffect(() => {
        wishItemsRef.current = wishItems;
    }, [wishItems]);

    useEffect(() => {
        if (!user?.id || syncedForUser.current === user.id) return;

        const sync = async () => {
            try {
                const response = await fetchCustomerWishlist(user.id ?? '');
                const serverItems = response?.data?.[0]?.items ?? [];
                syncedForUser.current = user.id ?? null;

                serverItems.forEach((item: any) => {
                    // Read from ref, not stale closure
                    const alreadyInStore = wishItemsRef.current.some(
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
    }, [user?.id]); // deps unchanged

    return null;
};