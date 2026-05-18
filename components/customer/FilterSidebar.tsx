'use client';
import { SlidersHorizontal, ChevronUp, ChevronRight, X, ChevronDown, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Category } from '@/utils/Types';

// ── Types ────────────────────────────────────────────────────────────────────
export interface FilterState {
    minPrice: number;
    maxPrice: number;
    selectedCategories: string[];  // category IDs
}

interface FilterSidebarProps {
    categories: Category[];
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
}

// ── Default / constants ───────────────────────────────────────────────────────
const DEFAULT_MAX = 50000;
const DEFAULT_FILTERS: FilterState = {
    minPrice: 0,
    maxPrice: DEFAULT_MAX,
    selectedCategories: [],
};

// ── Inner content (shared desktop / mobile) ──────────────────────────────────
function SidebarContent({
    setIsOpen,
    categories,
    filters,
    onFiltersChange,
    isPriceOpen,
    setIsPriceOpen,
}: {
    setIsOpen: (v: boolean) => void;
    categories: Category[];
    filters: FilterState;
    onFiltersChange: (f: FilterState) => void;
    isPriceOpen: boolean;
    setIsPriceOpen: (v: boolean) => void;
}) {
    const { minPrice, maxPrice, selectedCategories } = filters;

    const toggleCategory = (id: string) => {
        const next = selectedCategories.includes(id)
            ? selectedCategories.filter((c) => c !== id)
            : [...selectedCategories, id];
        onFiltersChange({ ...filters, selectedCategories: next });
    };

    const handleReset = () => onFiltersChange(DEFAULT_FILTERS);

    const hasActiveFilters =
        minPrice > 0 ||
        maxPrice < DEFAULT_MAX ||
        selectedCategories.length > 0;

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-800">Filters</h1>
                    {hasActiveFilters && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleReset}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <RotateCcw size={12} />
                            Reset
                        </motion.button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-1">
                        <X size={18} />
                    </button>
                    <SlidersHorizontal size={18} className="hidden lg:block text-gray-400" />
                </div>
            </div>

            {/* Price Section */}
            <section className="border-b border-gray-100 pb-6">
                <button
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                    className="flex items-center justify-between w-full mb-4"
                >
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Price Range</h2>
                    {isPriceOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                <AnimatePresence>
                    {isPriceOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden space-y-4"
                        >
                            {/* Visual progress bar */}
                            <div className="relative h-1.5 w-full bg-gray-100 rounded-full">
                                <div
                                    className="absolute h-full bg-blue-500 rounded-full transition-all"
                                    style={{
                                        left: `${(minPrice / DEFAULT_MAX) * 100}%`,
                                        right: `${100 - (maxPrice / DEFAULT_MAX) * 100}%`,
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex flex-col gap-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Min</span>
                                    <div className="border border-gray-200 rounded-lg p-2 text-sm text-gray-700 flex items-center focus-within:border-blue-400 transition-colors">
                                        <span className="text-gray-400 mr-1 text-xs">₹</span>
                                        <input
                                            type="number"
                                            value={minPrice}
                                            min={0}
                                            max={maxPrice - 1}
                                            onChange={(e) =>
                                                onFiltersChange({ ...filters, minPrice: Math.max(0, Number(e.target.value)) })
                                            }
                                            className="w-full outline-none bg-transparent text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Max</span>
                                    <div className="border border-gray-200 rounded-lg p-2 text-sm text-gray-700 flex items-center focus-within:border-blue-400 transition-colors">
                                        <span className="text-gray-400 mr-1 text-xs">₹</span>
                                        <input
                                            type="number"
                                            value={maxPrice}
                                            min={minPrice + 1}
                                            max={DEFAULT_MAX}
                                            onChange={(e) =>
                                                onFiltersChange({ ...filters, maxPrice: Math.min(DEFAULT_MAX, Number(e.target.value)) })
                                            }
                                            className="w-full outline-none bg-transparent text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="flex-1 overflow-hidden flex flex-col">
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Category</h2>
                    <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
                        {categories.map((cat) => {
                            const isSelected = selectedCategories.includes(cat.id);
                            return (
                                <motion.button
                                    key={cat.id}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                        isSelected
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <span className="truncate">{cat.name}</span>
                                    {isSelected ? (
                                        <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}

// ── Public component ─────────────────────────────────────────────────────────
export function FilterSidebar({ categories, filters, onFiltersChange }: FilterSidebarProps) {
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isOpen, setIsOpen] = useState(false); // mobile drawer

    return (
        <>
            {/* Mobile trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2"
            >
                <SlidersHorizontal size={18} />
                <span className="font-semibold text-sm">Filters</span>
                {(filters.selectedCategories.length > 0 || filters.minPrice > 0 || filters.maxPrice < DEFAULT_MAX) && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {filters.selectedCategories.length +
                            (filters.minPrice > 0 || filters.maxPrice < DEFAULT_MAX ? 1 : 0)}
                    </span>
                )}
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col lg:w-64 w-[60%] bg-white border-r border-gray-100 px-5 py-6 h-screen sticky top-0 gap-0">
                <SidebarContent
                    setIsOpen={setIsOpen}
                    categories={categories}
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    isPriceOpen={isPriceOpen}
                    setIsPriceOpen={setIsPriceOpen}
                />
            </aside>

            {/* Mobile drawer */}
            <div className={`fixed inset-0 z-[60] lg:hidden transition-visibility duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsOpen(false)}
                />
                <aside className={`absolute left-0 top-0 h-full w-[75%] max-w-xs bg-white p-5 shadow-2xl flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent
                        setIsOpen={setIsOpen}
                        categories={categories}
                        filters={filters}
                        onFiltersChange={onFiltersChange}
                        isPriceOpen={isPriceOpen}
                        setIsPriceOpen={setIsPriceOpen}
                    />
                </aside>
            </div>
        </>
    );
}