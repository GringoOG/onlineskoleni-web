import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminSession } from "@/lib/admin/auth";
import { canAccessGenerator, canAccessOrders } from "@/lib/admin/roles";

export const metadata: Metadata = {
  title: "Administrace TechnikPO",
  robots: { index: false, follow: false },
};

const sections = [
  {
    href: "/admin/objednavky",
    title: "Přehled objednávek",
    description:
      "Seznam všech objednávek (GoPay, QR platba, ručně). Vyhledávání, stav zaplaceno/nezaplaceno a ruční změna stavu.",
    cta: "Otevřít přehled",
    permission: "orders" as const,
  },
  {
    href: "/admin/objednavky/nova",
    title: "Nová manuální objednávka",
    description:
      "Založte přístup ke školení po faktuře nebo hotovosti. Systém vytvoří účty, přiřadí kurzy a odešle uvítací e-maily.",
    cta: "Nová objednávka",
    permission: "orders" as const,
  },
  {
    href: "/admin/generator",
    title: "Generátor ilustrací",
    description:
      "Hromadné generování obrázků pro microlearning z promptů (Flux.1-dev). Vložte až 200 promptů ve formátu KÓD | PROMPT.",
    cta: "Otevřít generátor",
    permission: "generator" as const,
  },
];

interface AdminHubPageProps {
  searchParams: Promise<{ access?: string }>;
}

export default async function AdminHubPage({ searchParams }: AdminHubPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const showAccessDenied = params.access === "denied";

  const canOrders = canAccessOrders(session.role);
  const canGenerator = canAccessGenerator(session.role);

  const visibleSections = sections.filter((section) => {
    if (section.permission === "orders") return canOrders;
    return canGenerator;
  });

  return (
    <>
      <PageHero
        title="Administrace TechnikPO"
        subtitle="Vyberte sekci, se kterou chcete pracovat. Objednávky a generování ilustrací jsou oddělené nástroje."
      >
        <AdminNav current="hub" canOrders={canOrders} canGenerator={canGenerator} />
      </PageHero>

      <Section>
        <div className="mx-auto max-w-4xl space-y-6">
          {showAccessDenied ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              Přístup odepřen. Váš účet nemá oprávnění k požadované sekci administrace.
            </div>
          ) : null}

          {visibleSections.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Váš účet nemá přiřazenou žádnou sekci administrace. Kontaktujte správce systému.
            </div>
          ) : (
            <div className={`grid gap-6 ${visibleSections.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {visibleSections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand/40 hover:shadow-md"
                >
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-brand">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {section.description}
                  </p>
                  <span className="mt-5 inline-block text-sm font-semibold text-brand">
                    {section.cta} →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
