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

Integrace je v kódu hotová. Postup pro **testovací údaje z e-mailu GoPay** (sandbox → produkce): viz [`docs/gopay-test.md`](docs/gopay-test.md).

1. Na Vercelu nastavte `GOPAY_GOID`, `GOPAY_CLIENT_ID`, `GOPAY_CLIENT_SECRET`, `GOPAY_GATEWAY_URL` a `NEXT_PUBLIC_APP_URL` (viz `.env.example`).
2. Redeploy a ověřte `GET /api/gopay/status` → `configured: true`.
3. Testovací objednávka: `/objednavka` → platba GoPay.
4. Notifikační URL (už v kódu): `{NEXT_PUBLIC_APP_URL}/api/gopay/webhook`

```env
GOPAY_GOID=…
GOPAY_CLIENT_ID=…
GOPAY_CLIENT_SECRET=…
GOPAY_GATEWAY_URL=https://gw.sandbox.gopay.com/api
NEXT_PUBLIC_APP_URL=https://www.onlineskoleni.eu
```

Lokálně: zkopírujte `.env.example` → `.env`, `npm run db:push`, `npm run dev`.

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
