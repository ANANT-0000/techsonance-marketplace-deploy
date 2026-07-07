"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import type { LandingFaqContent } from "@/utils/Types";

interface FaqSectionProps {
  content: LandingFaqContent;
}

export default function FaqSection({ content }: FaqSectionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const allOpen = openItems.length === content.questions.length;

  const toggleAll = () => {
    setOpenItems(allOpen ? [] : content.questions.map((question) => question.id));
  };

  return (
    <section
      aria-label="Frequently asked questions"
      id="faq"
      className="bg-landing-background py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center rounded-full border border-landing-border bg-landing-surface px-4 py-2"
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
            className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-landing-text sm:text-5xl"
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
            className="mt-5 max-w-lg text-lg leading-8 text-landing-muted"
          >
            {content.header.subtitle}
          </motion.p>

          <button
            type="button"
            onClick={toggleAll}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-landing-primary transition-opacity hover:opacity-80"
          >
            <span className="text-lg leading-none">{allOpen ? "−" : "+"}</span>
            {allOpen ? content.controls.collapse : content.controls.expand}
          </button>
        </div>

        <div className="rounded-[2rem] border border-landing-border bg-landing-surface shadow-sm">
          {content.questions.map((question, index) => {
            const isOpen = openItems.includes(question.id);
            return (
              <div
                key={question.id}
                className={`border-landing-border ${
                  index === 0 ? "border-t-0" : "border-t"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(question.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-landing-text transition-colors hover:text-landing-primary sm:px-6"
                  aria-expanded={isOpen}
                  aria-controls={`${question.id}-panel`}
                >
                  <span className="text-base font-semibold sm:text-lg">
                    {question.q}
                  </span>
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isOpen
                        ? "border-landing-primary bg-landing-primary text-landing-on-primary rotate-45"
                        : "border-landing-primary/20 bg-landing-primary-soft text-landing-primary"
                    }`}
                  >
                    <Plus size={14} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key={`${question.id}-panel`}
                      id={`${question.id}-panel`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-7 text-landing-muted sm:px-6">
                        {question.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
