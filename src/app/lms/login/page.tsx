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
        subtitle="Přihlaste se jako student (e-mail z objednávky) nebo demo účtem pro vyzkoušení testu."
      >
        <Link
          href="/lms"
          className="inline-block text-sm text-white/80 hover:text-white"
        >
          ← Moje školení
        </Link>
      </PageHero>

      <Section>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <LmsLoginForm redirectTo={redirectTo} />
            <div className="mt-4 space-y-2 text-center text-sm text-muted">
              <p>
                Nemáte přihlašovací údaje?{" "}
                <Link href="/objednavka" className="font-semibold text-brand-dark hover:underline">
                  Objednejte školení
                </Link>{" "}
                a přístup obdržíte e-mailem.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
