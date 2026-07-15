"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HomeHeroProps {
  brandLabel: string;
  title: string;
  subtitle: string;
  ctaSecondary: string;
}

/** Hlavní hero homepage s pozvolným zobrazením. */
export function HomeHero({
  brandLabel,
  title,
  subtitle,
  ctaSecondary,
}: HomeHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface-dark via-[#2a1810] to-surface-dark text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 85% 20%, rgba(245, 166, 35, 0.25), transparent 50%)",
        }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div
          className={`flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between page-hero-reveal${
            isVisible ? " is-visible" : ""
          }`}
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
              {brandLabel}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 text-lg text-white/80 md:text-xl">{subtitle}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/objednavka" className="btn-primary-lg text-center">
                Objednat online
              </Link>
              <Link
                href="/lms/bozp/test"
                className="rounded-lg border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {ctaSecondary}
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Image
              src="/images/logo.svg"
              alt=""
              width={200}
              height={220}
              priority
              className="h-auto w-36 drop-shadow-[0_0_40px_rgba(245,166,35,0.35)] sm:w-44 md:w-[200px]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
