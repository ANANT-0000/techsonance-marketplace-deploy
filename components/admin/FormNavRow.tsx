import { ChevronLeft, ChevronRight } from "lucide-react";

export function FormNavRow({
    onPrev,
    onNext,
    isFirst = false,
}: {
    onPrev?: () => void;
    onNext?: () => void;
    isFirst?: boolean;
}) {
    return (
        <div className={`flex items-center mt-6 pt-5 border-t border-gray-100 ${isFirst ? "justify-end" : "justify-between"}`}>
            {!isFirst && onPrev && (
                <button
                    type="button"
                    onClick={onPrev}
                    className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-all"
                >
                    <ChevronLeft size={15} />
                    Previous
                </button>
            )}
            {onNext && (
                <button
                    type="button"
                    onClick={onNext}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
                >
                    Continue
                    <ChevronRight size={15} />
                </button>
            )}
        </div>
    );
}