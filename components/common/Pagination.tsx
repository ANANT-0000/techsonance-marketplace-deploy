'use client';
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";


interface PaginationProps {
    count: number;
    totalPages: number;
    setCount: React.Dispatch<React.SetStateAction<number>>;
    style?: string;
    onPageChange?: () => void;
}

export function Pagination({ setCount, count, totalPages, style, onPageChange }: PaginationProps) {

    const handlePrev = () => {
        if (count > 1) {
            setCount(prev => prev - 1);
            onPageChange?.();
        }
    };

    const handleNext = () => {
        if (count < totalPages) {
            setCount(prev => prev + 1);
            onPageChange?.();
        }
    };

    return (
        <div className={`flex w-full  flex-row justify-end  items-center gap-6 my-8 ${style}`}>
            {/* Previous Button */}
            <motion.button
                whileTap={count > 1 ? { scale: 0.95 } : {}}
                disabled={count === 1}
                onClick={handlePrev}
                className={`px-4 py-2 flex gap-3 items-center font-medium rounded-md transition-all
                    ${count === 1
                        ? 'opacity-30 cursor-not-allowed grayscale'
                        : 'hover:bg-gray-100 active:bg-gray-200'}`}
            >
                <ChevronLeft className={`w-4 h-4 ${count === 1 ? 'text-gray-500' : 'text-gray-700'}`} />
                Previous
            </motion.button>

            <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white">
                    {count}
                </span>
                <span className="text-gray-400 font-normal">of</span>
                <span className="text-gray-700">{totalPages}</span>
            </div>

            <motion.button
                whileTap={count < totalPages ? { scale: 0.95 } : {}}
                disabled={count === totalPages}
                onClick={handleNext}
                className={`px-4 py-2 flex gap-3 items-center font-medium rounded-md transition-all
                    ${count === totalPages
                        ? 'opacity-30 cursor-not-allowed grayscale'
                        : 'hover:bg-gray-100 active:bg-gray-200'}`}
            >
                Next
                <ChevronRight className={`w-4 h-4 ${count === totalPages ? 'text-gray-500' : 'text-gray-700'}`} />
            </motion.button>
        </div>
    );
}