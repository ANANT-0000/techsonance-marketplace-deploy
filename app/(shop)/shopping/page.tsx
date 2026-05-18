// app/(shop)/shopping/page.tsx — full replacement
import { ShoppingList } from "@/components/customer/ShoppingList";

interface ShoppingPageProps {
    searchParams?: {
        search?: string;
        category_id?: string;
        min_price?: string;
        max_price?: string;
        sort_by?: string;
        page?: string;
    };
}

export default async function ShoppingPage({ searchParams }: ShoppingPageProps) {
    return (
        <main className="flex gap-8 xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1 px-2">
            <section className="w-full content-visibility-auto contain-intrinsic-size-[100dvh]">
                <ShoppingList initialSearchParams={searchParams} />
            </section>
        </main>
    );
}