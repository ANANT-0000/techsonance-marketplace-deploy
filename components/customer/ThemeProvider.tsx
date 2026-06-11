"use client";

import React, { createContext, useContext, useMemo } from "react";
import { StorefrontTheme, useThemeData } from "@/hooks/useThemeData";

// Helper to convert hex to RGB
function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(
    shorthandRegex,
    (_, r, g, b) => r + r + g + g + b + b,
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper to calculate relative luminance
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // default middle luminance if invalid color
  const { r, g, b } = rgb;
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate WCAG contrast ratio
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Contrast correction utility to ensure readability
export function getSafeContrastTextColor(
  bgColor: string,
  textColor: string,
): string {
  const ratio = getContrastRatio(bgColor, textColor);
  // WCAG threshold for readable text is 4.5:1 (or 3:1 for large text). Let's use 3.5:1 as a failsafe
  if (ratio < 3.5) {
    const bgLuminance = getRelativeLuminance(bgColor);
    // If background is light, return dark charcoal. If background is dark, return white.
    return bgLuminance > 0.5 ? "#0f172a" : "#ffffff";
  }
  return textColor;
}

interface ThemeContextType {
  theme: Partial<StorefrontTheme>;
}

const ThemeContext = createContext<ThemeContextType>({ theme: {} });

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  theme: Partial<StorefrontTheme>;
  children: React.ReactNode;
}

