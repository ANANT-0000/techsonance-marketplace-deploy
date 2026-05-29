import { Skeleton } from "@/components/ui/skeleton";

interface MetricsSkeletonProps {
    count?: number;
    style?: string;
    subStyle?: string;
}

export function MetricsSkeleton({ count = 4 , style, subStyle }: MetricsSkeletonProps) {
    return (
        <div className={`w-full ${style?.includes('flex') ? style : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-4 ${style || ''}`}>
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className={`bg-white p-4 rounded-lg border border-gray-200 space-y-2 ${subStyle || ''}`}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            ))}
        </div>
    );
}
