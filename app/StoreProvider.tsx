"use client";

import { Provider } from "react-redux";
import { AppStore, store, RootState } from "../lib/store";
import { useEffect, useRef, useState } from "react";
import { loadCart, syncCartAfterLogin } from "@/lib/features/Cart";
import { loadWishlist } from "@/lib/features/Wishlist";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { authToken } from "@/utils/authToken";
import { useThemeData } from "@/hooks/useThemeData";
import {
  BASE_API_URL,
  DEFAULT_FAVICON_PATH,
  BRANDING_ENDPOINT,
  HEADER_COMPANY_DOMAIN,
} from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";

const UNDEFINED_TYPE = "undefined";
const EVENT_ONLINE = "online";
const REL_ICON = "icon";

function DynamicFavicon() {
  const { themeData } = useThemeData();
  const [faviconUrl, setFaviconUrl] = useState<string>(() => {
    if (typeof window !== UNDEFINED_TYPE) {
      try {
        const themeCache = localStorage.getItem("techsonance_cms_theme");
        if (themeCache) {
          const parsed = JSON.parse(themeCache);
          if (parsed?.value?.favicon_url) {
            return parsed.value.favicon_url;
          }
        }
      } catch (e) {}
    }
    return "";
  });

  // Keep faviconUrl in sync with the fetched theme data if it changes
  useEffect(() => {
    if (themeData?.favicon_url) {
      setFaviconUrl(themeData.favicon_url);
    }
  }, [themeData?.favicon_url]);

  useEffect(() => {
    if (faviconUrl) return;

    let active = true;
    async function fetchFavicon() {
      try {
        const companyDomain = await getCompanyDomain();
        const res = await fetch(`${BASE_API_URL}${BRANDING_ENDPOINT}`, {
          headers: {
            [HEADER_COMPANY_DOMAIN]: companyDomain || "",
          },
        });
        if (res.ok) {
          const result = await res.json();
          const branding = result?.data;
          if (branding?.favicon_url && active) {
            setFaviconUrl(branding.favicon_url);
            const cacheItem = {
              value: {
                ...branding,
              },
              expiry: Date.now() + 500000, // 5 minutes TTL
            };
            localStorage.setItem(
              "techsonance_cms_theme",
              JSON.stringify(cacheItem),
            );
          }
        }
      } catch (e) {}
    }

    fetchFavicon();
    return () => {
      active = false;
    };
  }, [faviconUrl]);

  const finalFavicon = faviconUrl || DEFAULT_FAVICON_PATH;

  return <link rel={REL_ICON} href={finalFavicon} />;
}

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
      storeRef.current.dispatch(loadCart());
      storeRef.current.dispatch(loadWishlist());
    }
  }, []);

  return (
    <Provider store={storeRef.current}>
      <CartSyncWatcher />
      <DynamicFavicon />
      {children}
    </Provider>
  );
}
