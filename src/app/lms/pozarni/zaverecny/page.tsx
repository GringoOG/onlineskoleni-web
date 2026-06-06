import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getOfficialQuizConfig } from "@/lib/lms/quiz-data";
import { getDemoTestPath } from "@/lib/lms/course-paths";
import { getLmsSession } from "@/lib/lms/session";

const COURSE_SLUG = "pozarni" as const;

export const metadata: Metadata = {
  title: "Závěrečný test požární ochrany",
  description: "Vyberte oficiální test PO podle typu školení – zaměstnanec nebo vedoucí.",
};

export default async function PozarniOfficialTestHubPage() {
  const session = await getLmsSession();
  if (!session) {
    redirect("/lms/login?redirect=%2Flms%2Fpozarni%2Fzaverecny");
  }

  const zamestnanec = getOfficialQuizConfig(COURSE_SLUG, "zamestnanec");
  const vedouci = getOfficialQuizConfig(COURSE_SLUG, "vedouci");

  return (
    <>
      <PageHero
        title="Oficiální závěrečný test požární ochrany"
        subtitle="Vyberte test odpovídající vašemu typu školení. Po úspěšném složení obdržíte certifikát."
      >
        <Link
          href="/lms"
          className="mt-4 inline-block text-sm text-white/80 hover:text-white"
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
              správných (80 %)
            </p>
            <Link
              href="/lms/pozarni/zaverecny/zamestnanec"
              className="btn-primary mt-6 inline-flex"
            >
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
              (80 %)
            </p>
            <Link href="/lms/pozarni/zaverecny/vedouci" className="btn-primary mt-6 inline-flex">
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
