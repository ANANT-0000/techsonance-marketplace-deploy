'use client';

import { useState, useEffect, useRef, useReducer } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, X, Loader2, Sparkles, Frown, ArrowRight, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { fetchProductProducts, fetchProductOptions, fetchHomepageProducts } from '@/utils/commonAPiClient';
import { ProductCard } from '@/components/customer/ProductCard';
import { formatCurrency } from '@/lib/utils';

// Suggested search terms
const SUGGESTED_KEYWORDS = ['Guitar', 'Tuner', 'Piano', 'Keyboard', 'Headphone', 'Microphone', 'Amplifier', 'Cable'];

enum StateAction {
  SEARCH_QUERY = 'SEARCH_QUERY',
  PRODUCT_OPTIONS = 'PRODUCT_OPTIONS',
  SUGGESTIONS = 'SUGGESTIONS',
  PRODUCTS = 'PRODUCTS',
  IS_SEARCHING = 'IS_SEARCHING',
  SHOW_SUGGESTIONS = 'SHOW_SUGGESTIONS',
  HAS_SEARCHED = 'HAS_SEARCHED',
  POPULAR_SUGGESTIONS = 'POPULAR_SUGGESTIONS',
  IS_LOADING_POPULAR = 'IS_LOADING_POPULAR',
}

type StateActionPayload = { [key in StateAction]?: unknown };

interface State {
  searchQuery: string;
  productOptions: { id: string; name: string }[];
  suggestions: { id: string; name: string }[];
  products: any[];
  isSearching: boolean;
  showSuggestions: boolean;
  popularSuggestions: string[];
  isLoadingPopular: boolean;
  hasSearched: boolean;
}

const initialState: State = {
  searchQuery: '',
  productOptions: [],
  suggestions: [],
  products: [],
  isSearching: false,
  showSuggestions: false,
  popularSuggestions: [],
  isLoadingPopular: false,
  hasSearched: false,
};

