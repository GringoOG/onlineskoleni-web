import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description:
    "Zásady zpracování osobních údajů na portálu onlineskoleni.eu provozovaném společností TechnikPO s.r.o.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const effectiveDate = "7. 7. 2026";

  return (
    <>
      <PageHero
        title="Ochrana osobních údajů"
        subtitle={`Informace o zpracování osobních údajů dle nařízení GDPR (účinné od ${effectiveDate}).`}
      />

      <Section>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Správce osobních údajů</h2>
            <p className="mt-2">
              Správcem osobních údajů je <strong>{site.company}</strong>, se sídlem{" "}
              {site.address.street}, {site.address.zip} {site.address.city}, IČO: {site.ico}{" "}
              (dále jen „<strong>správce</strong>“).
            </p>
            <p className="mt-2">
              Kontakt pro záležitosti ochrany osobních údajů:{" "}
              <a href={`mailto:${site.email}`} className="link-brand">
                {site.email}
              </a>
              , tel. {site.phone}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Jaké údaje zpracováváme</h2>
            <p className="mt-2">
              V závislosti na tom, jak web nebo službu využíváte, zpracováváme tyto kategorie
              údajů:
            </p>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              a) Návštěvníci webu
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>technické údaje o použití webu (IP adresa, typ prohlížeče, cookies)</li>
              <li>údaje z analytických a marketingových nástrojů (viz část o cookies)</li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              b) Kontaktní formulář
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>jméno a příjmení, e-mail, telefon a firma</li>
              <li>obsah zprávy a vybrané typy školení</li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              c) Objednatel kurzu (zaměstnavatel / kontaktní osoba)
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>název firmy, IČO (pokud je uvedeno) a jméno kontaktní osoby</li>
              <li>e-mail a telefon</li>
              <li>údaje o objednávce (kurzy, počet míst, cena, stav platby)</li>
              <li>fakturační a platební související údaje</li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              d) Účastník online školení (zaměstnanec)
            </h3>
            <p className="mt-2">
              Pro poskytnutí online školení v systému LMS zpracováváme údaje účastníků, které
              objednatel zadá nebo které vzniknou při používání služby:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>jméno a příjmení</li>
              <li>e-mail (slouží jako přihlašovací jméno)</li>
              <li>název firmy / zaměstnavatele</li>
              <li>průběh a výsledek školení a testu</li>
              <li>údaje o vystaveném certifikátu (datum, evidenční kód, název kurzu)</li>
            </ul>
            <p className="mt-2">
              <strong>
                E-mailové adresy účastníků školení tedy zpracováváme
              </strong>{" "}
              — zejména za účelem založení účtu, zaslání přihlašovacích údajů, absolvování
              kurzu a vystavení certifikátu. Objednatel je povinen údaje účastníků předat pouze
              pokud k tomu má oprávnění (typicky jako zaměstnavatel nebo na základě jejich
              poučení).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Účel a právní základ zpracování</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Vyřízení poptávky z kontaktního formuláře</strong> — odpověď na dotaz,
                příprava nabídky (oprávněný zájem správce / jednání před uzavřením smlouvy).
              </li>
              <li>
                <strong>Objednávka a plnění smlouvy</strong> — uzavření a plnění smlouvy o
                poskytnutí online školení, vystavení daňového dokladu, komunikace s objednatelem.
              </li>
              <li>
                <strong>Provoz LMS a certifikace</strong> — zpřístupnění kurzu, ověření
                znalostí, vystavení certifikátu, připomenutí expirace platnosti certifikátu
                (plnění smlouvy / oprávněný zájem).
              </li>
              <li>
                <strong>Platby</strong> — zpracování plateb prostřednictvím platební brány GoPay
                nebo bankovním převodem (plnění smlouvy, zákonné povinnosti).
              </li>
              <li>
                <strong>Účetnictví a archivace</strong> — plnění zákonných povinností správce.
              </li>
              <li>
                <strong>Analytika a měření návštěvnosti</strong> — zlepšování webu a měření
                účinnosti reklamy (oprávněný zájem / souhlas dle nastavení cookies).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Příjemci údajů</h2>
            <p className="mt-2">
              Osobní údaje mohou být zpřístupněny těmto kategoriím příjemců, a to pouze v rozsahu
              nezbytném pro daný účel:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>GoPay s.r.o.</strong> — zpracování online plateb (platební brána).
              </li>
              <li>
                <strong>Resend</strong> — doručování transakčních e-mailů (přístupové údaje,
                potvrzení objednávky).
              </li>
              <li>
                <strong>Vercel Inc.</strong> — hosting webové aplikace.
              </li>
              <li>
                <strong>Supabase</strong> — provoz databáze (objednávky, účty v LMS).
              </li>
              <li>
                <strong>Google Ireland Limited</strong> — Google Analytics a Google Ads (měření
                návštěvnosti a konverzí), pokud jsou aktivní.
              </li>
              <li>účetní a daňoví poradci správce</li>
              <li>orgány veřejné moci, pokud to vyžaduje zákon</li>
            </ul>
            <p className="mt-2">
              Někteří příjemci mohou zpracovávat údaje v zemích mimo EU/EHP. Přenos probíhá na
              základě standardních smluvních doložek nebo jiných záruk dle GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Doba uchování</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Kontaktní formulář:</strong> do vyřízení poptávky, nejdéle 3 roky od
                poslední komunikace.
              </li>
              <li>
                <strong>Objednávky a faktury:</strong> po dobu stanovenou účetními a daňovými
                předpisy (typicky 5–10 let).
              </li>
              <li>
                <strong>Účet a průběh školení v LMS:</strong> po dobu trvání smluvního vztahu a
                následně po dobu nutnou pro prokázání absolvování školení a vystavení
                certifikátu, obvykle po dobu platnosti certifikátu a následující archivační
                lhůtu.
              </li>
              <li>
                <strong>Cookies:</strong> dle typu cookie, nejdéle 24 měsíců, pokud zákon
                nestanoví jinak.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Vaše práva</h2>
            <p className="mt-2">Subjekt údajů má právo:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>na přístup ke svým osobním údajům</li>
              <li>na opravu nebo doplnění údajů</li>
              <li>na výmaz („být zapomenut“), pokud pro to existují zákonné podmínky</li>
              <li>na omezení zpracování</li>
              <li>na přenositelnost údajů</li>
              <li>vznést námitku proti zpracování na základě oprávněného zájmu</li>
              <li>podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz)</li>
            </ul>
            <p className="mt-2">
              Žádosti o uplatnění práv zasílejte na{" "}
              <a href={`mailto:${site.email}`} className="link-brand">
                {site.email}
              </a>
              . U údajů účastníků školení může žádost podat i objednatel, pokud k tomu má
              oprávnění.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Cookies a online měření</h2>
            <p className="mt-2">
              Web používá cookies a podobné technologie pro zajištění funkčnosti a pro měření
              návštěvnosti:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Nezbytné / preferenční</strong> — např. uložení informace o souhlasu s
                cookies v prohlížeči (localStorage).
              </li>
              <li>
                <strong>Analytické</strong> — Google Analytics 4 (ID měření G-E51MX7EQNW).
              </li>
              <li>
                <strong>Marketingové</strong> — Google Ads (měření konverzí objednávek a
                kontaktního formuláře).
              </li>
            </ul>
            <p className="mt-2">
              Podrobnosti o používání cookies a možnostech jejich správy naleznete v nastavení
              svého prohlížeče. Analytické a marketingové nástroje lze blokovat rozšířeními
              prohlížeče nebo nastavením cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Zabezpečení údajů</h2>
            <p className="mt-2">
              Správce přijímá přiměřená technická a organizační opatření k ochraně osobních údajů
              (šifrované připojení HTTPS, přístupová hesla, omezení přístupu k administraci).
              Přihlašovací údaje do LMS jsou uchovávány v zabezpečené podobě.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Související dokumenty</h2>
            <p className="mt-2">
              Objednáním služby se řídíte také{" "}
              <Link href="/obchodni-podminky" className="link-brand">
                obchodními podmínkami
              </Link>
              . Objednatel odpovídá za to, že má právní titul pro předání údajů účastníků
              školení správci.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
