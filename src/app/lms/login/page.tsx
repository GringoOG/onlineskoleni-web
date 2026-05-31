import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LmsLoginForm } from "@/components/lms/LmsLoginForm";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { sanitizeLmsRedirect } from "@/lib/lms/mark-theory-started";
import { getLmsSession } from "@/lib/lms/session";

export const metadata: Metadata = {
  title: "Přihlášení studenta",
  description: "Přihlaste se do systému online školení a sledujte průběh svých kurzů.",
};

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LmsLoginPage({ searchParams }: PageProps) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = sanitizeLmsRedirect(redirectParam);

  const session = await getLmsSession();
  if (session) {
    redirect(redirectTo);
  }

  return (
    <>
      <PageHero
        title="Přihlášení studenta"
        subtitle="Použijte e-mail a heslo z uvítacího e-mailu po objednávce, nebo demo účet pro vyzkoušení."
      >
        <Link
          href="/lms"
          className="mt-4 inline-block text-sm text-white/80 hover:text-white"
        >
          ← Moje školení
        </Link>
      </PageHero>

      <Section>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <LmsLoginForm redirectTo={redirectTo} />
            <p className="mt-4 text-center text-sm text-muted">
              <Link
                href="/lms/bozp/test"
                className="font-semibold text-brand-dark hover:underline"
              >
                Rychlý vstup do demo testu BOZP →
              </Link>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
