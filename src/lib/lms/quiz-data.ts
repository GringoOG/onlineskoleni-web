import bozpQuiz from "../../../content/quizzes/bozp.json";
import { QUIZ_TOTAL_QUESTIONS } from "@/lib/lms/quiz-config";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface QuizDefinition {
  courseSlug: string;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
}

const bozp = bozpQuiz as QuizDefinition;

export function getBozpQuiz(): QuizDefinition {
  return bozp;
}

export function getBozpQuestions(): QuizQuestion[] {
  return bozp.questions;
}

/** Otázky bez správných odpovědí – pro zobrazení v prohlížeči. */
export function getBozpQuestionsPublic() {
  return bozp.questions.map(({ correctIndex: _c, ...question }) => question);
}

export function scoreBozpAnswers(selectedIndices: number[]): number {
  const questions = getBozpQuestions();
  if (selectedIndices.length !== questions.length) {
    throw new Error(`Očekáváno ${QUIZ_TOTAL_QUESTIONS} odpovědí.`);
  }

  return questions.reduce(
    (score, question, index) =>
      selectedIndices[index] === question.correctIndex ? score + 1 : score,
    0
  );
}
