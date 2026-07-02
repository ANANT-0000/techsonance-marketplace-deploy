import { CmsDataKey } from "@/constants/cms";
import { useState, useEffect, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import {
  getCachedData,
  cacheData,
  dispatchLocaleChange,
  subscribeLocaleChange,
} from "@/utils/cache";

// Dynamic banners fallback images

export function useHomepageData() {
  const [lang, setLangState] = useState<string>("en");
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [banners, setBanners] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize lang and subscribe to changes without polling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(CmsDataKey.LANG_KEY) || "en";
      setLangState(savedLang);
    }
    const unsubscribe = subscribeLocaleChange((newLang) => {
      setLangState(newLang);
    });
    return unsubscribe;
  }, []);

  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
    dispatchLocaleChange(newLang);
  }, []);

  const fetchData = useCallback(async (currentLang: string) => {
    setIsLoading(true);
    // Try finding in cache first
    const cachedCms = getCachedData(`${CmsDataKey.CMS_CACHE_KEY}_${currentLang}`);
    if (cachedCms) {
      setCmsContent(cachedCms);
      if (
        Array.isArray(cachedCms.hero_slides) &&
        cachedCms.hero_slides.length > 0
      ) {
        setHeroSlides(cachedCms.hero_slides);
      }
      // If we have cache, we don't block loader for API fetch
      setIsLoading(false);
    }

    try {
      // 1. Fetch CMS Home Page content (fresh from API first)
      try {
        const cmsRes = await AxiosAPI.get(`/v1/cms/home?lang=${currentLang}`, {
          headers: { "x-suppress-toast": true },
        });
        const cmsRow = cmsRes.data?.data ?? cmsRes.data;
        const rawContent = cmsRow?.content;

        if (rawContent) {
          const parsedContent =
            typeof rawContent === "string"
              ? JSON.parse(rawContent)
              : rawContent;
          setCmsContent(parsedContent);
          if (
            Array.isArray(parsedContent.hero_slides) &&
            parsedContent.hero_slides.length > 0
          ) {
            setHeroSlides(parsedContent.hero_slides);
          }
          cacheData(`${CmsDataKey.CMS_CACHE_KEY}_${currentLang}`, parsedContent);
        } else {
          if (!cmsContent) {
            const staleCached = localStorage.getItem(
              `${CmsDataKey.CMS_CACHE_KEY}_${currentLang}`,
            );
            if (staleCached) {
              try {
                const parsed = JSON.parse(staleCached);
                const val = parsed?.value ?? parsed;
                setCmsContent(val);
                if (
                  Array.isArray(val?.hero_slides) &&
                  val.hero_slides.length > 0
                ) {
                  setHeroSlides(val.hero_slides);
                }
              } catch {}
            }
          }
        }
      } catch (err: any) {
        if (!cmsContent) {
          const staleCached = localStorage.getItem(
            `${CmsDataKey.CMS_CACHE_KEY}_${currentLang}`,
          );
          if (staleCached) {
            try {
              const parsed = JSON.parse(staleCached);
              const val = parsed?.value ?? parsed;
              setCmsContent(val);
              if (
                Array.isArray(val?.hero_slides) &&
                val.hero_slides.length > 0
              ) {
                setHeroSlides(val.hero_slides);
              }
            } catch {}
          }
        }
      }

      // 2. Fetch Active Hero Banners
      try {
        const bannersRes = await AxiosAPI.get(
          "/v1/banners/active?placement=homepage_hero",
          { headers: { "x-suppress-toast": true } }
        );
        if (bannersRes.data && Array.isArray(bannersRes.data)) {
          const urls = bannersRes.data
            .map((b: any) => b.image_url)
            .filter(Boolean);
          if (urls.length > 0) {
            setBanners(urls);
            if (typeof window !== "undefined") {
              localStorage.setItem(CmsDataKey.BANNERS_CACHE_KEY, JSON.stringify(urls));
            }
          }
        }
      } catch (err) {
        // Banners are non-critical — use defaults silently
        if (typeof window !== "undefined") {
          const cachedBanners = localStorage.getItem(CmsDataKey.BANNERS_CACHE_KEY);
          if (cachedBanners) setBanners(JSON.parse(cachedBanners));
        }
      }

      // 3. Fetch Categories with Product Images
      try {
        const categoriesRes = await AxiosAPI.get(
          "/v1/categories/homepage?limit=8",
          { headers: { "x-suppress-toast": true } }
        );
        if (categoriesRes.data && Array.isArray(categoriesRes.data.data)) {
          const formatted = categoriesRes.data.data.map((cat: any) => ({
            title: cat.name,
            url: cat.product_image,
          }));
          if (formatted.length > 0) {
            setCategories(formatted);
            if (typeof window !== "undefined") {
              localStorage.setItem(
                CmsDataKey.CATEGORIES_CACHE_KEY,
                JSON.stringify(formatted),
              );
            }
          }
        }
      } catch (err) {
        if (typeof window !== "undefined") {
          const cachedCategories = localStorage.getItem(CmsDataKey.CATEGORIES_CACHE_KEY);
          if (cachedCategories) setCategories(JSON.parse(cachedCategories));
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(lang);
  }, [lang, fetchData]);

  // Helper function to resolve localized content with static fallbacks matching the Luxe Market and Kinetic screenshots
  const getField = useCallback(
    (key: string) => {
      if (
        cmsContent &&
        cmsContent[key] !== undefined &&
        cmsContent[key] !== null &&
        cmsContent[key] !== ""
      ) {
        return cmsContent[key];
      }

      // Fallbacks corresponding exactly to the designs in the screenshots
      // switch (key) {
      //   case "hero_subtitle":
      //     return "SEASON 2024 COLLECTION";
      //   case "hero_title":
      //     return "Define Your Modern Aesthetic";
      //   case "hero_desc":
      //     return "Experience the masterpiece of architecture, precision and innovation with our handpicked designers.";
      //   case "hero_btn_text":
      //     return "Explore";
      //   case "hero_image_url":
      //     return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop";

      //   case "middle_banner_subtitle":
      //     return "LIMITED TIME";
      //   case "middle_banner_title":
      //     return "Summer Sale: Up to 40% Off";
      //   case "middle_banner_desc":
      //     return "Select items from our latest collection on sale now.";
      //   case "middle_banner_btn_text":
      //     return "Shop Now";
      //   case "middle_banner_image_url":
      //     return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop";

      //   case "new_arrivals_left_subtitle":
      //     return "NEW COLLECTION";
      //   case "new_arrivals_left_title":
      //     return "The Avant-Garde Edit";
      //   case "new_arrivals_left_desc":
      //     return "Exhibiting the boundaries of contemporary fashion. Discover a new status.";
      //   case "new_arrivals_left_btn_text":
      //     return "Explore Collection";
      //   case "new_arrivals_left_image_url":
      //     return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop";

      //   case "new_arrivals_right_top_title":
      //     return "Premium Footwear";
      //   case "new_arrivals_right_top_image_url":
      //     return "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop";
      //   case "new_arrivals_right_bottom_title":
      //     return "Workplace Essentials";
      //   case "new_arrivals_right_bottom_image_url":
      //     return "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop";

      //   case "newsletter_title":
      //     return "Join the Inner Circle";
      //   case "newsletter_desc":
      //     return "Subscribe for early access to our latest collections, exclusive events and seasonal updates.";
      //   case "newsletter_btn_text":
      //     return "Subscribe";

      //   case "feedback_list":
      //     return [
      //       {
      //         customerName: "John Doe",
      //         feedback:
      //           "I had an amazing experience shopping at Luxe Market! The website is user-friendly, and the customer service was top-notch.",
      //         rating: 5,
      //       },
      //       {
      //         customerName: "Jane Smith",
      //         feedback:
      //           "Luxe Market has a fantastic selection of products. I was able to find rare items that I couldn't find anywhere else.",
      //         rating: 4,
      //       },
      //     ];
      //   default:
      //     return "";
      // }
    },
    [cmsContent],
  );

  return {
    lang,
    setLang,
    getField,
    banners,
    categories,
    heroSlides,
    isLoading,
    cmsContent,
  };
}
