import { Skeleton } from "@/components/ui/skeleton";

export const WishlistPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background py-6 sm:py-12 text-left font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative shadow-sm"
            >
              <Skeleton className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl" />
              <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-5 w-1/4 rounded" />
                </div>
                <Skeleton className="h-11 w-full sm:w-40 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
