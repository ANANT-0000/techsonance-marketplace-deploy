"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { useLandingTheme } from "@/hooks/useLandingTheme";
import {
  LANDING_CTA,
  LANDING_FEATURES,
  LANDING_FOOTER,
  LANDING_HERO,
  LANDING_FAQ,
  LANDING_INTEGRATIONS,
  LANDING_NAVBAR,
  LANDING_PRICING,
  LANDING_SHOWCASE,
  LANDING_STATS,
  LANDING_TESTIMONIALS,
  LANDING_TICKER,
} from "@/constants/landingText";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import TickerSection from "@/components/landing/TickerSection";
import type { LandingThemeConfig, SubscriptionPlan } from "@/utils/Types";

interface LandingPageProps {
  cmsData?: {
    theme?: {
      primary_color?: string;
      secondary_color?: string;
      background_color?: string;
      text_color?: string;
    };
    content?: {
      hero?: any;
      ticker?: any;
      showcase?: any;
      features?: any;
      stats?: any;
      pricing?: any;
      testimonials?: any;
      integrations?: any;
      faq?: any;
      cta?: any;
      footer?: any;
      navbar?: any;
    };
    isPublished?: boolean;
    plans?: SubscriptionPlan[];
  } | null;
}

const ShowcaseSection = dynamic(() => import("./ShowcaseSection"), {
  ssr: true,
});
const FeaturesSection = dynamic(() => import("./FeaturesSection"), {
  ssr: true,
});
const StatsSection = dynamic(() => import("./StatsSection"), {
  ssr: true,
});
const PricingSection = dynamic(() => import("./PricingSection"), {
  ssr: true,
});
const TestimonialsSection = dynamic(() => import("./TestimonialsSection"), {
  ssr: true,
});
const IntegrationsSection = dynamic(() => import("./IntegrationsSection"), {
  ssr: true,
});
const FaqSection = dynamic(() => import("./FaqSection"), {
  ssr: true,
});
const CTASection = dynamic(() => import("./CTASection"), {
  ssr: true,
});
const LandingFooter = dynamic(() => import("./LandingFooter"), {
  ssr: true,
});

const SECTION_ORDER = [
  "hero",
  "ticker",
  "showcase",
  "features",
  "stats",
  "pricing",
  "testimonials",
  "integrations",
  "faq",
  "cta",
] as const;

type SectionId = (typeof SECTION_ORDER)[number];

function buildLandingThemeStyle(theme: LandingThemeConfig): CSSProperties {
  return {
    "--landing-primary": theme.primary,
    "--landing-primary-hover": theme.primaryHover,
    "--landing-secondary": theme.secondary,
    "--landing-accent": theme.accent,
    "--landing-background": theme.background,
    "--landing-surface": theme.surface,
    "--landing-text": theme.text,
    "--landing-muted": theme.muted,
    "--landing-border": theme.border,
    "--landing-navbar": theme.navbar,
    "--landing-footer": theme.footer,
    "--landing-on-primary": theme.onPrimary,
    "--landing-on-dark": theme.onDark,
  } as CSSProperties;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(
    h.length === 3 ? h.charAt(0) + h.charAt(0) : h.substring(0, 2),
    16,
  );
  const g = parseInt(
    h.length === 3 ? h.charAt(1) + h.charAt(1) : h.substring(2, 4),
    16,
  );
  const b = parseInt(
    h.length === 3 ? h.charAt(2) + h.charAt(2) : h.substring(4, 6),
    16,
  );
  return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
}

function getBrightness(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function hexWithOpacity(hex: string, opacity: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function LandingPage({ cmsData }: LandingPageProps) {
  const { landingTheme } = useLandingTheme();

  // Merge dynamic CMS theme
  const activeTheme = { ...landingTheme };
  if (cmsData?.theme) {
    if (cmsData.theme.primary_color) {
      activeTheme.primary = cmsData.theme.primary_color;
      activeTheme.primaryHover = hexWithOpacity(
        cmsData.theme.primary_color,
        0.85,
      );
      activeTheme.onPrimary =
        getBrightness(cmsData.theme.primary_color) > 128
          ? "#000000"
          : "#ffffff";
    }
    if (cmsData.theme.secondary_color) {
      activeTheme.secondary = cmsData.theme.secondary_color;
      activeTheme.accent = cmsData.theme.secondary_color;
    }
    if (cmsData.theme.background_color) {
      activeTheme.background = cmsData.theme.background_color;
      activeTheme.surface =
        getBrightness(cmsData.theme.background_color) > 128
          ? "#ffffff"
          : "#1e293b";
      activeTheme.navbar = hexWithOpacity(cmsData.theme.background_color, 0.92);
      activeTheme.onDark =
        getBrightness(cmsData.theme.background_color) > 128
          ? "#0f172a"
          : "#ffffff";
    }
    if (cmsData.theme.text_color) {
      activeTheme.text = cmsData.theme.text_color;
      activeTheme.muted = hexWithOpacity(cmsData.theme.text_color, 0.6);
      activeTheme.border = hexWithOpacity(cmsData.theme.text_color, 0.1);
      // Fallback footer bg to inverted background (which is text color)
      activeTheme.footer = cmsData.theme.text_color;
    }
  }

  const landingThemeStyle = buildLandingThemeStyle(activeTheme);

  const cms = cmsData?.content ?? {};
  const plans = cmsData?.plans ?? [];
  const navbarContent = cms.navbar || LANDING_NAVBAR;
  const heroContent = cms.hero || LANDING_HERO;
  const tickerContent = cms.ticker || LANDING_TICKER;
  const showcaseContent = cms.showcase || LANDING_SHOWCASE;
  const featuresContent = cms.features || LANDING_FEATURES;
  const statsContent = cms.stats || LANDING_STATS;
  const testimonialsContent = cms.testimonials || LANDING_TESTIMONIALS;
  const integrationsContent = cms.integrations || LANDING_INTEGRATIONS;
  const faqContent = cms.faq || LANDING_FAQ;
  const ctaContent = cms.cta || LANDING_CTA;
  const footerContent = cms.footer || LANDING_FOOTER;

  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case "hero":
        return <HeroSection key={sectionId} content={heroContent} />;
      case "ticker":
        return <TickerSection key={sectionId} content={tickerContent} />;
      case "showcase":
        return <ShowcaseSection key={sectionId} content={showcaseContent} />;
      case "features":
        return <FeaturesSection key={sectionId} content={featuresContent} />;
      case "stats":
        return <StatsSection key={sectionId} content={statsContent} />;
      case "pricing":
        return <PricingSection key={sectionId} />;
      case "testimonials":
        return (
          <TestimonialsSection key={sectionId} content={testimonialsContent} />
        );
      case "integrations":
        return (
          <IntegrationsSection key={sectionId} content={integrationsContent} />
        );
      case "faq":
        return <FaqSection key={sectionId} content={faqContent} />;
      case "cta":
        return <CTASection key={sectionId} content={ctaContent} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="landing-theme min-h-screen overflow-x-hidden scroll-smooth"
      style={landingThemeStyle}
    >
      <header>
        <LandingNavbar content={navbarContent} />
      </header>

      <main>{SECTION_ORDER.map((sectionId) => renderSection(sectionId))}</main>

      <LandingFooter content={footerContent} logo={navbarContent.logo} />
    </div>
  );
}
