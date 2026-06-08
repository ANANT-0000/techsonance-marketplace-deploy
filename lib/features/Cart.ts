import { CartItemListResponse } from "@/app/(storefront)/customer/cart/CartClient";
import { companyDomain } from "@/config";
import { CART_KEY, CartItem, IS_AUTHENTICATED_KEY, USER_STORAGE_KEY } from "@/constants";
import { authToken } from "@/utils/authToken";
import { fetchGetCartList, fetchAddToCart } from "@/utils/customerApiClient";
import { fetchProductVariantDetails } from "@/utils/commonAPiClient";
import { Variant } from "@/utils/Types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface CartState {
    cartId: string;
    items: CartItem[];
    itemList: CartItemListResponse[];
    loading: boolean;
    error: string | null;
}

const isClient = typeof window !== 'undefined';

const saveCartToLocalStorage = (cartId: string, items: CartItem[]) => {
    if (!isClient) return;
    try {
        localStorage.setItem(CART_KEY, JSON.stringify({ cartId, items }));
    } catch (e) {
        console.error("Could not save cart to localStorage", e);
    }
};

const loadCartFromLocalOrServer = async (): Promise<Omit<CartState, 'loading' | 'error'>> => {
    if (!isClient) return { cartId: '', items: [], itemList: [] };
    const token = authToken();
    try {
        const isCustomer: {
            isAuthenticated: boolean;
            role: string;
        } | null = JSON.parse(localStorage.getItem(IS_AUTHENTICATED_KEY) || '{}')
        if (isCustomer?.role === 'admin' || isCustomer?.role === 'vendor') {
            return { cartId: '', items: [], itemList: [] };
        }
        const serializedCart = localStorage.getItem(CART_KEY);
        let customerId = localStorage.getItem(USER_STORAGE_KEY)
        if (customerId && customerId !== 'undefined' && customerId !== 'null') {
            customerId = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) as string)?.id
        }
        if (customerId && companyDomain && token) {
            console.log("Fetching cart from server for customerId:", customerId);
            const response = await fetchGetCartList(customerId, token);
            if (response && response.success && response.data && response.data.length > 0) {
                const itemList: CartItemListResponse[] = response.data;

                const items: CartItem[] = itemList.map((item) => ({
                    cartId: item.cart_id,
                    cartItemId: item.id,
                    quantity: item.quantity,
                    productVariantId: item.product_variant_id,
                }));

                const cartId = itemList[0]?.cart_id ?? '';
                saveCartToLocalStorage(cartId, items);

                return { cartId, items, itemList };
            }
        }
        if (serializedCart) {
            const parsedCart = JSON.parse(serializedCart);
            if (parsedCart && Array.isArray(parsedCart.items)) {
                const items: CartItem[] = parsedCart.items;
                const itemList: CartItemListResponse[] = [];

                try {
                    const detailsPromises = items.map(async (item) => {
                        const res = await fetchProductVariantDetails(item.productVariantId);
                        if (res && res.success && res.data) {
                            const variantData = res.data;

                            // Map VariantDetails to Variant shape
                            let imagesArray: any[] = [];
                            if (Array.isArray(variantData.images)) {
                                imagesArray = variantData.images.map((img: any, idx: number) => ({
                                    id: img.id || String(idx),
                                    image_url: img.image_url || img.imageUrl,
                                    alt_text: img.alt_text || variantData.variant_name,
                                    is_primary: img.is_primary || idx === 0,
                                    imgType: img.imgType || 'main',
                                }));
                            } else if (typeof variantData.images === 'string') {
                                imagesArray = [{
                                    id: 'primary',
                                    image_url: variantData.images,
                                    alt_text: variantData.variant_name,
                                    is_primary: true,
                                    imgType: 'main',
                                }];
                            }

                            const transformedVariant: Variant = {
                                id: variantData.id,
                                variant_name: variantData.variant_name,
                                sku: variantData.sku,
                                price: variantData.price,
                                status: variantData.status,
                                product_id: variantData.product_id || '',
                                images: imagesArray,
                                attributes: [],
                                stock_quantity: variantData.stock_quantity ?? 9999,
                                created_at: '',
                                updated_at: '',
                                seo_meta: null,
                                inventory: { stock_quantity: variantData.stock_quantity ?? 9999, warehouse_id: '' }
                            } as any;

                            itemList.push({
                                id: item.productVariantId,
                                cart_id: '',
                                product_variant_id: item.productVariantId,
                                quantity: item.quantity,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                productVariant: transformedVariant
                            });
                        }
                    });
                    await Promise.all(detailsPromises);
                } catch (err) {
                    console.error("Error fetching guest variant details:", err);
                }

                return { cartId: '', items, itemList };
            }
        }

    } catch (e) {
        console.error("Could not load cart from localStorage or server", e);
    }

    return { cartId: '', items: [], itemList: [] };
};

