import Link from "next/link";
import { courseColorClasses } from "@/lib/course-colors";
import type { DashboardCourse } from "@/lib/lms/get-student-dashboard";
import { PROGRESS_DESCRIPTIONS } from "@/lib/lms/progress";
import { CourseProgressBadge } from "@/components/lms/CourseProgressBadge";
import { CourseProgressStepper } from "@/components/lms/CourseProgressStepper";
import { StartTheoryButton } from "@/components/lms/StartTheoryButton";
import { getDemoTestPath } from "@/lib/lms/course-paths";
import { getStudyMaterialDownloadUrl } from "@/lib/lms/study-material";

interface CourseProgressCardProps {
  course: DashboardCourse;
  isDemoUser?: boolean;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function CourseProgressCard({
  course,
  isDemoUser = false,
}: CourseProgressCardProps) {
  const colors = courseColorClasses[course.color];
  const demoTestPath = getDemoTestPath(course.slug);
  // Demo účet nesmí jít na ostrý závěrečný test – jen demo.
  const officialOrDemoTestPath = isDemoUser ? demoTestPath : course.testPath;
  const testLabel = isDemoUser
    ? "Spustit demo test"
    : course.latestAttempt
      ? "Opakovat test"
      : "Spustit závěrečný test";
  const midTestLabel = isDemoUser ? "Přejít na demo test" : "Přejít na test";

  return (
    <article
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 shadow-sm sm:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold uppercase tracking-wide ${colors.text}`}>
            {course.shortTitle}
          </p>
          <h2 className="mt-2 break-words text-lg font-bold text-foreground sm:text-xl">
            {course.title}
          </h2>
        </div>
        <CourseProgressBadge status={course.progress} />
      </div>

      <p className="mt-3 text-sm text-muted">{PROGRESS_DESCRIPTIONS[course.progress]}</p>

      {course.slug === "pozarni" && course.audience ? (
        <p className="mt-2 text-sm font-medium text-foreground">
          Typ školení:{" "}
          {course.audience === "vedouci"
            ? "vedoucí (platnost certifikátu 3 roky)"
            : "zaměstnanec (platnost certifikátu 2 roky)"}
        </p>
      ) : null}

      <div className="mt-5">
        <CourseProgressStepper status={course.progress} />
      </div>

      {course.latestAttempt && course.progress !== "completed" && (
        <p className="mt-4 text-sm text-muted">
          Poslední pokus v testu: {course.latestAttempt.score}/
          {course.latestAttempt.totalQuestions}{" "}
          {course.latestAttempt.isPassed ? "(úspěch)" : "(neúspěch)"}
        </p>
      )}

      {course.seatsPurchased && course.seatsPurchased > 1 && (
        <p className="mt-2 text-sm text-muted">
          Zakoupeno míst: {course.seatsPurchased}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={getStudyMaterialDownloadUrl(course.slug)}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-brand-tint"
        >
          Stáhnout studijní materiál (PDF)
        </a>

        {course.progress === "not_started" && (
          <>
            <StartTheoryButton courseId={course.courseId} theoryPath={course.theoryPath} />
            <Link
              href={course.theoryPath}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-brand-tint"
            >
              Otevřít microlearning
            </Link>
          </>
        )}

        {course.progress === "theory" && (
          <>
            <Link href={course.theoryPath} className="btn-primary">
              Pokračovat v microlearningu
            </Link>
            {officialOrDemoTestPath && (
              <Link
                href={officialOrDemoTestPath}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-brand-tint"
              >
                {midTestLabel}
              </Link>
            )}
          </>
        )}

        {course.progress === "ready_for_test" && officialOrDemoTestPath && (
          <Link href={officialOrDemoTestPath} className="btn-primary">
            {testLabel}
          </Link>
        )}

        {course.progress === "completed" && (
          <>
            {course.certificate && !isDemoUser ? (
              <a
                href={course.certificate.downloadUrl}
                className="btn-primary"
                download
              >
                Stáhnout certifikát (PDF)
              </a>
            ) : (
              <Link
                href={
                  (isDemoUser ? demoTestPath : course.testPath) ?? course.theoryPath
                }
                className="btn-primary"
              >
                Otevřít kurz
              </Link>
            )}
            {course.completedAt && (
              <span className="self-center text-sm text-muted">
                Dokončeno {formatDate(course.completedAt)}
              </span>
            )}
          </>
        )}
      </div>

      {course.certificate && course.progress === "completed" && (
        <p className="mt-3 text-xs text-muted">
          Certifikát č. {course.certificate.code} · platný do{" "}
          {formatDate(course.certificate.expiresAt)}
        </p>
      )}
    </article>
  );
}
