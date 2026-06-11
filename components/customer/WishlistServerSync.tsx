import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addToWishlist, clearWishlist, loadWishlist } from "@/lib/features/Wishlist";
import { RootState } from "@/lib/store";
import { authToken } from "@/utils/authToken";
import { fetchCustomerWishlist, fetchAddWishList } from "@/utils/customerApiClient";
import { useEffect, useRef } from "react";

export const WishlistServerSync = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
    const syncedForUser = useRef<string | null>(null);
    const token = authToken();
    const wishItemsRef = useRef(wishItems);

    useEffect(() => {
        wishItemsRef.current = wishItems;
    }, [wishItems]);

    useEffect(() => {
        if (!user?.id || !token || syncedForUser.current === user.id) return;

        const sync = async () => {
            try {
                // 1. Identify guest local items in the store (starting with 'local_')
                const localItems = wishItemsRef.current.filter(w => w.id.startsWith('local_'));

                // 2. Fetch current server items
                const response = await fetchCustomerWishlist(user.id ?? '', token);
                const serverItems = response?.data?.[0]?.items ?? [];
                syncedForUser.current = user.id ?? null;

                // 3. Sync local guest items to server
                if (localItems.length > 0) {
                    const syncPromises = localItems.map(async (localItem) => {
                        const alreadyOnServer = serverItems.some(
                            (s: any) => s.product_variant_id === localItem.product_variant_id
                        );
                        if (!alreadyOnServer) {
                            await fetchAddWishList(localItem.product_variant_id, user.id ?? '', token);
                        }
                    });
                    await Promise.all(syncPromises);

                    // Clear guest state and reload from server
                    dispatch(clearWishlist());
                    dispatch(loadWishlist());
                } else {
                    // Just add missing server items to store
                    serverItems.forEach((item: any) => {
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
                }
            } catch (err) {
                // Ignore failure
            }
        };

        sync();
    }, [user?.id, token, dispatch]);

    return null;
};