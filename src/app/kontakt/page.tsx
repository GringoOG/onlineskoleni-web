import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Kontaktujte ${site.name} – objednávka školení BOZP, PO a dalších kurzů.`,
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        title="Kontakt"
        subtitle="Napište nám jména zaměstnanců a druh školení – zašleme přihlašovací údaje."
      />

      <Section>
        <SubstituteFulfillmentBanner variant="full" />
      </Section>

      <Section id="kontaktni-formular" className="scroll-mt-24">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">{site.company}</h2>
            <address className="mt-4 not-italic text-slate-600">
              <p>{site.address.street}</p>
              <p>
                {site.address.zip} {site.address.city}
              </p>
              <p className="mt-2">IČO: {site.ico}</p>
            </address>
            <ul className="mt-6 space-y-3">
              <li>
                <span className="text-sm text-slate-500">E-mail</span>
                <br />
                <a
                  href={`mailto:${site.email}`}
                  className="link-brand"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <span className="text-sm text-slate-500">Telefon</span>
                <br />
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="link-brand"
                >
                  {site.phone}
                </a>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <h2 className="text-lg font-bold text-slate-900">Napište nám</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
