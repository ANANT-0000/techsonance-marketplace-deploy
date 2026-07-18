import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const CartItemSkeleton = () => (
  <Card className="rounded-2xl shadow-sm border-border overflow-hidden mb-4 bg-card">
    <CardContent className="p-4 flex flex-row gap-4">
      <Skeleton className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex justify-between items-end mt-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CartPageSkeleton = () => {
  return (
    <main className="min-h-screen bg-background pb-24 lg:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
        <div className="mb-6 sm:mb-8 text-left">
          <Skeleton className="h-8 w-48 rounded mb-2" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8 w-full space-y-4">
            {[...Array(2)].map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
          <div className="lg:col-span-5 xl:col-span-4 w-full">
            <Skeleton className="h-[400px] rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </main>
  );
};
