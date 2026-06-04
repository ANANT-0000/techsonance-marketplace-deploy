'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AddToCart } from './AddToCart';
import { BuyBtn } from './BuyBtn';
import { WishListBtn } from './WishListBtn';
import { useShoppingCmsData } from "@/hooks/useShoppingCmsData";
import { Pagination } from '../common/Pagination';
import Link from 'next/link';
import { FilterSidebar, FilterState } from './FilterSidebar';

import { useMediaQuery } from 'react-responsive';
import { ProductSkeleton } from '../common/ProductSkeleton';
import { motion, AnimatePresence } from 'motion/react';
import { BuyBtnMode, Product, Category } from '@/utils/Types';
import { formatCurrency } from '@/lib/utils';
import { fetchProductVendorProducts, SortBy } from '@/utils/commonAPiClient';
import { ArrowUpDown, ChevronDown, PackageSearch } from 'lucide-react';
import { SearchBar } from './SearchBar';

const PAGE_SIZE = 12;
const STOCK_WARNING_THRESHOLD = 15;
const SORT_OPTIONS: { label: string; value: SortBy }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low → High', value: 'price_asc' },
    { label: 'Price: High → Low', value: 'price_desc' },
    { label: 'Name A–Z', value: 'name_asc' },
    { label: 'Best Discount', value: 'discount' },
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
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const { promoContent } = useShoppingCmsData();

    // ── State ────────────────────────────────────────────────────────────────
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

    // ── Close sort dropdown on outside click ─────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Fetch products from server ────────────────────────────────────────────
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
            console.log("response product", response)
            setProducts(response.data || []);
            setTotal(response.total || 0);
            setTotalPages(response.totalPages || 1);

            // Extract unique categories for the filter sidebar
            if (response.data?.length > 0) {
                const seen = new Map<string, Category>();
                response.data.forEach((p: Product) => {
                    if (p.category && !seen.has(p.category.id)) seen.set(p.category.id, p.category);
                });
                setCategories((prev) => {
                    // Merge with existing categories to avoid losing categories after filtering
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

    // ── Reset page when filters/search/sort change ───────────────────────────
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

    const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort';

    const hasActiveFilters =
        committedSearch ||
        filters.selectedCategories.length > 0 ||
        filters.minPrice > 0 ||
        filters.maxPrice < 50000;

    return (
        <motion.section className={`w-full ${styles}`}>
            {/* ── Top bar: Search + Sort ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch sm:items-center">
                {/* Search */}
                <div className="flex-1">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onSearch={handleSearch}
                        placeholder="Search products by name or description..."
                    />
                </div>

                {/* Sort dropdown */}
                <div ref={sortRef} className="relative flex-shrink-0">
                    <button
                        onClick={() => setIsSortOpen((v) => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white transition-colors whitespace-nowrap"
                    >
                        <ArrowUpDown size={15} className="text-gray-400" />
                        {currentSortLabel}
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isSortOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                transition={{ duration: 0.15 }}
                                style={{ transformOrigin: 'top' }}
                                className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleSortChange(opt.value)}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === opt.value
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Result count ─────────────────────────────────────────────────── */}
            {!isLoading && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <span>
                        {total === 0 ? 'No products' : `${total} product${total !== 1 ? 's' : ''}`}
                        {committedSearch && (
                            <> for <span className="font-semibold text-gray-800">"{committedSearch}"</span></>
                        )}
                    </span>
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setCommittedSearch('');
                                setFilters(DEFAULT_FILTERS);
                                setPage(1);
                            }}
                            className="ml-auto text-xs font-medium text-red-500 hover:text-red-700 underline underline-offset-2"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* ── Storefront Dynamic Promotion Banner ────────────────────────────── */}
            {promoContent && promoContent.promo_banner_title && (
                <div 
                    className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden mb-6 flex flex-col justify-center px-6 md:px-12 text-white bg-cover bg-center shadow-lg transition-transform hover:scale-[1.005] duration-300"
                    style={{ backgroundImage: `url(${promoContent.promo_banner_image_url || 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop'})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-0" />
                    <div className="relative z-10 max-w-lg">
                        <span className="bg-red-500/90 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 inline-block">
                            Special Promotion
                        </span>
                        <h2 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2 text-white">
                            {promoContent.promo_banner_title}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-200 leading-relaxed mb-4 line-clamp-2 md:line-clamp-none">
                            {promoContent.promo_banner_desc}
                        </p>
                        {promoContent.promo_banner_link && (
                            <Link 
                                href={promoContent.promo_banner_link}
                                className="bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold px-5 py-2.5 rounded-xl transition-all inline-block hover:shadow-md"
                            >
                                Discover Offer
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* ── Main layout: Sidebar + Grid ───────────────────────────────────── */}
            <div className="flex gap-6">
                <FilterSidebar
                    categories={categories}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.ul
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 gap-2 items-start"
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
                                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.ul
                                key={`products-${page}-${committedSearch}-${sortBy}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 gap-2 items-stretch"
                            >
                                {products.map((product, idx) => (
                                    <ProductCard key={product.id} product={product} isMobile={isMobile} idx={idx} />
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
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

// ── Product card (extracted) ─────────────────────────────────────────────────
function ProductCard({ product, isMobile, idx }: { product: Product; isMobile: boolean; idx: number }) {
    const primaryImage =
        product.variants?.[0]?.images?.[0]?.image_url ?? 'https://placehold.net/10.png';
    const variantId = product.variants?.[0]?.id ?? '';

    return (
        <motion.li
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.25 }}
            className="flex flex-col justify-between text-lg text-gray-700 hover:text-gray-900 cursor-pointer border-2 border-gray-200 rounded-lg p-4 relative transition-shadow hover:shadow-md"
        >
            <div className="flex flex-col h-full">
                <WishListBtn productVariantId={variantId} styles="absolute lg:top-0 lg:right-4 md:top-0 md:right-4 -top-2 right-2 z-10" />
                <Link href={`/shopping/${product.id}`} className="block overflow-hidden rounded-lg">
                    <img
                        loading="lazy"
                        className="w-full object-contain lg:aspect-[9/14] aspect-[9/12] rounded-lg mb-4 transform hover:scale-105 transition-transform duration-300"
                        src={primaryImage}
                        alt={product.name?.trim()}
                    />
                </Link>
                <h3 className="font-semibold text-sm lg:line-clamp-1 line-clamp-2 leading-4 mb-1">
                    {product.name}
                </h3>
                <p className="lg:text-sm text-xs text-gray-500 lg:line-clamp-2 line-clamp-2 leading-5 overflow-hidden mb-4 h-10">
                    {product.description}
                </p>
            </div>

            <div className="mt-auto">
                <div className="flex items-center justify-between gap-2 flex-wrap-reverse ">
                    <span className="font-bold text-gray-900 lg:text-xl text-sm">
                        ₹{formatCurrency(Number(product.base_price))}
                    </span>
                    {Number(product.discount_percent) > 0 && (
                        <div className="flex gap-2">
                            <span className="text-xs line-through text-gray-400">
                                ₹{formatCurrency(Math.floor(Number(product.base_price) / (1 - Number(product.discount_percent) / 100)))}
                            </span>
                            <span className="text-xs font-bold text-green-500">
                                {Math.round(Number(product.discount_percent))}% off
                            </span>
                        </div>
                    )}
                    {
                        product.variants[0].inventory.stock_quantity !== 0 &&
                        product.variants[0].inventory.stock_quantity <= STOCK_WARNING_THRESHOLD && (
                            <div className=" text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-lg lg:text-center md:text-center text-nowrap">Last {product.variants[0].inventory.stock_quantity} items left</div>
                        )

                    }
                </div>
                {!isMobile && variantId && (
                    <div className="flex gap-2 mt-2 justify-between  items-stretch">
                        <AddToCart productVariantId={variantId} styles="w-full" />
                        {
                            product.variants[0].inventory.stock_quantity <= 0 ? (
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg w-full text-center flex justify-center items-center">Out of Stock</span>
                            )
                                : <BuyBtn id={variantId} mode={BuyBtnMode.QUICK_BUY} styles="px-6" />}
                    </div>
                )}
            </div>
        </motion.li>
    );
}