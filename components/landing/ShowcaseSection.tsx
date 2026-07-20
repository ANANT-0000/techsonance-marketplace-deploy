"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingShowcaseContent } from "@/utils/Types";

interface ShowcaseSectionProps {
  content: LandingShowcaseContent;
}

export default function ShowcaseSection({ content }: ShowcaseSectionProps) {
  const [activeIndex, setActiveIndex] = useState(2);

  if (!content || !content.images || content.images.length === 0) {
    return null;
  }

  const handleDragEnd = (e: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % content.images.length);
  };

  const prevSlide = () => {
    setActiveIndex(
      (prev) => (prev - 1 + content.images.length) % content.images.length,
    );
  };

  const getVariants = (index: number) => {
    const total = content.images.length;
    let offset = index - activeIndex;

    // Adjust offset for wrap-around so it loops infinitely
    if (offset > Math.floor(total / 2)) {
      offset -= total;
    } else if (offset < -Math.floor(total / 2)) {
      offset += total;
    }

    if (offset === 0) {
      return { x: "0%", scale: 1, rotate: 0, zIndex: 20, opacity: 1, y: "0%" };
    } else if (offset === 1) {
      return {
        x: "85%",
        scale: 0.85,
        rotate: 4,
        zIndex: 10,
        opacity: 0.85,
        y: "3%",
      };
    } else if (offset === -1) {
      return {
        x: "-85%",
        scale: 0.85,
        rotate: -4,
        zIndex: 10,
        opacity: 0.85,
        y: "3%",
      };
    } else if (offset === 2) {
      return {
        x: "160%",
        scale: 0.75,
        rotate: 8,
        zIndex: 5,
        opacity: 0.6,
        y: "6%",
      };
    } else if (offset === -2) {
      return {
        x: "-160%",
        scale: 0.75,
        rotate: -8,
        zIndex: 5,
        opacity: 0.6,
        y: "6%",
      };
    } else if (offset > 2) {
      return {
        x: "210%",
        scale: 0.6,
        rotate: 12,
        zIndex: 0,
        opacity: 0,
        y: "10%",
      };
    } else {
      return {
        x: "-210%",
        scale: 0.6,
        rotate: -12,
        zIndex: 0,
        opacity: 0,
        y: "10%",
      };
    }
  };

  return (
    <section
      aria-label="Showcase"
      id="screens"
      className="bg-landing-surface py-24 sm:py-32 lg:py-40 overflow-hidden relative"
    >
      {/* Subtle ambient glow in the background matching primary color */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-landing-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mb-8 inline-flex items-center rounded-full border border-landing-primary/10 bg-landing-primary/5 px-5 py-2 shadow-sm"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-landing-primary">
              {content.header.label}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight text-landing-text sm:text-5xl lg:text-6xl"
          >
            {content.header.titlePart1}
            <span className="text-landing-primary">
              {content.header.titleHighlight}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-landing-muted font-medium"
          >
            {content.header.subtitle}
          </motion.p>
        </div>

        <div className="mt-20 sm:mt-24 flex flex-col items-center gap-10">
          <div className="flex items-center gap-4 relative z-40">
            <button
              type="button"
              onClick={prevSlide}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-landing-border/60 bg-landing-surface text-landing-text shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:scale-105 hover:bg-landing-background hover:text-landing-primary hover:border-landing-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              aria-label="Previous screen"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-2.5 px-2">
              {content.images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                    index === activeIndex
                      ? "w-8 bg-landing-primary shadow-[0_0_12px_rgba(var(--landing-primary-rgb),0.4)]"
                      : "w-2.5 bg-landing-primary/20 hover:bg-landing-primary/40 hover:scale-110"
                  }`}
                  aria-label={`View screen ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-landing-border/60 bg-landing-surface text-landing-text shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:scale-105 hover:bg-landing-background hover:text-landing-primary hover:border-landing-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              aria-label="Next screen"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="relative w-full flex items-center justify-center mt-6">
            <div className="w-[12rem] sm:w-[15rem] lg:w-[20rem] opacity-0 pointer-events-none invisible">
              <div className="p-3 border border-transparent">
                <div className="aspect-[620/1262] w-full"></div>
              </div>
            </div>

            {/* Transparent overlay for swipe detection across the entire carousel */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing touch-pan-y"
            />

            {content.images.map((image, index) => {
              const variants = getVariants(index);
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={image.src}
                  animate={variants}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 35,
                    mass: 0.8,
                  }}
                  className={`absolute w-[12rem] sm:w-[15rem] lg:w-[20rem] overflow-hidden rounded-[1rem] bg-landing-surface origin-center transition-colors duration-500 ease-out ${
                    isActive
                      ? "border border-landing-primary/30 shadow-[0_30px_80px_rgba(0,0,0,0.12)] ring-1 ring-landing-primary/5"
                      : "border border-landing-border/40 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <div
                    className={`overflow-hidden rounded-[1rem] bg-landing-background transition-all duration-500 ease-out ${
                      isActive ? "p-1 sm:p-1" : "p-1 sm:p-1"
                    }`}
                  >
                    <div className="relative aspect-[620/1262] w-full bg-slate-900/5 dark:bg-slate-900 rounded-[1rem] overflow-hidden shadow-inner">
                      {image.src &&
                      (image.src.endsWith(".mp4") ||
                        image.src.endsWith(".mov") ||
                        image.src.endsWith(".webm") ||
                        image.src.includes("/video/upload/")) ? (
                        <video
                          src={image.src}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="object-cover w-full h-full absolute inset-0 transition-opacity duration-500"
                        />
                      ) : (
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          priority={isActive}
                          sizes="(max-width: 1024px) 80vw, 20rem"
                          className="object-cover pointer-events-none select-none transition-transform duration-700 hover:scale-105"
                          draggable={false}
                        />
                      )}

                      {/* Subtle glare effect for active image */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
