import type { QuizQuestion } from "@/lib/lms/quiz-data";

/** Náhodné pořadí otázek (Fisher–Yates). Volat na serveru při každém načtení ostrého testu. */
export function shuffleQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Náhodný výběr N otázek ze zásobníku pro ostrý test. */
export function pickOfficialQuizQuestions(
  questions: QuizQuestion[],
  count: number
): QuizQuestion[] {
  return shuffleQuizQuestions(questions).slice(0, Math.min(count, questions.length));
}
