# Objednávky a školení – příručka pro provozovatele

Krátký přehled, jak funguje web **onlineskoleni.eu**: automatické objednávky od zákazníků, ruční objednávky v administraci a kdy se lidem odesílají přístupy do školení.

---

## 1. Co zákazník dělá na webu (Objednat)

Na stránce **Objednat** zákazník:

1. Vidí informace o **firemních slevách**.
2. Zadá **účastníky** – jeden řádek = jedna osoba ve formátu  
   `Jméno Příjmení, email@firma.cz`
3. U více osob zvolí **ANO / NE** na otázku *„Mají všechny osoby stejné školení?“*  
   - **ANO** → jeden společný seznam kurzů pro všechny  
   - **NE** → u každé osoby kartička s vlastním výběrem kurzů
4. Vyplní **fakturační údaje** (firma, kontakt, e-mail…).
5. Zaplatí **GoPay** (karta / online převod) nebo **QR převodem**.

**Důležité:** Každý účastník potřebuje **vlastní e-mail**. Na ten e-mail pak přijde přihlášení ke školení. Fakturační e-mail slouží hlavně pro potvrzení objednávky, ne nutně jako LMS účet.

---

## 2. Kdy se odešlou přístupy do školení

| Způsob platby | Kdy účastníci dostanou e-mail s přístupem |
|---------------|-------------------------------------------|
| **GoPay** | **Hned** po úspěšné platbě |
| **QR převod** | Až v administraci označíte objednávku jako **Zaplaceno** |
| **Ruční objednávka** (admin) | Až v administraci označíte objednávku jako **Zaplaceno** |

Po odeslání přístupů:

- **Každý účastník** dostane e-mail se svým přihlášením a přiřazenými kurzy.
- **Fakturační / kontaktní e-mail** dostane potvrzení objednávky (bez hesel).

---

## 3. Jak pracovat s ruční objednávkou (admin)

Když firma volá / píše a nechce platit přes web:

1. V administraci otevřete **Nová objednávka** (manuální).
2. Vyplňte firmu a kontakt (e-mail kontaktu = kam půjde potvrzení).
3. Vložte účastníky stejně jako na webu (`Jméno Příjmení, email@…`).
4. U 2+ osob zvolte **ANO / NE** (stejná školení / různá).
5. Zaškrtněte kurzy, zvolte slevu a způsob platby (**Faktura** / **Hotově**).
6. Uložte objednávku → vznikne jako **Nezaplaceno**.
7. Až peníze dorazí (nebo hotovost přijmete), v seznamu objednávek klikněte **Zaplaceno**.  
   Tím se založí účty a **odešlou se přístupy** na e-maily účastníků.

Dokud neoznačíte **Zaplaceno**, účastníci přístup nedostanou.

---

## 4. QR platby – co dělat vy

1. Zákazník na webu vytvoří objednávku a dostane QR / údaje k převodu.
2. Objednávka čeká jako **Nezaplaceno**.
3. Až uvidíte platbu na účtu, v administraci ji označte **Zaplaceno**.
4. Systém pošle přístupy účastníkům (stejně jako u ruční objednávky).

---

## 5. Seznam objednávek v administraci

U každé objednávky můžete přepínat:

- **Zaplaceno** → spustí založení účtů LMS + odeslání uvítacích e-mailů (pokud ještě neproběhlo)
- **Nezaplaceno** → objednávka čeká na platbu

U QR a ručních objednávek se při označení zaplaceno může také odeslat měření nákupu (Google Ads / GA4).

---

## 6. Kurzy a ceny (základ)

- Ceny jsou **za osobu a kurz**, obvykle **bez DPH**.
- U BOZP a PO jsou varianty **zaměstnanec** a **vedoucí** (jiná cena, test, platnost certifikátu). V jedné objednávce mohou být obě.
- **Firemní slevy** (podle celkového počtu míst v objednávce):
  - 10–49 osob → **10 %**
  - 50–99 osob → **15 %**
  - 100+ osob → individuální nabídka (kontakt)

Přesný ceník je na webu / v sekci cen.

---

## 7. Co se stane po aktivaci (stručně)

1. Pro každého účastníka vznikne (nebo se najde) účet v LMS.
2. Přiřadí se mu kurzy, které byly v objednávce zaškrtnuté.
3. Odešle se e-mail s odkazem na přihlášení a heslem (u nového účtu).
4. Účastník se přihlásí, projde školení / test a může získat certifikát.

---

## 8. Časté situace

**Jedna firma, více lidí**  
Vložte více řádků se jmény a e-maily. Každý dostane vlastní přístup.

**Stejný kurz pro všechny**  
Zvolte **ANO** a zaškrtněte kurzy jednou.

**Různé kurzy (někdo zaměstnanec, někdo vedoucí)**  
Zvolte **NE** a u každé kartičky zaškrtněte správné kurzy.

**Zákazník zaplatil QR, ale přístupy nechodí**  
Zkontrolujte, zda je objednávka v adminu označená jako **Zaplaceno**.

**Ruční objednávka hned po uložení neposílá e-maily**  
To je správně. E-maily jdou až po **Zaplaceno**.

**Kontaktní e-mail = jeden z účastníků**  
Může. Pak ta osoba dostane jak potvrzení objednávky, tak přístup ke školení (dva typy zpráv).

---

## 9. Kam se dívat v praxi

| Potřeba | Kam |
|---------|-----|
| Zákazník si objednává sám | `/objednavka` |
| Ruční zápis objednávky | Admin → nová / manuální objednávka |
| Potvrdit platbu (QR / ruční) | Admin → seznam objednávek → **Zaplaceno** |
| Dotazy k nabídce 100+ osob | `info@onlineskoleni.eu` |

---

*Dokument popisuje chování webu po nastavení: GoPay hned po platbě; QR a ruční až po potvrzení v administraci.*
