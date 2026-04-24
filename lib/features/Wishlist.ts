import { USER_STORAGE_KEY, WISHLIST_KEY } from "@/constants/constants";
import { fetchCustomerWishlist } from "@/utils/customerApiClient";
import { Variant } from "@/utils/Types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCompanyDomain } from "../get-domain";


export interface WishlistItem {
    id: string;
    wishlist_id: string;
    product_variant_id: string;
    created_at?: string;
    updated_at?: string;
}

interface WishlistServerResponse {
    id: string;
    wishlist_id: string;
    productVariant: Variant[];
    product_variant_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface WishlistState {
    wishlistId: string;
    wishItems: WishlistItem[];
    loading: boolean;
    error: string | null;
}

const isClient = typeof window !== 'undefined';

const saveWishlistToLocalStorage = (wishlistId: string, wishItems: WishlistItem[]) => {
    if (!isClient) return;
    try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify({ wishlistId, wishItems }));
    } catch (e) {
        console.error("Could not save wishlist to localStorage", e);
    }
};

// ─── Loader ───────────────────────────────────────────────────────────────────

const loadWishlistFromLocalOrServer = async (): Promise<Omit<WishlistState, 'loading' | 'error'>> => {
    if (!isClient) return { wishlistId: '', wishItems: [] };
    const companyDomain = await getCompanyDomain();
    let localFallback: Omit<WishlistState, 'loading' | 'error'> = { wishlistId: '', wishItems: [] };

    try {
        const serializedWishlist = localStorage.getItem(WISHLIST_KEY);

        if (serializedWishlist) {
            const parsed = JSON.parse(serializedWishlist);
            if (parsed && Array.isArray(parsed.wishItems)) {
                localFallback = { ...parsed, wishItems: parsed.wishItems as WishlistItem[] };
            }
        }

        const customerId = localStorage.getItem(USER_STORAGE_KEY)
            ? JSON.parse(localStorage.getItem(USER_STORAGE_KEY) as string)?.id
            : null;

        if (customerId && companyDomain) {
            const response = await fetchCustomerWishlist(customerId);

            if (response && 'ok' in response && response.ok && response.data) {
                const serverData: WishlistServerResponse[] = response.data;

                if (serverData.length > 0) {
                    const wishItems: WishlistItem[] = serverData.map((item: WishlistServerResponse) => ({
                        id: item.id,
                        wishlist_id: item.wishlist_id,
                        product_variant_id: item.product_variant_id,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                    }));
                    const wishlistId = serverData[0].wishlist_id;
                    saveWishlistToLocalStorage(wishlistId, wishItems);
                    return { wishlistId, wishItems };
                }

            }
        }
    } catch (e) {
        console.error("Could not load wishlist from localStorage or server", e);
        return localFallback;
    }

    return localFallback;
};


export const loadWishlist = createAsyncThunk('wishlist/load', async () => {
    return await loadWishlistFromLocalOrServer();
});

const initialState: WishlistState = {
    wishlistId: '',
    wishItems: [],
    loading: false,
    error: null,
};


const WishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action: { payload: WishlistItem }) => {
            if (state.loading) return;

            const existingItem = state.wishItems.find(
                (item) => item.product_variant_id === action.payload.product_variant_id
            );

            if (!existingItem) {
                state.wishItems.push(action.payload);
                saveWishlistToLocalStorage(state.wishlistId, state.wishItems);
            }
        },

        removeFromWishlist: (state, action: { payload: string }) => {
            state.wishItems = state.wishItems.filter(
                (item) => item.id !== action.payload
            );

            saveWishlistToLocalStorage(state.wishlistId, state.wishItems);
        },

        setWishlistId: (state, action: { payload: string }) => {
            state.wishlistId = action.payload;
        },

        clearWishlist: (state) => {
            state.wishlistId = '';
            state.wishItems = [];
            if (isClient) localStorage.removeItem(WISHLIST_KEY);
        },
    },

    extraReducers(builder) {
        builder
            .addCase(loadWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadWishlist.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.wishlistId = action.payload.wishlistId ?? '';
                    state.wishItems = action.payload.wishItems ?? [];
                }
            })
            .addCase(loadWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? 'Failed to load wishlist';
            });
    },
});

export const { addToWishlist, removeFromWishlist, setWishlistId, clearWishlist } = WishlistSlice.actions;
export const WishlistReducer = WishlistSlice.reducer;