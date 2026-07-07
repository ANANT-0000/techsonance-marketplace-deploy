"use client";

import { motion } from "motion/react";
import type { LandingTestimonialsContent } from "@/utils/Types";

interface TestimonialsSectionProps {
  content: LandingTestimonialsContent;
}

export default function TestimonialsSection({
  content,
}: TestimonialsSectionProps) {
  return (
    <section
      aria-label="Testimonials"
      id="testimonials"
      className="bg-landing-background py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mb-6 inline-flex items-center rounded-full border border-landing-border bg-landing-surface px-4 py-2"
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
            {content.header.titlePart2}
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

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.reviews.map((review, index) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-[1.75rem] border border-landing-border bg-landing-surface p-8 shadow-sm transition-transform hover:-translate-y-1 ${
                review.isTall ? "lg:row-span-2" : ""
              }`}
            >
              <div className="mb-5 flex gap-1 text-landing-primary">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <span key={`${review.id}-star-${starIndex}`}>★</span>
                ))}
              </div>
              <p
                className={`italic leading-8 text-landing-muted ${
                  review.isTall ? "text-lg" : "text-base"
                }`}
              >
                "{review.quote}"
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-landing-primary/20 bg-landing-primary-soft text-sm font-bold text-landing-primary">
                  {review.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-landing-text">
                    {review.author}
                  </div>
                  <div className="text-xs text-landing-muted">{review.role}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
