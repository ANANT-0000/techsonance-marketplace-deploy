"use client";

import { motion } from "motion/react";
import type { LandingTickerContent } from "@/utils/Types";

interface TickerSectionProps {
  content: LandingTickerContent;
}

export default function TickerSection({ content }: TickerSectionProps) {
  const tickerItems = [...content.brands, ...content.brands];

  return (
    <section
      aria-label="Trusted brands"
      className="overflow-hidden border-y border-landing-border bg-landing-surface py-12"
    >
      <p className="px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-landing-muted sm:px-6">
        {content.label}
      </p>

      <div className="relative mt-7 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-landing-surface to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-landing-surface to-transparent" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity }}
          className="flex w-max items-center gap-12 whitespace-nowrap"
        >
          {tickerItems.map((brand, index) => {
            let text = brand;
            while (typeof text === 'object' && text !== null && 'text' in text) {
              text = (text as any).text;
            }
            const key = typeof brand === 'object' && brand !== null && 'id' in brand ? (brand as any).id : brand;
            return (
            <div
              key={`${key}-${index}`}
              className="flex items-center gap-3 text-lg font-semibold tracking-[-0.03em] text-landing-muted transition-colors hover:text-landing-primary"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-landing-border bg-landing-primary-soft text-landing-primary">
                <span className="h-2 w-2 rounded-full bg-landing-primary" />
              </span>
              {text}
            </div>
          )})}
        </motion.div>
      </div>
    </section>
  );
}
