import { useState, useEffect, useCallback } from 'react';
import AxiosAPI from '@/lib/axios';
import { getCachedData, cacheData } from '@/utils/cache';

const THEME_CACHE_KEY = 'techsonance_cms_theme';

export interface StorefrontTheme {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  navbar_bg: string;
  navbar_fg: string;
  footer_bg: string;
  footer_fg: string;
  navbar_position: 'sticky' | 'static';
  logo_alignment: 'left' | 'center';
  footer_style: 'detailed' | 'simple';
  border_radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  card_style: 'standard' | 'glassmorphic';
  homepage_layout: string[];
  font_family?: string;
}

const DEFAULT_THEME: StorefrontTheme = {
  primary_color: "#2563eb",
  secondary_color: "#4f46e5",
  background_color: "#f8fafc",
  text_color: "#0f172a",
  navbar_bg: "#ffffff",
  navbar_fg: "#0f172a",
  footer_bg: "#0f172a",
  footer_fg: "#ffffff",
  navbar_position: "sticky",
  logo_alignment: "left",
  footer_style: "detailed",
  border_radius: "md",
  card_style: "standard",
  homepage_layout: ["hero", "categories", "products", "promo", "new_arrivals", "newsletter"],
  font_family: "Inter"
};

export function useThemeData() {
  const [themeData, setThemeData] = useState<StorefrontTheme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTheme = useCallback(async () => {
    setIsLoading(true);
    const cached = getCachedData(THEME_CACHE_KEY);
    if (cached) {
      setThemeData(cached);
      setIsLoading(false);
      return;
    }

    try {
      const res = await AxiosAPI.get('/v1/company-identity/branding');
      const branding = res.data?.data ?? res.data;
      if (branding && typeof branding === 'object' && branding.primary_color) {
        let homepageLayout = branding.homepage_layout;
        if (typeof homepageLayout === 'string') {
          try {
            homepageLayout = JSON.parse(homepageLayout);
          } catch {
            homepageLayout = homepageLayout.split(',').map((s: string) => s.trim());
          }
        }
        const parsed = {
          ...branding,
          homepage_layout: homepageLayout || DEFAULT_THEME.homepage_layout,
        };
        const merged = { ...DEFAULT_THEME, ...parsed };
        setThemeData(merged);
        cacheData(THEME_CACHE_KEY, merged);
      }
    } catch (err) {
      console.warn('Using default theme layout configurations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  return { themeData, isLoading, refreshTheme: fetchTheme };
}
