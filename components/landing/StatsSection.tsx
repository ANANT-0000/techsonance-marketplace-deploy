"use client";

import { motion } from "motion/react";
import type { LandingStatsContent } from "@/utils/Types";

interface StatsSectionProps {
  content: LandingStatsContent;
}

export default function StatsSection({ content }: StatsSectionProps) {
  return (
    <section
      aria-label="Platform stats"
      className="border-y border-landing-border bg-landing-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {content.items.map((item, index) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[1.75rem] border border-landing-border bg-landing-surface p-6 shadow-sm"
            >
              <div className="h-1 w-12 rounded-full bg-landing-primary" />
              <div className="mt-5 flex items-baseline gap-1 text-4xl font-semibold tracking-[-0.05em] text-landing-text">
                <span>{item.value}</span>
                <span className="text-lg text-landing-primary">
                  {item.suffix}
                </span>
              </div>
              <div className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-landing-text">
                {item.label}
              </div>
              <div className="mt-2 text-sm leading-6 text-landing-muted">
                {item.sublabel}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
