import { Skeleton } from "@/components/ui/skeleton";

interface CardGridSkeletonProps {
    count?: number;
    columns?: number;
}

export function CardGridSkeleton({ count = 6, columns = 3 }: CardGridSkeletonProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 flex-1" />
                    </div>
                </div>
            ))}
        </div>
    );
}
