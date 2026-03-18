'use client';
import { ShoppingList } from "@/components/customer/ShoppingList";
import { PRODUCT_LIST } from "@/constants/customer";

export default function ShoppingPage() {
    return (
        <>
            <main className="flex gap-8 xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1 px-2">
                <section className="w-full content-visibility-auto contain-intrinsic-size-[100dvh]">
                    <ShoppingList products={PRODUCT_LIST} />
                </section>
            </main>
        </>
    );
}
