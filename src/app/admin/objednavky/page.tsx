import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminOrdersList } from "@/components/admin/AdminOrdersList";
import { requireOrdersAccess } from "@/lib/admin/auth";
import { canAccessGenerator } from "@/lib/admin/roles";

export const metadata: Metadata = {
  title: "Přehled objednávek",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersListPage() {
  const session = await requireOrdersAccess();

  return (
    <>
      <PageHero
        title="Přehled objednávek"
        subtitle="Všechny objednávky rozdělené podle způsobu platby. Vyhledávání podle čísla, objednatele nebo data."
      >
        <AdminNav
          current="orders-list"
          canOrders
          canGenerator={canAccessGenerator(session.role)}
        />
      </PageHero>

      <Section>
        <div className="mb-6 flex justify-end">
          <Link href="/admin/objednavky/nova" className="btn-primary text-sm">
            + Nová manuální objednávka
          </Link>
        </div>
        <AdminOrdersList />
      </Section>
    </>
  );
}
