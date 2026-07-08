import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/Section";
import { CTABanner } from "@/components/CTABanner";
import { getCourse, getCourseSlugs, courses } from "@/lib/content";
import { courseColorClasses } from "@/lib/course-colors";
import { getDemoTestPath } from "@/lib/lms/course-paths";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return { title: "Kurz nenalezen" };
  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const colors = courseColorClasses[course.color];
  const otherCourses = courses.filter((c) => c.slug !== slug);

  return (
    <>
      <div className={`${colors.bg} border-b ${colors.border} py-10 sm:py-14`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:gap-5">
            <Link
              href="/skoleni"
              className="inline-flex w-fit text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Všechna školení
            </Link>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
            >
              {course.shortTitle}
            </span>
            <h1 className={`break-words text-3xl font-bold leading-tight sm:text-4xl md:text-5xl ${colors.text}`}>
              {course.title}
            </h1>
            <p className="max-w-3xl text-base text-slate-700 sm:text-lg">{course.description}</p>
          </div>
        </div>
      </div>

      <Section title="Co kurz obsahuje">
        <ul className="space-y-3">
          {course.highlights.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
            >
              <span className={`font-bold ${colors.text}`}>•</span>
              {item}
            </li>
          ))}
        </ul>
        {getDemoTestPath(slug) && (
          <p className="mt-6">
            <Link href={getDemoTestPath(slug)!} className="btn-primary inline-flex">
              Vyzkoušet demo test {course.shortTitle}
            </Link>
          </p>
        )}
      </Section>

      <Section alt title="Další školení">
        <ul className="flex flex-wrap gap-3">
          {otherCourses.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/skoleni/${c.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted hover:border-brand hover:text-brand-dark"
              >
                {c.shortTitle}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <CTABanner
          title={`Objednat školení: ${course.shortTitle}`}
          description="Napište nám jména zaměstnanců – zašleme přihlašovací údaje."
        />
      </Section>
    </>
  );
}
