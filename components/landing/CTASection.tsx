"use client";

import { motion } from "motion/react";
import type { LandingCtaContent } from "@/utils/Types";

interface CTASectionProps {
  content: LandingCtaContent;
}

export default function CTASection({ content }: CTASectionProps) {
  return (
    <section
      aria-label="Call to action"
      className="bg-landing-background py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative overflow-hidden rounded-[2.5rem] border border-landing-border bg-landing-footer px-6 py-14 shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:px-10 sm:py-16 lg:flex lg:items-center lg:justify-between lg:px-16 lg:py-20"
        >
          <div className="pointer-events-none absolute -right-12 top-0 h-72 w-72 rounded-full bg-landing-primary-soft blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-landing-primary/20 bg-landing-primary-soft px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-primary">
              {content.label}
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-landing-on-dark sm:text-5xl">
              {content.titlePart1}
              <span className="text-landing-primary">{content.titleHighlight}</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-landing-on-dark/70">
              {content.subtitle}
            </p>
          </div>

          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full bg-landing-primary px-6 py-3.5 text-sm font-semibold text-landing-on-primary shadow-lg shadow-landing-primary/20 transition-colors hover:bg-landing-primary-hover"
            >
              {content.ctaPrimary}
            </a>
            <a
              href="#faq"
              className="inline-flex items-center justify-center rounded-full border border-landing-on-dark/10 px-6 py-3.5 text-sm font-semibold text-landing-on-dark/70 transition-colors hover:border-landing-on-dark/30 hover:text-landing-on-dark"
            >
              {content.ctaSecondary}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
