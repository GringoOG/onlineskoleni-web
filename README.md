# OnlineŠkolení.cz – marketingový web

Moderní marketingový web pro [OnlineŠkolení.cz](https://www.onlineskoleni.eu) postavený na Next.js.

## Spuštění (lokální náhled)

```bash
npm install
npm run db:push
npm run preview
```

Otevřete **[http://127.0.0.1:3000](http://127.0.0.1:3000)** (doporučeno místo `localhost`).

Vývoj s automatickým obnovením: `npm run dev` (stejná adresa).

**Ukázka pro klienta (veřejný odkaz):** viz [DEPLOY.md](./DEPLOY.md) – Vercel, tunel, screenshoty.

## Struktura

- `content/` – texty kurzů, stránek a ceníku (JSON)
- `src/app/` – stránky (App Router)
- `src/components/` – UI komponenty

## Stránky

| Cesta | Popis |
|-------|--------|
| `/` | Úvodní stránka |
| `/skoleni` | Přehled kurzů |
| `/skoleni/[slug]` | Detail kurzu (bozp, pozarni, ridici, ergonomie, gdpr) |
| `/sluzby` | Další služby |
| `/cenik` | Orientační ceník |
| `/kontakt` | Kontaktní formulář |
| `/ochrana-udaju` | GDPR šablona |

## GoPay – online platby

1. Získejte **sandbox** credentials v [GoPay](https://www.gopay.com/) (GOID, Client ID, Client Secret).
2. Zkopírujte `.env.example` → `.env` a vyplňte:

```env
GOPAY_GOID=8123456789
GOPAY_CLIENT_ID=...
GOPAY_CLIENT_SECRET=...
GOPAY_GATEWAY_URL=https://gw.sandbox.gopay.com/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

3. Inicializujte databázi: `npm run db:push`
4. Spusťte web: `npm run dev`
5. Objednávka: [http://localhost:3000/objednavka](http://localhost:3000/objednavka)

**Produkce:** `NEXT_PUBLIC_APP_URL` musí být HTTPS (např. `https://www.onlineskoleni.eu`). GoPay webhook: `/api/gopay/webhook`.

Ceny za osobu upravte v `content/order-catalog.json` (částka v **haléřích**, např. 199 Kč = `19900`).

## LMS (další fáze)

Po zaplacení se objednávka označí jako `PAID`. Přihlašovací údaje zaměstnanců a kurzy doplníme v další fázi.

## Nasazení

```bash
npm run build
npm start
```

Vhodné pro Vercel nebo vlastní Node hosting. Nastavte DNS domény `onlineskoleni.eu` na produkční server.

## Úprava obsahu

Upravte soubory v `content/courses.json`, `content/pages.json` a `content/pricing.json`.
