import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Administrace – přihlášení",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/objednavky/nova");
  }

  return (
    <>
      <PageHero
        title="Administrace TechnikPO"
        subtitle="Přihlaste se pro založení manuálních objednávek (faktura, hotově) a odeslání přístupů ke školení."
      >
        <Link href="/" className="mt-4 inline-block text-sm text-white/80 hover:text-white">
          ← Zpět na web
        </Link>
      </PageHero>

      <Section>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <AdminLoginForm />
          </div>
        </div>
      </Section>
    </>
  );
}
