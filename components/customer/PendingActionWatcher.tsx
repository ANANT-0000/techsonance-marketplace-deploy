"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { fetchAddWishList } from "@/utils/customerApiClient";
import { addToWishlist } from "@/lib/features/Wishlist";
import { authToken } from "@/utils/authToken";
import toast from "react-hot-toast";
import { PENDING_ACTION_KEY } from "@/constants";

export default function PendingActionWatcher() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const token = authToken();
  const processedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !token) {
      processedRef.current = false;
      return;
    }

    // Only process once per authentication transition to prevent duplicate calls
    if (processedRef.current) return;

    const rawAction = sessionStorage.getItem(PENDING_ACTION_KEY);
    if (!rawAction) return;

    processedRef.current = true;
    sessionStorage.removeItem(PENDING_ACTION_KEY);

    try {
      const action = JSON.parse(rawAction);
      if (
        action.type === "wishlist" &&
        action.payload?.productVariantId &&
        user.id
      ) {
        const productVariantId = action.payload.productVariantId;
        const userId = user.id;
        toast.promise(
          (async () => {
            const response = await fetchAddWishList(
              productVariantId,
              userId,
              token,
            );
            if (!response?.success || !response?.data) {
              throw new Error("Failed to update wishlist");
            }
            dispatch(
              addToWishlist({
                id: response.data.id,
                wishlist_id: response.data.wishlist_id,
                product_variant_id: response.data.product_variant_id,
                created_at: response.data.created_at,
                updated_at: response.data.updated_at,
              }),
            );
          })(),
          {
            loading: "Adding item to your wishlist...",
            success: "Added to wishlist!",
            error: "Could not add to wishlist. Please try again.",
          },
        );
      }
    } catch (err) {}
  }, [isAuthenticated, user?.id, token, dispatch]);

  return null;
}
