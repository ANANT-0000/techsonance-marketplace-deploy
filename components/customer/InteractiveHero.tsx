'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export interface HeroSlide {
  id?: string | number;
  image_url?: string;
  title?: string;
  subtitle?: string;
  btn_text?: string;
  btn_link?: string;
}

export interface InteractiveHeroProps {
  banner_type?: 'carousel' | 'video';
  video_url?: string;
  slides?: HeroSlide[];
  fallback_image_url?: string;
}

export function InteractiveHero({
  banner_type = 'carousel',
  video_url,
  slides = [],
  fallback_image_url = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'
}: InteractiveHeroProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play timer for carousel
  useEffect(() => {
    if (banner_type !== 'carousel' || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banner_type, slides.length]);

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Video render helper
  if (banner_type === 'video' && video_url) {
    return (
      <section className="relative w-full h-[65vh] lg:h-[75vh] min-h-[450px] bg-slate-950 overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          src={video_url}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          onError={(e) => {
            console.error('Video loading failed, falling back to image');
            // Force rendering standard fallback on video failure
          }}
        />

        {/* Video Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

        {/* Floating Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={toggleVideoPlay}
            className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-all hover:scale-105 active:scale-95"
            aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
          >
            {isVideoPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
          </button>
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-all hover:scale-105 active:scale-95"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* Text Overlay Content */}
        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 w-full">
            <div className="max-w-2xl text-white">
              <span className="inline-block text-[10px] font-bold tracking-[0.25em] text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-6">
                Active Feature
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.1] mb-6">
                The Future of Aesthetic Design
              </h1>
              <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed mb-8 max-w-lg">
                Explore an immersive shopping experience defined by curation, precision, and state-of-the-art layout customization.
              </p>
              <Link href="/store">
                <button className="bg-white text-black hover:bg-slate-100 transition-all duration-300 px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-lg hover:shadow-white/10 hover:-translate-y-0.5">
                  Explore Collection
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback to carousel or simple image if slide list is empty
  const activeSlides = slides.length > 0 ? slides : [{
    image_url: fallback_image_url,
    title: 'Define Your Modern Aesthetic',
    subtitle: 'SEASON 2024 COLLECTION',
    btn_text: 'Shop Now',
    btn_link: '/store'
  }];

  return (
    <section className="relative w-full h-[65vh] lg:h-[75vh] min-h-[450px] bg-slate-900 overflow-hidden group">
      {/* Slides Carousel container */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Slide Image */}
            <div className="relative w-full h-full">
              <Image
                src={activeSlides[currentIdx].image_url || fallback_image_url}
                alt={activeSlides[currentIdx].title || 'Banner'}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
            </div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 w-full">
                <div className="max-w-2xl text-white">
                  {activeSlides[currentIdx].subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/70 mb-4"
                    >
                      {activeSlides[currentIdx].subtitle}
                    </motion.p>
                  )}
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.1] mb-6"
                  >
                    {activeSlides[currentIdx].title || 'Modern Collection'}
                  </motion.h1>

                  {activeSlides[currentIdx].btn_text && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <Link href={activeSlides[currentIdx].btn_link || '/store'}>
                        <button className="bg-white text-black hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl shadow-lg">
                          {activeSlides[currentIdx].btn_text}
                        </button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-black/25 backdrop-blur-md text-white border border-white/5 hover:bg-black/55 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-black/25 backdrop-blur-md text-white border border-white/5 hover:bg-black/55 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIdx === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
