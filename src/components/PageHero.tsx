interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHero({ title, subtitle, children }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark via-[#2a1810] to-surface-dark py-14 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(245, 166, 35, 0.35), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-brand-light/90">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
