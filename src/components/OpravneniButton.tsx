"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const OPRAVNENI_IMAGE = {
  src: "/images/opravneni/pozarni-ochrana-z-tpo-85-2012.png",
  alt: "Osvědčení o odborné způsobilosti technika požární ochrany č. Z-TPO-85/2012",
  title: "Oprávnění k výkonu činnosti v požární ochraně",
  caption: "Osvědčení o odborné způsobilosti technika požární ochrany · Z-TPO-85/2012",
};

export function OpravneniButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="max-w-3xl rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-tint via-white to-brand-tint/60 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
          Doložení odbornosti
        </p>
        <h3 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
          Oprávnění k výkonu školení
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Naše online školení zajišťuje odborně způsobilá osoba. Můžete si zobrazit
          osvědčení technika požární ochrany{" "}
          <strong className="font-semibold text-foreground">Z-TPO-85/2012</strong> vydané
          Ministerstvem vnitra – stejné číslo uvádíme i na certifikátech z požární ochrany.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary mt-5 inline-flex items-center gap-2"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Zobrazit oprávnění
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opravneni-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[min(92dvh,920px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[92dvh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
              <div className="min-w-0 flex-1">
                <h2 id="opravneni-title" className="text-base font-bold text-foreground sm:text-lg">
                  {OPRAVNENI_IMAGE.title}
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm">{OPRAVNENI_IMAGE.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-brand-tint"
                aria-label="Zavřít"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100 p-3 sm:p-4">
              <Image
                src={OPRAVNENI_IMAGE.src}
                alt={OPRAVNENI_IMAGE.alt}
                width={1200}
                height={1700}
                sizes="(max-width: 640px) 100vw, 672px"
                className="mx-auto h-auto w-full max-w-2xl rounded-lg bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
