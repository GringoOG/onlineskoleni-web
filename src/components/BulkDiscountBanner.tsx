import { pricing } from "@/lib/content";

interface BulkDiscountBannerProps {
  variant?: "full" | "compact";
}

export function BulkDiscountBanner({ variant = "full" }: BulkDiscountBannerProps) {
  if (variant === "compact") {
    return (
      <div className="rounded-2xl border-2 border-brand bg-gradient-to-br from-brand-tint to-white p-5 shadow-sm">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-brand-darker">
          Firemní slevy
        </p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {pricing.bulkDiscounts.map((tier) => (
            <li
              key={tier.range}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-[#f0d4b8]"
            >
              <span className="text-brand-dark">{tier.range}:</span> {tier.discount}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-sm font-bold text-brand-darker">
          Sleva se započítá automaticky dle celkového počtu osob v objednávce na všechny položky.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-brand bg-gradient-to-br from-brand-tint via-white to-brand-tint p-6 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">
            Výhodné pro firmy
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Firemní slevy při větším počtu zaměstnanců
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            {pricing.bulkDiscount}
          </p>
        </div>
        <p className="max-w-xs shrink-0 rounded-xl border-2 border-brand bg-white px-4 py-3 text-center text-sm font-bold leading-snug text-brand-darker shadow-sm sm:text-base">
          Sleva se započítá automaticky dle celkového počtu osob v objednávce na všechny položky.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {pricing.bulkDiscounts.map((tier) => (
          <div
            key={tier.range}
            className="rounded-xl border border-[#f0d4b8] bg-white px-4 py-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-brand-dark">{tier.range}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{tier.discount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
