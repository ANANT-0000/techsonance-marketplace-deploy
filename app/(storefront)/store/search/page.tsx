'use client';
/**
 * SearchPage.tsx — /store/search
 *
 * This page has ONE job: accept a query and redirect to ShoppingList.
 *
 * Route contract (single source of truth across ALL entry points):
 *   Entry:   /store/search?q=<term>      (navbar overlay, direct link)
 *   Exits:   /store/shop?search=<term>   (ShoppingList reads ?search=)
 *
 * When the user lands here with ?q= already set (e.g. from SearchOverlay),
 * we immediately redirect. When there's no query, we show the idle UI
 * (popular categories + explore banner) — clicking any of those also
 * redirects to /store/shop?search=.
 *
 * There is NO second search bar here. The navbar SearchTrigger is the
 * only search entry point; the sticky bar that used to live in this
 * header is removed to eliminate the duplicate.
 */

import { useEffect, useReducer } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { fetchHomepageProducts } from '@/utils/commonAPiClient';

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

type Action =
    | { type: 'SET_POPULAR'; payload: string[] }
    | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_POPULAR': return { ...state, popularSuggestions: action.payload };
        case 'SET_LOADING': return { ...state, isLoadingPopular: action.payload };
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
        if (queryParam.trim()) return; // don't bother if we're about to redirect
        const load = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const popular = await fetchHomepageProducts(12);
                if (Array.isArray(popular?.data)) {
                    const names: string[] = popular.data
                        .map((p: any) =>
                            p?.name ? p.name.split(' ').slice(0, 3).join(' ') + '...' : ''
                        )
                        .filter(Boolean);
                    dispatch({ type: 'SET_POPULAR', payload: Array.from(new Set(names)) });
                }
            } catch {
                // fall through to FALLBACK_KEYWORDS
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
        load();
    }, [queryParam]);

    // ── If query is present, show a brief redirect indicator ─────────────────
    if (queryParam.trim()) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">Searching marketplace…</span>
                </div>
            </div>
        );
    }

    // ── Idle screen ───────────────────────────────────────────────────────────
    const pills = state.popularSuggestions.length > 0
        ? state.popularSuggestions
        : FALLBACK_KEYWORDS;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            <main className="max-w-4xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-8"
                >
                    {/* Popular categories */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wider mb-5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Popular Categories
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {state.isLoadingPopular
                                ? Array.from({ length: 6 }).map((_, i) => (
                                      <div
                                          key={i}
                                          className="h-9 w-28 bg-gray-100 animate-pulse rounded-full"
                                      />
                                  ))
                                : pills.map((word) => (
                                      <button
                                          key={word}
                                          onClick={() => router.push(shopUrl(word))}
                                          className="px-4 py-2 rounded-full text-sm font-medium bg-gray-50 border border-gray-100 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                                      >
                                          {word}
                                      </button>
                                  ))}
                        </div>
                    </div>

                    {/* Explore banner */}
                    <div className="rounded-2xl p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-md gap-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-extrabold tracking-wide">Explore Vendor Stores</h3>
                            <p className="text-sm text-blue-100">
                                Browse and filter our entire collection of dedicated vendor websites
                            </p>
                        </div>
                        <Link
                            href="/store"
                            className="bg-white hover:bg-blue-50 text-blue-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm shrink-0"
                        >
                            Browse All
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}