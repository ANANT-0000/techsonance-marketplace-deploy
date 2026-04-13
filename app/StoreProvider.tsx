'use client';
import { Provider } from 'react-redux';
import { AppStore, store } from '../lib/store';
import { useEffect, useRef } from 'react';
import { loadCart } from '@/lib/features/Cart';
import { loadWishlist } from '@/lib/features/Wishlist';

export default function ReduxProviders({ children }: { children: React.ReactNode }): React.ReactNode {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = store();
        storeRef.current?.dispatch(loadCart());
        storeRef.current?.dispatch(loadWishlist());
    }
    // useEffect(() => {
    //     storeRef.current?.dispatch(loadCart());
    //     storeRef.current?.dispatch(loadWishlist());
    // }, [])
    return (
        <>
            <Provider store={storeRef.current}>
                {children}
            </Provider>

        </>
    );
}