import { useState, useEffect, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import { getCachedData, cacheData } from "@/utils/cache";
import { IMAGE_PLACEHOLDER, THEME_CACHE_KEY } from "@/constants";

export enum NavbarPosition {
  STICKY = "sticky",
  STATIC = "static",
  FIXED = "fixed",
}

export enum LogoAlignment {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

export enum FooterStyle {
  SIMPLE = "simple",
  DETAILED = "detailed",
}

export enum BorderRadius {
  FULL = "full",
  SM = "sm",
  MD = "md",
  LG = "lg",
  XL = "xl",
}

export enum CardStyle {
  GLASSMORPHIC = "glassmorphic",
  STANDARD = "standard",
  OUTLINED = "outlined",
  MINIMAL = "minimal",
  NEUMORPHIC = "neumorphic",
}

export enum HomepageSection {
  HERO = "hero",
  CATEGORIES = "categories",
  NEW_ARRIVALS = "new_arrivals",
  PRODUCTS = "products",
  PROMO = "promo",
  NEWSLETTER = "newsletter",
  SCARCITY = "scarcity",
  CURATED = "curated",
  LOOKBOOK = "lookbook",
  SOCIAL_PROOF = "social_proof",
}

export interface StorefrontTheme {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  navbar_bg: string;
  navbar_fg: string;
  footer_bg: string;
  footer_fg: string;
  navbar_position: NavbarPosition;
  logo_alignment: LogoAlignment;
  footer_style: FooterStyle;
  border_radius: BorderRadius;
  card_style: CardStyle;
  homepage_layout: HomepageSection[];
  font_family: "Inter";
  logo_url: string; // URL
  logo_dark_url: string; // URL
  watermark_url: string; // URL
  favicon_url: string; // URL
  accent_color: "#f472b6";
  created_at: string; // ISO 8601 Date string
  updated_at: string; // ISO 8601 Date string;
}
const DEFAULT_THEME: StorefrontTheme = {
  logo_url: IMAGE_PLACEHOLDER,
  logo_dark_url: IMAGE_PLACEHOLDER,
  watermark_url: "",
  favicon_url: "",
  accent_color: "#f472b6",
  created_at: "",
  updated_at: "",
  primary_color: "#2563eb",
  secondary_color: "#4f46e5",
  background_color: "#f8fafc",
  text_color: "#0f172a",
  navbar_bg: "#ffffff",
  navbar_fg: "#0f172a",
  footer_bg: "#0f172a",
  footer_fg: "#ffffff",
  navbar_position: NavbarPosition.STICKY,
  logo_alignment: LogoAlignment.LEFT,
  footer_style: FooterStyle.DETAILED,
  border_radius: BorderRadius.MD,
  card_style: CardStyle.STANDARD,
  homepage_layout: [
    HomepageSection.HERO,
    HomepageSection.CATEGORIES,
    HomepageSection.PRODUCTS,
    HomepageSection.PROMO,
    HomepageSection.NEW_ARRIVALS,
    HomepageSection.NEWSLETTER,
  ],
  font_family: "Inter",
};

export function useThemeData() {
  const [themeData, setThemeData] = useState<StorefrontTheme>(() => {
    const cached = getCachedData(THEME_CACHE_KEY);
    return cached || DEFAULT_THEME;
  });
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
      const res = await AxiosAPI.get("/v1/company-identity/branding");
      const branding = res.data?.data ?? res.data;
      if (branding && typeof branding === "object" && branding.primary_color) {
        let homepageLayout = branding.homepage_layout;
        if (typeof homepageLayout === "string") {
          try {
            homepageLayout = JSON.parse(homepageLayout);
          } catch {
            homepageLayout = homepageLayout
              .split(",")
              .map((s: string) => s.trim());
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  return { themeData, isLoading, refreshTheme: fetchTheme };
}
