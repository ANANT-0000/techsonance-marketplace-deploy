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
      (prev) => (prev - 1 + content.images.length) % content.images.length
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
      return { x: "80%", scale: 0.85, rotate: 5, zIndex: 10, opacity: 0.9, y: "4%" };
    } else if (offset === -1) {
      return { x: "-80%", scale: 0.85, rotate: -5, zIndex: 10, opacity: 0.9, y: "4%" };
    } else if (offset === 2) {
      return { x: "150%", scale: 0.7, rotate: 10, zIndex: 5, opacity: 0.7, y: "8%" };
    } else if (offset === -2) {
      return { x: "-150%", scale: 0.7, rotate: -10, zIndex: 5, opacity: 0.7, y: "8%" };
    } else if (offset > 2) {
      return { x: "200%", scale: 0.5, rotate: 15, zIndex: 0, opacity: 0, y: "12%" };
    } else {
      return { x: "-200%", scale: 0.5, rotate: -15, zIndex: 0, opacity: 0, y: "12%" };
    }
  };

  return (
    <section
      aria-label="Showcase"
      id="screens"
      className="bg-landing-surface py-24 sm:py-28 lg:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mb-6 inline-flex items-center rounded-full border border-landing-border bg-landing-background px-4 py-2"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-landing-primary">
              {content.header.label}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-[-0.05em] text-landing-text sm:text-5xl"
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
            className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-landing-muted"
          >
            {content.header.subtitle}
          </motion.p>
        </div>

        <div className="mt-16 flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 relative z-40">
            <button
              type="button"
              onClick={prevSlide}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-landing-border bg-landing-surface text-landing-text shadow-sm transition-all hover:-translate-x-0.5 hover:bg-landing-primary-soft hover:text-landing-primary"
              aria-label="Previous screen"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              {content.images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-8 bg-landing-primary"
                      : "w-2.5 bg-landing-primary/20 hover:bg-landing-primary/40"
                  }`}
                  aria-label={`View screen ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-landing-border bg-landing-surface text-landing-text shadow-sm transition-all hover:translate-x-0.5 hover:bg-landing-primary-soft hover:text-landing-primary"
              aria-label="Next screen"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="relative w-full flex items-center justify-center mt-4">
            <div className="w-[11rem] sm:w-[14rem] lg:w-[18rem] opacity-0 pointer-events-none invisible">
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
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`absolute w-[11rem] sm:w-[14rem] lg:w-[18rem] overflow-hidden rounded-[2rem] border bg-landing-surface shadow-[0_24px_70px_rgba(15,23,42,0.12)] origin-center transition-colors duration-300 ${
                    isActive
                      ? "border-landing-primary/50 ring-1 ring-landing-primary/20"
                      : "border-landing-border/80"
                  }`}
                >
                  <div
                    className={`overflow-hidden rounded-[1.75rem] border border-landing-border bg-landing-background transition-all duration-300 ${
                      isActive ? "p-3" : "p-2 sm:p-2.5"
                    }`}
                  >
                    <div className="relative aspect-[620/1262] w-full bg-slate-900 rounded-[1.5rem] overflow-hidden">
                      {image.src && (
                        image.src.endsWith(".mp4") ||
                        image.src.endsWith(".mov") ||
                        image.src.endsWith(".webm") ||
                        image.src.includes("/video/upload/")
                      ) ? (
                        <video
                          src={image.src}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="object-cover w-full h-full absolute inset-0"
                        />
                      ) : (
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          priority={isActive}
                          sizes="(max-width: 1024px) 80vw, 18rem"
                          className="object-cover pointer-events-none select-none"
                          draggable={false}
                        />
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
