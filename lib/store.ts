
import { adminThemeReducer } from './features/theme/adminThemeSlice';
import { CartReducer } from './features/Cart';
import { cartSidebarReducer } from './features/CartSidebar';
import { menuReducer } from './features/menuBar';
import { sidebarReducer } from './features/sidebar';
import { authReducer, getPreloadedAuthState } from './features/auth/authSlice';
import { WishlistReducer } from './features/Wishlist';
import { configureStore } from '@reduxjs/toolkit';
import { get } from 'http';

const isClient = typeof window !== 'undefined';

type PartialRootState = {
    auth: ReturnType<typeof authReducer>;
    adminTheme?: ReturnType<typeof adminThemeReducer>;
    sidebar?: ReturnType<typeof sidebarReducer>;
    menu?: ReturnType<typeof menuReducer>;
    cart?: ReturnType<typeof CartReducer>;
    cartSidebar?: ReturnType<typeof cartSidebarReducer>;
    wishlist?: ReturnType<typeof WishlistReducer>;
};
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
        if (action.type === 'auth/loginSuccess' || action.type === 'auth/logOut') {
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

export const store = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            adminTheme: adminThemeReducer,
            sidebar: sidebarReducer,
            menu: menuReducer,
            cart: CartReducer,
            cartSidebar: cartSidebarReducer,
            wishlist: WishlistReducer,
        },
        preloadedState: getPreloadedAuthState(),
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
    })
}
export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
