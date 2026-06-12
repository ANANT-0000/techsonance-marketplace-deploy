import { useState, useEffect, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import { getCachedData, cacheData } from "@/utils/cache";
import { IMAGE_PLACEHOLDER, THEME_CACHE_KEY } from "@/constants";

export interface StorefrontTheme {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  navbar_bg: string;
  navbar_fg: string;
  footer_bg: string;
  footer_fg: string;
  navbar_position: "sticky" | "static" | "fixed";
  logo_alignment: "left" | "center" | "right";
  footer_style: "simple" | "detailed";
  border_radius: "full" | "sm" | "md" | "lg" | "xl";
  card_style:
    | "glassmorphic"
    | "standard"
    | "outlined"
    | "minimal"
    | "neumorphic";
  homepage_layout: (
    | "hero"
    | "categories"
    | "new_arrivals"
    | "products"
    | "promo"
    | "newsletter"
    | "scarcity"
    | "curated"
    | "lookbook"
    | "social_proof"
  )[];
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
  navbar_position: "sticky",
  logo_alignment: "left",
  footer_style: "detailed",
  border_radius: "md",
  card_style: "standard",
  homepage_layout: [
    "hero",
    "categories",
    "products",
    "promo",
    "new_arrivals",
    "newsletter",
  ],
  font_family: "Inter",
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
