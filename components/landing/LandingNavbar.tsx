"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { LandingNavbarContent } from "@/utils/Types";
import { VEDNOR_REGISTER_PATH } from "@/constants";

interface LandingNavbarProps {
  content: LandingNavbarContent;
}

export default function LandingNavbar({ content }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[1000] border-b transition-all duration-300 ${
        isScrolled
          ? "border-landing-border bg-landing-navbar/95 py-0 backdrop-blur-xl shadow-[0_1px_0_var(--landing-border)]"
          : "border-transparent bg-transparent py-0"
      }`}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          {content.logo.type === "image" && content.logo.imageUrl ? (
            <img
              src={content.logo.imageUrl}
              alt={content.logo.text || "Company Logo"}
              className="w-48 h-16 object-contain p-1"
            />
          ) : (
            <span className="text-xl font-semibold tracking-[-0.04em] text-landing-text">
              {content.logo.text}
              <span className="text-landing-primary">
                {content.logo.highlight}
              </span>
            </span>
          )}
        </Link>

        <ul className="hidden items-center gap-1 lg:flex" role="list">
          {content.links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-landing-muted transition-colors hover:bg-landing-primary-soft hover:text-landing-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={VEDNOR_REGISTER_PATH}
            className="rounded-full bg-landing-primary px-5 py-2.5 text-sm font-semibold text-landing-on-primary shadow-lg shadow-landing-primary/20 transition-transform hover:bg-landing-primary-hover hover:scale-[1.02]"
          >
            {content.ctas.signup}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-landing-border bg-landing-surface text-landing-text transition-colors hover:bg-landing-primary-soft lg:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        id="landing-mobile-menu"
        inert={!isMobileMenuOpen}
        className={`fixed inset-0 z-[999] bg-landing-background/98 px-4 py-6 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mx-auto flex h-full max-w-7xl flex-col">
          <div className="flex items-center justify-between pb-6">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              {content.logo.type === "image" && content.logo.imageUrl ? (
                <img
                  src={content.logo.imageUrl}
                  alt={content.logo.text || "Company Logo"}
                  className="h-11 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-semibold tracking-[-0.04em] text-landing-text">
                  {content.logo.text}
                  <span className="text-landing-primary">
                    {content.logo.highlight}
                  </span>
                </span>
              )}
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-landing-border bg-landing-surface text-landing-text"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between rounded-3xl border border-landing-border bg-landing-surface p-4 shadow-xl">
            <ul className="flex flex-col gap-2" role="list">
              {content.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-landing-border px-4 py-4 text-base font-medium text-landing-text transition-colors hover:border-landing-primary hover:bg-landing-primary-soft hover:text-landing-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3 border-t border-landing-border pt-4">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full border border-landing-border px-5 py-3 text-center text-sm font-semibold text-landing-text transition-colors hover:bg-landing-primary-soft hover:text-landing-primary"
              >
                {content.ctas.login}
              </Link>
              <Link
                href={VEDNOR_REGISTER_PATH}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full bg-landing-primary px-5 py-3 text-center text-sm font-semibold text-landing-on-primary transition-colors hover:bg-landing-primary-hover"
              >
                {content.ctas.signup}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
