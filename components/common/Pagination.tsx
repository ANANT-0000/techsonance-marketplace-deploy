'use client';
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGINATION_TEXT } from "@/constants/commonText";


interface PaginationProps {
    count: number;
    totalPages: number;
    setCount: React.Dispatch<React.SetStateAction<number>>;
    style?: string;
    onPageChange?: () => void;
}

export function Pagination({ setCount, count,  totalPages, style, onPageChange }: PaginationProps) {

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
        <div className={`flex w-full flex-row justify-end items-center gap-4 my-8 ${style}`}>
            {/* Previous Button */}
            <motion.button
                whileTap={count > 1 ? { scale: 0.97 } : {}}
                disabled={count === 1}
                onClick={handlePrev}
                className={`px-4 py-2 flex gap-2 items-center text-[13px] font-medium rounded-xl transition-all duration-300 ease-out border shadow-sm
                    ${count === 1
                        ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 shadow-none'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'}`}
            >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                {PAGINATION_TEXT.PREVIOUS}
            </motion.button>

            <div className="flex items-center gap-3 text-[13px] font-medium bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                <span className="flex items-center justify-center min-w-[24px] h-6 rounded-md bg-indigo-50 text-indigo-700 font-semibold px-1.5">
                    {count}
                </span>
                <span className="text-slate-400 font-normal">{PAGINATION_TEXT.OF}</span>
                <span className="text-slate-600 font-semibold">{totalPages}</span>
            </div>

            <motion.button
                whileTap={count < totalPages ? { scale: 0.97 } : {}}
                disabled={count === totalPages}
                onClick={handleNext}
                className={`px-4 py-2 flex gap-2 items-center text-[13px] font-medium rounded-xl transition-all duration-300 ease-out border shadow-sm
                    ${count === totalPages
                        ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 shadow-none'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'}`}
            >
                {PAGINATION_TEXT.NEXT}
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </motion.button>
        </div>
    );
}