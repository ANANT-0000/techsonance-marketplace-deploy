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

export interface TrustBadge {
  id?: string | number;
  icon: string; // 'shipping' | 'security' | 'quality' | 'support'
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
  shipping: Truck,
  security: ShieldCheck,
  quality: Award,
  support: Headphones,
  default: MessageCircleHeart
};

export function TestimonialSlider({
  title = 'What Our Clients Say',
  eyebrow = 'TESTIMONIALS',
  testimonials = [],
  badges = []
}: TestimonialSliderProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const currentTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: 1,
      name: 'Aishwarya R.',
      location: 'Delhi',
      rating: 5,
      comment: 'The quality of the linen blazer is absolutely premium. Fits perfectly, packaged with utmost care, and arrived ahead of schedule!',
      avatar_url: ''
    },
    {
      id: 2,
      name: 'Rohan M.',
      location: 'Mumbai',
      rating: 5,
      comment: 'Excellent customer service. I had to resize my trousers and the process was handled within 2 days. Highly recommended!',
      avatar_url: ''
    },
    {
      id: 3,
      name: 'Karan J.',
      location: 'Bangalore',
      rating: 5,
      comment: 'Top-tier fabric and stitch details. It is difficult to find such custom quality at this price point. A true marketplace gem!',
      avatar_url: ''
    }
  ];

  const currentBadges = badges.length > 0 ? badges : [
    { id: 1, icon: 'shipping', title: 'Free Shipping', subtitle: 'On all orders above ₹999' },
    { id: 2, icon: 'quality', title: 'Quality Guarantee', subtitle: 'Handcrafted premium fabrics' },
    { id: 3, icon: 'security', title: 'Secure Checkout', subtitle: 'Fully encrypted billing logs' },
    { id: 4, icon: 'support', title: '24/7 Support', subtitle: 'Dedicated stylist support helpline' }
  ];

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
            {eyebrow}
          </span>
          <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-10">
            {title}
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
