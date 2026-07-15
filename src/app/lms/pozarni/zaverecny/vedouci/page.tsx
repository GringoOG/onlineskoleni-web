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
import { requireOfficialTestAccess } from "@/lib/lms/official-test-access";

const COURSE_SLUG = "pozarni" as const;
const AUDIENCE = "vedouci" as const;

export const metadata: Metadata = {
  title: "Závěrečný test PO – vedoucí",
  description: "Oficiální závěrečný test požární ochrany pro vedoucí zaměstnance.",
};

export default async function PozarniOfficialManagerTestPage() {
  const config = getOfficialQuizConfig(COURSE_SLUG, AUDIENCE);
  const { totalQuestions, minCorrectAnswers } = getOfficialTestSize(
    COURSE_SLUG,
    AUDIENCE
  );
  const shuffledQuestions = prepareOfficialQuizQuestions(COURSE_SLUG, AUDIENCE);
  const session = await requireOfficialTestAccess(COURSE_SLUG, '/lms/pozarni/zaverecny/vedouci');


  const enrolledAudience = await getEnrollmentAudience(session.userId, COURSE_SLUG);
  if (enrolledAudience === "zamestnanec") {
    redirect("/lms/pozarni/zaverecny/zamestnanec");
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
        subtitle={`${config.subtitle} · ${totalQuestions} otázek · úspěch od ${minCorrectAnswers} správných (80 %) · platnost certifikátu 3 roky · po absolvování může školit své zaměstnance`}
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
