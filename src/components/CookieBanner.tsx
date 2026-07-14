"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "onlineskoleni-cookie-consent";

let listeners: Array<() => void> = [];

function subscribe(onStoreChange: () => void) {
  listeners.push(onStoreChange);
  return () => {
    listeners = listeners.filter((l) => l !== onStoreChange);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "accepted";
}

function getServerSnapshot() {
  return true;
}

export function CookieBanner() {
  const hasConsent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    notify();
  }

  if (hasConsent) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-brand-dark/30 bg-white px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.18)] sm:px-6 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Souhlas s cookies"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-base font-bold text-slate-900 sm:text-lg">
            Používáme cookies a měření návštěvnosti
          </p>
          <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
            Web používá nezbytné cookies a nástroje pro měření návštěvnosti (Google Analytics,
            Google Ads), abychom mohli vyhodnocovat provoz a reklamy. Podrobnosti najdete v{" "}
            <Link
              href="/ochrana-udaju"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-dark underline"
            >
              zásadách ochrany údajů
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          className="btn-primary-lg w-full shrink-0 px-8 py-3.5 text-base sm:w-auto sm:min-w-[12rem]"
        >
          Rozumím
        </button>
      </div>
    </div>
  );
}
