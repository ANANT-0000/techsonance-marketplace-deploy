import { CartItemListResponse } from "@/app/(shop)/customerProfile/[userId]/cart/page";
import { companyDomain } from "@/config";
import { CART_KEY, CartItemType, USER_STORAGE_KEY } from "@/constants";
import { fetchGetCartList } from "@/utils/customerApiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface CartState {
    cartId: string;
    items: CartItemType[];
    itemList: CartItemListResponse[];
    loading: boolean;
    error: string | null;
}

const isClient = typeof window !== 'undefined';

const saveCartToLocalStorage = (cartId: string, items: CartItemType[]) => {
    if (!isClient) return;
    try {
        localStorage.setItem(CART_KEY, JSON.stringify({ cartId, items }));
    } catch (e) {
        console.error("Could not save cart to localStorage", e);
    }
};
const loadCartFromLocalOrServer = async (): Promise<Omit<CartState, 'loading' | 'error'>> => {
    if (!isClient) return { cartId: '', items: [], itemList: [] };

    try {
        const serializedCart = localStorage.getItem(CART_KEY);
        const customerId = localStorage.getItem(USER_STORAGE_KEY)
            ? JSON.parse(localStorage.getItem(USER_STORAGE_KEY) as string)?.id
            : null;
        if (customerId && companyDomain) {
            const response = await fetchGetCartList(customerId, companyDomain);
            if (response.ok && Array.isArray(response.data)) {
                const itemList: CartItemListResponse[] = response.data;
                
                const items: CartItemType[] = itemList.map((item) => ({
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
                return { ...parsedCart, itemList: [] };
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
        addToCart: (state, action: { payload: CartItemType }) => {
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
            saveCartToLocalStorage(state.cartId, state.items);
        },
        removeFromCart: (state, action: { payload: { productVariantId: string; quantity?: number } }) => {
            const existingItem = state.items.find(
                (item) => item.productVariantId === action.payload.productVariantId
            );

            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity = action.payload.quantity ?? existingItem.quantity - 1;
                } else {
                    state.items = state.items.filter(
                        (item) => item.productVariantId !== action.payload.productVariantId
                    );
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