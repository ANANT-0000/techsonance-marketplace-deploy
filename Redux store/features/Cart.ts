import { createSlice } from "@reduxjs/toolkit";

interface CartItem {
    userId: string;
    id: string;
    quantity: number;
    price: number;
}

const isClient = typeof window !== 'undefined';

const loadCartFromLocalStorage = () => {
    if (!isClient) return { items: [] };
    try {
        const serializedCart = localStorage.getItem('cart');
        if (serializedCart) {
            const parsedCart = JSON.parse(serializedCart);
            if (parsedCart && Array.isArray(parsedCart.items)) {
                return parsedCart;
            } else {
                return { items: [] };
            }
        }
    } catch (e) {
        console.error("Could not load cart from localStorage", e);
    }
    return { items: [] };
}

const initialState: { items: CartItem[] } = {
    items: loadCartFromLocalStorage().items || [],
}

const CartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = Array.isArray(state.items) ? state.items.find(item => item.id === action.payload.id) : undefined;
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
        },
        removeFromCart: (state, action) => {
            const existingItem = Array.isArray(state.items) ? state.items.find(item => item.id === action.payload.id) : undefined;
            if (existingItem) {
                state.items = state.items.filter(item => item.id !== action.payload.id);
            }
        },
        updateQuantity: (state, action) => {
            const existingItem = Array.isArray(state.items) ? state.items.find(item => item.id === action.payload.id) : undefined;
            if (existingItem) {
                existingItem.quantity = action.payload.quantity;
            }
        },
        clearCart: (state) => {
            state.items = [];
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = CartSlice.actions;
export const CartReducer = CartSlice.reducer;
