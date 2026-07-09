import Image from "next/image";
import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { Section } from "@/components/Section";
import { BulkDiscountBanner } from "@/components/BulkDiscountBanner";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { CTABanner } from "@/components/CTABanner";
import { courses, pages } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-dark via-[#2a1810] to-surface-dark text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 85% 20%, rgba(245, 166, 35, 0.25), transparent 50%)",
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
                TechnikPO s.r.o.
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                {pages.hero.title}
              </h1>
              <p className="mt-6 text-lg text-white/80 md:text-xl">{pages.hero.subtitle}</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/objednavka" className="btn-primary-lg text-center">
                  Objednat online
                </Link>
                <Link
                  href="/lms/bozp/test"
                  className="rounded-lg border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {pages.hero.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Image
                src="/images/logo.svg"
                alt=""
                width={200}
                height={220}
                priority
                className="h-auto w-36 drop-shadow-[0_0_40px_rgba(245,166,35,0.35)] sm:w-44 md:w-[200px]"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>

      <Section>
        <SubstituteFulfillmentBanner variant="full" />
      </Section>

      <Section id="skoleni" title="Naše školení" subtitle="Zákonné online kurzy s certifikátem po úspěšném testu">
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

      <Section alt title={pages.onlineBenefits.title}>
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

      <Section id="demo-test" title={pages.demoTest.title}>
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
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
