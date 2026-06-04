import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { ContactPageContent, ContactList } from '@/constants/customer';

const CONTACT_CACHE_KEY = 'soundsphere_cms_contact';
const LANG_KEY = 'soundsphere_locale';

export function useContactData() {
  const [lang, setLang] = useState<string>('en');
  const [heroContent, setHeroContent] = useState<any>(ContactPageContent);
  const [contactList, setContactList] = useState<any[]>(ContactList);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_KEY) || 'en';
      setLang(savedLang);
    }
  }, []);

  const fetchContact = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`${CONTACT_CACHE_KEY}_${currentLang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setHeroContent(parsed.hero || ContactPageContent);
        setContactList(parsed.list || ContactList);
      }
    }
    try {
      const res = await AxiosAPI.get(`/v1/cms/contact?lang=${currentLang}`);
      if (res.data && res.data.content) {
        const parsed = typeof res.data.content === 'string'
          ? JSON.parse(res.data.content)
          : res.data.content;
        
        const hero = parsed.hero || ContactPageContent;
        const list = parsed.list || ContactList;
        setHeroContent(hero);
        setContactList(list);
        localStorage.setItem(`${CONTACT_CACHE_KEY}_${currentLang}`, JSON.stringify({ hero, list }));
      }
    } catch (err) {
      console.warn('Using default static Contact content');
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
    fetchContact(lang);
  }, [lang, fetchContact]);

  return { heroContent, contactList, isLoading };
}
