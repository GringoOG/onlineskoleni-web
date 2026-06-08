import Link from "next/link";
import { pages } from "@/lib/content";

interface SubstituteFulfillmentBannerProps {
  variant?: "strip" | "compact" | "full";
}

export function SubstituteFulfillmentBanner({
  variant = "full",
}: SubstituteFulfillmentBannerProps) {
  const content = pages.substituteFulfillment;

  if (variant === "strip") {
    return (
      <div className="border-b border-amber-300/40 bg-gradient-to-r from-amber-100 via-amber-50 to-brand-tint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 text-center text-sm sm:justify-between sm:text-left">
          <p className="font-semibold text-amber-950">
            <span className="mr-1.5 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
              OZP
            </span>
            {content.strip}
          </p>
          <Link
            href="/#nahradni-plneni"
            className="shrink-0 text-sm font-semibold text-brand-dark underline-offset-2 hover:underline"
          >
            Co to znamená →
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
          {content.badge}
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-900">{content.summary}</p>
        <p className="mt-2 text-xs text-slate-600">Právní základ: {content.legalBasis}</p>
        <Link
          href="/#nahradni-plneni"
          className="mt-3 inline-block text-sm font-semibold text-brand-dark hover:underline"
        >
          Více o náhradním plnění →
        </Link>
      </div>
    );
  }

  return (
    <div
      id="nahradni-plneni"
      className="scroll-mt-24 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-white to-brand-tint p-6 shadow-md sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
        {content.badge}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
        {content.title}
      </h2>
      <p className="mt-3 max-w-3xl text-base text-slate-700">{content.summary}</p>
      <p className="mt-2 text-sm text-slate-500">Právní základ: {content.legalBasis}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">{content.whatItMeans.title}</h3>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            {content.whatItMeans.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">{content.howItWorks.title}</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            {content.howItWorks.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {content.benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-800 ring-1 ring-amber-200"
          >
            <span className="font-bold text-amber-600">✓</span>
            {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{content.cta}</p>
        <Link href="/kontakt" className="btn-primary shrink-0 px-5 py-2.5 text-sm">
          {content.ctaButton}
        </Link>
      </div>
    </div>
  );
}
