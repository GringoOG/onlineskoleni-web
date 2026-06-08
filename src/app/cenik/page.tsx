import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTABanner } from "@/components/CTABanner";
import { BulkDiscountBanner } from "@/components/BulkDiscountBanner";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { pricing } from "@/lib/content";
import type { PricingPlan } from "@/types/content";

export const metadata: Metadata = {
  title: "Ceník",
  description:
    "Ceník online školení BOZP, manipulace s břemeny, PO, řidičů a GDPR. Ceny bez DPH, firemní slevy od 10 osob.",
};

function PricingCard({ plan }: { plan: PricingPlan }) {
  const orderHref = plan.catalogSlug
    ? `/objednavka?kurz=${plan.catalogSlug}`
    : "/objednavka";

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
      <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
      <p className="mt-4">
        <span className="text-3xl font-bold text-brand-dark">{plan.price}</span>
        <span className="ml-2 text-sm text-slate-500">{plan.per}</span>
      </p>
      <ul className="mt-6 flex-1 space-y-2 border-t border-slate-100 pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-slate-700">
            <span className="text-brand-dark">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2">
        <Link href={orderHref} className="btn-primary block py-2.5 text-center">
          Objednat online
        </Link>
        <Link
          href="/kontakt"
          className="block rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Poptat e-mailem
        </Link>
      </div>
    </article>
  );
}

export default function CenikPage() {
  return (
    <>
      <PageHero title="Ceník" subtitle={pricing.intro} />

      <Section>
        <SubstituteFulfillmentBanner variant="compact" />
      </Section>

      <Section>
        <BulkDiscountBanner />
      </Section>

      <Section title="Jednotlivá školení">
        <div className="grid gap-6 md:grid-cols-2">
          {pricing.plans.map((plan) => (
            <PricingCard key={plan.catalogSlug ?? plan.name} plan={plan} />
          ))}
        </div>
      </Section>

      <Section title="Balíčky">
        <div className="grid gap-6 md:grid-cols-2">
          {pricing.bundles.map((plan) => (
            <PricingCard key={plan.catalogSlug ?? plan.name} plan={plan} />
          ))}
        </div>
      </Section>

      <Section title="Firemní slevy">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Počet osob u kurzu / balíčku</th>
                <th className="px-4 py-3 font-semibold">Sleva</th>
              </tr>
            </thead>
            <tbody>
              {pricing.bulkDiscounts.map((tier) => (
                <tr key={tier.range} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-900">{tier.range}</td>
                  <td className="px-4 py-3 text-slate-700">{tier.discount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600">{pricing.bulkDiscount}</p>
      </Section>

      <Section>
        <p className="text-center text-sm text-slate-500">{pricing.note}</p>
      </Section>

      <Section>
        <CTABanner
          title="Objednejte školení online"
          description="Vyberte kurzy nebo balíček, zaplaťte přes GoPay a my připravíme přístupy pro zaměstnance."
          primaryHref="/objednavka"
          primaryLabel="Přejít k objednávce"
        />
      </Section>
    </>
  );
}
