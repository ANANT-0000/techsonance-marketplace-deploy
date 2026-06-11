import { CartItemListResponse } from "@/app/(storefront)/customer/cart/CartClient";
import { companyDomain } from "@/config";
import {
  CART_KEY,
  CartItem,
  IS_AUTHENTICATED_KEY,
  USER_STORAGE_KEY,
} from "@/constants";
import { authToken } from "@/utils/authToken";
import { fetchGetCartList, fetchAddToCart } from "@/utils/customerApiClient";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { Variant } from "@/utils/Types";
import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";

export interface CartState {
  cartId: string;
  items: CartItem[];
  itemList: CartItemListResponse[];
  loading: boolean;
  error: string | null;
}

const isClient = typeof window !== "undefined";

const saveCartToLocalStorage = (
  cartId: string,
  items: CartItem[],
  itemList: CartItemListResponse[],
) => {
  if (!isClient) return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ cartId, items, itemList }));
    const savedCart = localStorage.getItem(CART_KEY);
  } catch (e) {
  }
};

const loadCartFromLocalOrServer = async (): Promise<
  Omit<CartState, "loading" | "error">
> => {
  if (!isClient) return { cartId: "", items: [], itemList: [] };
  const token = authToken();
  try {
    const isCustomer: {
      isAuthenticated: boolean;
      role: string;
    } | null = JSON.parse(localStorage.getItem(IS_AUTHENTICATED_KEY) || "{}");
    if (isCustomer?.role === "admin" || isCustomer?.role === "vendor") {
      return { cartId: "", items: [], itemList: [] };
    }
    const serializedCart: string | null = localStorage.getItem(CART_KEY);

    let customerId = localStorage.getItem(USER_STORAGE_KEY);
    if (customerId && customerId !== "undefined" && customerId !== "null") {
      customerId = JSON.parse(
        localStorage.getItem(USER_STORAGE_KEY) as string,
      )?.id;
    }

    // 1. If logged in and online, merge local offline cart updates to server
    if (
      customerId &&
      companyDomain &&
      token &&
      typeof window !== "undefined" &&
      navigator.onLine
    ) {
      try {
        // Get current server cart items
        let dbItems: any[] = [];
        const dbCartResponse = await fetchGetCartList(customerId, token);
        if (
          dbCartResponse &&
          dbCartResponse.success &&
          Array.isArray(dbCartResponse.data)
        ) {
          dbItems = dbCartResponse.data;
        }
        // Get local items
        let localItems: CartItem[] = [];
        if (serializedCart) {
          const parsedCart = JSON.parse(serializedCart);
          if (parsedCart && Array.isArray(parsedCart.items)) {
            localItems = parsedCart.items;
          }
        }

        // Sync local changes to server (if any)
        if (localItems.length > 0) {
          const syncPromises = localItems.map(async (localItem) => {
            const dbMatch = dbItems.find(
              (item: any) =>
                item.product_variant_id === localItem.productVariantId,
            );
            if (!dbMatch || dbMatch.quantity !== localItem.quantity) {
              await fetchAddToCart(
                localItem.productVariantId,
                localItem.quantity,
                customerId,
                token,
              );
            }
          });
          await Promise.all(syncPromises);

          // Re-fetch final server cart
          const updatedDbResponse = await fetchGetCartList(customerId, token);
          if (
            updatedDbResponse &&
            updatedDbResponse.success &&
            Array.isArray(updatedDbResponse.data)
          ) {
            dbItems = updatedDbResponse.data;
          }
        }

        if (dbItems.length > 0) {
          const itemList: CartItemListResponse[] = dbItems;
          const items: CartItem[] = itemList.map((item) => ({
            cartId: item.cart_id,
            cartItemId: item.id,
            quantity: item.quantity,
            productVariantId: item.product_variant_id,
          }));
          const cartId = itemList[0]?.cart_id ?? "";
          saveCartToLocalStorage(cartId, items, itemList);
          return { cartId, items, itemList };
        } else {
          saveCartToLocalStorage("", [], []);
          return { cartId: "", items: [], itemList: [] };
        }
      } catch (serverError) {
      }
    }

    // 2. Fallback: load from local storage    if (serializedCart) {
    const parsedCart = JSON.parse(serializedCart ?? "{}");
    if (parsedCart && Array.isArray(parsedCart.items)) {
      const items: CartItem[] = parsedCart.items;
      let itemList: CartItemListResponse[] = parsedCart.itemList || [];

      // Fetch details if missing and we are online
      if (
        items.length > 0 &&
        itemList.length === 0 &&
        typeof window !== "undefined" &&
        navigator.onLine
      ) {
        try {
          const detailsPromises = items.map(async (item) => {
            const res = await fetchProductVariantDetails(item.productVariantId);
            if (res && res.success && res.data) {
              const variantData = res.data;

              // Map VariantDetails to Variant shape
              let imagesArray: any[] = [];
              if (Array.isArray(variantData.images)) {
                imagesArray = variantData.images.map(
                  (img: any, idx: number) => ({
                    id: img.id || String(idx),
                    image_url: img.image_url || img.imageUrl,
                    alt_text: img.alt_text || variantData.variant_name,
                    is_primary: img.is_primary || idx === 0,
                    imgType: img.imgType || "main",
                  }),
                );
              } else if (typeof variantData.images === "string") {
                imagesArray = [
                  {
                    id: "primary",
                    image_url: variantData.images,
                    alt_text: variantData.variant_name,
                    is_primary: true,
                    imgType: "main",
                  },
                ];
              }

              const transformedVariant: Variant = {
                id: variantData.id,
                variant_name: variantData.variant_name,
                sku: variantData.sku,
                price: variantData.price,
                status: variantData.status,
                product_id: variantData.product_id || "",
                images: imagesArray,
                attributes: [],
                stock_quantity: variantData.stock_quantity ?? 9999,
                created_at: "",
                updated_at: "",
                seo_meta: null,
                inventory: {
                  stock_quantity: variantData.stock_quantity ?? 9999,
                  warehouse_id: "",
                },
              } as any;

              itemList.push({
                id: item.productVariantId,
                cart_id: "",
                product_variant_id: item.productVariantId,
                quantity: item.quantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                productVariant: transformedVariant,
              });
            }
          });
          await Promise.all(detailsPromises);
          saveCartToLocalStorage(parsedCart.cartId || "", items, itemList);
        } catch (err) {}
      }

      return { cartId: parsedCart.cartId || "", items, itemList };
    }
  } catch (e) {}

  return { cartId: "", items: [], itemList: [] };
};

