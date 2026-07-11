/**
 * app/page.tsx — Root Route (Server Component)
 *
 * Conditional rendering based on the incoming hostname:
 *
 *   host starts with LANDING_PAGE_SLUG  →  <LandingPage />   (e.g. marketplace.techsonance.co.in)
 *   any other host                       →  <MainSite />      (e.g. acme.techsonance.co.in)
 *
 * LANDING_PAGE_SLUG defaults to "marketplace" if the env var is not set.
 * This variable is server-only — it does NOT need a NEXT_PUBLIC_ prefix.
 */

import { headers } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";

// ── Landing page imports ────────────────────────────────────────────────────
import LandingPage from "@/components/landing/LandingPage";
import LandingPageSkeleton from "@/components/common/LandingPageSkeleton";
import StoreNotAvailable from "@/components/common/StoreNotAvailable";
import { getLandingPageData, fetchCompanyProfile } from "@/utils/commonAPiClient";
import { LANDING_METADATA } from "@/constants/landingText";
import {
  OG_TYPE,
  TWITTER_CARD,
  DEFAULT_FAVICON_PATH,
  DEFAULT_STORE_NAME,
  STORE_SUFFIX,
  BRANDING_ENDPOINT,
  HEADER_COMPANY_DOMAIN,
  REVALIDATE_INTERVAL,
  getWelcomeDescription,
} from "@/constants/storefront";

// ── Storefront (MainSite) imports ───────────────────────────────────────────
import StorefrontHome from "@/app/(storefront)/StorefrontHome";
import ShopLayout from "@/app/(storefront)/layout";

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const isLanding = await shouldShowLandingPage();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${host}`;
  const metadataBaseUrl = new URL(siteUrl);

  if (isLanding) {
    return {
      metadataBase: metadataBaseUrl,
      title: LANDING_METADATA.title,
      description: LANDING_METADATA.description,
      alternates: { canonical: "/" },
      openGraph: {
        title: LANDING_METADATA.title,
        description: LANDING_METADATA.description,
        type: OG_TYPE,
        url: "/",
        images: [
          {
            url: "/assets/landing/tm-622-screen-02.jpg",
            width: 620,
            height: 1262,
            alt: LANDING_METADATA.title,
          },
        ],
      },
      twitter: {
        card: TWITTER_CARD,
        title: LANDING_METADATA.title,
        description: LANDING_METADATA.description,
        images: ["/assets/landing/tm-622-screen-02.jpg"],
      },
    };
  }

  // Storefront specific metadata
  const companyDomain = host.split(":")[0].toLowerCase();
  let storeName = DEFAULT_STORE_NAME;
  let faviconUrl = DEFAULT_FAVICON_PATH;
  if (companyDomain) {
    const namePart = companyDomain.split(".")[0] || "";
    if (namePart) {
      storeName =
        namePart.charAt(0).toUpperCase() + namePart.slice(1) + STORE_SUFFIX;
    }
  }

  try {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${apiBaseUrl}${BRANDING_ENDPOINT}`, {
      headers: {
        [HEADER_COMPANY_DOMAIN]: companyDomain || "",
      },
      next: { revalidate: REVALIDATE_INTERVAL },
    });
    if (res.ok) {
      const result = await res.json();
      const branding = result?.data;
      if (branding && typeof branding === "object" && branding.favicon_url) {
        faviconUrl = branding.favicon_url;
      }
    }
  } catch (err) {}

  const descriptionText = getWelcomeDescription(storeName);

  return {
    metadataBase: metadataBaseUrl,
    title: storeName,
    description: descriptionText,
    icons: {
      icon: faviconUrl,
    },
    alternates: { canonical: "/" },
    openGraph: {
      title: storeName,
      description: descriptionText,
      type: OG_TYPE,
      url: "/",
      images: [
        {
          url: "/assets/landing/tm-622-screen-02.jpg",
          width: 620,
          height: 1262,
          alt: storeName,
        },
      ],
    },
    twitter: {
      card: TWITTER_CARD,
      title: storeName,
      description: descriptionText,
      images: ["/assets/landing/tm-622-screen-02.jpg"],
    },
  };
}

// ── Must be dynamic: reads `headers()` on every request ─────────────────────
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely read the incoming hostname from the Next.js headers store.
 * Strips any port suffix (e.g. "localhost:3000" → "localhost").
 */
async function getHostname(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  return host.split(":")[0].toLowerCase();
}

/**
 * Returns true when the incoming hostname exactly matches one of the
 * domains listed in LANDING_PAGE_DOMAINS (comma-separated).
 *
 * Set LANDING_PAGE_DOMAINS in .env.local (dev) or your hosting dashboard (prod):
 *
 *   LANDING_PAGE_DOMAINS=marketplace.techsonance.co.in,marketplace.localhost
 *
 * Examples:
 *   marketplace.techsonance.co.in  → true   ✅ serve LandingPage
 *   marketplace.localhost          → true   ✅ serve LandingPage (dev)
 *   acme.techsonance.co.in         → false  ❌ serve Storefront
 *   localhost                      → false  ❌ serve Storefront
 */
async function shouldShowLandingPage(): Promise<boolean> {
  const raw = process.env.LANDING_PAGE_DOMAINS ?? "";

  // Parse comma-separated list, trim whitespace, lowercase, drop empty entries
  const landingDomains = new Set(
    raw
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  );

  // No domains configured → never show the landing page
  if (landingDomains.size === 0) return false;

  const hostname = await getHostname();
  return landingDomains.has(hostname);
}

// ── Sub-components ───────────────────────────────────────────────────────────

/** Async server component: fetches CMS data and renders the landing page. */
async function LandingPageContainer() {
  let cmsData: any = null;
  try {
    const res = await getLandingPageData();
    cmsData =
      res != null && typeof res === "object" && "data" in res ? res.data : null;
  } catch {}
  return <LandingPage cmsData={cmsData} />;
}

// ── Root Page ────────────────────────────────────────────────────────────────

export default async function RootPage() {
  const isLanding = await shouldShowLandingPage();

  if (isLanding) {
    // ── Marketplace Main Landing Page (e.g. marketplace.techsonance.co.in) ──
    return (
      <Suspense fallback={<LandingPageSkeleton />}>
        <LandingPageContainer />
      </Suspense>
    );
  }

  // ── Vendor Storefront / MainSite (e.g. acme.techsonance.co.in) ────────────
  const profile = await fetchCompanyProfile();

  if (!profile || profile.siteStatus === 'not_started') {
    return <StoreNotAvailable />;
  }

  // If the vendor has published a landing page, show it.
  if (profile.siteData?.isPublished) {
    return (
      <Suspense fallback={<LandingPageSkeleton />}>
        <LandingPageContainer />
      </Suspense>
    );
  }

  // Otherwise, if they have products, show the storefront home.
  return (
    <ShopLayout>
      <StorefrontHome />
    </ShopLayout>
  );
}
