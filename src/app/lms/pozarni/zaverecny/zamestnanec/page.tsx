import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseQuiz } from "@/components/lms/BozpQuiz";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { getEnrollmentAudience } from "@/lib/lms/enroll-from-order";
import {
  getOfficialQuizConfig,
  getOfficialTestSize,
  getQuizQuestionsPublic,
  prepareOfficialQuizQuestions,
} from "@/lib/lms/quiz-data";
import { getLmsSession } from "@/lib/lms/session";

const COURSE_SLUG = "pozarni" as const;
const AUDIENCE = "zamestnanec" as const;

export const metadata: Metadata = {
  title: "Závěrečný test PO – zaměstnanec",
  description: "Oficiální závěrečný test požární ochrany pro řadové zaměstnance.",
};

export default async function PozarniOfficialEmployeeTestPage() {
  const config = getOfficialQuizConfig(COURSE_SLUG, AUDIENCE);
  const { totalQuestions, minCorrectAnswers } = getOfficialTestSize(
    COURSE_SLUG,
    AUDIENCE
  );
  const shuffledQuestions = prepareOfficialQuizQuestions(COURSE_SLUG, AUDIENCE);
  const session = await getLmsSession();

  if (!session) {
    redirect("/lms/login?redirect=%2Flms%2Fpozarni%2Fzaverecny%2Fzamestnanec");
  }

  const enrolledAudience = await getEnrollmentAudience(session.userId, COURSE_SLUG);
  if (enrolledAudience === "vedouci") {
    redirect("/lms/pozarni/zaverecny/vedouci");
  }

  let userName = "Student";
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
        subtitle={`${config.subtitle} · ${totalQuestions} otázek · úspěch od ${minCorrectAnswers} správných (80 %) · platnost certifikátu 2 roky`}
      >
        <Link href="/lms" className="inline-block text-sm text-white/80 hover:text-white">
          ← Moje školení
        </Link>
      </PageHero>

      <Section>
        <CourseQuiz
          courseSlug={COURSE_SLUG}
          questions={getQuizQuestionsPublic(shuffledQuestions)}
          userName={userName}
          totalQuestions={totalQuestions}
          minCorrectAnswers={minCorrectAnswers}
          variant="oficialni"
          audience={AUDIENCE}
        />
      </Section>
    </>
  );
}