export const loadCart = createAsyncThunk('cart/load', async () => {
    return await loadCartFromLocalOrServer();
});

export const syncCartAfterLogin = createAsyncThunk(
    'cart/syncAfterLogin',
    async (payload: { userId: string; token: string }, { dispatch }) => {
        if (!isClient) return;
        try {
            const serializedCart = localStorage.getItem(CART_KEY);
            if (!serializedCart) return;

            const parsedCart = JSON.parse(serializedCart);
            if (!parsedCart || !Array.isArray(parsedCart.items) || parsedCart.items.length === 0) {
                return;
            }

            const guestItems = parsedCart.items;

            // 1. Fetch current database cart items
            let dbItems: any[] = [];
            const dbCartResponse = await fetchGetCartList(payload.userId, payload.token);
            if (dbCartResponse && dbCartResponse.success && Array.isArray(dbCartResponse.data)) {
                dbItems = dbCartResponse.data;
            }

            // 2. Perform merge calls in parallel using fetchAddToCart
            const mergePromises = guestItems.map(async (guestItem: CartItem) => {
                const dbMatch = dbItems.find((item: any) => item.product_variant_id === guestItem.productVariantId);
                if (dbMatch) {
                    // Sum the quantities
                    const newQuantity = guestItem.quantity + dbMatch.quantity;
                    await fetchAddToCart(guestItem.productVariantId, newQuantity, payload.userId, payload.token);
                } else {
                    // Add new item
                    await fetchAddToCart(guestItem.productVariantId, guestItem.quantity, payload.userId, payload.token);
                }
            });

            await Promise.all(mergePromises);

            // 3. Clear guest cart from local storage
            localStorage.removeItem(CART_KEY);

            // 4. Reload the cart state from database
            dispatch(loadCart());
        } catch (error) {
            console.error("Error during cart sync after login:", error);
        }
    }
);

const initialState: CartState = {
    cartId: '',
    items: [],
    itemList: [],
    loading: false,
    error: null,
};


const CartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: { payload: CartItem }) => {
            if (!state.cartId && action.payload.cartId) {
                state.cartId = action.payload.cartId;
            }
            const existingItem = state.items.find(
                (item) => item.productVariantId === action.payload.productVariantId
            );
            if (existingItem) {
                existingItem.quantity = action.payload.quantity ?? existingItem.quantity + 1;
            } else {
                state.items.push({ ...action.payload, quantity: action.payload.quantity ?? 1 });
            }

            // Keep itemList in sync
            const existingItemList = state.itemList.find(
                (item) => item.product_variant_id === action.payload.productVariantId
            );
            if (existingItemList) {
                existingItemList.quantity = action.payload.quantity ?? existingItemList.quantity + 1;
            }

            saveCartToLocalStorage(state.cartId, state.items);
        },
        removeFromCart: (state, action: { payload: { productVariantId: string; quantity?: number } }) => {
            const existingItem = state.items.find(
                (item) => item.productVariantId === action.payload.productVariantId
            );

            if (existingItem) {
                if (action.payload.quantity !== undefined) {
                    if (action.payload.quantity <= 0) {
                        state.items = state.items.filter(
                            (item) => item.productVariantId !== action.payload.productVariantId
                        );
                    } else {
                        existingItem.quantity = action.payload.quantity;
                    }
                } else {
                    if (existingItem.quantity > 1) {
                        existingItem.quantity -= 1;
                    } else {
                        state.items = state.items.filter(
                            (item) => item.productVariantId !== action.payload.productVariantId
                        );
                    }
                }
            }

            const existingItemList = state.itemList.find(
                (item) => item.product_variant_id === action.payload.productVariantId
            );
            if (existingItemList) {
                if (action.payload.quantity !== undefined) {
                    if (action.payload.quantity <= 0) {
                        state.itemList = state.itemList.filter(
                            (item) => item.product_variant_id !== action.payload.productVariantId
                        );
                    } else {
                        existingItemList.quantity = action.payload.quantity;
                    }
                } else {
                    if (existingItemList.quantity > 1) {
                        existingItemList.quantity -= 1;
                    } else {
                        state.itemList = state.itemList.filter(
                            (item) => item.product_variant_id !== action.payload.productVariantId
                        );
                    }
                }
            }

            saveCartToLocalStorage(state.cartId, state.items);
        },

        clearCart: (state) => {
            state.items = [];
            state.itemList = [];
            state.cartId = '';
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
                    state.cartId = action.payload.cartId ?? '';
                    state.items = action.payload.items ?? [];
                    state.itemList = action.payload.itemList ?? [];
                }
            })
            .addCase(loadCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? 'Failed to load cart';
            });
    },
});

export const { addToCart, removeFromCart, clearCart, setItemList } = CartSlice.actions;
export const CartReducer = CartSlice.reducer;

// ─── Dispatch loadCart once in root layout ────────────────────────────────────
// useEffect(() => { dispatch(loadCart()); }, [dispatch]);