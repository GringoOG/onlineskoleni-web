"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToHash(hash: string): void {
  const id = hash.replace(/^#/, "");
  if (!id) {
    return;
  }

  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/** Plynulé scrollování při přechodu mezi stránkami a na kotvy (#). */
export function SmoothScrollHandler() {
  const pathname = usePathname();
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const timer = window.setTimeout(() => scrollToHash(hash), 80);
      return () => window.clearTimeout(timer);
    }

    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }

    scrollToTop();
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash) {
        scrollToHash(window.location.hash);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") {
        return;
      }

      const id = hash.slice(1);
      const element = document.getElementById(id);
      if (!element) {
        return;
      }

      event.preventDefault();
      history.pushState(null, "", hash);
      scrollToHash(hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