export const loadCart = createAsyncThunk("cart/load", async () => {
  return await loadCartFromLocalOrServer();
});

export const syncCartAfterLogin = createAsyncThunk(
  "cart/syncAfterLogin",
  async (payload: { userId: string; token: string }, { dispatch }) => {
    if (!isClient) return;
    try {
      const serializedCart = localStorage.getItem(CART_KEY);
      if (!serializedCart) return;

      const parsedCart = JSON.parse(serializedCart);
      if (
        !parsedCart ||
        !Array.isArray(parsedCart.items) ||
        parsedCart.items.length === 0
      ) {
        return;
      }

      const guestItems = parsedCart.items;

      // 1. Fetch current database cart items
      let dbItems: any[] = [];
      const dbCartResponse = await fetchGetCartList(
        payload.userId,
        payload.token,
      );
      if (
        dbCartResponse &&
        dbCartResponse.success &&
        Array.isArray(dbCartResponse.data)
      ) {
        dbItems = dbCartResponse.data;
      }

      // 2. Perform merge calls in parallel using fetchAddToCart
      const mergePromises = guestItems.map(async (guestItem: CartItem) => {
        const dbMatch = dbItems.find(
          (item: any) => item.product_variant_id === guestItem.productVariantId,
        );
        if (dbMatch) {
          // Sum the quantities
          const newQuantity = guestItem.quantity + dbMatch.quantity;
          await fetchAddToCart(
            guestItem.productVariantId,
            newQuantity,
            payload.userId,
            payload.token,
          );
        } else {
          // Add new item
          await fetchAddToCart(
            guestItem.productVariantId,
            guestItem.quantity,
            payload.userId,
            payload.token,
          );
        }
      });

      await Promise.all(mergePromises);

      // 3. Clear guest cart from local storage
      localStorage.removeItem(CART_KEY);

      // 4. Reload the cart state from database
      dispatch(loadCart());
    } catch (error) {
    }
  },
);

