import bozpDemo from "../../../content/quizzes/bozp-demo.json";
import bozpOficialniZamestnanec from "../../../content/quizzes/bozp-oficialni-zamestnanec.json";
import bozpOficialniVedouci from "../../../content/quizzes/bozp-oficialni-vedouci.json";
import pozarniDemo from "../../../content/quizzes/pozarni-demo.json";
import pozarniOficialniZamestnanec from "../../../content/quizzes/pozarni-oficialni-zamestnanec.json";
import pozarniOficialniVedouci from "../../../content/quizzes/pozarni-oficialni-vedouci.json";
import ridiciDemo from "../../../content/quizzes/ridici-demo.json";
import ridiciOficialni from "../../../content/quizzes/ridici-oficialni.json";
import { getMinCorrectAnswers } from "@/lib/lms/quiz-config";

export type LmsQuizCourseSlug = "bozp" | "pozarni" | "ridici";
export type QuizAudience = "zamestnanec" | "vedouci";
/** @deprecated Use QuizAudience */
export type BozpQuizAudience = QuizAudience;

export type BozpQuizVariant = "demo" | "oficialni";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface QuizDefinition {
  courseSlug: string;
  variant: BozpQuizVariant;
  audience?: QuizAudience;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
}

export interface QuizRuntimeConfig {
  courseSlug: LmsQuizCourseSlug;
  variant: BozpQuizVariant;
  audience?: QuizAudience;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  minCorrectAnswers: number;
}

export interface QuizAnswerSubmission {
  questionId: string;
  selectedIndex: number;
}

type AudienceOfficialQuizzes = Record<QuizAudience, QuizDefinition>;

type CourseQuizBundle =
  | {
      officialMode: "audience";
      demo: QuizDefinition;
      oficialni: AudienceOfficialQuizzes;
    }
  | {
      officialMode: "single";
      demo: QuizDefinition;
      oficialni: QuizDefinition;
    };

const quizRegistry: Record<LmsQuizCourseSlug, CourseQuizBundle> = {
  bozp: {
    officialMode: "audience",
    demo: bozpDemo as QuizDefinition,
    oficialni: {
      zamestnanec: bozpOficialniZamestnanec as QuizDefinition,
      vedouci: bozpOficialniVedouci as QuizDefinition,
    },
  },
  pozarni: {
    officialMode: "audience",
    demo: pozarniDemo as QuizDefinition,
    oficialni: {
      zamestnanec: pozarniOficialniZamestnanec as QuizDefinition,
      vedouci: pozarniOficialniVedouci as QuizDefinition,
    },
  },
  ridici: {
    officialMode: "single",
    demo: ridiciDemo as QuizDefinition,
    oficialni: ridiciOficialni as QuizDefinition,
  },
};

export function courseHasAudienceSplit(courseSlug: LmsQuizCourseSlug): boolean {
  return quizRegistry[courseSlug].officialMode === "audience";
}

function toRuntimeConfig(
  courseSlug: LmsQuizCourseSlug,
  quiz: QuizDefinition
): QuizRuntimeConfig {
  const totalQuestions = quiz.questions.length;
  return {
    courseSlug,
    variant: quiz.variant,
    audience: quiz.audience,
    title: quiz.title,
    subtitle: quiz.subtitle,
    questions: quiz.questions,
    totalQuestions,
    minCorrectAnswers: getMinCorrectAnswers(totalQuestions),
  };
}

function getOfficialQuizDefinition(
  courseSlug: LmsQuizCourseSlug,
  audience?: QuizAudience
): QuizDefinition {
  const bundle = quizRegistry[courseSlug];
  if (bundle.officialMode === "single") {
    return bundle.oficialni;
  }
  if (!audience) {
    throw new Error(`Kurz ${courseSlug} vyžaduje typ testu (zaměstnanec / vedoucí).`);
  }
  return bundle.oficialni[audience];
}

