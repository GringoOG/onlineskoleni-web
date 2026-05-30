import Link from "next/link";
import type { Course } from "@/types/content";
import { courseColorClasses } from "@/lib/course-colors";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const colors = courseColorClasses[course.color];

  return (
    <article
      className={`flex flex-col rounded-2xl border ${colors.border} ${colors.bg} p-6 transition hover:shadow-md`}
    >
      <span
        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
      >
        {course.shortTitle}
      </span>
      <h3 className={`mt-4 text-xl font-bold ${colors.text}`}>{course.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
        {course.description}
      </p>
      <Link
        href={`/skoleni/${course.slug}`}
        className={`mt-6 inline-flex items-center text-sm font-semibold ${colors.text} hover:underline`}
      >
        Více o kurzu →
      </Link>
    </article>
  );
}
