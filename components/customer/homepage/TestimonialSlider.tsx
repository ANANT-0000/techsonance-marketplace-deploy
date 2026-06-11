'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Truck, ShieldCheck, Award, MessageCircleHeart, Headphones } from 'lucide-react';

export interface Testimonial {
  id?: string | number;
  name: string;
  location?: string;
  rating: number;
  comment: string;
  avatar_url?: string;
}

export enum BadgeIconType {
  SHIPPING = "shipping",
  SECURITY = "security",
  QUALITY = "quality",
  SUPPORT = "support",
  DEFAULT = "default",
}

export interface TrustBadge {
  id?: string | number;
  icon: BadgeIconType | string;
  title: string;
  subtitle: string;
}

export interface TestimonialSliderProps {
  title?: string;
  eyebrow?: string;
  testimonials?: Testimonial[];
  badges?: TrustBadge[];
}

// Map strings to Lucide icons
const iconMap: Record<string, any> = {
  [BadgeIconType.SHIPPING]: Truck,
  [BadgeIconType.SECURITY]: ShieldCheck,
  [BadgeIconType.QUALITY]: Award,
  [BadgeIconType.SUPPORT]: Headphones,
  [BadgeIconType.DEFAULT]: MessageCircleHeart
};

import { TESTIMONIALS_SLIDER_DEFAULT, TRUST_BADGES_SLIDER_DEFAULT } from "@/constants/storefront";
import { TESTIMONIALS_TEXT } from "@/constants/customerText";

export function TestimonialSlider({
  title,
  eyebrow,
  testimonials,
  badges
}: TestimonialSliderProps) {
  const displayTitle = title ?? TESTIMONIALS_TEXT.WHAT_CLIENTS_SAY;
  const displayEyebrow = eyebrow ?? TESTIMONIALS_TEXT.TESTIMONIALS_EYEBROW;
  const currentTestimonials = testimonials !== undefined && testimonials !== null && testimonials.length > 0
    ? testimonials
    : TESTIMONIALS_SLIDER_DEFAULT;
  const currentBadges = badges !== undefined && badges !== null && badges.length > 0
    ? badges
    : TRUST_BADGES_SLIDER_DEFAULT;

  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-advance testimonials
  useEffect(() => {
    if (currentTestimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % currentTestimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentTestimonials.length]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + currentTestimonials.length) % currentTestimonials.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % currentTestimonials.length);
  };

  const activeTestimonial = currentTestimonials[activeIdx];

  return (
    <section className="py-20 px-6 lg:px-16 xl:px-24 bg-white border-y border-slate-50">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-16">
        
        {/* Testimonials Slider */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-bold tracking-[0.25em] text-purple-600 uppercase mb-2">
            {displayEyebrow}
          </span>
          <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-10">
            {displayTitle}
          </h2>

          <div className="relative w-full max-w-2xl min-h-[180px] flex items-center justify-center px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-6">
                  {Array.from({ length: activeTestimonial.rating }).map((_, idx) => (
                    <Star key={idx} size={15} fill="#F59E0B" className="text-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-base sm:text-lg md:text-xl font-light italic text-slate-700 leading-relaxed mb-6">
                  "{activeTestimonial.comment}"
                </blockquote>

                {/* Avatar and Name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ background: `linear-gradient(135deg, hsl(${activeIdx * 120 + 220}, 60%, 60%) 0%, hsl(${activeIdx * 120 + 260}, 65%, 55%) 100%)` }}
                  >
                    {activeTestimonial.avatar_url ? (
                      <img
                        src={activeTestimonial.avatar_url}
                        alt={activeTestimonial.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      activeTestimonial.name.charAt(0)
                    )}
                  </div>
                  <div className="text-left">
                    <cite className="not-italic text-sm font-bold text-slate-800 block">
                      {activeTestimonial.name}
                    </cite>
                    {activeTestimonial.location && (
                      <span className="text-[11px] text-slate-400">
                        {activeTestimonial.location}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation */}
            {currentTestimonials.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-t border-slate-100 pt-10">
          {currentBadges.map((badge) => {
            const IconComponent = iconMap[badge.icon] || iconMap.default;

            return (
              <div key={badge.id} className="flex items-center md:justify-center gap-3.5 pt-6 md:pt-0 md:px-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/5 text-purple-600 flex items-center justify-center shrink-0">
                  <IconComponent size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
