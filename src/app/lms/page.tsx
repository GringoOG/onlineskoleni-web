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

export default async function LmsDashboardPage() {
  const session = await getLmsSession();

  if (!session) {
    redirect("/lms/login");
  }

  const data = await getStudentDashboard(session.userId);
  if (!data) {
    redirect("/lms/login");
  }

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
        <LmsDashboard data={data} />
      </Section>
    </>
  );
}
