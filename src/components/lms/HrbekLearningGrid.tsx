import Link from "next/link";
import { courses } from "@/lib/content";
import { courseColorClasses } from "@/lib/course-colors";
import { getHrbekLearningPath } from "@/lib/lms/hrbek-learning-paths";
import {
  getDemoTestPath,
  getOfficialTestHubPath,
} from "@/lib/lms/course-paths";

interface HrbekLearningGridProps {
  isDemoUser: boolean;
}

export function HrbekLearningGrid({ isDemoUser }: HrbekLearningGridProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Microlearning – učební materiály a testy
          </h2>
          <p className="mt-1 text-sm text-muted">
            Studijní karty s ilustracemi, průběžné ověření znalostí a závěrečný test
            pro každou kategorii školení. Certifikát (PDF) vydává až oficiální závěrečný test v LMS.
          </p>
        </div>
        <Link
          href={getHrbekLearningPath(undefined, { demo: isDemoUser })}
          className="shrink-0 text-sm font-semibold text-brand-dark hover:underline"
        >
          Otevřít celý katalog →
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const colors = courseColorClasses[course.color];
          const demoTestPath = getDemoTestPath(course.slug);
          const officialTestPath = getOfficialTestHubPath(course.slug);

          return (
            <li
              key={course.slug}
              className={`flex h-full flex-col rounded-2xl border ${colors.border} ${colors.bg} p-5 shadow-sm`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${colors.text}`}>
                {course.shortTitle}
              </p>
              <h3 className="mt-1 text-base font-bold text-foreground">{course.title}</h3>

              <div className="mt-4 flex flex-1 flex-col gap-2">
                <Link
                  href={getHrbekLearningPath(course.slug, { demo: isDemoUser })}
                  className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Studijní karty (microlearning)
                </Link>
                {demoTestPath && (
                  <Link
                    href={demoTestPath}
                    className="rounded-lg border border-border bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground hover:bg-brand-tint"
                  >
                    Demo test
                  </Link>
                )}
                {officialTestPath && (
                  <Link
                    href={officialTestPath}
                    className="rounded-lg border border-border bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground hover:bg-brand-tint"
                  >
                    Závěrečný test (LMS)
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
