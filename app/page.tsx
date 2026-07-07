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
import { getLandingPageData } from "@/utils/commonAPiClient";
import { LANDING_METADATA } from "@/constants/landingText";
import { OG_TYPE, TWITTER_CARD } from "@/constants/storefront";

// ── Storefront (MainSite) imports ───────────────────────────────────────────
import StorefrontHome from "@/app/(storefront)/page";

// ── Metadata ────────────────────────────────────────────────────────────────
const metadataBaseUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
);

export const metadata: Metadata = {
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
    // ── Landing page (e.g. marketplace.techsonance.co.in) ──────────────────
    return (
      <Suspense fallback={<LandingPageSkeleton />}>
        <LandingPageContainer />
      </Suspense>
    );
  }

  // ── Storefront / MainSite (e.g. acme.techsonance.co.in) ───────────────────
  return <StorefrontHome />;
}
