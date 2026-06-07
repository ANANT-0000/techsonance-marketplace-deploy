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

    let title = "Products Catalogue | Store";
    let description = "Browse our full catalogue of high-quality products. Filter by category, price, and find exactly what you are looking for.";

    if (search) {
        title = `Search Results for "${search}" | Store`;
        description = `Find the best deals and search results for "${search}" in our store. Browse high-quality products today.`;
    } else if (categoryId) {
        try {
            const category = await fetchCategory(categoryId);
            if (category && category.name) {
                title = `${category.name} | Store`;
                description = category.description || `Explore our wide range of products in the ${category.name} category. Find top quality items at the best prices.`;
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