import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { AboutPageContent } from '@/constants/customer';
import { getCachedData, cacheData, subscribeLocaleChange } from '@/utils/cache';

const ABOUT_CACHE_KEY = 'techsonance_cms_about';
const LANG_KEY = 'techsonance_locale';

export function useAboutData() {
  const [lang, setLang] = useState<string>('en');
  const [aboutContent, setAboutContent] = useState<any>(AboutPageContent);
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

  const fetchAbout = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    const cached = getCachedData(`${ABOUT_CACHE_KEY}_${currentLang}`);
    if (cached) {
      setAboutContent(cached);
      setIsLoading(false);
      return;
    }

    try {
      const res = await AxiosAPI.get(`/v1/cms/about?lang=${currentLang}`);
      const cmsRow = res.data?.data ?? res.data;
      const rawContent = cmsRow?.content;
      if (rawContent) {
        const parsed = typeof rawContent === 'string'
          ? JSON.parse(rawContent)
          : rawContent;

        setAboutContent(parsed);
        cacheData(`${ABOUT_CACHE_KEY}_${currentLang}`, parsed);
      }
    } catch (err) {
      console.warn('Using default static About Us content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbout(lang);
  }, [lang, fetchAbout]);

  return { aboutContent, isLoading };
}
