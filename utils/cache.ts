const LANG_KEY = 'techsonance_locale';

export const cacheData = (key: string, data: any, ttlMs: number = 300000) => { // 5 minutes
  if (typeof window === 'undefined') return;
  const item = {
    value: data,
    expiry: Date.now() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCachedData = (key: string) => {
  if (typeof window === 'undefined') return null;
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
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, newLang);
  window.dispatchEvent(new CustomEvent('techsonance_locale_change', { detail: newLang }));
};

export const subscribeLocaleChange = (callback: (lang: string) => void) => {
  if (typeof window === 'undefined') return () => {};
  const handleCustom = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail || 'en');
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LANG_KEY) {
      callback(e.newValue || 'en');
    }
  };
  window.addEventListener('techsonance_locale_change', handleCustom);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('techsonance_locale_change', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
};
