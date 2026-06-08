import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { BulkDiscountBanner } from "@/components/BulkDiscountBanner";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { CheckoutForm } from "@/components/CheckoutForm";
import { isGoPayConfigured } from "@/lib/gopay";

export const metadata: Metadata = {
  title: "Objednávka a platba",
  description: "Objednejte online školení BOZP, PO a další kurzy. Platba přes GoPay.",
};

export default function ObjednavkaPage() {
  const gopayReady = isGoPayConfigured();

  return (
    <>
      <PageHero
        title="Objednávka školení"
        subtitle="Vyberte kurzy, zadejte počet zaměstnanců a zaplaťte online přes GoPay."
      />

      <Section>
        <SubstituteFulfillmentBanner variant="full" />
      </Section>

      <Section>
        <BulkDiscountBanner />

        {!gopayReady && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">GoPay není nakonfigurován</p>
            <p className="mt-1">
              Pro testování plateb doplňte credentials do souboru <code>.env</code> podle{" "}
              <code>.env.example</code> (sandbox účet z GoPay).
            </p>
          </div>
        )}

        <Suspense fallback={<p className="text-slate-600">Načítání formuláře…</p>}>
          <CheckoutForm />
        </Suspense>
      </Section>
    </>
  );
}
