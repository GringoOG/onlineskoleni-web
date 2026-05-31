/** Fáze průběhu kurzu ve student dashboardu. */
export type CourseProgressStatus =
  | "not_started"
  | "theory"
  | "ready_for_test"
  | "completed";

export const PROGRESS_LABELS: Record<CourseProgressStatus, string> = {
  not_started: "Nezačato",
  theory: "Studium teorie",
  ready_for_test: "Připraven na test",
  completed: "Splněno",
};

export const PROGRESS_DESCRIPTIONS: Record<CourseProgressStatus, string> = {
  not_started: "Začněte prostudováním teoretické části kurzu.",
  theory: "Projděte si materiály a poté přejděte k závěrečnému testu.",
  ready_for_test: "Můžete absolvovat závěrečný test.",
  completed: "Kurz i test jste úspěšně dokončili.",
};

export function resolveCourseProgress(input: {
  isCompleted: boolean;
  theoryStartedAt: Date | null;
  hasQuizAttempt: boolean;
  hasPassedAttempt: boolean;
}): CourseProgressStatus {
  if (input.isCompleted || input.hasPassedAttempt) {
    return "completed";
  }
  if (input.hasQuizAttempt) {
    return "ready_for_test";
  }
  if (input.theoryStartedAt) {
    return "theory";
  }
  return "not_started";
}

/** Pořadí kroků pro vizuální stepper (1–4). */
export function progressStepIndex(status: CourseProgressStatus): number {
  switch (status) {
    case "not_started":
      return 1;
    case "theory":
      return 2;
    case "ready_for_test":
      return 3;
    case "completed":
      return 4;
  }
}
