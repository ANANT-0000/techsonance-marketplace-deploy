import { Skeleton } from "@/components/ui/skeleton";

export const ProductPageSkeleton = () => (
  <main className="min-h-screen bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex gap-4">
          <div className="hidden lg:flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-[72px] h-[72px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="flex-1 aspect-square rounded-3xl" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-12 w-40 mt-2" />
          <div className="flex gap-3 mt-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-9 h-9 rounded-full" />
            ))}
          </div>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-20 h-10 rounded-xl" />
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Skeleton className="flex-1 h-12 rounded-2xl" />
            <Skeleton className="flex-1 h-12 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  </main>
);
