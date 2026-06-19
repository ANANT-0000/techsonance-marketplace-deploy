/**
 * ShoppingPage.tsx (Server Component) — updated for Phase 1
 *
 * Key change: `initialSearchParams` is no longer passed to `<ShoppingList>`.
 * The client component reads all params directly from `useSearchParams()`, so
 * passing them down as props was redundant and created a double-source-of-truth
 * bug where stale prop values overrode fresh URL state on navigation.
 *
 * The server component retains its SEO responsibilities (generateMetadata) and
 * can pre-fetch category data for the title — it just no longer needs to
 * hydrate the client with param values.
 */

import { ShoppingList } from "@/components/customer/ShoppingList";
import { Metadata } from "next";
import { fetchCategory } from "@/utils/commonAPiClient";

export const dynamic = "force-dynamic";

interface ShoppingPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    sort_by?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ShoppingPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = params?.search ?? "";
  const category = params?.category ?? "";

  let title =
    "Shop High-Quality Tech, Electronics & Hardware | Techsonance Store";
  let description =
    "Explore Techsonance Store for high-quality electronics, components, devices, and accessories. Get premium products at unbeatable prices with secure delivery.";

  if (search) {
    const formatted = search.trim().replace(/\b\w/g, (c) => c.toUpperCase());
    title = `Buy ${formatted} Online at Best Prices | Techsonance Store`;
    description = `Looking to buy ${formatted} online? Check out the latest models, verified customer reviews, and top-rated deals on ${formatted} at Techsonance Marketplace.`;
  } else if (category) {
    try {
      const categoryData = await fetchCategory(category);
      if (categoryData?.name) {
        const catName = categoryData.name.trim();
        title = `Buy ${catName} Online - Best Deals & Discounts | Techsonance Store`;
        description =
          categoryData.description ??
          `Shop the latest ${catName} products online at Techsonance. Discover premium quality items, exclusive discounts, and fast delivery.`;
      }
    } catch {
      // Non-fatal — fall through to default metadata
    }
  }

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Server component shell.
 *
 * <ShoppingList> is a client component that reads all search/filter/sort/page
 * state from useSearchParams() — no props needed. The URL is the contract.
 */
export default async function ShoppingPage() {
  return (
    <main className="flex gap-8 xl:pt-10 pb-8 xl:px-16 lg:px-8 md:px-4 sm:px-2 py-1 px-2">
      <section className="w-full content-visibility-auto contain-intrinsic-size-[100dvh]">
        <ShoppingList />
      </section>
    </main>
  );
}
