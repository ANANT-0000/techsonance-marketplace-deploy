'use client';
import { SlidersHorizontal, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Category } from '@/utils/Types';
import { SortBy } from '@/utils/commonAPiClient';
import { SORT_OPTIONS } from './ShoppingList';

export interface FilterState {
    minPrice: number;
    maxPrice: number;
    selectedCategories: string[];
}

interface FilterSidebarProps {
    categories: Category[];
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    sortBy: SortBy;
    onSortChange: (sort: SortBy) => void;
    totalResults: number;
}

const DEFAULT_MAX = 50000;
const DEFAULT_FILTERS: FilterState = {
    minPrice: 0,
    maxPrice: DEFAULT_MAX,
    selectedCategories: [],
};

// Desktop layout component
function DesktopSidebarContent({
    categories,
    filters,
    onFiltersChange,
    isPriceOpen,
    setIsPriceOpen,
}: {
    categories: Category[];
    filters: FilterState;
    onFiltersChange: (f: FilterState) => void;
    isPriceOpen: boolean;
    setIsPriceOpen: (v: boolean) => void;
}) {
    const toggleCategory = (id: string) => {
        const next = filters.selectedCategories.includes(id)
            ? filters.selectedCategories.filter((c) => c !== id)
            : [...filters.selectedCategories, id];
        onFiltersChange({ ...filters, selectedCategories: next });
    };

    return (
        <div className="flex flex-col gap-8 h-full pr-4">
            {/* Desktop Categories (Left-Aligned Checkboxes) */}
            {categories.length > 0 && (
                <section>
                    <h2 className="text-[15px] font-bold text-gray-900 mb-4">Category</h2>
                    <div className="flex flex-col gap-3">
                        {categories.map((cat) => {
                            const isSelected = filters.selectedCategories.includes(cat.id);
                            return (
                                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center border transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className={`text-[14px] ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                        {cat.name}
                                    </span>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={isSelected} 
                                        onChange={() => toggleCategory(cat.id)} 
                                    />
                                </label>
                            );
                        })}
                    </div>
                </section>
            )}

            <hr className="border-gray-100" />

            {/* Desktop Price Range (Input Boxes) */}
            <section>
                <button
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                    className="flex items-center justify-between w-full mb-4 group"
                >
                    <h2 className="text-[15px] font-bold text-gray-900">Price Range</h2>
                    {isPriceOpen ? <ChevronUp size={16} className="text-gray-400 group-hover:text-gray-600" /> : <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />}
                </button>

                <AnimatePresence>
                    {isPriceOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:border-gray-400 transition-colors">
                                    <span className="text-gray-500 mr-1 text-[13px]">$</span>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => onFiltersChange({ ...filters, minPrice: Math.max(0, Number(e.target.value)) })}
                                        className="w-full bg-transparent outline-none text-sm font-medium text-gray-900"
                                    />
                                </div>
                                <span className="text-gray-400 text-sm">to</span>
                                <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:border-gray-400 transition-colors">
                                    <span className="text-gray-500 mr-1 text-[13px]">$</span>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => onFiltersChange({ ...filters, maxPrice: Math.min(DEFAULT_MAX, Number(e.target.value)) })}
                                        className="w-full bg-transparent outline-none text-sm font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}

export function FilterSidebar({ categories, filters, onFiltersChange, sortBy, onSortChange, totalResults }: FilterSidebarProps) {
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isOpen, setIsOpen] = useState(false); // Mobile bottom sheet state

    // Prevent body scroll when bottom sheet is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleClearAll = () => {
        onFiltersChange(DEFAULT_FILTERS);
    };

    const toggleCategory = (id: string) => {
        const next = filters.selectedCategories.includes(id)
            ? filters.selectedCategories.filter((c) => c !== id)
            : [...filters.selectedCategories, id];
        onFiltersChange({ ...filters, selectedCategories: next });
    };

    return (
        <>
            {/* Desktop Sidebar (Hidden on mobile) */}
            <aside className="hidden lg:block w-[240px] flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
                <DesktopSidebarContent
                    categories={categories}
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    isPriceOpen={isPriceOpen}
                    setIsPriceOpen={setIsPriceOpen}
                />
            </aside>

            {/* Mobile Filter Button (Top Right of product grid) */}
            <div className="lg:hidden absolute top-0 right-0 z-10 pt-[38px] pr-4">
               <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#0A0A0B] text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:bg-black transition-colors"
                >
                    <SlidersHorizontal size={14} />
                    <span className="font-semibold text-sm">Filter</span>
                </button>
            </div>

            {/* Mobile Bottom Sheet Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-[2px]"
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl h-[85vh] flex flex-col lg:hidden shadow-2xl overflow-hidden"
                        >
                            {/* Drag Handle & Header */}
                            <div className="flex-shrink-0 pt-3 pb-4 px-6 border-b border-gray-100 flex flex-col items-center relative bg-white">
                                <div className="w-10 h-1 bg-gray-300 rounded-full mb-5" />
                                <div className="w-full flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                    <button onClick={handleClearAll} className="text-[15px] font-semibold text-blue-600">
                                        Clear all
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Form Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32">
                                {/* Sort By Pills */}
                                <section>
                                    <h3 className="text-[16px] font-bold text-gray-900 mb-4">Sort By</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {SORT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => onSortChange(opt.value)}
                                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${
                                                    sortBy === opt.value
                                                        ? 'bg-[#0A0A0B] text-white border-[#0A0A0B]'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Price Range Visual */}
                                <section>
                                    <h3 className="text-[16px] font-bold text-gray-900 mb-5">Price Range</h3>
                                    <div className="w-full bg-blue-100/50 h-2.5 rounded-full mb-4 relative">
                                        <div 
                                            className="absolute h-full bg-[#1A56DB] rounded-full"
                                            style={{ 
                                                left: `${(filters.minPrice / DEFAULT_MAX) * 100}%`, 
                                                right: `${100 - (filters.maxPrice / DEFAULT_MAX) * 100}%` 
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[15px] font-medium text-gray-700">
                                        <span>$0</span>
                                        <span>$5000+</span>
                                    </div>
                                </section>

                                {/* Category (Right-Aligned Checkboxes) */}
                                <section>
                                    <h3 className="text-[16px] font-bold text-gray-900 mb-4">Category</h3>
                                    <div className="flex flex-col gap-5">
                                        {categories.map((cat) => {
                                            const isSelected = filters.selectedCategories.includes(cat.id);
                                            return (
                                                <label key={cat.id} className="flex items-center justify-between cursor-pointer group">
                                                    <span className="text-gray-700 text-[15px]">{cat.name}</span>
                                                    <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#0A0A0B] border-[#0A0A0B]' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={isSelected} 
                                                        onChange={() => toggleCategory(cat.id)} 
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            {/* Sticky Footer */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full bg-[#0A0A0B] hover:bg-black text-white font-semibold py-4 rounded-[12px] text-[15px] transition-colors"
                                >
                                    Apply {totalResults} Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}