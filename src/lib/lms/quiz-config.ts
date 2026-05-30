/** Počet otázek v závěrečném testu kurzu. */
export const QUIZ_TOTAL_QUESTIONS = 10;

/** Minimální počet správných odpovědí pro úspěch (80 % z 10). */
export const QUIZ_MIN_CORRECT_ANSWERS = 8;

export const QUIZ_PASS_THRESHOLD_PERCENT = Math.round(
  (QUIZ_MIN_CORRECT_ANSWERS / QUIZ_TOTAL_QUESTIONS) * 100
);
