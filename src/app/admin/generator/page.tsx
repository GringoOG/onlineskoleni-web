import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { AdminNav } from "@/components/admin/AdminNav";
import { ImageGeneratorPanel } from "@/components/admin/ImageGeneratorPanel";
import { requireGeneratorAccess } from "@/lib/admin/auth";
import { canAccessOrders } from "@/lib/admin/roles";

export const metadata: Metadata = {
  title: "Generátor ilustrací",
  robots: { index: false, follow: false },
};

export default async function AdminGeneratorPage() {
  const session = await requireGeneratorAccess();

  return (
    <>
      <PageHero
        title="Hromadný generátor ilustrací"
        subtitle="Vložte prompty ve formátu KÓD | PROMPT a nechte Flux.1-dev vygenerovat obrázky pro microlearning. Výsledky se zpracovávají postupně ve frontě."
      >
        <AdminNav
          current="generator"
          canOrders={canAccessOrders(session.role)}
          canGenerator
        />
      </PageHero>

      <Section>
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ImageGeneratorPanel />
          </div>
        </div>
      </Section>
    </>
  );
}
