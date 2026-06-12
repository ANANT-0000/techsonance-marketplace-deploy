import { useState, useEffect, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import { getCachedData, cacheData, subscribeLocaleChange } from "@/utils/cache";
import { IMAGE_PLACEHOLDER, LANG_KEY, STOREFRONT_CACHE_KEY } from "@/constants";

const defaultPromo = {
  promo_banner_title: "Uncompromised High-Fidelity Audio",
  promo_banner_desc:
    "Save up to 40% on professional studio monitors, reference headphones, and smart amplifiers. Limited time collection.",
  promo_banner_image_url: IMAGE_PLACEHOLDER,
  promo_banner_link: "/store?tag=promotion",
};

export function useStoreFrontCmsData() {
  const [lang, setLang] = useState<string>("en");
  const [promoContent, setPromoContent] = useState<any>(defaultPromo);
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

  const fetchStoreFrontCms = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    const cached = getCachedData(`${STOREFRONT_CACHE_KEY}_${currentLang}`);
    if (cached) {
      setPromoContent(cached);
      setIsLoading(false);
      return;
    }

    try {
      const res = await AxiosAPI.get(`/v1/cms/store?lang=${currentLang}`);
      const cmsRow = res.data?.data ?? res.data;
      const rawContent = cmsRow?.content;
      if (rawContent) {
        const parsed =
          typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;

        setPromoContent(parsed);
        cacheData(`${STOREFRONT_CACHE_KEY}_${currentLang}`, parsed);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreFrontCms(lang);
  }, [lang, fetchStoreFrontCms]);

  const getField = useCallback(
    (key: string) => {
      if (
        promoContent &&
        promoContent[key] !== undefined &&
        promoContent[key] !== null &&
        promoContent[key] !== ""
      ) {
        return promoContent[key];
      }
    },
    [promoContent],
  );
  return { promoContent, isLoading, getField };
}
