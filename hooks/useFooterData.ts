import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { FOOTER_CONTENT, FOOTER_BOTTOM_TEXT } from '@/constants/customer';

const FOOTER_CACHE_KEY = 'soundsphere_cms_footer';
const LANG_KEY = 'soundsphere_locale';

export function useFooterData() {
  const [lang, setLang] = useState<string>('en');
  const [footerContent, setFooterContent] = useState<any[]>(FOOTER_CONTENT);
  const [footerBottomText, setFooterBottomText] = useState<string>(FOOTER_BOTTOM_TEXT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_KEY) || 'en';
      setLang(savedLang);
    }
  }, []);

  const fetchFooter = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`${FOOTER_CACHE_KEY}_${currentLang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setFooterContent(parsed.content || FOOTER_CONTENT);
        setFooterBottomText(parsed.bottomText || FOOTER_BOTTOM_TEXT);
      }
    }
    try {
      const res = await AxiosAPI.get(`/v1/cms/footer?lang=${currentLang}`);
      if (res.data && res.data.content) {
        const parsed = typeof res.data.content === 'string'
          ? JSON.parse(res.data.content)
          : res.data.content;
        
        const content = parsed.content || FOOTER_CONTENT;
        const bottomText = parsed.bottom_text || FOOTER_BOTTOM_TEXT;
        setFooterContent(content);
        setFooterBottomText(bottomText);
        localStorage.setItem(`${FOOTER_CACHE_KEY}_${currentLang}`, JSON.stringify({ content, bottomText }));
      }
    } catch (err) {
      console.warn('Using default static footer config');
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
    fetchFooter(lang);
  }, [lang, fetchFooter]);

  return { footerContent, footerBottomText, isLoading };
}
