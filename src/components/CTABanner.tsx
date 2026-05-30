import Link from "next/link";

interface CTABannerProps {
  title: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function CTABanner({
  title,
  description,
  primaryHref = "/kontakt",
  primaryLabel = "Kontaktovat",
  secondaryHref = "/#demo-test",
  secondaryLabel = "Vyzkoušet test",
}: CTABannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-dark via-brand-darker to-surface-dark px-6 py-10 text-center text-white shadow-lg shadow-brand-dark/20 md:px-12 md:py-14">
      <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-brand-tint-strong/90">{description}</p>
      )}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-darker transition hover:bg-brand-tint"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
