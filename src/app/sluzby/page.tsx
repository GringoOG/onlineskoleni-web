import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTABanner } from "@/components/CTABanner";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { pages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Služby",
  description:
    "Výroba e-learningových kurzů na míru, revize hasicích přístrojů a další služby požární ochrany.",
};

export default function SluzbyPage() {
  const { services } = pages;

  return (
    <>
      <PageHero title={services.title} subtitle={services.legalNote} />

      <Section>
        <SubstituteFulfillmentBanner variant="compact" />
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              {services.elearning.title}
            </h2>
            <p className="mt-4 text-slate-600">{services.elearning.description}</p>
          </article>
          <article className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h2 className="text-xl font-bold text-red-900">
              {services.fireSafety.title}
            </h2>
            <p className="mt-4 text-red-900/80">{services.fireSafety.description}</p>
          </article>
        </div>
      </Section>

      <Section alt title="Související weby">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pages.relatedLinks.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-card p-5 text-center font-medium text-brand-dark transition hover:border-brand hover:shadow-sm"
              >
                {link.title} ↗
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <CTABanner
          title="Máte zájem o naše služby?"
          primaryLabel="Kontaktovat"
          secondaryLabel="Zobrazit školení"
          secondaryHref="/skoleni"
        />
      </Section>
    </>
  );
}
