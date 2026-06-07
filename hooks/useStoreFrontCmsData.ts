import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { getCachedData, cacheData, subscribeLocaleChange } from '@/utils/cache';

const STOREFRONT_CACHE_KEY = 'techsonance_cms_storefront';
const LANG_KEY = 'techsonance_locale';

const defaultPromo = {
  promo_banner_title: 'Uncompromised High-Fidelity Audio',
  promo_banner_desc: 'Save up to 40% on professional studio monitors, reference headphones, and smart amplifiers. Limited time collection.',
  promo_banner_image_url: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop',
  promo_banner_link: '/store?tag=promotion'
};

export function useStoreFrontCmsData() {
  const [lang, setLang] = useState<string>('en');
  const [promoContent, setPromoContent] = useState<any>(defaultPromo);
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
        const parsed = typeof rawContent === 'string'
          ? JSON.parse(rawContent)
          : rawContent;

        setPromoContent(parsed);
        cacheData(`${STOREFRONT_CACHE_KEY}_${currentLang}`, parsed);
      }
    } catch (err) {
      console.warn('Using default static storefront promotions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreFrontCms(lang);
  }, [lang, fetchStoreFrontCms]);

  return { promoContent, isLoading };
}
