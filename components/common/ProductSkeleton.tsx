import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductSkeleton() {
    return (
        <Card className="rounded-2xl shadow-sm border-border overflow-hidden bg-card h-full">
            <CardContent className="flex flex-col justify-between p-3 lg:p-4 h-full">
                <div className="flex flex-col h-full">
                    <Skeleton className="aspect-square rounded-lg mb-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-5/6 mb-4" />
                </div>
                <div className="mt-auto pt-4 border-t border-border">
                    <Skeleton className="h-6 w-1/4 mb-3" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 w-12 rounded-xl shrink-0" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}