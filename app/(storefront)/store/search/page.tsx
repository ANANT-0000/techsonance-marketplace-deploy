'use client';

import { useEffect, useReducer, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { fetchHomepageProducts } from '@/utils/commonAPiClient';
import { SearchBar } from '@/components/customer/SearchBar';

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_KEYWORDS = [
    'Guitar', 'Tuner', 'Piano', 'Keyboard',
    'Headphone', 'Microphone', 'Amplifier', 'Cable',
];


// The one and only route that renders search results
const SHOP_ROUTE = '/store';

// ─── Minimal state (only what the idle screen needs) ─────────────────────────

interface State {
    popularSuggestions: string[];
    isLoadingPopular: boolean;
}

export enum SearchPageActionType {
    SET_POPULAR = 'SET_POPULAR',
    SET_LOADING = 'SET_LOADING',
}

type Action =
    | { type: SearchPageActionType.SET_POPULAR; payload: string[] }
    | { type: SearchPageActionType.SET_LOADING; payload: boolean };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case SearchPageActionType.SET_POPULAR: return { ...state, popularSuggestions: action.payload };
        case SearchPageActionType.SET_LOADING: return { ...state, isLoadingPopular: action.payload };
        default: return state;
    }
}

// ─── Navigation helper ────────────────────────────────────────────────────────

function shopUrl(term: string) {
    return `${SHOP_ROUTE}?search=${encodeURIComponent(term.trim())}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryParam = searchParams.get('q') ?? '';

    const [searchQuery, setSearchQuery] = useState('');
    const [state, dispatch] = useReducer(reducer, {
        popularSuggestions: [],
        isLoadingPopular: false,
    });

    // ── If query present → redirect immediately to ShoppingList ──────────────
    useEffect(() => {
        if (queryParam.trim()) {
            router.replace(shopUrl(queryParam));
        }
    }, [queryParam, router]);

    // ── Load popular suggestions for idle screen ──────────────────────────────
    useEffect(() => {
        if (queryParam.trim()) return;
        const load = async () => {
            dispatch({ type: SearchPageActionType.SET_LOADING, payload: true });
            try {
                const popular = await fetchHomepageProducts(12);
                if (Array.isArray(popular?.data)) {
                    const names: string[] = popular.data
                        .map((p: any) =>
                            p?.name ? p.name.split(' ').slice(0, 3).join(' ') : ''
                        )
                        .filter(Boolean);
                    dispatch({ type: SearchPageActionType.SET_POPULAR, payload: Array.from(new Set(names)) });
                }
            } catch {
                // fall through to FALLBACK_KEYWORDS
            } finally {
                dispatch({ type: SearchPageActionType.SET_LOADING, payload: false });
            }
        };
        load();
    }, [queryParam]);

    // ── If query is present, show a brief redirect indicator ─────────────────
    if (queryParam.trim()) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin text-theme-primary" />
                    <span className="text-theme-body-sm font-medium">Searching marketplace…</span>
                </div>
            </div>
        );
    }

    // ── Idle screen ───────────────────────────────────────────────────────────
    const pills = state.popularSuggestions.length > 0
        ? state.popularSuggestions
        : FALLBACK_KEYWORDS;

    const handleSearch = (val: string) => {
        const term = val.trim();
        if (term) router.push(shopUrl(term));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            {/* ── Hero search header ─────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className="text-center mb-6"
                    >
                        <h1 className="text-theme-h4 font-bold text-gray-900 tracking-tight">
                            Search the Marketplace
                        </h1>
                        <p className="text-theme-body-sm text-gray-400 mt-1">
                            Find products, brands, and stores
                        </p>
                    </motion.div>

                    {/* ── The same SearchBar used in the Navbar ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, delay: 0.08 }}
                    >
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={handleSearch}
                            placeholder="Search products, brands, stores…"
                        />
                    </motion.div>
                </div>
            </div>

            {/* ── Suggestions & Explore ──────────────────────────────────────── */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.12 }}
                    className="space-y-6"
                >
                    {/* Popular categories */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="flex items-center gap-2 text-theme-body-sm font-bold text-gray-800 uppercase tracking-wider mb-5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Popular Searches
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {state.isLoadingPopular
                                ? Array.from({ length: 8 }).map((_, i) => (
                                      <div
                                          key={i}
                                          className="h-9 w-28 bg-gray-100 animate-pulse rounded-full"
                                      />
                                  ))
                                : pills.map((word) => (
                                      <button
                                          key={word}
                                          onClick={() => {
                                              setSearchQuery(word);
                                              handleSearch(word);
                                          }}
                                          className="px-4 py-2 rounded-full text-theme-body-sm font-medium bg-gray-50 border border-gray-100 text-gray-700 hover:bg-theme-primary/5 hover:border-theme-primary/30 hover:text-theme-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                                      >
                                          {word}
                                      </button>
                                  ))}
                        </div>
                    </div>

                    {/* Explore banner */}
                    <div className="rounded-2xl p-8 bg-gradient-to-br from-theme-primary to-theme-primary/80 text-theme-primary-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-md gap-4">
                        <div className="space-y-1.5">
                            <h3 className="text-theme-h6 font-extrabold tracking-wide">Explore All Products</h3>
                            <p className="text-theme-body-sm opacity-80">
                                Browse and filter our entire collection of products
                            </p>
                        </div>
                        <Link
                            href="/store"
                            className="bg-white/15 hover:bg-white/25 border border-white/20 text-current px-6 py-2.5 rounded-xl text-theme-body-sm font-bold transition-all shadow-sm shrink-0 backdrop-blur-sm"
                        >
                            Browse All
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}