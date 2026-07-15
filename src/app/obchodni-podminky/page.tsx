import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Obchodní podmínky",
  description:
    "Obchodní podmínky pro nákup online školení BOZP, PO a dalších kurzů na onlineskoleni.eu.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const effectiveDate = "7. 7. 2026";

  return (
    <>
      <PageHero
        title="Obchodní podmínky"
        subtitle={`Podmínky nákupu online školení prostřednictvím ${site.name} (účinné od ${effectiveDate}).`}
      />

      <Section>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Úvodní ustanovení</h2>
            <p className="mt-2">
              Tyto obchodní podmínky (dále jen „<strong>Podmínky</strong>“) upravují nákup a
              poskytování online školení prostřednictvím internetového portálu{" "}
              <strong>onlineskoleni.eu</strong> provozovaného společností{" "}
              <strong>{site.company}</strong>, se sídlem {site.address.street},{" "}
              {site.address.zip} {site.address.city}, IČO: {site.ico} (dále jen „
              <strong>poskytovatel</strong>“).
            </p>
            <p className="mt-2">
              Objednáním kurzu na webu objednatel potvrzuje, že se s těmito Podmínkami seznámil
              a souhlasí s nimi. Podmínky jsou dostupné trvale na adrese{" "}
              <Link href="/obchodni-podminky" className="link-brand">
                /obchodni-podminky
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Definice</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Objednatel</strong> – fyzická nebo právnická osoba, která uzavírá smlouvu
                o poskytnutí služby (typicky zaměstnavatel nebo jeho zástupce).
              </li>
              <li>
                <strong>Uživatel / účastník školení</strong> – zaměstnanec nebo jiná osoba, které
                objednatel zpřístupní online školení v systému LMS.
              </li>
              <li>
                <strong>Služba</strong> – online školení včetně studijních materiálů, testů a případně
                vystavení certifikátu po úspěšném absolvování, dle popisu konkrétního kurzu na webu.
              </li>
              <li>
                <strong>LMS</strong> – learning management systém dostupný na adrese webu pro
                absolvování školení.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Předmět smlouvy</h2>
            <p className="mt-2">
              Předmětem smlouvy je poskytnutí přístupu k online školení dle objednávky objednatele.
              Rozsah kurzu, délka platnosti certifikátu a požadavky na úspěšné dokončení jsou uvedeny
              u jednotlivých kurzů na webu a v systému LMS. Služba je digitální obsah poskytovaný
              distanční formou.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Objednávka a uzavření smlouvy</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Objednávku lze učinit vyplněním formuláře na stránce{" "}
                <Link href="/objednavka" className="link-brand">
                  Objednávka
                </Link>{" "}
                nebo dohodou s poskytovatelem (faktura, hotovost).
              </li>
              <li>
                Smlouva je uzavřena okamžikem přijetí objednávky poskytovatelem, a u platebních
                metod vyžadujících úhradu nejpozději okamžikem připsání platby na účet poskytovatele
                nebo potvrzení platby platební bránou.
              </li>
              <li>
                Poskytovatel si vyhrazuje právo objednávku odmítnout při zjevně chybné ceně, nedostupnosti
                služby nebo při podezření na zneužití.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Cena a platební podmínky</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Ceny jsou uvedeny v českých korunách včetně DPH (pokud je poskytovatel plátcem DPH)
                na stránce{" "}
                <Link href="/cenik" className="link-brand">
                  Ceník
                </Link>{" "}
                a v objednávkovém formuláři. Případné slevy za větší počet účastníků se počítají
                automaticky dle aktuálního ceníku.
              </li>
              <li>
                Platbu lze provést online platební bránou GoPay (platební karta, online bankovní
                převod), bankovním převodem na základě QR kódu / platebních údajů, nebo dle
                dohody fakturou či hotově.
              </li>
              <li>
                Daňový doklad (faktura) je vystaven dle údajů uvedených v objednávce a zaslán
                objednateli e-mailem, pokud není dohodnuto jinak.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Dodání služby</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Po zaplacení (nebo po dohodě o aktivaci u faktury) poskytovatel zpřístupní kurz
                v systému LMS a zašle objednateli nebo účastníkům přihlašovací údaje na e-mail
                uvedený v objednávce.
              </li>
              <li>
                Objednatel je povinen zajistit, aby účastníci školení obdrželi přístupové údaje a
                mohli školení absolvovat v souladu se zákonem a interními předpisy zaměstnavatele.
              </li>
              <li>
                Služba je považována za dodanou zpřístupněním kurzu v LMS a odesláním přihlašovacích
                údajů, nikoli fyzickým doručením zboží.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Certifikát</h2>
            <p className="mt-2">
              Po úspěšném absolvování závěrečného testu dle podmínek kurzu může být účastníkovi
              vystaven elektronický certifikát ke stažení v LMS. Platnost certifikátu je uvedena
              u konkrétního kurzu: u BOZP a požární ochrany 2 roky pro zaměstnance a 3 roky pro
              vedoucí, u ostatních kurzů standardně 1 rok od vystavení, pokud není uvedeno jinak.
              Certifikát nenahrazuje odbornou způsobilost tam, kde ji zákon vyžaduje formou
              prezenčního školení — objednatel odpovídá za volbu vhodné formy školení.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Odstoupení od smlouvy a storno
            </h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Objednatel–spotřebitel má právo odstoupit od smlouvy do 14 dnů od jejího uzavření,
                pokud zákon nestanoví jinak.
              </li>
              <li>
                U digitálního obsahu, který není dodán na hmotném nosiči, spotřebitel výslovně
                souhlasí s tím, že poskytovatel může službu splnit před uplynutím lhůty pro
                odstoupení. Po zahájení plnění (zpřístupnění kurzu v LMS) zaniká právo na
                odstoupení, pokud to zákon umožňuje a spotřebitel byl o tom poučen.
              </li>
              <li>
                U objednávek právnických osob a podnikatelů se uplatní dohodnuté podmínky; odstoupení
                bez zákonného důvodu není možné po zpřístupnění služby.
              </li>
              <li>
                Žádosti o storno před aktivací kurzu řeší poskytovatel individuálně na{" "}
                <a href={`mailto:${site.email}`} className="link-brand">
                  {site.email}
                </a>
                .
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Reklamace</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Objednatel má právo uplatnit reklamaci vady služby bez zbytečného odkladu po jejím
                zjištění, nejpozději do 12 měsíců od převzetí služby.
              </li>
              <li>
                Reklamaci uplatněte e-mailem na{" "}
                <a href={`mailto:${site.email}`} className="link-brand">
                  {site.email}
                </a>{" "}
                s popisem vady, číslem objednávky a kontaktními údaji. Poskytovatel vyřídí reklamaci
                bez zbytečného odkladu, nejpozději do 30 dnů.
              </li>
              <li>
                Případná oprávněná sleva nebo vrácení části ceny proběhne na bankovní účet objednatele,
                pokud nebude dohodnuto jinak.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">10. Práva a povinnosti stran</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Objednatel odpovídá za správnost údajů v objednávce a za ochranu přihlašovacích údajů
                účastníků.
              </li>
              <li>
                Účastník nesmí sdílet přístupové údaje s třetími osobami ani kopírovat studijní
                materiály mimo oprávněné použití.
              </li>
              <li>
                Poskytovatel může dočasně omezit přístup při údržbě systému nebo při porušení
                Podmínek; o plánované odstávce informuje přiměřeným způsobem.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">11. Duševní vlastnictví</h2>
            <p className="mt-2">
              Veškerý obsah kurzů, testů, grafiky a software LMS je chráněn autorským právem.
              Objednateli a účastníkům je udělena pouze nevýhradní licence k užití pro účely
              absolvování školení v rámci jejich pracovněprávního nebo smluvního vztahu.
              Jakékoliv šíření, kopírování nebo zpřístupnění třetím osobám bez souhlasu
              poskytovatele je zakázáno.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">12. Ochrana osobních údajů</h2>
            <p className="mt-2">
              Zpracování osobních údajů se řídí dokumentem{" "}
              <Link href="/ochrana-udaju" className="link-brand">
                Ochrana osobních údajů
              </Link>
              . Objednáním služby objednatel potvrzuje, že má oprávnění předat údaje účastníků
              školení, pokud se jejich jména a e-maily zadávají do systému.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">13. Mimosmluvní ujednání</h2>
            <p className="mt-2">
              Poskytovatel nenese odpovědnost za škody vzniklé v důsledku nesprávného použití
              systému, výpadku internetového připojení na straně objednatele nebo za škody
              způsobené vyšší mocí. Odpovědnost poskytovatele za škodu na majetku je omezena
              do výše ceny příslušné objednávky, pokud zákon nepřipouští jinak.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">14. Závěrečná ustanovení</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Tyto Podmínky se řídí právním řádem České republiky. Spory se strany pokusí řešit
                smírně; příslušné jsou soudy České republiky dle sídla poskytovatele.
              </li>
              <li>
                Poskytovatel je oprávněn Podmínky jednostranně aktualizovat. Nové znění zveřejní na
                webu s uvedením data účinnosti; u již uzavřených smluv platí podmínky účinné
                v okamžiku objednávky, pokud zákon nestanoví jinak.
              </li>
              <li>
                Kontakt: {site.company}, {site.email}, tel. {site.phone}.
              </li>
            </ol>
          </section>
        </div>
      </Section>
    </>
  );
}
