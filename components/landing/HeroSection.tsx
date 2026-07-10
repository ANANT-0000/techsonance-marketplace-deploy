"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowRight,
  Maximize2,
  ShieldCheck,
  Users,
  Warehouse,
} from "lucide-react";
import type { LandingHeroContent } from "@/utils/Types";

interface HeroSectionProps {
  content: LandingHeroContent;
}

const TRUST_ICON_MAP = {
  shield: ShieldCheck,
  server: Warehouse,
  users: Users,
} as const;

export default function HeroSection({ content }: HeroSectionProps) {

  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden pt-24 pb-16 sm:pt-28 lg:pt-28 lg:pb-16"
    >
      <div className="pointer-events-none absolute -right-24 top-0 h-[36rem] w-[36rem] rounded-full bg-landing-primary-soft blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-landing-accent-soft blur-3xl" />

      <div className="mx-auto grid max-w-[96rem] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:px-8 xl:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)] 2xl:max-w-[104rem]">
        <div className="max-w-[48rem]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface px-4 py-2 shadow-sm"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-landing-primary text-xs font-bold text-landing-on-primary">
              +
            </span>
            <span className="text-sm font-medium text-landing-muted">
              {content.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-semibold tracking-[-0.04em] text-landing-text sm:text-5xl lg:text-6xl"
          >
            {content.titlePart1}
            <span className="text-landing-primary">
              {content.titleHighlight}
            </span>
            {content.titlePart2 ?? ""}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 max-w-lg text-base leading-7 text-landing-muted sm:text-lg"
          >
            {content.subtitle}
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 space-y-3"
          >
            {[
              "Dedicated vendor storefronts with tenant-scoped content",
              "Catalog, inventory, and CMS control from one workspace",
              "Payment routing, shipping orchestration, and support built in",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-landing-primary/20 bg-landing-primary-soft text-landing-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm leading-6 text-landing-muted">
                  {item}
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full bg-landing-primary px-6 py-3.5 text-sm font-semibold text-landing-on-primary shadow-lg shadow-landing-primary/20 transition-all hover:bg-landing-primary-hover hover:scale-[1.01]"
            >
              {content.ctaPrimary}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a
              href="#screens"
              className="inline-flex items-center justify-center rounded-full border border-landing-border bg-landing-surface px-6 py-3.5 text-sm font-semibold text-landing-text transition-all hover:border-landing-primary hover:bg-landing-primary-soft hover:text-landing-primary"
            >
              {content.ctaSecondary}
            </a>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            {content.trustBadges.map((badge) => {
              const Icon = TRUST_ICON_MAP[badge.icon] ?? ShieldCheck;

              return (
                <div key={badge.label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-landing-primary" />
                  <span className="text-sm font-medium text-landing-muted">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="mx-auto w-full max-w-[900px] overflow-hidden rounded-[2rem] border border-landing-border bg-landing-surface shadow-2xl shadow-landing-text/10">
            <div className="flex items-center justify-between gap-4 border-b border-landing-border bg-landing-background px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-landing-warning" />
                  <span className="h-2.5 w-2.5 rounded-full bg-landing-success" />
                  <span className="h-2.5 w-2.5 rounded-full bg-landing-primary" />
                </div>
                <div className="hidden min-w-0 rounded-full border border-landing-border bg-landing-surface px-4 py-1.5 text-xs font-medium text-landing-muted sm:block">
                  Techsonance merchant dashboard
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-landing-muted">
                <span className="hidden h-2 w-2 rounded-full bg-landing-success sm:inline-block" />
                <span className="hidden sm:inline">Live workspace</span>
                <Maximize2 className="h-4 w-4 text-landing-muted" />
              </div>
            </div>

            <div className="bg-landing-surface p-1 sm:p-2 lg:p-3">
              <div className="overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[1.4rem] border border-landing-border bg-landing-background">
                {content.visual.media ? (
                  <div className="relative aspect-[16/9] lg:aspect-[1915/950] w-full max-h-[40vh] sm:max-h-[50vh] lg:max-h-[70vh]">
                    {content.visual.media.type === "image" && (
                      <Image
                        src={content.visual.media.src}
                        alt={content.visual.media.alt || "Dashboard preview"}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 68vw"
                        className="object-cover object-top"
                      />
                    )}
                    {content.visual.media.type === "video" && (
                      <video
                        src={content.visual.media.src}
                        autoPlay={content.visual.media.autoPlay ?? true}
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover object-top"
                      />
                    )}
                    {content.visual.media.type === "embed" && (
                      <iframe
                        src={content.visual.media.src}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
