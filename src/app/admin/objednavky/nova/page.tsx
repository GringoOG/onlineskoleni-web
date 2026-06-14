import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ManualOrderForm } from "@/components/admin/ManualOrderForm";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { logoutAdmin } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: "Nová manuální objednávka",
  robots: { index: false, follow: false },
};

export default async function AdminManualOrderPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHero
        title="Nová manuální objednávka"
        subtitle="Založte přístup ke školení po faktuře nebo hotovosti. Systém vytvoří účty, přiřadí kurz a odešle uvítací e-maily."
      >
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
          <Link href="/" className="hover:text-white">
            ← Web
          </Link>
          <form action={logoutAdmin}>
            <button type="submit" className="hover:text-white">
              Odhlásit se
            </button>
          </form>
        </div>
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
