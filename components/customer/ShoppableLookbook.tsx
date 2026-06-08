'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ShoppingCart } from 'lucide-react';
import { AddToCart } from '@/components/customer/AddToCart';

export interface LookbookHotspot {
  id: string | number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  product_id?: string;
  variant_id?: string; // Must match productVariantId for AddToCart
  name?: string;
  price?: string | number;
  image_url?: string;
  description?: string;
}

export interface ShoppableLookbookProps {
  title?: string;
  subtitle?: string;
  image_url?: string;
  hotspots?: LookbookHotspot[];
  fallback_image_url?: string;
}

export function ShoppableLookbook({
  title = 'Shop The Look',
  subtitle = 'Click on the hot-spots to view details and add items to your cart.',
  image_url = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop',
  hotspots = [],
  fallback_image_url = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop'
}: ShoppableLookbookProps) {
  const [activeHotspot, setActiveHotspot] = useState<LookbookHotspot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveHotspot(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentHotspots = hotspots.length > 0 ? hotspots : [
    {
      id: 1,
      x: 35,
      y: 40,
      name: 'Tailored Linen Blazer',
      price: 3499,
      variant_id: 'sample-variant-id-1',
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=300&auto=format&fit=crop',
      description: 'Luxe blend of breathable linen. Premium fit and structure.'
    },
    {
      id: 2,
      x: 60,
      y: 65,
      name: 'Relaxed Silk Trousers',
      price: 2899,
      variant_id: 'sample-variant-id-2',
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=300&auto=format&fit=crop',
      description: 'Flowing wide-leg trousers crafted from organic Mulberry silk.'
    }
  ];

  return (
    <section className="py-16 px-6 lg:px-16 xl:px-24 bg-white" ref={containerRef}>
      <div className="max-w-screen-xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold tracking-[0.25em] text-purple-600 uppercase">
            Curated Inspiration
          </span>
          <h2 className="text-3xl font-serif tracking-tight text-gray-900 mt-2 mb-3">
            {title}
          </h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Interactive Image Container */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50">
          <Image
            src={image_url || fallback_image_url}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
          />

          {/* Render Hotspots */}
          {currentHotspots.map((spot) => {
            const isActive = activeHotspot?.id === spot.id;

            return (
              <div
                key={spot.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                {/* Pulse Glow Effect */}
                <span className="absolute -inset-2.5 rounded-full bg-white/30 animate-ping" />

                {/* Hotspot Toggle Button */}
                <button
                  onClick={() => setActiveHotspot(isActive ? null : spot)}
                  className={`relative w-8 h-8 rounded-full border border-white/20 shadow-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-600 text-white scale-110 rotate-45'
                      : 'bg-black/60 text-white hover:bg-black/85'
                  }`}
                  aria-label={`View product details for ${spot.name}`}
                >
                  <Plus size={16} className="transition-transform duration-300" />
                </button>

                {/* Popover Card */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute bottom-11 -left-[110px] sm:-left-32 w-56 sm:w-64 bg-white/90 backdrop-blur-xl border border-white/25 rounded-2xl shadow-2xl p-3.5 z-20 flex flex-col gap-3.5`}
                      style={{ originY: 1 }}
                    >
                      {/* Popover Arrow pointing down */}
                      <div className="absolute -bottom-1.5 left-[118px] sm:left-34 w-3.5 h-3.5 bg-white border-r border-b border-white/25 rotate-45" />

                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        {spot.image_url && (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                            <Image
                              src={spot.image_url}
                              alt={spot.name || 'Product'}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate mb-0.5">
                            {spot.name || 'Premium Item'}
                          </h4>
                          {spot.price && (
                            <p className="text-[13px] font-black text-purple-700">
                              ₹{Number(spot.price).toLocaleString('en-IN')}
                            </p>
                          )}
                          {spot.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                              {spot.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Add To Cart block */}
                      {spot.variant_id ? (
                        <div className="w-full">
                          <AddToCart
                            productVariantId={spot.variant_id}
                            styles="w-full h-9 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                          />
                        </div>
                      ) : (
                        <button className="w-full h-9 bg-slate-900 text-white hover:bg-black text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                          <ShoppingCart size={13} />
                          <span>Out of Stock</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
