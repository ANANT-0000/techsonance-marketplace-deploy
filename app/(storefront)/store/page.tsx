import { ShoppingList } from "@/components/customer/ShoppingList";
import { Metadata } from 'next';
import { fetchCategory } from '@/utils/commonAPiClient';

export const dynamic = 'force-dynamic';

interface ShoppingPageProps {
    searchParams: Promise<{
        search?: string;
        category_id?: string;
        min_price?: string;
        max_price?: string;
        sort_by?: string;
        page?: string;
    }>;
}

export async function generateMetadata(
    { searchParams }: ShoppingPageProps,
): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const search = resolvedParams?.search || "";
    const categoryId = resolvedParams?.category_id || "";

    let title = "Shop High-Quality Tech, Electronics & Hardware | Techsonance Store";
    let description = "Explore Techsonance Store for high-quality electronics, components, devices, and accessories. Get premium products at unbeatable prices with secure delivery.";

    if (search) {
        // Clean capitalize helper
        const formattedSearch = search.trim().replace(/\b\w/g, c => c.toUpperCase());
        title = `Buy ${formattedSearch} Online at Best Prices | Techsonance Store`;
        description = `Looking to buy ${formattedSearch} online? Check out the latest models, verified customer reviews, and top-rated deals on ${formattedSearch} at Techsonance Marketplace.`;
    } else if (categoryId) {
        try {
            const category = await fetchCategory(categoryId);
            if (category && category.name) {
                const catName = category.name.trim();
                title = `Buy ${catName} Online - Best Deals & Discounts | Techsonance Store`;
                description = category.description || `Shop the latest ${catName} products online at Techsonance. Discover premium quality items, exclusive discounts, and fast delivery.`;
            }
        } catch (error) {
            console.error("Failed to fetch category metadata for SEO:", error);
        }
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        }
    };
}

export default async function ShoppingPage({ searchParams }: ShoppingPageProps) {

    // 3. Await the searchParams Promise explicitly
    const resolvedParams = await searchParams;

    // 4. Now safely build your object
    const safeParams = {
        search: resolvedParams?.search || "",
        category_id: resolvedParams?.category_id || "",
        min_price: resolvedParams?.min_price ? Number(resolvedParams.min_price) : 0,
        max_price: resolvedParams?.max_price ? Number(resolvedParams.max_price) : 0,
        sort_by: resolvedParams?.sort_by || "",
        page: resolvedParams?.page ? Number(resolvedParams.page) : 1,
    }

    console.log("Server received search:", safeParams.search);
    return (
        <main className="flex gap-8 xl:pt-10 pb-8 xl:px-16 lg:px-8 md:px-4 sm:px-2 py-1 px-2">
            <section className="w-full content-visibility-auto contain-intrinsic-size-[100dvh]">
                <ShoppingList initialSearchParams={safeParams} />
            </section>
        </main>
    );
}