import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { AdminNav } from "@/components/admin/AdminNav";
import { ManualOrderForm } from "@/components/admin/ManualOrderForm";
import { requireOrdersAccess } from "@/lib/admin/auth";
import { canAccessGenerator } from "@/lib/admin/roles";

export const metadata: Metadata = {
  title: "Nová manuální objednávka",
  robots: { index: false, follow: false },
};

export default async function AdminManualOrderPage() {
  const session = await requireOrdersAccess();

  return (
    <>
      <PageHero
        title="Nová manuální objednávka"
        subtitle="Založte přístup ke školení po faktuře nebo hotovosti. Systém vytvoří účty, přiřadí kurz a odešle uvítací e-maily."
      >
        <AdminNav
          current="orders"
          canOrders
          canGenerator={canAccessGenerator(session.role)}
        />
      </PageHero>

      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ManualOrderForm />
          </div>
        </div>
      </Section>
    </>
  );
}
