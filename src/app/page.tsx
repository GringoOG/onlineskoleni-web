import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { HomeHero } from "@/components/HomeHero";
import { Section } from "@/components/Section";
import { BulkDiscountBanner } from "@/components/BulkDiscountBanner";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { CTABanner } from "@/components/CTABanner";
import { courses, pages } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <HomeHero
        brandLabel="TechnikPO s.r.o."
        title={pages.hero.title}
        subtitle={pages.hero.subtitle}
        ctaSecondary={pages.hero.ctaSecondary}
      />

      <Section>
        <SubstituteFulfillmentBanner variant="full" />
      </Section>

      <Section
        id="skoleni"
        title="Naše školení"
        subtitle="Zákonné online kurzy s certifikátem po úspěšném testu"
        align="center"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href="/skoleni" className="link-brand text-sm">
            Přehled všech školení →
          </Link>
        </p>
        <div className="mt-10">
          <BulkDiscountBanner variant="compact" />
        </div>
      </Section>

      <Section alt title={pages.onlineBenefits.title} align="center">
        <ul className="grid gap-3 sm:grid-cols-2">
          {pages.onlineBenefits.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl bg-brand-tint px-4 py-3 text-sm text-muted"
            >
              <span className="font-bold text-brand-dark">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center">
          <Link href="/o-nas" className="link-brand text-sm font-semibold">
            Více o TechnikPO a náhradním plnění →
          </Link>
        </p>
      </Section>

      <Section id="demo-test" title={pages.demoTest.title} align="center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
          <p className="text-muted">{pages.demoTest.description}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-brand-tint px-4 py-3">
              <dt className="font-medium text-muted">Uživatelské jméno</dt>
              <dd className="mt-1 font-mono font-semibold text-foreground">
                {pages.demoTest.username}
              </dd>
            </div>
            <div className="rounded-lg bg-brand-tint px-4 py-3">
              <dt className="font-medium text-muted">Heslo</dt>
              <dd className="mt-1 font-mono font-semibold text-foreground">
                {pages.demoTest.password}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted">{pages.demoTest.note}</p>
          <Link href="/lms/bozp/test" className="btn-primary mt-6 inline-flex">
            Spustit demo test BOZP
          </Link>
        </div>
      </Section>

      <Section>
        <CTABanner
          title="Máte zájem o školení?"
          description="Napište nám jména zaměstnanců a druh školení – připravíme přihlašovací údaje."
          primaryHref="/objednavka"
          primaryLabel="Objednat online"
        />
      </Section>
    </>
  );
}
