interface Pillar {
  title: string;
  description: string;
}

interface PillarsProps {
  items: Pillar[];
}

const icons = ["shield", "award", "zap"] as const;

function PillarIcon({ type }: { type: (typeof icons)[number] }) {
  if (type === "shield") {
    return (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  if (type === "award") {
    return (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  }
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export function Pillars({ items }: PillarsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((pillar, i) => (
        <div
          key={pillar.title}
          className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand-dark">
            <PillarIcon type={icons[i % icons.length]} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-foreground">{pillar.title}</h3>
          <p className="mt-2 text-sm text-muted">{pillar.description}</p>
        </div>
      ))}
    </div>
  );
}