export function ThemeProvider({
  theme: initialTheme,
  children,
}: ThemeProviderProps) {
  const { themeData: clientTheme } = useThemeData();

  const mergedTheme = useMemo(() => {
    // If the server-side fetched theme is empty or incomplete, fall back to client-cached theme data
    const hasTheme =
      initialTheme &&
      Object.keys(initialTheme).length > 0 &&
      initialTheme.primary_color;
    if (hasTheme) {
      return { ...clientTheme, ...initialTheme };
    }
    return { ...initialTheme, ...clientTheme };
  }, [initialTheme, clientTheme]);

  // Apply contrast correction check on background and text colors
  const correctedTheme = useMemo(() => {
    const bg = mergedTheme.background_color || "#f8fafc";
    const text = mergedTheme.text_color || "#0f172a";
    const primary = mergedTheme.primary_color || "#2563eb";

    return {
      ...mergedTheme,
      text_color: getSafeContrastTextColor(bg, text),
      // Validate primary color text contrast (e.g. for buttons)
      primary_color: primary,
    };
  }, [mergedTheme]);

  // Construct styling variables mapping for root injection
  const inlineStyles = useMemo(() => {
    const styles: Record<string, string> = {};
    if (correctedTheme.primary_color) {
      styles["--theme-primary"] = correctedTheme.primary_color;
      styles["--theme-primary-foreground"] = getSafeContrastTextColor(
        correctedTheme.primary_color,
        "#ffffff",
      );
    }
    if (correctedTheme.secondary_color)
      styles["--theme-secondary"] = correctedTheme.secondary_color;
    if (correctedTheme.secondary_color)
      styles["--theme-accent"] = correctedTheme.secondary_color;
    if (correctedTheme.background_color)
      styles["--theme-background"] = correctedTheme.background_color;
    if (correctedTheme.text_color)
      styles["--theme-text"] = correctedTheme.text_color;

    // Apply main layout overrides locally
    if (correctedTheme.primary_color) {
      styles["--brand-primary"] = correctedTheme.primary_color;
      styles["--brand-primary-foreground"] = getSafeContrastTextColor(
        correctedTheme.primary_color,
        "#ffffff",
      );
    }
    if (correctedTheme.secondary_color)
      styles["--brand-secondary"] = correctedTheme.secondary_color;
    if (correctedTheme.background_color)
      styles["--background"] = correctedTheme.background_color;
    if (correctedTheme.text_color)
      styles["--foreground"] = correctedTheme.text_color;
    if (correctedTheme.navbar_bg) styles["--navbar"] = correctedTheme.navbar_bg;
    if (correctedTheme.navbar_fg)
      styles["--navbar-foreground"] = correctedTheme.navbar_fg;
    if (correctedTheme.footer_bg) styles["--footer"] = correctedTheme.footer_bg;
    if (correctedTheme.footer_fg)
      styles["--footer-foreground"] = correctedTheme.footer_fg;

    // Border radius override mapping
    const radii: Record<string, string> = {
      none: "0rem",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
      full: "1.5rem",
    };
    if (correctedTheme.border_radius) {
      styles["--radius"] = radii[correctedTheme.border_radius] || "0.5rem";
    }
    if (correctedTheme.font_family) {
      styles["--font-family"] = `'${correctedTheme.font_family}', sans-serif`;
    }

    return styles as React.CSSProperties;
  }, [correctedTheme]);

  const fontLink = useMemo(() => {
    if (!correctedTheme.font_family) return null;
    const font = correctedTheme.font_family;
    const systemFonts = [
      "Arial",
      "Helvetica",
      "Times New Roman",
      "Courier New",
      "Georgia",
      "Verdana",
      "Trebuchet MS",
      "System-UI",
      "sans-serif",
      "serif",
      "monospace",
    ];
    if (systemFonts.includes(font)) return null;

    const formattedFont = font.replace(/\s+/g, "+");
    return `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700&display=swap`;
  }, [correctedTheme.font_family]);

  const cssText = useMemo(() => {
    return `
      :root {
        ${Object.entries(inlineStyles)
          .map(([key, value]) => `${key}: ${value} !important;`)
          .join("\n")}
      }
      body {
        font-family: var(--font-family, 'Inter', sans-serif) !important;
      }
    `;
  }, [inlineStyles]);

  return (
    <ThemeContext.Provider value={{ theme: correctedTheme }}>
      {fontLink && <link rel="stylesheet" href={fontLink} />}
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <div style={inlineStyles} className="min-h-screen flex flex-col w-full">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

interface ThemeSectionProps {
  theme: Partial<StorefrontTheme>;
  className?: string;
  children: React.ReactNode;
}

// Section Level Overrides (Bypasses global variables dynamically)
export function ThemeSection({
  theme,
  className = "",
  children,
}: ThemeSectionProps) {
  const parentTheme = useTheme();

  // Combine parent theme configuration with local section overrides
  const combinedTheme = useMemo(() => {
    return { ...parentTheme.theme, ...theme };
  }, [parentTheme.theme, theme]);

  // Apply localized contrast correction failsafes
  const correctedTheme = useMemo(() => {
    const bg = combinedTheme.background_color || "#f8fafc";
    const text = combinedTheme.text_color || "#0f172a";
    return {
      ...combinedTheme,
      text_color: getSafeContrastTextColor(bg, text),
    };
  }, [combinedTheme]);

  const inlineStyles = useMemo(() => {
    const styles: Record<string, string> = {};
    if (correctedTheme.primary_color) {
      styles["--theme-primary"] = correctedTheme.primary_color;
      styles["--theme-primary-foreground"] = getSafeContrastTextColor(
        correctedTheme.primary_color,
        "#ffffff",
      );
    }
    if (correctedTheme.secondary_color)
      styles["--theme-secondary"] = correctedTheme.secondary_color;
    if (correctedTheme.secondary_color)
      styles["--theme-accent"] = correctedTheme.secondary_color;
    if (correctedTheme.background_color)
      styles["--theme-background"] = correctedTheme.background_color;
    if (correctedTheme.text_color)
      styles["--theme-text"] = correctedTheme.text_color;

    // Apply main layout variables overrides scoped locally to this section
    if (correctedTheme.primary_color) {
      styles["--brand-primary"] = correctedTheme.primary_color;
      styles["--brand-primary-foreground"] = getSafeContrastTextColor(
        correctedTheme.primary_color,
        "#ffffff",
      );
    }
    if (correctedTheme.secondary_color)
      styles["--brand-secondary"] = correctedTheme.secondary_color;
    if (correctedTheme.background_color)
      styles["--background"] = correctedTheme.background_color;
    if (correctedTheme.text_color)
      styles["--foreground"] = correctedTheme.text_color;
    return styles as React.CSSProperties;
  }, [correctedTheme]);

  return (
    <ThemeContext.Provider value={{ theme: correctedTheme }}>
      <div style={inlineStyles} className={className}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
