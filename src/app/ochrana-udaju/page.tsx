import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: "Zásady zpracování osobních údajů na webu OnlineŠkolení.cz.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Ochrana osobních údajů"
        subtitle="Informace o zpracování osobních údajů dle GDPR (šablona k doplnění)."
      />

      <Section>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">Správce údajů</h2>
            <p className="mt-2">
              {site.company}, {site.address.street}, {site.address.zip}{" "}
              {site.address.city}, IČO: {site.ico}
              <br />
              E-mail: {site.email}, tel.: {site.phone}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Účel zpracování</h2>
            <p className="mt-2">
              Osobní údaje z kontaktního formuláře zpracováváme za účelem vyřízení
              vaší poptávky školení a komunikace s objednatelem kurzu. E-mailové
              adresy zaměstnanců neshromažďujeme – komunikujeme pouze s objednatelem.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Rozsah údajů</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Jméno a příjmení, firma, e-mail, telefon</li>
              <li>Obsah zprávy a vybrané typy školení</li>
              <li>Technické údaje (cookies) nezbytné pro provoz webu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Doba uchování</h2>
            <p className="mt-2">
              Údaje uchováváme po dobu nezbytnou pro vyřízení poptávky a plnění
              zákonných povinností, nejdéle 3 roky od poslední komunikace, pokud
              zákon nestanoví jinak.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Vaše práva</h2>
            <p className="mt-2">
              Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost
              údajů a podání stížnosti u ÚOOÚ. Žádosti směřujte na {site.email}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Cookies</h2>
            <p className="mt-2">
              Web používá pouze nezbytné cookies (např. souhlas s cookies uložený v
              localStorage). Analytické cookies nepoužíváme, pokud nejsou výslovně
              aktivovány.
            </p>
          </section>

          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Tento text je orientační šablona. Před publikací doporučujeme konzultaci
            s právníkem pro finální znění dle skutečných procesů zpracování údajů.
          </p>
        </div>
      </Section>
    </>
  );
}
