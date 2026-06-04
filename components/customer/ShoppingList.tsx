'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AddToCart } from './AddToCart';
import { BuyBtn } from './BuyBtn';
import { WishListBtn } from './WishListBtn';
import { useShoppingCmsData } from "@/hooks/useShoppingCmsData";
import { Pagination } from '../common/Pagination';
import Link from 'next/link';
import { FilterSidebar, FilterState } from './FilterSidebar';
import { ProductSkeleton } from '../common/ProductSkeleton';
import { motion, AnimatePresence } from 'motion/react';
import { BuyBtnMode, Product, Category } from '@/utils/Types';
import { formatCurrency } from '@/lib/utils';
import { fetchProductVendorProducts, SortBy } from '@/utils/commonAPiClient';
import { ChevronDown, PackageSearch } from 'lucide-react';
import { SearchBar } from './SearchBar';

const PAGE_SIZE = 12;

export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Most Popular', value: 'discount' },
];

const DEFAULT_FILTERS: FilterState = { minPrice: 0, maxPrice: 50000, selectedCategories: [] };

interface ShoppingListProps {
    initialSearchParams?: {
        search?: string;
        category_id?: string;
        min_price?: string;
        max_price?: string;
        sort_by?: string;
        page?: string;
    };
    styles?: string;
}

export function ShoppingList({ initialSearchParams, styles }: ShoppingListProps) {
    const { promoContent } = useShoppingCmsData();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(() => Number(initialSearchParams?.page || 1));
    const [search, setSearch] = useState(initialSearchParams?.search || '');
    const [committedSearch, setCommittedSearch] = useState(initialSearchParams?.search || '');
    const [sortBy, setSortBy] = useState<SortBy>((initialSearchParams?.sort_by as SortBy) || 'newest');
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    const [filters, setFilters] = useState<FilterState>(() => ({
        minPrice: Number(initialSearchParams?.min_price || 0),
        maxPrice: Number(initialSearchParams?.max_price || 50000),
        selectedCategories: initialSearchParams?.category_id ? [initialSearchParams.category_id] : [],
    }));

    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const category_id = filters.selectedCategories[0];
            const response = await fetchProductVendorProducts({
                search: committedSearch || undefined,
                category_id,
                min_price: filters.minPrice > 0 ? filters.minPrice : undefined,
                max_price: filters.maxPrice < 50000 ? filters.maxPrice : undefined,
                sort_by: sortBy,
                offset: (page - 1) * PAGE_SIZE,
                limit: PAGE_SIZE,
            });
            
            setProducts(response.data || []);
            setTotal(response.total || 0);
            setTotalPages(response.totalPages || 1);

            if (response.data?.length > 0) {
                const seen = new Map<string, Category>();
                response.data.forEach((p: Product) => {
                    if (p.category && !seen.has(p.category.id)) seen.set(p.category.id, p.category);
                });
                setCategories((prev) => {
                    const merged = new Map<string, Category>(prev.map((c) => [c.id, c]));
                    seen.forEach((v, k) => merged.set(k, v));
                    return Array.from(merged.values());
                });
            }
        } catch (e) {
            console.error('Failed to fetch products', e);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [committedSearch, filters, sortBy, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFiltersChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleSearch = (value: string) => {
        setCommittedSearch(value);
        setPage(1);
    };

    const handleSortChange = (value: SortBy) => {
        setSortBy(value);
        setIsSortOpen(false);
        setPage(1);
    };

    const handlePageChange = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Newest';

    return (
        <motion.section className={`w-full ${styles}`}>
            <div className="flex gap-8">
                {/* Desktop Sidebar */}
                <FilterSidebar
                    categories={categories}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    totalResults={total}
                />

                <div className="flex-1 min-w-0">
                    {/* Header Area */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        {/* Mobile Header Title */}
                        <div className="lg:hidden w-full flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-[#1a202c]">New Arrivals</h1>
                                <p className="text-sm text-gray-500 mt-1">Showing {total} items</p>
                            </div>
                        </div>

                        {/* Desktop Search & Meta */}
                        <div className="hidden lg:flex w-full items-center justify-between">
                            <div className="text-sm text-gray-500 font-medium">
                                Showing {total} products
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="w-72">
                                    <SearchBar
                                        value={search}
                                        onChange={setSearch}
                                        onSearch={handleSearch}
                                        placeholder="Search brands, styles..."
                                    />
                                </div>
                                <div ref={sortRef} className="relative">
                                    <button
                                        onClick={() => setIsSortOpen((v) => !v)}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white hover:border-gray-300 transition-colors"
                                    >
                                        Sort by: {currentSortLabel}
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isSortOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1"
                                            >
                                                {SORT_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => handleSortChange(opt.value)}
                                                        className={`w-full text-left px-4 py-2.5 text-sm ${sortBy === opt.value ? 'bg-gray-50 font-semibold text-black' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Area */}
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.ul
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                            >
                                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </motion.ul>
                        ) : products.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4"
                            >
                                <PackageSearch size={48} strokeWidth={1} className="opacity-40" />
                                <div className="text-center">
                                    <p className="text-base font-medium text-gray-600">No products found</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.ul
                                key={`products-${page}-${committedSearch}-${sortBy}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                            >
                                {products.map((product, idx) => (
                                    <ProductCard key={product.id} product={product} idx={idx} />
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>

                    {!isLoading && totalPages > 1 && (
                        <Pagination
                            count={page}
                            setCount={setPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </motion.section>
    );
}

// ── Product card ─────────────────────────────────────────────────
// ── Product card ─────────────────────────────────────────────────
function ProductCard({ product, idx }: { product: Product; idx: number }) {
    const primaryImage = product.variants?.[0]?.images?.[0]?.image_url ?? 'https://placehold.net/400x500.png';
    const variantId = product.variants?.[0]?.id ?? '';

    return (
        <motion.li
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.25 }}
            className="group flex flex-col cursor-pointer bg-white border border-gray-100 rounded-[20px] overflow-hidden hover:shadow-lg transition-all duration-300 relative h-full"
        >
            <div className="relative aspect-square md:aspect-[4/5] bg-[#F8F9FA] overflow-hidden">
                <WishListBtn productVariantId={variantId} styles="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center rounded-full text-gray-600 hover:text-red-500 transition-colors" />
                <Link href={`/shopping/${product.id}`} className="block w-full h-full p-4">
                    <img
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        src={primaryImage}
                        alt={product.name?.trim()}
                    />
                </Link>
            </div>

            <div className="p-4 flex flex-col flex-grow bg-white">
                <div className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
                    {product.category?.name || 'Category'}
                </div>
                <Link href={`/shopping/${product.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-[15px] leading-tight mb-3 line-clamp-2">
                        {product.name}
                    </h3>
                </Link>
                
                <div className="mt-auto">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="font-bold text-gray-900 text-lg">
                                ${formatCurrency(Number(product.base_price))}
                            </span>
                            {Number(product.discount_percent) > 0 && (
                                <span className="text-xs line-through text-gray-400 ml-1.5 font-medium">
                                    ${formatCurrency(Math.floor(Number(product.base_price) / (1 - Number(product.discount_percent) / 100)))}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Always-Visible Action Buttons */}
                    {variantId && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col xl:flex-row gap-2 w-full">
                            <AddToCart 
                                productVariantId={variantId} 
                                styles="flex-1 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors" 
                            />
                            <BuyBtn 
                                id={variantId} 
                                mode={BuyBtnMode.QUICK_BUY} 
                                styles="flex-1 h-10 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg flex items-center justify-center text-gray-900 transition-colors" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.li>
    );
}