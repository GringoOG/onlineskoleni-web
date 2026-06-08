import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseQuiz } from "@/components/lms/BozpQuiz";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { getDemoQuizConfig, getQuizQuestionsPublic } from "@/lib/lms/quiz-data";
import { getOfficialTestHubPath } from "@/lib/lms/course-paths";
import { getLmsSession } from "@/lib/lms/session";

const COURSE_SLUG = "ergonomie" as const;

export const metadata: Metadata = {
  title: "Demo test ergonomie práce",
  description:
    "Vyzkoušejte si formát závěrečného testu ergonomie – zkrácená ukázka se 10 otázkami.",
};

export default async function ErgonomieDemoTestPage() {
  const config = getDemoQuizConfig(COURSE_SLUG);
  const session = await getLmsSession();

  if (!session) {
    redirect("/lms/login?redirect=%2Flms%2Fergonomie%2Ftest");
  }

  let userName = "Demo student";
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (user) userName = user.name;

  return (
    <>
      <PageHero
        title={config.title}
        subtitle={`${config.subtitle} · ${config.totalQuestions} otázek · úspěch od ${config.minCorrectAnswers} správných (80 %)`}
      >
        <Link
          href="/lms"
          className="mt-4 inline-block text-sm text-white/80 hover:text-white"
        >
          ← Moje školení
        </Link>
        <Link
          href={getOfficialTestHubPath(COURSE_SLUG)!}
          className="mt-2 block text-sm text-white/70 hover:text-white"
        >
          Oficiální závěrečný test →
        </Link>
      </PageHero>

      <Section>
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Toto je <strong>demo ukázka</strong> – certifikát se vydává až po úspěšném absolvování{" "}
          <Link href={getOfficialTestHubPath(COURSE_SLUG)!} className="font-semibold underline">
            oficiálního testu
          </Link>
          .
        </p>
        <CourseQuiz
          courseSlug={COURSE_SLUG}
          questions={getQuizQuestionsPublic(config.questions)}
          userName={userName}
          totalQuestions={config.totalQuestions}
          minCorrectAnswers={config.minCorrectAnswers}
          variant="demo"
        />
      </Section>
    </>
  );
}
