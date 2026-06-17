import { ENV_DEVELOPMENT } from "@/constants";

const LANG_KEY = "techsonance_locale";
const LARGE_DATA_THRESHOLD = 15360; // 15KB

export const cacheData = (key: string, data: any, ttlMs: number = 300000) => {
  // 5 minutes
  if (typeof window === "undefined") return;

  // Dev condition: If env is dev, do not cache
  if (process.env.NODE_ENV === ENV_DEVELOPMENT) {
    return;
  }

  const item = {
    value: data,
    expiry: Date.now() + ttlMs,
  };

  try {
    const serialized = JSON.stringify(item);

    // Cache large data slowly (deferred to requestIdleCallback or setTimeout)
    if (serialized.length > LARGE_DATA_THRESHOLD) {
      const saveToCache = () => {
        try {
          localStorage.setItem(key, serialized);
        } catch (e) {}
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => saveToCache(), { timeout: 2000 });
      } else {
        setTimeout(saveToCache, 500);
      }
    } else {
      localStorage.setItem(key, serialized);
    }
  } catch (err) {}
};

export const getCachedData = (key: string) => {
  if (typeof window === "undefined") return null;

  // Dev condition: If env is dev, do not use caching
  if (process.env.NODE_ENV === ENV_DEVELOPMENT) {
    return null;
  }

  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
};

export const dispatchLocaleChange = (newLang: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANG_KEY, newLang);
  window.dispatchEvent(
    new CustomEvent("techsonance_locale_change", { detail: newLang }),
  );
};

export const subscribeLocaleChange = (callback: (lang: string) => void) => {
  if (typeof window === "undefined") return () => {};
  const handleCustom = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail || "en");
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LANG_KEY) {
      callback(e.newValue || "en");
    }
  };
  window.addEventListener("techsonance_locale_change", handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("techsonance_locale_change", handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
};
