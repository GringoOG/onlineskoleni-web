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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg"
      role="dialog"
      aria-label="Souhlas s cookies"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Web používá nezbytné cookies a nástroje pro měření návštěvnosti (Google Analytics,
          Google Ads). Více v{" "}
          <Link href="/ochrana-udaju" className="link-brand underline">
            zásadách ochrany údajů
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="btn-primary shrink-0"
        >
          Rozumím
        </button>
      </div>
    </div>
  );
}
