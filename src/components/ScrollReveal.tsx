"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Varianta CSS třídy – section (default) nebo page-hero. */
  variant?: "section" | "hero";
}

/** Obecný wrapper pro pozvolné zobrazení bloku při scrollu / načtení. */
export function ScrollReveal({
  children,
  className = "",
  variant = "section",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    if (variant === "hero") {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [variant]);

  const revealClass =
    variant === "hero" ? "page-hero-reveal" : "section-reveal";

  return (
    <div
      ref={ref}
      className={`${revealClass}${isVisible ? " is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
