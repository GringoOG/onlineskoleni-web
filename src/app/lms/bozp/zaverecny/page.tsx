import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getEnrollmentAudience } from "@/lib/lms/enroll-from-order";
import { getOfficialQuizConfig } from "@/lib/lms/quiz-data";
import { getDemoTestPath } from "@/lib/lms/course-paths";
import { requireOfficialTestAccess } from "@/lib/lms/official-test-access";

const COURSE_SLUG = "bozp" as const;

export const metadata: Metadata = {
  title: "Závěrečný test BOZP",
  description: "Oficiální test BOZP podle typu školení z objednávky.",
};

export default async function BozpOfficialTestHubPage() {
  const session = await requireOfficialTestAccess(COURSE_SLUG, "/lms/bozp/zaverecny");

  const enrolledAudience = await getEnrollmentAudience(session.userId, COURSE_SLUG);
  if (enrolledAudience === "zamestnanec") {
    redirect("/lms/bozp/zaverecny/zamestnanec");
  }
  if (enrolledAudience === "vedouci") {
    redirect("/lms/bozp/zaverecny/vedouci");
  }

  // Legacy zápisy bez audience – výběr ještě nabídneme jednou.
  const zamestnanec = getOfficialQuizConfig(COURSE_SLUG, "zamestnanec");
  const vedouci = getOfficialQuizConfig(COURSE_SLUG, "vedouci");

  return (
    <>
      <PageHero
        title="Oficiální závěrečný test BOZP"
        subtitle="U novějších objednávek je typ školení (zaměstnanec / vedoucí) určen už v nabídce. U starších zápisů vyberte odpovídající test."
      >
        <Link
          href="/lms"
          className="inline-block text-sm text-white/80 hover:text-white"
        >
          ← Moje školení
        </Link>
      </PageHero>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-dark">
              Zaměstnanec
            </p>
            <h2 className="mt-2 text-xl font-bold text-foreground">{zamestnanec.title}</h2>
            <p className="mt-2 text-sm text-muted">
              {zamestnanec.totalQuestions} otázek · úspěch od {zamestnanec.minCorrectAnswers}{" "}
              správných (80 %) · platnost certifikátu 2 roky
            </p>
            <Link href="/lms/bozp/zaverecny/zamestnanec" className="btn-primary mt-6 inline-flex">
              Spustit test pro zaměstnance
            </Link>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-dark">
              Vedoucí zaměstnanec
            </p>
            <h2 className="mt-2 text-xl font-bold text-foreground">{vedouci.title}</h2>
            <p className="mt-2 text-sm text-muted">
              {vedouci.totalQuestions} otázek · úspěch od {vedouci.minCorrectAnswers} správných
              (80 %) · platnost certifikátu 3 roky · po absolvování může školit své zaměstnance
            </p>
            <Link href="/lms/bozp/zaverecny/vedouci" className="btn-primary mt-6 inline-flex">
              Spustit test pro vedoucí
            </Link>
          </article>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Chcete si nejdřív vyzkoušet formát?{" "}
          <Link
            href={getDemoTestPath(COURSE_SLUG)!}
            className="font-semibold text-brand-dark hover:underline"
          >
            Demo test (10 otázek)
          </Link>
        </p>
      </Section>
    </>
  );
}