function reducer(state: State, action: { type: StateAction; payload?: StateActionPayload[keyof StateActionPayload] }): State {
  switch (action.type) {
    case StateAction.SEARCH_QUERY: return { ...state, searchQuery: action.payload as string };
    case StateAction.PRODUCT_OPTIONS: return { ...state, productOptions: action.payload as { id: string; name: string }[] };
    case StateAction.SUGGESTIONS: return { ...state, suggestions: action.payload as { id: string; name: string }[] };
    case StateAction.PRODUCTS: return { ...state, products: action.payload as any[] };
    case StateAction.IS_SEARCHING: return { ...state, isSearching: action.payload as boolean };
    case StateAction.SHOW_SUGGESTIONS: return { ...state, showSuggestions: action.payload as boolean };
    case StateAction.POPULAR_SUGGESTIONS: return { ...state, popularSuggestions: action.payload as string[] };
    case StateAction.IS_LOADING_POPULAR: return { ...state, isLoadingPopular: action.payload as boolean };
    case StateAction.HAS_SEARCHED: return { ...state, hasSearched: action.payload as boolean };
    default: return state;
  }
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [state, dispatch] = useReducer(reducer, initialState);
  const { searchQuery, productOptions, suggestions, products, isSearching, showSuggestions, hasSearched, isLoadingPopular, popularSuggestions } = state;



  // Load popular suggestions from the server on page enter
  useEffect(() => {
    const loadPopular = async () => {
      try {
        dispatch({ type: StateAction.IS_LOADING_POPULAR, payload: true });
        const popularProducts = await fetchHomepageProducts(12);
        if (popularProducts && Array.isArray(popularProducts.data)) {
          // Extract names, filter out non-strings, trim, and filter duplicates
          const names = popularProducts.data.map((p: any) => {
            if (!p?.name) return '';
            return p.name.split(' ').slice(0, 3).join(' ') + '...';
          });
          const uniqueNames = Array.from(new Set(names));
          dispatch({ type: StateAction.POPULAR_SUGGESTIONS, payload: uniqueNames || [] });
        }
      } catch (err) {
        console.error('Failed to fetch popular product suggestions:', err);
      } finally {
        dispatch({ type: StateAction.IS_LOADING_POPULAR, payload: false });
      }
    };
    loadPopular();
  }, []);

  // Fetch all product options once when the page loads
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await fetchProductOptions();
        dispatch({ type: StateAction.PRODUCT_OPTIONS, payload: options || [] });
      } catch (err) {
        console.error('Failed to load product options:', err);
      }
    };
    loadOptions();
  }, []);

  // Filter suggestions locally based on searchQuery
  useEffect(() => {
    const text = searchQuery.trim().toLowerCase();
    if (text.length < 2) {
      dispatch({ type: StateAction.SUGGESTIONS, payload: [] });
      return;
    }

    const filtered = productOptions.filter((option) =>
      option.name.toLowerCase().includes(text)
    );
    dispatch({ type: StateAction.SUGGESTIONS, payload: filtered.slice(0, 8) }); // Limit to 8 suggestions
  }, [searchQuery, productOptions]);

  // Execute initial search if search query is present in URL
  useEffect(() => {
    if (queryParam) {
      dispatch({ type: StateAction.SEARCH_QUERY, payload: queryParam });
      handleSearch(queryParam);
    }
  }, [queryParam]);

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    dispatch({ type: StateAction.IS_SEARCHING, payload: true });
    dispatch({ type: StateAction.SHOW_SUGGESTIONS, payload: false });
    dispatch({ type: StateAction.HAS_SEARCHED, payload: true });
    router.replace(`/store/search?q=${encodeURIComponent(queryText.trim())}`);
    try {
      const res = await fetchProductProducts({ search: queryText.replace('...', '').trim(), limit: 20 });
      dispatch({ type: StateAction.PRODUCTS, payload: res?.data || [] });
    } catch (err) {
      console.error('Failed to fetch search products:', err);
      dispatch({ type: StateAction.PRODUCTS, payload: [] });
    } finally {
      dispatch({ type: StateAction.IS_SEARCHING, payload: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    dispatch({ type: StateAction.SEARCH_QUERY, payload: '' });
    dispatch({ type: StateAction.SUGGESTIONS, payload: [] });
    dispatch({ type: StateAction.PRODUCTS, payload: [] });
    dispatch({ type: StateAction.HAS_SEARCHED, payload: false });
    router.replace('/store/search');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 font-sans text-gray-900">
      {/* ================= HEADER & SEARCH INPUT ================= */}
      {/* Changed to max-w-7xl for wide screens */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-7xl w-full mx-auto flex items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 relative max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  dispatch({ type: StateAction.SEARCH_QUERY, payload: e.target.value });
                  dispatch({ type: StateAction.SHOW_SUGGESTIONS, payload: true });
                }}
                onFocus={() => dispatch({ type: StateAction.SHOW_SUGGESTIONS, payload: true })}
                placeholder="Search vendor stores, products..."
                className="w-full bg-gray-100/80 focus:bg-white pl-10 pr-10 py-2.5 rounded-full text-sm font-medium border border-transparent focus:border-blue-500 focus:outline-none transition-all focus:ring-2 focus:ring-blue-100/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3.5 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown (Absolute positioning below input) */}
            <AnimatePresence>
              {!isSearching && showSuggestions && searchQuery.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 space-y-2 z-50"
                >
                  {suggestions.length > 0 ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                        Suggested Products
                      </p>
                      <div className="space-y-1">
                        {suggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              dispatch({ type: StateAction.SEARCH_QUERY, payload: item.name });
                              handleSearch(item.name);
                            }}
                            className="w-full text-left px-3 py-3 hover:bg-blue-50/50 flex items-center justify-between text-sm font-semibold text-gray-800 rounded-xl transition-all border-b border-gray-50 last:border-0"
                          >
                            <span className="truncate">{item.name}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No matching suggestions. Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-[10px] text-gray-600">Enter</kbd> to search.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </header>

      {/* ================= CONTENT BODY ================= */}
      {/* Changed to max-w-7xl and added flex layout for sidebar */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* SIDEBAR (Desktop Only) */}
        {hasSearched && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-gray-800">
                  <SlidersHorizontal className="w-4 h-4" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Filters</h3>
                </div>
                {/* Add your actual filters here later */}
                <div className="space-y-4">
                  <div className="h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center px-3 text-sm text-gray-400">Category Filter...</div>
                  <div className="h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center px-3 text-sm text-gray-400">Price Range...</div>
                  <div className="h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center px-3 text-sm text-gray-400">Vendor Status...</div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* MAIN RESULTS AREA */}
        <div className="flex-1 min-w-0"> {/* min-w-0 ensures truncation works inside flex child */}

          {/* State 1: Results Loading */}
          {isSearching && (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-gray-500 font-medium animate-pulse">Searching marketplace...</p>
            </div>
          )}

          {/* State 2: Empty/Default Screen */}
          {!hasSearched && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 max-w-4xl mx-auto" // Keep default screen centered and a bit narrower
            >
              {/* Suggested Searches */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wider mb-5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Popular Categories
                </h2>
                <div className="flex flex-wrap gap-3">
                  {isLoadingPopular ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-9 w-24 bg-gray-100 animate-pulse rounded-full" />
                    ))
                  ) : (
                    (popularSuggestions.length > 0 ? popularSuggestions : SUGGESTED_KEYWORDS).map((word) => (
                      <button
                        key={word}
                        onClick={() => {
                          dispatch({ type: StateAction.SEARCH_QUERY, payload: word });
                          handleSearch(word);
                        }}
                        className="px-4 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-sm font-medium text-gray-700 hover:text-blue-700 rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Shopping category quick link banner */}
              <div className="rounded-2xl p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-md gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold tracking-wide">Explore Vendor Stores</h3>
                  <p className="text-sm text-blue-100">Browse and filter our entire collection of dedicated vendor websites</p>
                </div>
                <Link
                  href="/store"
                  className="bg-white hover:bg-blue-50 text-blue-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm shrink-0"
                >
                  Browse All
                </Link>
              </div>
            </motion.div>
          )}

          {/* State 3: Search Results Grid */}
          {hasSearched && !isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* FIXED RESULTS HEADER - Now handles long text gracefully */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm text-gray-500 truncate">
                    Found <span className="font-bold text-gray-900">{products.length}</span> items matching <span className="font-medium text-gray-900">"{searchQuery}"</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Native Sort Dropdown */}
                  <select className="text-sm bg-white border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-700 font-medium">
                    <option>Best Match</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest Arrivals</option>
                  </select>

                  {products.length > 0 && (
                    <button
                      onClick={clearSearch}
                      className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {products.length === 0 ? (
                /* No Results State */
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Frown className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">No results found</h3>
                  <p className="text-sm text-gray-400 max-w-sm mt-2 leading-relaxed">
                    We couldn't find any products matching "{searchQuery}". Try adjusting your keywords or browse categories.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="mt-6 px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                /* Standard Product Card Grid - Expanded for desktop */
                <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} idx={idx} />
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}