'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import AxiosAPI from '@/lib/axios';

export interface CuratedDiscoveryProps {
  title?: string;
  subtitle?: string;
  type?: 'trending' | 'new_arrivals' | 'curated';
  product_ids?: string[];
  products?: any[];
}

function SkeletonCard() {
  return (
    <div className="min-w-[240px] sm:min-w-[280px] flex flex-col bg-white border border-gray-100 rounded-2xl p-4 gap-3 animate-pulse shadow-sm">
      <div className="aspect-square bg-gray-100 rounded-xl" />
      <div className="w-1/3 h-3 bg-gray-100 rounded" />
      <div className="w-3/4 h-4 bg-gray-100 rounded" />
      <div className="w-1/4 h-5 bg-gray-100 rounded mt-auto" />
    </div>
  );
}

export function CuratedDiscovery({
  title = 'Trending Masterpieces',
  subtitle = 'Discover our hand-picked selection of high-demand aesthetic creations.',
  type = 'trending',
  product_ids = [],
  products: initialProducts
}: CuratedDiscoveryProps) {
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    let endpoint = '/v1/products/homepage?limit=8';
    if (type === 'new_arrivals') {
      endpoint = '/v1/products/homepage?limit=8'; // Can customize query if specific endpoints exist
    }

    setLoading(true);
    AxiosAPI.get(endpoint)
      .then((res) => {
        // Mock or filter based on variant presence for catalog consistency
        const rawList = res.data?.data ?? res.data ?? [];
        // If curated ids exist, filter by them
        if (product_ids.length > 0) {
          const filtered = rawList.filter((p: any) => product_ids.includes(p.id));
          setProducts(filtered.length > 0 ? filtered : rawList);
        } else {
          setProducts(rawList);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch curated discovery items:', err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [type, product_ids, initialProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const offset = clientWidth * 0.75;
    const target = direction === 'left' ? scrollLeft - offset : scrollLeft + offset;
    scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-6 lg:px-16 xl:px-24 bg-slate-50/50">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.25em] text-purple-600 uppercase mb-2">
              <Sparkles size={12} /> Live Curation
            </span>
            <h2 className="text-3xl font-serif tracking-tight text-gray-900 leading-tight">
              {title}
            </h2>
            <p className="text-xs text-gray-400 mt-2 max-w-lg">
              {subtitle}
            </p>
          </div>

          {/* Navigation Controls */}
          {products.length > 0 && (
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-100 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-100 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Products List Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pr-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : products.length === 0 ? (
            <div className="w-full text-center py-12 text-slate-450 bg-white border border-dashed border-slate-200 rounded-3xl">
              <p className="text-sm">No items configured for this curated list.</p>
              <Link href="/store" className="text-xs text-purple-600 font-bold hover:underline mt-2 inline-block">
                View All Catalog Products
              </Link>
            </div>
          ) : (
            products.map((p, idx) => (
              <div
                key={p.id}
                className="min-w-[240px] sm:min-w-[280px] max-w-[280px] snap-start h-full"
              >
                <ul className="list-none p-0 m-0 h-full">
                  <ProductCard product={p} idx={idx} />
                </ul>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
