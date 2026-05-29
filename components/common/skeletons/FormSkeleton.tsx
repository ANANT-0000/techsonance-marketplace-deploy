import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
    fields?: number;
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
    return (
        <div className="space-y-4">
            {Array.from({ length: fields }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
}
