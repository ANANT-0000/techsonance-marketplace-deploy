import { useState, useEffect, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import { ContactPageContent, ContactList } from "@/constants/customer";
import { getCachedData, cacheData, subscribeLocaleChange } from "@/utils/cache";

const CONTACT_CACHE_KEY = "techsonance_cms_contact";
const LANG_KEY = "techsonance_locale";

export function useContactData() {
  const [lang, setLang] = useState<string>("en");
  const [heroContent, setHeroContent] = useState<any>(ContactPageContent);
  const [contactList, setContactList] = useState<any[]>(ContactList);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize lang and subscribe to changes without polling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(LANG_KEY) || "en";
      setLang(savedLang);
    }
    const unsubscribe = subscribeLocaleChange((newLang) => {
      setLang(newLang);
    });
    return unsubscribe;
  }, []);

  const fetchContact = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    const cached = getCachedData(`${CONTACT_CACHE_KEY}_${currentLang}`);
    if (cached) {
      setHeroContent(cached.hero || ContactPageContent);
      setContactList(cached.list || ContactList);
      setIsLoading(false);
      return;
    }

    try {
      const res = await AxiosAPI.get(`/v1/cms/contact?lang=${currentLang}`);
      const cmsRow = res.data?.data ?? res.data;
      const rawContent = cmsRow?.content;
      if (rawContent) {
        const parsed =
          typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;

        const hero = parsed.hero || ContactPageContent;
        const list = parsed.list || ContactList;
        setHeroContent(hero);
        setContactList(list);
        cacheData(`${CONTACT_CACHE_KEY}_${currentLang}`, { hero, list });
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContact(lang);
  }, [lang, fetchContact]);

  return { heroContent, contactList, isLoading };
}
