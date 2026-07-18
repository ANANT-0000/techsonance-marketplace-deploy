import { ShoppingPageSkeleton } from "@/components/customer/ShoppingPageSkeleton";

export default function Loading() {
  return (
    <main className="flex gap-8 xl:pt-10 pb-8 xl:px-16 lg:px-8 md:px-4 sm:px-2 py-1 px-2">
      <section className="w-full content-visibility-auto contain-intrinsic-size-[100dvh]">
        <ShoppingPageSkeleton />
      </section>
    </main>
  );
}
