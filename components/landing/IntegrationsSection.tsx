"use client";

import { motion } from "motion/react";
import type { LandingIntegrationsContent } from "@/utils/Types";

interface IntegrationsSectionProps {
  content: LandingIntegrationsContent;
}

export default function IntegrationsSection({
  content,
}: IntegrationsSectionProps) {
  return (
    <section
      aria-label="Integrations"
      id="integrations"
      className="border-y border-landing-border bg-landing-surface py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {content.tools.map((tool, index) => {
            let text = tool;
            while (typeof text === 'object' && text !== null && 'text' in text) {
              text = (text as any).text;
            }
            const key = typeof tool === 'object' && tool !== null && 'id' in tool ? (tool as any).id : tool;
            return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.03 }}
              className="rounded-full border border-landing-border bg-landing-background px-5 py-2.5 text-sm font-semibold text-landing-muted shadow-sm transition-all hover:-translate-y-0.5 hover:border-landing-primary/30 hover:bg-landing-primary-soft hover:text-landing-primary"
            >
              {text}
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