const initialState: CartState = {
  cartId: "",
  items: [],
  itemList: [],
  loading: false,
  error: null,
};

const CartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: { payload: CartItem & { productVariant?: Variant } },
    ) => {
      if (!state.cartId && action.payload.cartId) {
        state.cartId = action.payload.cartId;
      }
      const existingItem = state.items.find(
        (item) => item.productVariantId === action.payload.productVariantId,
      );
      if (existingItem) {
        existingItem.quantity =
          action.payload.quantity ?? existingItem.quantity + 1;
      } else {
        state.items.push({
          cartId: action.payload.cartId || state.cartId || "",
          cartItemId: action.payload.cartItemId || "",
          productVariantId: action.payload.productVariantId,
          quantity: action.payload.quantity ?? 1,
        });
      }

      // Keep itemList in sync
      const existingItemList = state.itemList.find(
        (item) => item.product_variant_id === action.payload.productVariantId,
      );
      if (existingItemList) {
        existingItemList.quantity =
          action.payload.quantity ?? existingItemList.quantity + 1;
      } else if (action.payload.productVariant) {
        state.itemList.push({
          id: action.payload.productVariantId,
          cart_id: action.payload.cartId || state.cartId || "",
          product_variant_id: action.payload.productVariantId,
          quantity: action.payload.quantity ?? 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          productVariant: action.payload.productVariant,
        });
      }
      saveCartToLocalStorage(
        state.cartId,
        current(state.items),
        current(state.itemList),
      );
    },
    removeFromCart: (
      state,
      action: { payload: { productVariantId: string; quantity?: number } },
    ) => {
      const { productVariantId, quantity } = action.payload;

      const itemIndex = state.items.findIndex(
        (item) => item.productVariantId === productVariantId,
      );

      if (itemIndex !== -1) {
        if (quantity !== undefined) {
          if (quantity <= 0) {
            state.items.splice(itemIndex, 1);
          } else {
            state.items[itemIndex].quantity = quantity;
          }
        } else {
          if (state.items[itemIndex].quantity > 1) {
            state.items[itemIndex].quantity -= 1;
          } else {
            state.items.splice(itemIndex, 1);
          }
        }
      }

      const itemListIndex = state.itemList.findIndex(
        (item) => item.product_variant_id === productVariantId,
      );

      if (itemListIndex !== -1) {
        if (quantity !== undefined) {
          if (quantity <= 0) {
            state.itemList.splice(itemListIndex, 1);
          } else {
            state.itemList[itemListIndex].quantity = quantity;
          }
        } else {
          if (state.itemList[itemListIndex].quantity > 1) {
            state.itemList[itemListIndex].quantity -= 1;
          } else {
            state.itemList.splice(itemListIndex, 1);
          }
        }
      }

      saveCartToLocalStorage(
        state.cartId,
        current(state.items),
        current(state.itemList),
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.itemList = [];
      state.cartId = "";
      if (isClient) localStorage.removeItem(CART_KEY);
    },
    setItemList: (state, action: { payload: CartItemListResponse[] }) => {
      state.itemList = action.payload;
    },
  },

  extraReducers(builder) {
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.cartId = action.payload.cartId ?? "";
          state.items = action.payload.items ?? [];
          state.itemList = action.payload.itemList ?? [];
        }
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load cart";
      })
      .addCase("auth/logOut", (state) => {
        state.items = [];
        state.itemList = [];
        state.cartId = "";
        state.loading = false;
        state.error = null;
      });
  },
});

export const { addToCart, removeFromCart, clearCart, setItemList } =
  CartSlice.actions;
export const CartReducer = CartSlice.reducer;

// ─── Dispatch loadCart once in root layout ────────────────────────────────────
// useEffect(() => { dispatch(loadCart()); }, [dispatch]);
