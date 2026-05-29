import { Skeleton } from "@/components/ui/skeleton";

interface TableRowSkeletonProps {
    columns?: number;
    rows?: number;
}

export function TableRowSkeleton({ columns = 7, rows = 5 }: TableRowSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-200">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
