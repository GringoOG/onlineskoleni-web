"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  alt?: boolean;
  /** Zarovnání nadpisu (a podnadpisu). Výchozí: střed. Obsah sekce zůstává plná šířka. */
  align?: "left" | "center";
  /** Postupné zobrazení při scrollu (vypnout u formulářů / adminu). */
  reveal?: boolean;
}

export function Section({
  id,
  title,
  subtitle,
  children,
  className = "",
  alt = false,
  align = "center",
  reveal = true,
}: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(!reveal);

  useEffect(() => {
    if (!reveal) {
      return;
    }

    const element = sectionRef.current;
    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const rect = element.getBoundingClientRect();
    const alreadyVisible =
      rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

    if (alreadyVisible) {
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reveal]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`py-10 md:py-12 ${alt ? "bg-card" : ""} ${className}`}
    >
      <div
        className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${
          reveal ? `section-reveal${isVisible ? " is-visible" : ""}` : ""
        }`}
      >
        {(title || subtitle) && (
          <div
            className={`mb-8 max-w-2xl ${
              align === "center" ? "mx-auto text-center" : ""
            }`}
          >
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
