import Link from "next/link";
import type { StudentDashboardData } from "@/lib/lms/get-student-dashboard";
import { CourseProgressCard } from "@/components/lms/CourseProgressCard";
import { HrbekLearningGrid } from "@/components/lms/HrbekLearningGrid";
import { LmsLogoutButton } from "@/components/lms/LmsLogoutButton";
import { isDemoUserEmail } from "@/lib/lms/demo-user";

interface LmsDashboardProps {
  data: StudentDashboardData;
}

export function LmsDashboard({ data }: LmsDashboardProps) {
  const isDemoUser = isDemoUserEmail(data.user.email);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Přihlášen jako</p>
          <h1 className="text-2xl font-bold text-foreground">{data.user.name}</h1>
          <p className="mt-1 text-sm text-muted">{data.user.email}</p>
          {data.user.companyName && (
            <p className="mt-1 text-sm text-muted">Firma: {data.user.companyName}</p>
          )}
        </div>
        <LmsLogoutButton />
      </div>

      <HrbekLearningGrid
        isDemoUser={isDemoUser}
        enrolledSlugs={data.courses.map((course) => course.slug)}
      />

      <div>
        <h2 className="text-lg font-bold text-foreground">Moje kurzy</h2>
        <p className="mt-1 text-sm text-muted">
          Kurzy z vaší objednávky – průběh studia, microlearning a závěrečné testy.
        </p>
      </div>

      {data.courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-brand-tint/40 p-8 text-center">
          <p className="text-muted">
            Zatím nemáte přiřazený žádný kurz. Po zaplacení objednávky se kurzy zobrazí
            zde automaticky.
          </p>
          <Link href="/objednavka" className="btn-primary mt-4 inline-block">
            Objednat školení
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {data.courses.map((course) => (
            <li key={course.enrollmentId}>
              <CourseProgressCard course={course} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
