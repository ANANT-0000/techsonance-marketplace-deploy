import { createSlice } from "@reduxjs/toolkit";

interface WishlistItem {
    userId: string;
    productId: string;
    addedAt: string;
}

interface WishlistState {
    wishlist_id: string;
    wishItems: WishlistItem[];
}

const isClient = typeof window !== 'undefined';

const loadWishlistFromLocalStorage = (): WishlistState | null => {
    if (!isClient) return null;
    try {
        const serializedWishlist = localStorage.getItem('wishlist');
        if (serializedWishlist) {
            return JSON.parse(serializedWishlist);
        }
    } catch (e) {
        console.error("Could not load wishlist from localStorage", e);
    }
    return null;
}

const initialState: WishlistState = loadWishlistFromLocalStorage() || {
    wishlist_id: '',
    wishItems: [],
}

const WishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action) => {
            const existingItem = state.wishItems.find(item => item.productId === action.payload.productId);
            if (!existingItem) {
                state.wishItems.push({ ...action.payload, addedAt: new Date().toISOString() });
            }
        },
        removeFromWishlist: (state, action) => {
            state.wishItems = state.wishItems.filter(item => item.productId !== action.payload);
        }
    },
});

export const { addToWishlist, removeFromWishlist } = WishlistSlice.actions;
export const WishlistReducer = WishlistSlice.reducer;