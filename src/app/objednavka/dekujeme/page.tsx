import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { OrderStatus } from "@/components/OrderStatus";

export const metadata: Metadata = {
  title: "Děkujeme za objednávku",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function DekujemePage({ searchParams }: PageProps) {
  const { order: orderNumber } = await searchParams;

  return (
    <>
      <PageHero title="Děkujeme" subtitle="Přehled vaší objednávky a stavu platby" />

      <Section>
        {!orderNumber ? (
          <p className="text-slate-600">Chybí číslo objednávky v adrese URL.</p>
        ) : (
          <Suspense fallback={<p className="text-slate-600">Načítání…</p>}>
            <OrderStatus orderNumber={orderNumber} />
          </Suspense>
        )}
      </Section>
    </>
  );
}
