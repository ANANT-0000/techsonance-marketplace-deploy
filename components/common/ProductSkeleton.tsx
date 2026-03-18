export function ProductSkeleton() {
    return (
        <div className="flex flex-col justify-between bg-white border border-gray-200 rounded-xl p-3 lg:p-4 h-full animate-pulse">
            <div className="flex flex-col h-full">

                <div className="aspect-square bg-gray-200 rounded-lg mb-4" />

                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />

                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
            </div>

            <div className="mt-auto pt-2 border-t border-gray-50">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded flex-1" />
                    <div className="h-10 bg-gray-200 rounded w-12" />
                </div>
            </div>
        </div>
    );
}