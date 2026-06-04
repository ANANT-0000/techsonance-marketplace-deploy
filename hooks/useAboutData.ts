import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { AboutPageContent } from '@/constants/customer';

const ABOUT_CACHE_KEY = 'techsonance_cms_about';
const LANG_KEY = 'techsonance_locale';

export function useAboutData() {
  const [lang, setLang] = useState<string>('en');
  const [aboutContent, setAboutContent] = useState<any>(AboutPageContent);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_KEY) || 'en';
      setLang(savedLang);
    }
  }, []);

  const fetchAbout = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`${ABOUT_CACHE_KEY}_${currentLang}`);
      if (cached) {
        setAboutContent(JSON.parse(cached));
      }
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
        localStorage.setItem(`${ABOUT_CACHE_KEY}_${currentLang}`, JSON.stringify(parsed));
      }
    } catch (err) {
      console.warn('Using default static About Us content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync state if user changes locale via homepage pill
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
    fetchAbout(lang);
  }, [lang, fetchAbout]);

  return { aboutContent, isLoading };
}
