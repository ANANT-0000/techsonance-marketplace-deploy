
import { adminThemeReducer } from './features/theme/adminThemeSlice';
import { CartReducer } from './features/Cart';
import { cartSidebarReducer } from './features/CartSidebar';
import { menuReducer } from './features/menuBar';
import { sidebarReducer } from './features/sidebar';
import { authReducer } from './features/auth/authSlice';
import { WishlistReducer } from './features/Wishlist';
import { configureStore } from '@reduxjs/toolkit';

const isClient = typeof window !== 'undefined';

const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
    try {
        const result = next(action);
        if (!isClient) return result;

        if (action.type.startsWith('cart/')) {
            const cartState = store.getState().cart;
            if (Array.isArray(cartState.items)) {
                localStorage.setItem('cart', JSON.stringify(cartState));
            }
        }
        if (action.type.startsWith('auth/')) {
            const authState = store.getState().auth;
            localStorage.setItem('auth', JSON.stringify(authState));
        }
        if (action.type.startsWith('cartSidebar/')) {
            const cartSidebarState = store.getState().cartSidebar;
            localStorage.setItem('cartSidebar', JSON.stringify(cartSidebarState));
        }
        if (action.type.startsWith('wishlist/')) {
            const wishlistState = store.getState().wishlist;
            localStorage.setItem('wishlist', JSON.stringify(wishlistState));
        }
        return result;
    } catch (error) {
        console.error('CRASH IN REDUCER FOR ACTION:', action.type);
        console.error('The exact error is:', error);
        throw error;
    }
}

export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminTheme: adminThemeReducer,
        sidebar: sidebarReducer,
        menu: menuReducer,
        cart: CartReducer,
        cartSidebar: cartSidebarReducer,
        wishlist: WishlistReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
