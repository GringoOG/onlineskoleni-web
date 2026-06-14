import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ImageGeneratorPanel } from "@/components/admin/ImageGeneratorPanel";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { logoutAdmin } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: "Generátor ilustrací",
  robots: { index: false, follow: false },
};

export default async function AdminGeneratorPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHero
        title="Hromadný generátor ilustrací"
        subtitle="Vložte prompty ve formátu KÓD | PROMPT a nechte Flux.1-dev vygenerovat obrázky pro microlearning. Výsledky se zpracovávají postupně ve frontě."
      >
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
          <Link href="/admin/objednavky/nova" className="hover:text-white">
            ← Manuální objednávky
          </Link>
          <Link href="/" className="hover:text-white">
            Web
          </Link>
          <form action={logoutAdmin}>
            <button type="submit" className="hover:text-white">
              Odhlásit se
            </button>
          </form>
        </div>
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
