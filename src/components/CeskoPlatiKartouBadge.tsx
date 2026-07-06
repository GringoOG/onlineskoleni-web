import Image from "next/image";
import Link from "next/link";

const CPK_URL = "https://www.ceskoplatikartou.cz/";
const LOGO_SRC = "/images/cesko-plati-kartou.png";

interface CeskoPlatiKartouBadgeProps {
  /** Světlé pozadí (objednávka) nebo tmavé (patička). */
  variant?: "light" | "dark";
  className?: string;
}

export function CeskoPlatiKartouBadge({
  variant = "light",
  className = "",
}: CeskoPlatiKartouBadgeProps) {
  const isDark = variant === "dark";

  const text =
    variant === "dark"
      ? "Tento projekt podporuje digitalizaci obchodu v rámci iniciativy Česko platí kartou."
      : "Bezpečné platby kartou zajištěny v programu Česko platí kartou.";

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-4 ${
        isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-slate-50/80"
      } ${className}`}
    >
      <Link
        href={CPK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 self-start transition opacity-90 hover:opacity-100"
        aria-label="Česko platí kartou – více informací"
      >
        <Image
          src={LOGO_SRC}
          alt="Česko platí kartou"
          width={56}
          height={56}
          className="h-14 w-14 rounded-lg object-contain"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {text}
        </p>
        <p className={`mt-1.5 flex flex-wrap items-center gap-2 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
              isDark ? "bg-white/10 text-slate-300" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            Visa
          </span>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
              isDark ? "bg-white/10 text-slate-300" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            Mastercard
          </span>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
              isDark ? "bg-white/10 text-slate-300" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            GoPay
          </span>
        </p>
      </div>
    </div>
  );
}
