import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTABanner } from "@/components/CTABanner";
import { pricing } from "@/lib/content";
import { orderCatalog } from "@/lib/order-catalog";

export const metadata: Metadata = {
  title: "Ceník",
  description: "Orientační ceník online školení BOZP, PO, řidičů, ergonomie a GDPR.",
};

export default function CenikPage() {
  return (
    <>
      <PageHero title="Ceník" subtitle={pricing.intro} />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {pricing.plans.map((plan, index) => {
            const catalogItem = orderCatalog[index];
            return (
            <article
              key={plan.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <p className="mt-4">
                <span className="text-3xl font-bold text-brand-dark">{plan.priceFrom}</span>
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
                <Link
                  href={catalogItem ? `/objednavka?kurz=${catalogItem.courseSlug}` : "/objednavka"}
                  className="btn-primary block py-2.5 text-center"
                >
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
          })}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">{pricing.note}</p>
        <p className="mt-4 rounded-xl bg-brand-tint px-4 py-3 text-center text-sm text-brand-darker">
          {pricing.bulkDiscount}
        </p>
      </Section>

      <Section>
        <CTABanner
          title="Objednejte školení online"
          description="Vyberte kurzy, zaplaťte přes GoPay a my připravíme přístupy pro zaměstnance."
          primaryHref="/objednavka"
          primaryLabel="Přejít k objednávce"
        />
      </Section>
    </>
  );
}
