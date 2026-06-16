"use client";

import { Provider } from "react-redux";
import { AppStore, store, RootState } from "../lib/store";
import { useEffect, useRef } from "react";
import { loadCart, syncCartAfterLogin } from "@/lib/features/Cart";
import { loadWishlist } from "@/lib/features/Wishlist";
import { hydrateAuth } from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { authToken } from "@/utils/authToken";
import { usePathname, useSearchParams } from "next/navigation";
import { stopPageLoading } from "@/lib/features/pageLoading";
import { PageLoader } from "@/components/customer/PageLoader";
import { Suspense } from "react";

const UNDEFINED_TYPE = "undefined";
const EVENT_ONLINE = "online";

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

  useEffect(() => {
    if (typeof window === UNDEFINED_TYPE) return;

    const handleOnline = () => {
      dispatch(loadCart());
    };

    window.addEventListener(EVENT_ONLINE, handleOnline);
    return () => {
      window.removeEventListener(EVENT_ONLINE, handleOnline);
    };
  }, [dispatch]);

  return null;
}

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(stopPageLoading());
  }, [pathname, searchParams, dispatch]);

  return null;
}

function PageLoadingWatcher({ children }: { children: React.ReactNode }) {
  const { isPageLoading } = useAppSelector(
    (state: RootState) => state.pageLoading,
  );

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
      {isPageLoading && <PageLoader />}
      {children}
    </>
  );
}

export default function ReduxProviders({
  children,
}: {
  children: React.ReactNode;
}) {
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
      storeRef.current.dispatch(hydrateAuth());
      storeRef.current.dispatch(loadCart());
      storeRef.current.dispatch(loadWishlist());
    }
  }, []);

  return (
    <Provider store={storeRef.current}>
      <CartSyncWatcher />
      <PageLoadingWatcher>{children}</PageLoadingWatcher>
    </Provider>
  );
}
