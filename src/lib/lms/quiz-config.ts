/** Procento správných odpovědí pro úspěšné složení testu. */
export const QUIZ_PASS_THRESHOLD_PERCENT = 80;

/** Demo test – zkrácená ukázka pro veřejnost. */
export const DEMO_QUIZ_TOTAL = 10;
export const DEMO_QUIZ_MIN_CORRECT = 8;

export function getMinCorrectAnswers(totalQuestions: number): number {
  return Math.ceil((totalQuestions * QUIZ_PASS_THRESHOLD_PERCENT) / 100);
}

/** @deprecated Použijte konstanty pro demo nebo getMinCorrectAnswers u oficiálního testu. */
export const QUIZ_TOTAL_QUESTIONS = DEMO_QUIZ_TOTAL;
export const QUIZ_MIN_CORRECT_ANSWERS = DEMO_QUIZ_MIN_CORRECT;
