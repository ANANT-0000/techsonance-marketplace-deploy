"use client";

import { useCallback, useEffect, useState } from "react";
import AxiosAPI from "@/lib/axios";
import { cacheData, getCachedData } from "@/utils/cache";
import type { LandingThemeConfig } from "@/utils/Types";

export const LANDING_THEME_CACHE_KEY = "LANDING_THEME_CONFIG";

export const DEFAULT_LANDING_THEME: LandingThemeConfig = {
  primary: "#2563EB",
  primaryHover: "#4F46E5",
  secondary: "#4F46E5",
  accent: "#059669",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  muted: "#475569",
  border: "rgba(15, 23, 42, 0.08)",
  navbar: "rgba(248, 250, 252, 0.92)",
  footer: "#0F172A",
  onPrimary: "#FFFFFF",
  onDark: "#FFFFFF",
};

const normalizeLandingTheme = (
  data: Partial<LandingThemeConfig> | null | undefined,
): LandingThemeConfig => ({
  ...DEFAULT_LANDING_THEME,
  ...(data ?? {}),
});

export function useLandingTheme() {
  const [landingTheme, setLandingTheme] = useState<LandingThemeConfig>(() => {
    const cached = getCachedData(LANDING_THEME_CACHE_KEY) as
      | LandingThemeConfig
      | null
      | undefined;
    return cached ? normalizeLandingTheme(cached) : DEFAULT_LANDING_THEME;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLandingTheme = useCallback(async () => {
    setIsLoading(true);
    const cached = getCachedData(LANDING_THEME_CACHE_KEY) as
      | LandingThemeConfig
      | null
      | undefined;

    if (cached) {
      setLandingTheme(normalizeLandingTheme(cached));
      setIsLoading(false);
      return;
    }

    try {
      const response = await AxiosAPI.get("/v1/landing-page", {
        headers: { "x-suppress-toast": "true" },
      });

      const payload = response.data?.data;
      const merged = normalizeLandingTheme(payload);
      setLandingTheme(merged);
      cacheData(LANDING_THEME_CACHE_KEY, merged);
    } catch {
      setLandingTheme(DEFAULT_LANDING_THEME);
    } finally {
      setIsLoading(false);
    }
    // setLandingTheme(DEFAULT_LANDING_THEME);
    // setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchLandingTheme();
  }, [fetchLandingTheme]);

  return { landingTheme, isLoading, refreshLandingTheme: fetchLandingTheme };
}
