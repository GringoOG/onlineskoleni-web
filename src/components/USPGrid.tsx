interface USPGridProps {
  items: string[];
}

export function USPGrid({ items }: USPGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li
          key={item}
          className={`flex h-full gap-3 rounded-xl border p-4 shadow-sm ${
            index === 0
              ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
              : "border-border bg-card"
          }`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              index === 0 ? "bg-amber-500 text-white" : "bg-brand-tint text-brand-dark"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span
            className={`text-sm leading-relaxed ${index === 0 ? "text-slate-800" : "text-muted"}`}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
