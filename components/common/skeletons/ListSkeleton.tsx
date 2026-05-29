import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
    count?: number;
}

export function ListSkeleton({ count = 5 }: ListSkeletonProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            ))}
        </div>
    );
}
