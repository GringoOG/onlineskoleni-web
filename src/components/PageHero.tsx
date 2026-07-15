"use client";

import { useEffect, useState } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHero({ title, subtitle, children }: PageHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark via-[#2a1810] to-surface-dark py-10 text-white sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245, 166, 35, 0.35), transparent 55%)",
        }}
      />
      <div
        className={`relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8 page-hero-reveal${
          isVisible ? " is-visible" : ""
        }`}
      >
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-light/90 sm:text-base">
            {subtitle}
          </p>
        )}
        {children ? (
          <div className="mt-6 flex flex-col items-center gap-3 sm:gap-4">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
