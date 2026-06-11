import { useState, useEffect, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import { FOOTER_CONTENT, FOOTER_BOTTOM_TEXT } from "@/constants/customer";
import { FooterSectionType } from "@/utils/Types";
import { getCachedData, cacheData, subscribeLocaleChange } from "@/utils/cache";

const FOOTER_CACHE_KEY = "techsonance_cms_footer";
const LANG_KEY = "techsonance_locale";

export function useFooterData() {
  const [lang, setLang] = useState<string>("en");
  const [footerContent, setFooterContent] = useState<FooterSectionType[]>([]);
  const [footerBottomText, setFooterBottomText] = useState<string | null>(null);
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

  const fetchFooter = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    const cached = getCachedData(`${FOOTER_CACHE_KEY}_${currentLang}`);
    if (cached) {
      setFooterContent(cached.content || FOOTER_CONTENT);
      setFooterBottomText(cached.bottomText || FOOTER_BOTTOM_TEXT);
      setIsLoading(false);
      return;
    }

    try {
      const res = await AxiosAPI.get(`/v1/cms/footer?lang=${currentLang}`);
      const cmsRow = res.data?.data ?? res.data;
      const rawContent = cmsRow?.content;
      if (rawContent) {
        const parsed =
          typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;

        const content = parsed.content || FOOTER_CONTENT;
        const bottomText = parsed.bottom_text || FOOTER_BOTTOM_TEXT;
        setFooterContent(content);
        setFooterBottomText(bottomText);
        cacheData(`${FOOTER_CACHE_KEY}_${currentLang}`, {
          content,
          bottomText,
        });
      }
    } catch (err) {
      console.warn("Using default static footer config");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFooter(lang);
  }, [lang, fetchFooter]);

  return { footerContent, footerBottomText, isLoading };
}