export function getDemoQuizConfig(courseSlug: LmsQuizCourseSlug): QuizRuntimeConfig {
  return toRuntimeConfig(courseSlug, quizRegistry[courseSlug].demo);
}

export function getOfficialQuizConfig(
  courseSlug: LmsQuizCourseSlug,
  audience?: QuizAudience
): QuizRuntimeConfig {
  return toRuntimeConfig(courseSlug, getOfficialQuizDefinition(courseSlug, audience));
}

/** @deprecated Use getDemoQuizConfig("bozp") */
export function getBozpDemoQuizConfig(): QuizRuntimeConfig {
  return getDemoQuizConfig("bozp");
}

/** @deprecated Use getOfficialQuizConfig("bozp", audience) */
export function getBozpOfficialQuizConfig(audience: QuizAudience): QuizRuntimeConfig {
  return getOfficialQuizConfig("bozp", audience);
}

export function getQuizQuestionsPublic(questions: QuizQuestion[]) {
  return questions.map(({ correctIndex: _c, ...question }) => question);
}

/** @deprecated Use getQuizQuestionsPublic */
export function getBozpQuestionsPublic(questions: QuizQuestion[]) {
  return getQuizQuestionsPublic(questions);
}

export function scoreQuizAnswers(
  questions: QuizQuestion[],
  selectedIndices: number[]
): number {
  if (selectedIndices.length !== questions.length) {
    throw new Error(`Očekáváno ${questions.length} odpovědí.`);
  }

  return questions.reduce(
    (score, question, index) =>
      selectedIndices[index] === question.correctIndex ? score + 1 : score,
    0
  );
}

export function scoreQuizAnswersById(
  questions: QuizQuestion[],
  answers: QuizAnswerSubmission[]
): number {
  const byId = new Map(questions.map((question) => [question.id, question]));

  if (answers.length !== questions.length) {
    throw new Error(`Očekáváno ${questions.length} odpovědí.`);
  }

  const seenIds = new Set<string>();
  let score = 0;
  for (const answer of answers) {
    if (seenIds.has(answer.questionId)) {
      throw new Error("Duplicitní odpověď na otázku.");
    }
    seenIds.add(answer.questionId);

    const question = byId.get(answer.questionId);
    if (!question) {
      throw new Error(`Neplatná otázka: ${answer.questionId}.`);
    }
    if (
      !Number.isInteger(answer.selectedIndex) ||
      answer.selectedIndex < 0 ||
      answer.selectedIndex >= question.options.length
    ) {
      throw new Error("Neplatný formát odpovědí.");
    }
    if (answer.selectedIndex === question.correctIndex) {
      score += 1;
    }
  }

  if (seenIds.size !== questions.length) {
    throw new Error("Neplatný formát odpovědí.");
  }

  return score;
}

export function scoreDemoAnswers(
  courseSlug: LmsQuizCourseSlug,
  selectedIndices: number[]
): number {
  return scoreQuizAnswers(quizRegistry[courseSlug].demo.questions, selectedIndices);
}

export function scoreOfficialAnswers(
  courseSlug: LmsQuizCourseSlug,
  answers: QuizAnswerSubmission[],
  audience?: QuizAudience
): number {
  return scoreQuizAnswersById(
    getOfficialQuizDefinition(courseSlug, audience).questions,
    answers
  );
}

/** @deprecated Use scoreDemoAnswers("bozp", selectedIndices) */
export function scoreBozpDemoAnswers(selectedIndices: number[]): number {
  return scoreDemoAnswers("bozp", selectedIndices);
}

/** @deprecated Use scoreOfficialAnswers("bozp", answers, audience) */
export function scoreBozpOfficialAnswers(
  audience: QuizAudience,
  selectedIndices: number[]
): number {
  const questions = getOfficialQuizDefinition("bozp", audience).questions;
  return scoreQuizAnswers(questions, selectedIndices);
}
