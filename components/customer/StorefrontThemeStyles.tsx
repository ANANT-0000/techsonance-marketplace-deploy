'use client';
import { useThemeData } from '@/hooks/useThemeData';
import { useEffect } from 'react';

export function StorefrontThemeStyles() {
  const { themeData } = useThemeData();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Apply color overrides
    if (themeData.primary_color) {
      root.style.setProperty('--brand-primary', themeData.primary_color);
      root.style.setProperty('--theme-primary', themeData.primary_color);
    }
    if (themeData.secondary_color) {
      root.style.setProperty('--brand-secondary', themeData.secondary_color);
      root.style.setProperty('--theme-secondary', themeData.secondary_color);
      root.style.setProperty('--theme-accent', themeData.secondary_color);
    }
    if (themeData.background_color) {
      root.style.setProperty('--background', themeData.background_color);
      root.style.setProperty('--theme-background', themeData.background_color);
    }
    if (themeData.text_color) {
      root.style.setProperty('--foreground', themeData.text_color);
      root.style.setProperty('--theme-text', themeData.text_color);
    }
    
    // Navbar overrides
    if (themeData.navbar_bg) {
      root.style.setProperty('--navbar', themeData.navbar_bg);
    }
    if (themeData.navbar_fg) {
      root.style.setProperty('--navbar-foreground', themeData.navbar_fg);
    }
    
    // Footer overrides
    if (themeData.footer_bg) {
      root.style.setProperty('--footer', themeData.footer_bg);
    }
    if (themeData.footer_fg) {
      root.style.setProperty('--footer-foreground', themeData.footer_fg);
    }

    // Border radius override mapping
    const radii: Record<string, string> = {
      none: '0rem',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '1.5rem',
    };
    if (themeData.border_radius) {
      root.style.setProperty('--radius', radii[themeData.border_radius] || '0.5rem');
    }
  }, [themeData]);

  return null;
}
