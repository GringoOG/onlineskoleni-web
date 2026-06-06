import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTABanner } from "@/components/CTABanner";
import { courses } from "@/lib/content";

export const metadata: Metadata = {
  title: "Školení",
  description:
    "Online kurzy BOZP, požární ochrany, referenčního školení řidičů, ergonomie a GDPR s certifikátem.",
};

export default function SkoleniPage() {
  return (
    <>
      <PageHero
        title="Školení"
        subtitle="Zákonné e-learning kurzy pro zaměstnance i vedoucí pracovníky. Po úspěšném testu obdržíte certifikát."
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </Section>

      <Section alt>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Certifikáty</h2>
          <p className="mt-2 text-slate-600">
            Po úspěšném absolvování kurzu je v systému školení automaticky vygenerován
            certifikát, který slouží zaměstnavateli jako kontrola absolvovaného školení.
            Certifikát si můžete kdykoliv vytisknout.
          </p>
          <Link
            href="/kontakt"
            className="link-brand mt-4 inline-flex text-sm"
          >
            Objednat školení →
          </Link>
        </div>
      </Section>

      <Section>
        <CTABanner title="Potřebujete školení pro celý tým?" />
      </Section>
    </>
  );
}
