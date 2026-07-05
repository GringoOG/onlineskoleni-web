import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { GoogleAdsPurchaseConversion } from "@/components/GoogleAdsPurchaseConversion";
import { OrderStatus } from "@/components/OrderStatus";

export const metadata: Metadata = {
  title: "Děkujeme za objednávku",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ order?: string; method?: string }>;
}

export default async function DekujemePage({ searchParams }: PageProps) {
  const { order: orderNumber, method } = await searchParams;
  const showQrPayment = method === "qr";

  return (
    <>
      <PageHero title="Děkujeme" subtitle="Přehled vaší objednávky a stavu platby" />

      <Section>
        {!orderNumber ? (
          <p className="text-slate-600">Chybí číslo objednávky v adrese URL.</p>
        ) : (
          <>
            <GoogleAdsPurchaseConversion orderNumber={orderNumber} />
            <Suspense fallback={<p className="text-slate-600">Načítání…</p>}>
              <OrderStatus orderNumber={orderNumber} showQrPayment={showQrPayment} />
            </Suspense>
          </>
        )}
      </Section>
    </>
  );
}
