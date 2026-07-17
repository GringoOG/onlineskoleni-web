import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { BulkDiscountBanner } from "@/components/BulkDiscountBanner";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Objednávka a platba",
  description: "Objednejte online školení BOZP, PO a další kurzy. Platba přes GoPay.",
};

export default function ObjednavkaPage() {
  return (
    <>
      <PageHero
        title="Objednávka školení"
        subtitle="Zadejte účastníky, přiřaďte školení a zaplaťte online přes GoPay."
      />

      <Section>
        <SubstituteFulfillmentBanner variant="full" />
      </Section>

      <Section>
        <BulkDiscountBanner />

        <div className="mt-12 sm:mt-14">
          <Suspense fallback={<p className="text-slate-600">Načítání formuláře…</p>}>
            <CheckoutForm />
          </Suspense>
        </div>
      </Section>
    </>
  );
}
