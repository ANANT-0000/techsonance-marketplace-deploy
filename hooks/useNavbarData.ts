import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { NAV_LINKS } from '@/constants/customer';

const NAVBAR_CACHE_KEY = 'techsonance_cms_navbar';
const LANG_KEY = 'techsonance_locale';

export function useNavbarData() {
  const [lang, setLang] = useState<string>('en');
  const [menuLinks, setMenuLinks] = useState<any[]>(NAV_LINKS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_KEY) || 'en';
      setLang(savedLang);
    }
  }, []);

  const fetchNavbar = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`${NAVBAR_CACHE_KEY}_${currentLang}`);
      if (cached) {
        setMenuLinks(JSON.parse(cached));
      }
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
          localStorage.setItem(`${NAVBAR_CACHE_KEY}_${currentLang}`, JSON.stringify(parsed.links));
        }
      }
    } catch (err) {
      console.warn('Using default static navbar links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to locale changes triggered by homepage selector
  useEffect(() => {
    const checkLocale = setInterval(() => {
      if (typeof window !== 'undefined') {
        const currentSaved = localStorage.getItem(LANG_KEY) || 'en';
        if (currentSaved !== lang) {
          setLang(currentSaved);
        }
      }
    }, 1000);
    return () => clearInterval(checkLocale);
  }, [lang]);

  useEffect(() => {
    fetchNavbar(lang);
  }, [lang, fetchNavbar]);

  return { menuLinks, isLoading };
}
