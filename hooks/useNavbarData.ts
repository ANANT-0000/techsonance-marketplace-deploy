import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { NAV_LINKS } from '@/constants/customer';
import { getCachedData, cacheData, subscribeLocaleChange } from '@/utils/cache';

const NAVBAR_CACHE_KEY = 'techsonance_cms_navbar';
const LANG_KEY = 'techsonance_locale';

export function useNavbarData() {
  const [lang, setLang] = useState<string>('en');
  const [menuLinks, setMenuLinks] = useState<any[]>(NAV_LINKS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize lang and subscribe to changes without polling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_KEY) || 'en';
      setLang(savedLang);
    }
    const unsubscribe = subscribeLocaleChange((newLang) => {
      setLang(newLang);
    });
    return unsubscribe;
  }, []);

  const fetchNavbar = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    const cached = getCachedData(`${NAVBAR_CACHE_KEY}_${currentLang}`);
    if (cached) {
      setMenuLinks(cached);
      setIsLoading(false);
      return;
    }

    try {
      const res = await AxiosAPI.get(`/v1/cms/navbar?lang=${currentLang}`);
      const cmsRow = res.data?.data ?? res.data;
      const rawContent = cmsRow?.content;
      if (rawContent) {
        const parsed = typeof rawContent === 'string'
          ? JSON.parse(rawContent)
          : rawContent;
        
        if (parsed.links && Array.isArray(parsed.links)) {
          setMenuLinks(parsed.links);
          cacheData(`${NAVBAR_CACHE_KEY}_${currentLang}`, parsed.links);
        }
      }
    } catch (err) {
      console.warn('Using default static navbar links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavbar(lang);
  }, [lang, fetchNavbar]);

  return { menuLinks, isLoading };
}
