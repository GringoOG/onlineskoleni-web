import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { USPGrid } from "@/components/USPGrid";
import { Pillars } from "@/components/Pillars";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { CTABanner } from "@/components/CTABanner";
import { OpravneniButton } from "@/components/OpravneniButton";
import { pages } from "@/lib/content";

export const metadata: Metadata = {
  title: "O nás",
  description:
    "TechnikPO s.r.o. – online školení BOZP, požární ochrany a dalších zákonných kurzů. Náhradní plnění díky zaměstnávání OZP.",
};

export default function ONasPage() {
  const { about, whyUs, howToOrder, pillars } = pages;

  return (
    <>
      <PageHero title={about.title} subtitle={about.intro} />

      <Section>
        <SubstituteFulfillmentBanner variant="full" />
      </Section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-lg leading-relaxed text-muted">{about.body}</p>
          <div className="mt-8 w-full">
            <OpravneniButton />
          </div>
        </div>
      </Section>

      <Section alt title={whyUs.title}>
        <USPGrid items={whyUs.items} />
      </Section>

      <Section title={howToOrder.title}>
        <ol className="max-w-2xl space-y-4">
          {howToOrder.steps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand-dark text-sm font-bold text-white">
                {index + 1}
              </span>
              <span className="pt-1 text-muted">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8">
          <Link href="/objednavka" className="link-brand text-sm font-semibold">
            Přejít na objednávku →
          </Link>
        </p>
      </Section>

      <Section alt>
        <Pillars items={pillars} />
      </Section>

      <Section>
        <CTABanner
          title="Máte zájem o školení?"
          description="Napište nám jména zaměstnanců a druh školení – připravíme přihlašovací údaje."
          primaryHref="/objednavka"
          primaryLabel="Objednat online"
          secondaryLabel="Kontaktovat"
          secondaryHref="/kontakt"
        />
      </Section>
    </>
  );
}
