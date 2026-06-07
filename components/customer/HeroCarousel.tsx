'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
  id: string | number;
  image_url: string;
  title?: string;
  subtitle?: string;
  btn_text?: string;
  /** Search query that gets passed to /store?search= */
  search_query?: string;
  /** Optional full override URL (used if no search_query) */
  link_url?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
  isLoading?: boolean;
}

const FALLBACK_SLIDE: HeroSlide = {
  id: 'fallback',
  image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop',
  title: 'Define Your Modern Aesthetic',
  subtitle: 'SEASON 2024 COLLECTION',
  btn_text: 'Explore',
  search_query: '',
};

export function HeroCarousel({ slides, autoPlayMs = 5000, isLoading }: HeroCarouselProps) {
  const displaySlides = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number, dir: 'left' | 'right' = 'right') => {
    setDirection(dir);
    setActive(index);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % displaySlides.length, 'right');
  }, [active, displaySlides.length, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + displaySlides.length) % displaySlides.length, 'left');
  }, [active, displaySlides.length, goTo]);

  // Auto-play
  useEffect(() => {
    if (paused || displaySlides.length <= 1) return;
    timerRef.current = setTimeout(next, autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, paused, autoPlayMs, next, displaySlides.length]);

  const slide = displaySlides[active];

  // Build the CTA href
  const ctaHref = slide.search_query
    ? `/store?search=${encodeURIComponent(slide.search_query)}`
    : slide.link_url || '/store';

  return (
    <section
      className="relative w-full lg:h-[85vh] h-[60vh] overflow-hidden bg-[#0b0c10] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {displaySlides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={i !== active}
        >
          <Image
            src={s.image_url || FALLBACK_SLIDE.image_url}
            alt={s.title || 'Hero image'}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Text content — always on top */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-14 md:px-16 xl:px-24 lg:max-w-3xl w-full">
        {slide.subtitle && (
          <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/75 font-bold mb-3 md:mb-4 block">
            {slide.subtitle}
          </span>
        )}
        {slide.title && (
          <h1 className="text-3xl md:text-5xl xl:text-6xl font-serif text-white leading-[1.1] tracking-tight mb-4 md:mb-6 drop-shadow-lg">
            {slide.title}
          </h1>
        )}
        <Link href={ctaHref}>
          <button className="bg-white text-black hover:bg-gray-100 transition-all duration-300 lg:px-8 px-4 lg:py-3 py-2 text-xs uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98]">
            {slide.btn_text || 'Shop Now'}
          </button>
        </Link>
      </div>

      {/* Prev / Next arrows */}
      {displaySlides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full lg:p-2.5 p-1 transition-all duration-200 text-white hover:scale-110"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full lg:p-2.5 p-1 transition-all duration-200 text-white hover:scale-110"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 items-center">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > active ? 'right' : 'left')}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${i === active
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {displaySlides.length > 1 && !paused && (
        <div className="absolute bottom-0 left-0 z-30 h-[2px] bg-white/30 w-full">
          <div
            key={active}
            className="h-full bg-white"
            style={{
              animation: `heroProgress ${autoPlayMs}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
