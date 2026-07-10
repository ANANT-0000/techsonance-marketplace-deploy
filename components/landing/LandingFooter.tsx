"use client";

import Link from "next/link";
import type { LandingFooterContent } from "@/utils/Types";

interface LandingFooterProps {
  content: LandingFooterContent;
  logo?: {
    type?: "text" | "image";
    text?: string;
    highlight?: string;
    imageUrl?: string;
  };
}

export default function LandingFooter({ content, logo }: LandingFooterProps) {
  return (
    <footer
      aria-label="Footer"
      className="border-t border-landing-on-dark/5 bg-landing-footer py-20 text-landing-on-dark"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-md">
            <Link
              href="/"
              className="flex items-center justify-start gap-2 bg-white p-1 rounded-2xl"
            >
              {logo?.type === "image" && logo?.imageUrl ? (
                <img
                  src={logo.imageUrl}
                  alt={logo.text || "Company Logo"}
                  className="w-full h-20 object-contain"
                />
              ) : (
                <span className="text-2xl font-semibold tracking-[-0.05em] text-landing-on-dark">
                  {logo?.text || "Techso"}
                  <span className="text-landing-primary">
                    {logo?.highlight || "nance"}
                  </span>
                </span>
              )}
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-landing-on-dark/55">
              {content.brandDesc}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {content.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-landing-on-dark/10 text-xs font-semibold text-landing-on-dark/55 transition-colors hover:border-landing-primary/40 hover:text-landing-primary"
                >
                  {social.label
                    .split(" ")
                    .map((part) => part.slice(0, 1))
                    .join("")
                    .slice(0, 2)}
                </a>
              ))}
            </div>
          </div>

          {content.columns.map((column) => (
            <div key={column.label}>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-landing-on-dark/30">
                {column.label}
              </div>
              <ul className="mt-5 space-y-3" role="list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      className="text-sm text-landing-on-dark/55 transition-colors hover:text-landing-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-landing-on-dark/5 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-landing-on-dark/35">{content.copyright}</p>
          <div className="flex flex-wrap gap-5">
            {content.legal.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className="text-sm text-landing-on-dark/35 transition-colors hover:text-landing-on-dark/70"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
