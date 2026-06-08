'use client';

import { Provider } from 'react-redux';
import { AppStore, store, RootState } from '../lib/store';
import { useEffect, useRef } from 'react';
import { loadCart, syncCartAfterLogin } from '@/lib/features/Cart';
import { loadWishlist } from '@/lib/features/Wishlist';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { authToken } from '@/utils/authToken';

function CartSyncWatcher() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const token = authToken();
    const prevUserRef = useRef(user);

    useEffect(() => {
        if (user && user.id && !prevUserRef.current && token) {
            dispatch(syncCartAfterLogin({ userId: user.id, token }));
        }
        prevUserRef.current = user;
    }, [user, token, dispatch]);

    return null;
}

export default function ReduxProviders({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    const hasFetched = useRef(false);
    // 1. Initialize the store ONLY (No side effects here!)
    if (!storeRef.current) {
        storeRef.current = store();
    }

    // 2. Hydrate local data safely after the component mounts on the client
    useEffect(() => {
       if (!hasFetched.current && storeRef.current) {
    hasFetched.current = true;
    storeRef.current.dispatch(loadCart());
    storeRef.current.dispatch(loadWishlist());
  }
    }, []);

    return (
        <Provider store={storeRef.current}>
            <CartSyncWatcher />
            {children}
        </Provider>
    );
}