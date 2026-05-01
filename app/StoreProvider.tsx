'use client';

import { Provider } from 'react-redux';
import { AppStore, store } from '../lib/store';
import { useEffect, useRef } from 'react';
import { loadCart } from '@/lib/features/Cart';
import { loadWishlist } from '@/lib/features/Wishlist';

export default function ReduxProviders({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);

    // 1. Initialize the store ONLY (No side effects here!)
    if (!storeRef.current) {
        storeRef.current = store();
    }

    // 2. Hydrate local data safely after the component mounts on the client
    useEffect(() => {
        if (storeRef.current) {
            storeRef.current.dispatch(loadCart());
            storeRef.current.dispatch(loadWishlist());
        }
    }, []);

    return (
        <Provider store={storeRef.current}>
            {children}
        </Provider>
    );
}