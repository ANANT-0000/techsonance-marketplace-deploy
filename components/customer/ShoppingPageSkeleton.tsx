import { ProductSkeleton } from "@/components/common/ProductSkeleton";
import { ShoppingListConfig } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";

export const ShoppingPageSkeleton = () => {
  return (
    <div className="w-full">
      <div className="flex gap-8">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden lg:block w-[280px] shrink-0 border-r border-border pr-6">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <hr className="my-2 border-border" />
            <Skeleton className="h-6 w-1/3 mb-4" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header Area Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="w-full flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>

          {/* Grid */}
          <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: ShoppingListConfig.PAGE_SIZE }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
