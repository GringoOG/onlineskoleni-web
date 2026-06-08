import type { CourseProgressStatus } from "@/lib/lms/progress";
import { PROGRESS_LABELS, progressStepIndex } from "@/lib/lms/progress";

const STEPS: CourseProgressStatus[] = [
  "not_started",
  "theory",
  "ready_for_test",
  "completed",
];

interface CourseProgressStepperProps {
  status: CourseProgressStatus;
}

export function CourseProgressStepper({ status }: CourseProgressStepperProps) {
  const activeStep = progressStepIndex(status);

  return (
    <ol className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-4">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;
        const isDone = stepNumber < activeStep;

        return (
          <li
            key={step}
            className={`rounded-lg border px-3 py-2 text-center text-xs leading-tight ${
              isDone
                ? "border-green-200 bg-green-50 text-green-800"
                : isActive
                  ? "border-brand bg-brand-tint font-semibold text-brand-darker"
                  : "border-border bg-white text-muted"
            }`}
          >
            <span className="block break-words font-medium">{PROGRESS_LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
