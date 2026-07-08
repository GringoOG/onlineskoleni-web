import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/admin/auth";
import { getDefaultAdminRedirect } from "@/lib/admin/roles";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Administrace – přihlášení",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect(getDefaultAdminRedirect(session.role));
  }

  return (
    <>
      <PageHero
        title="Administrace TechnikPO"
        subtitle="Přihlaste se do administrace TechnikPO – manuální objednávky nebo generátor ilustrací."
      >
        <Link href="/" className="inline-block text-sm text-white/80 hover:text-white">
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
