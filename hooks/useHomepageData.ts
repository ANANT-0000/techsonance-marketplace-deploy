import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';

const CMS_CACHE_KEY = 'soundsphere_cms_home';
const BANNERS_CACHE_KEY = 'soundsphere_banners_home';
const CATEGORIES_CACHE_KEY = 'soundsphere_categories_home';
const LANG_KEY = 'soundsphere_locale';

// Dynamic banners fallback images
const defaultBanners = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1400&auto=format&fit=crop'
];

// Curated categories static fallback
const fallbackCategories = [
  { title: 'Fashion', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop' },
  { title: 'Electronics', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop' },
  { title: 'Home & Living', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop' },
  { title: 'Beauty', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop' }
];

export function useHomepageData() {
  const [lang, setLangState] = useState<string>('en');
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [banners, setBanners] = useState<string[]>(defaultBanners);
  const [categories, setCategories] = useState<any[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize lang from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_KEY) || 'en';
      setLangState(savedLang);
    }
  }, []);

  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_KEY, newLang);
    }
  }, []);

  const fetchData = useCallback(async (currentLang: string) => {
    setIsLoading(true);

    // Hydrate state from Cache on mount
    if (typeof window !== 'undefined') {
      const cachedCms = localStorage.getItem(`${CMS_CACHE_KEY}_${currentLang}`);
      const cachedBanners = localStorage.getItem(BANNERS_CACHE_KEY);
      const cachedCategories = localStorage.getItem(CATEGORIES_CACHE_KEY);

      if (cachedCms) setCmsContent(JSON.parse(cachedCms));
      if (cachedBanners) setBanners(JSON.parse(cachedBanners));
      if (cachedCategories) setCategories(JSON.parse(cachedCategories));
    }

    try {
      // 1. Fetch CMS Home Page content
      try {
        const cmsRes = await AxiosAPI.get(`/v1/cms/home?lang=${currentLang}`);
        if (cmsRes.data && cmsRes.data.content) {
          const parsedContent = typeof cmsRes.data.content === 'string'
            ? JSON.parse(cmsRes.data.content)
            : cmsRes.data.content;
          setCmsContent(parsedContent);
          localStorage.setItem(`${CMS_CACHE_KEY}_${currentLang}`, JSON.stringify(parsedContent));
        }
      } catch (err) {
        console.error('Failed to fetch CMS page content', err);
      }

      // 2. Fetch Active Hero Banners
      try {
        const bannersRes = await AxiosAPI.get('/v1/banners/active?placement=homepage_hero');
        if (bannersRes.data && Array.isArray(bannersRes.data)) {
          const urls = bannersRes.data.map((b: any) => b.image_url).filter(Boolean);
          if (urls.length > 0) {
            setBanners(urls);
            localStorage.setItem(BANNERS_CACHE_KEY, JSON.stringify(urls));
          }
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      }

      // 3. Fetch Categories with Product Images
      try {
        const categoriesRes = await AxiosAPI.get('/v1/categories');
        if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
          const formatted = categoriesRes.data.map((cat: any) => ({
            title: cat.name,
            url: cat.product_image || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop'
          }));
          if (formatted.length > 0) {
            setCategories(formatted);
            localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(formatted));
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }

    } catch (error) {
      console.error('Error refreshing homepage data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(lang);
  }, [lang, fetchData]);

  // Helper function to resolve localized content with static fallbacks matching the Luxe Market and Kinetic screenshots
  const getField = useCallback((key: string) => {
    if (cmsContent && cmsContent[key] !== undefined) {
      return cmsContent[key];
    }
    
    // Fallbacks corresponding exactly to the designs in the screenshots
    switch (key) {
      case 'hero_subtitle':
        return 'SEASON 2024 COLLECTION';
      case 'hero_title':
        return 'Define Your Modern Aesthetic';
      case 'hero_desc':
        return 'Experience the masterpiece of architecture, precision and innovation with our handpicked designers.';
      case 'hero_btn_text':
        return 'Explore';
      case 'hero_image_url':
        return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop';
      
      case 'middle_banner_subtitle':
        return 'LIMITED TIME';
      case 'middle_banner_title':
        return 'Summer Sale: Up to 40% Off';
      case 'middle_banner_desc':
        return 'Select items from our latest collection on sale now.';
      case 'middle_banner_btn_text':
        return 'Shop Now';
      case 'middle_banner_image_url':
        return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop';
      
      case 'new_arrivals_left_subtitle':
        return 'NEW COLLECTION';
      case 'new_arrivals_left_title':
        return 'The Avant-Garde Edit';
      case 'new_arrivals_left_desc':
        return 'Exhibiting the boundaries of contemporary fashion. Discover a new status.';
      case 'new_arrivals_left_btn_text':
        return 'Explore Collection';
      case 'new_arrivals_left_image_url':
        return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop';
      
      case 'new_arrivals_right_top_title':
        return 'Premium Footwear';
      case 'new_arrivals_right_top_image_url':
        return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop';
      case 'new_arrivals_right_bottom_title':
        return 'Workplace Essentials';
      case 'new_arrivals_right_bottom_image_url':
        return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop';
      
      case 'newsletter_title':
        return 'Join the Inner Circle';
      case 'newsletter_desc':
        return 'Subscribe for early access to our latest collections, exclusive events and seasonal updates.';
      case 'newsletter_btn_text':
        return 'Subscribe';
      
      case 'feedback_list':
        return [
          {
            customerName: "John Doe",
            feedback: "I had an amazing experience shopping at Luxe Market! The website is user-friendly, and the customer service was top-notch.",
            rating: 5
          },
          {
            customerName: "Jane Smith",
            feedback: "Luxe Market has a fantastic selection of products. I was able to find rare items that I couldn't find anywhere else.",
            rating: 4
          }
        ];
      default:
        return '';
    }
  }, [cmsContent]);

  return {
    lang,
    setLang,
    getField,
    banners,
    categories,
    isLoading
  };
}
