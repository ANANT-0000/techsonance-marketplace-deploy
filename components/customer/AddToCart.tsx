"use client";
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import type { RootState } from "@/lib/store";
import { addToCart, removeFromCart, loadCart } from "@/lib/features/Cart";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchAddToCart, fetchRemoveFromCart } from "@/utils/customerApiClient";
import { useEffect, useRef, useState } from "react";
import { authToken } from "@/utils/authToken";
import { Variant, ProductImageType } from "@/utils/Types";
import { ADD_TO_CART_TEXT } from "@/constants/customerText";

interface AddToCartProps {
  productVariantId: string;
  styles?: string;
  productVariant?: Variant;
  variant?: "default" | "pink";
}

export interface CartItemResponse {
  cart_id: string;
  cart_item_id: string;
  quantity: number;
  product_variant_id: string;
  success?: boolean;
  message?: string;
}

export function AddToCart({
  productVariantId,
  styles,
  productVariant,
  variant = "default",
}: AddToCartProps) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state: RootState) => state.cart);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const path = usePathname();
  const token = authToken();

  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);
  const rollbackRef = useRef<{
    quantity: number;
    cartItemId?: string;
    cartId?: string;
  } | null>(null);

  const [resolvedVariant, setResolvedVariant] = useState<Variant | undefined>(
    productVariant,
  );
  const currentVariant =
    productVariant && productVariant.price !== undefined
      ? productVariant
      : resolvedVariant;

  useEffect(() => {
    if (productVariant && productVariant.price !== undefined) {
      setResolvedVariant(productVariant);
      return;
    }

    let active = true;
    const loadVariantDetails = async () => {
      try {
        const { fetchProductVariantDetails } =
          await import("@/utils/commonAPiClient");
        const res = await fetchProductVariantDetails(productVariantId);
        if (active && res && res.success && res.data) {
          const vData = res.data;
          let imagesArray: any[] = [];
          if (Array.isArray(vData.images)) {
            imagesArray = vData.images.map((img: any, idx: number) => ({
              id: img.id || String(idx),
              image_url: img.image_url || img.imageUrl,
              alt_text: img.alt_text || vData.variant_name,
              is_primary: img.is_primary || idx === 0,
              imgType: img.imgType || ProductImageType.MAIN,
            }));
          } else if (typeof vData.images === "string") {
            imagesArray = [
              {
                id: "primary",
                image_url: vData.images,
                alt_text: vData.variant_name,
                is_primary: true,
                imgType: ProductImageType.MAIN,
              },
            ];
          }

          const transformedVariant: Variant = {
            id: vData.id,
            variant_name: vData.variant_name,
            sku: vData.sku,
            price: vData.price,
            status: vData.status,
            product_id: vData.product_id || "",
            images: imagesArray,
            attributes: [],
            stock_quantity: vData.stock_quantity ?? 9999,
            created_at: "",
            updated_at: "",
            seo_meta: null,
            inventory: {
              stock_quantity: vData.stock_quantity ?? 9999,
              warehouse_id: "",
            },
          } as any;
          setResolvedVariant(transformedVariant);
        }
      } catch (err) {
        console.warn("Failed to fetch variant details in AddToCart:", err);
      }
    };
    loadVariantDetails();
    return () => {
      active = false;
    };
  }, [productVariantId, productVariant]);

  const cartItem = items?.find(
    (item) => item.productVariantId === productVariantId,
  );
  const quantity = cartItem?.quantity ?? 0;

  const handleIncrement = async () => {
    if (
      !user?.id ||
      !token ||
      (typeof window !== "undefined" && !navigator.onLine)
    ) {
      const prevQuantity = quantity;
      const optimisticQuantity = prevQuantity + 1;

      dispatch(
        addToCart({
          cartId: "",
          cartItemId: "",
          productVariantId,
          quantity: optimisticQuantity,
          productVariant: currentVariant,
        }),
      );

      if (!path.includes("cart") && !path.includes("wishlist")) {
        dispatch(toggleCartSidebar("open"));
      }
      return;
    }
    if (isSyncing || syncingRef.current) return;

    const prevQuantity = quantity;
    const prevCartItemId = cartItem?.cartItemId;
    const prevCartId = cartItem?.cartId;
    const optimisticQuantity = prevQuantity + 1;

    dispatch(
      addToCart({
        cartId: cartItem?.cartId ?? "",
        cartItemId: cartItem?.cartItemId ?? "",
        productVariantId,
        quantity: optimisticQuantity,
        productVariant: currentVariant,
      }),
    );

    if (!path.includes("cart") && !path.includes("wishlist")) {
      dispatch(toggleCartSidebar("open"));
    }

    setIsSyncing(true);
    syncingRef.current = true;
    rollbackRef.current = {
      quantity: prevQuantity,
      cartItemId: prevCartItemId,
      cartId: prevCartId,
    };

    try {
      const response = await fetchAddToCart(
        productVariantId,
        optimisticQuantity,
        user.id,
        token,
      );
      if (response === undefined) {
        throw new Error("NETWORK_ERROR");
      }
      const cartResponse: CartItemResponse = response?.data;
      if (!cartResponse?.cart_id) throw new Error("SERVER_ERROR");
      dispatch(
        addToCart({
          cartId: cartResponse.cart_id,
          cartItemId: cartResponse.cart_item_id,
          productVariantId: cartResponse.product_variant_id,
          quantity: cartResponse.quantity,
          productVariant: currentVariant,
        }),
      );
    } catch (error: any) {
      if (
        error.message === "NETWORK_ERROR" ||
        (typeof window !== "undefined" && !navigator.onLine)
      ) {
      } else {
        if (prevQuantity === 0) {
          dispatch(removeFromCart({ productVariantId, quantity: 0 }));
        } else {
          dispatch(
            addToCart({
              cartId: prevCartId ?? "",
              cartItemId: prevCartItemId ?? "",
              productVariantId,
              quantity: prevQuantity,
              productVariant: currentVariant,
            }),
          );
        }
      }
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
      rollbackRef.current = null;
    }
  };

  const handleDecrement = async () => {
    if (
      !user?.id ||
      !token ||
      (typeof window !== "undefined" && !navigator.onLine)
    ) {
      if (!cartItem) return;
      const prevQuantity = quantity;
      if (prevQuantity <= 1) {
        dispatch(removeFromCart({ productVariantId, quantity: 0 }));
      } else {
        dispatch(
          removeFromCart({ productVariantId, quantity: prevQuantity - 1 }),
        );
      }
      return;
    }
    if (!cartItem) return;
    if (isSyncing || syncingRef.current) return;

    const prevQuantity = quantity;
    const prevCartItemId = cartItem.cartItemId;
    const prevCartId = cartItem.cartId;

    if (prevQuantity <= 1) {
      dispatch(removeFromCart({ productVariantId, quantity: 0 }));
    } else {
      dispatch(
        removeFromCart({ productVariantId, quantity: prevQuantity - 1 }),
      );
    }

    setIsSyncing(true);
    syncingRef.current = true;
    rollbackRef.current = {
      quantity: prevQuantity,
      cartItemId: prevCartItemId,
      cartId: prevCartId,
    };

    try {
      const response = await fetchRemoveFromCart(
        user.id,
        cartItem.cartId,
        cartItem.cartItemId,
        token,
      );
      if (response === undefined) {
        throw new Error("NETWORK_ERROR");
      }
      const cartResponse: CartItemResponse = response?.data;
      if (!cartResponse) throw new Error("SERVER_ERROR");
      if (cartResponse.success && !cartResponse.quantity) {
        dispatch(removeFromCart({ productVariantId, quantity: 0 }));
      } else {
        dispatch(
          removeFromCart({ productVariantId, quantity: cartResponse.quantity }),
        );
      }
    } catch (error: any) {
      if (
        error.message === "NETWORK_ERROR" ||
        (typeof window !== "undefined" && !navigator.onLine)
      ) {
      } else {
        dispatch(
          addToCart({
            cartId: prevCartId,
            cartItemId: prevCartItemId,
            productVariantId,
            quantity: prevQuantity,
            productVariant: currentVariant,
          }),
        );
      }
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
      rollbackRef.current = null;
    }
  };

  return (
    <div
      className={
        variant === "pink"
          ? `flex items-center gap-3 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/30 dark:border-pink-900/10 rounded-full px-3 py-1.5 shadow-sm text-pink-600 dark:text-pink-400 font-extrabold text-sm select-none transition-all duration-200 ${styles ?? ""}`
          : `relative flex items-center justify-center overflow-hidden select-none transition-all duration-200 ${styles ?? ""}`
      }
    >
      <AnimatePresence mode="wait">
        {quantity === 0 ? (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleIncrement}
            disabled={isSyncing}
            whileTap={isSyncing ? {} : { scale: 0.97 }}
            className="flex h-full w-full items-center justify-center gap-2 px-2 disabled:opacity-50"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4 shrink-0" />
            )}
            <span className="text-theme-caption sm:text-xs-plus font-semibold tracking-wide whitespace-nowrap">
              {ADD_TO_CART_TEXT.ADD}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="counter-ui"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={
              variant === "pink"
                ? "flex items-center justify-between gap-3 w-full h-full text-pink-600 dark:text-pink-400"
                : "absolute inset-0 flex items-center justify-between bg-theme-primary text-theme-primary-foreground px-1 py-1 w-full h-full"
            }
          >
            <motion.button
              whileTap={isSyncing ? {} : { scale: 0.82 }}
              onClick={handleDecrement}
              disabled={isSyncing}
              className={
                variant === "pink"
                  ? "text-pink-600 dark:text-pink-400 hover:bg-pink-100/50 rounded-full p-0.5 transition-colors cursor-pointer disabled:opacity-50"
                  : "h-full aspect-square flex items-center justify-center rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
              }
              aria-label={ADD_TO_CART_TEXT.ARIA_REMOVE}
            >
              <Minus size={variant === "pink" ? 14 : 15} strokeWidth={2.5} />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span
                key={quantity}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className={
                  variant === "pink"
                    ? "font-extrabold text-sm tabular-nums min-w-[14px] text-center"
                    : "font-bold text-theme-caption sm:text-theme-body-sm min-w-[20px] text-center tabular-nums grow"
                }
              >
                {quantity}
              </motion.span>
            </AnimatePresence>

            <motion.button
              whileTap={isSyncing ? {} : { scale: 0.82 }}
              onClick={handleIncrement}
              disabled={isSyncing}
              className={
                variant === "pink"
                  ? "text-pink-600 dark:text-pink-400 hover:bg-pink-100/50 rounded-full p-0.5 transition-colors cursor-pointer disabled:opacity-50"
                  : "h-full aspect-square flex items-center justify-center rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
              }
              aria-label={ADD_TO_CART_TEXT.ARIA_ADD}
            >
              <Plus size={variant === "pink" ? 14 : 15} strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
