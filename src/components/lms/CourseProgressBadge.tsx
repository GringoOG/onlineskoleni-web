import type { CourseProgressStatus } from "@/lib/lms/progress";
import { PROGRESS_LABELS } from "@/lib/lms/progress";

const STATUS_STYLES: Record<CourseProgressStatus, string> = {
  not_started: "bg-slate-100 text-slate-700 border-slate-200",
  theory: "bg-amber-50 text-amber-900 border-amber-200",
  ready_for_test: "bg-brand-tint text-brand-darker border-[#f0d4b8]",
  completed: "bg-green-50 text-green-800 border-green-200",
};

interface CourseProgressBadgeProps {
  status: CourseProgressStatus;
}

export function CourseProgressBadge({ status }: CourseProgressBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {PROGRESS_LABELS[status]}
    </span>
  );
}
