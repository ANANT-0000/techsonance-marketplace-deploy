'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, X, Loader2, Sparkles, Frown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { fetchProductProducts, fetchProductOptions } from '@/utils/commonAPiClient';
import { ProductCard } from '@/components/customer/ProductCard';
import { formatCurrency } from '@/lib/utils';

// Suggested search terms for users when they haven't typed yet
const SUGGESTED_KEYWORDS = [
  'Guitar',
  'Tuner',
  'Piano',
  'Keyboard',
  'Headphone',
  'Microphone',
  'Amplifier',
  'Cable'
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [productOptions, setProductOptions] = useState<{ id: string; name: string }[]>([]);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch all product options once when the page loads
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await fetchProductOptions();
        setProductOptions(options || []);
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
      setSuggestions([]);
      return;
    }

    const filtered = productOptions.filter((option) =>
      option.name.toLowerCase().includes(text)
    );
    setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
  }, [searchQuery, productOptions]);

  // Perform search query to fetch matching products
  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);
    setHasSearched(true);
    
    // Update search query param in URL
    router.replace(`/customer/search?q=${encodeURIComponent(queryText.trim())}`);

    try {
      const res = await fetchProductProducts({ search: queryText.trim(), limit: 20 });
      setProducts(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch search products:', err);
      setProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search on form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Execute initial search if search query is present in URL
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      handleSearch(queryParam);
    }
  }, [queryParam]);

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setProducts([]);
    setHasSearched(false);
    router.replace('/customer/search');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 font-sans">
      {/* ================= HEADER & SEARCH INPUT ================= */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Back Action */}
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input Box */}
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products, gear..."
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
          </form>
        </div>
      </header>

      {/* ================= CONTENT BODY ================= */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {/* State 1: Results Loading */}
        {isSearching && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-gray-500 font-medium animate-pulse">Searching marketplace...</p>
            </div>
          </div>
        )}

        {/* State 2: Show Suggestions Inline in Body when typing */}
        {!isSearching && showSuggestions && searchQuery.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-2"
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
                        setSearchQuery(item.name);
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

        {/* State 3: Empty/Default Screen */}
        {!hasSearched && !isSearching && (!showSuggestions || searchQuery.trim().length < 2) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 mt-2"
          >
            {/* Suggested Searches */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Popular Suggestions
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {SUGGESTED_KEYWORDS.map((word) => (
                  <button
                    key={word}
                    onClick={() => {
                      setSearchQuery(word);
                      handleSearch(word);
                    }}
                    className="px-4 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-700 rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Shopping category quick link banner */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold tracking-wide">Explore All Categories</h3>
                <p className="text-xs text-blue-100">Browse and filter our entire collection of premium musical instruments.</p>
              </div>
              <Link
                href="/shopping"
                className="bg-white hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
              >
                Go to Shop
              </Link>
            </div>
          </motion.div>
        )}

        {/* State 4: Search Results Grid */}
        {hasSearched && !isSearching && (!showSuggestions || searchQuery.trim().length < 2) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Found <span className="font-bold text-gray-800">{products.length}</span> {products.length === 1 ? 'item' : 'items'} matching "{searchQuery}"
              </p>
              {products.length > 0 && (
                <button
                  onClick={clearSearch}
                  className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear Results
                </button>
              )}
            </div>

            {products.length === 0 ? (
              /* No Results State */
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Frown className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-base font-bold text-gray-800">No results found</h3>
                <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
                  We couldn't find any products matching "{searchQuery}". Try adjusting your keywords or browse popular suggestions above.
                </p>
                <button
                  onClick={() => {
                    clearSearch();
                  }}
                  className="mt-6 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              /* Standard Product Card Grid */
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} idx={idx} />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
