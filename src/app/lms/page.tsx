import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LmsDashboard } from "@/components/lms/LmsDashboard";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getStudentDashboard } from "@/lib/lms/get-student-dashboard";
import { getLmsSession } from "@/lib/lms/session";

export const metadata: Metadata = {
  title: "Moje školení",
  description: "Přehled vašich online kurzů, průběhu studia a certifikátů.",
};

interface PageProps {
  searchParams: Promise<{ official?: string }>;
}

export default async function LmsDashboardPage({ searchParams }: PageProps) {
  const session = await getLmsSession();

  if (!session) {
    redirect("/lms/login");
  }

  const data = await getStudentDashboard(session.userId);
  if (!data) {
    redirect("/lms/login");
  }

  const { official } = await searchParams;

  return (
    <>
      <PageHero
        title="Moje školení"
        subtitle="Přehled kurzů, průběh studia a stažení certifikátů."
      >
        <Link
          href="/skoleni"
          className="inline-block text-sm text-white/80 hover:text-white"
        >
          ← Katalog školení
        </Link>
      </PageHero>

      <Section>
        {official === "denied" ? (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Oficiální závěrečný test je dostupný jen po zaplacení školení v klientské
            zóně. Veřejné demo slouží pouze k vyzkoušení formátu.{" "}
            <Link href="/objednavka" className="font-semibold underline">
              Objednat školení
            </Link>
          </p>
        ) : null}
        <LmsDashboard data={data} />
      </Section>
    </>
  );
}
