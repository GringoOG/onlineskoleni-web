# Jak poslat ukázku webu klientovi

## 1. Vercel (doporučeno – veřejná HTTPS adresa)

Nejjednodušší způsob, jak poslat klientovi odkaz typu `https://onlineskoleni-preview.vercel.app`.

### Postup

1. Účet na [vercel.com](https://vercel.com) (zdarma).
2. Nahrajte projekt:
   - **GitHub:** repozitář → Import v Vercelu, nebo
   - **CLI:** `npx vercel` ve složce projektu (postupujte podle dotazů).
3. V **Environment Variables** na Vercelu nastavte minimálně:
   - `NEXT_PUBLIC_APP_URL` = `https://vase-url.vercel.app`
   - `DATABASE_URL` = connection string z [Neon](https://neon.tech) (PostgreSQL, free tier)  
     Pro ukázku **designu** stačí nasadit i bez DB – fungují všechny stránky kromě objednávky/platby.
4. Po deployi pošlete klientovi odkaz z Vercelu.

### Poznámka k databázi

Lokálně používáte SQLite (`file:./dev.db`). Na Vercelu SQLite nefunguje – pro **objednávku a GoPay** potřebujete PostgreSQL (např. Neon) a v `prisma/schema.prisma` změnit `provider` na `postgresql`.

Pro **čistou ukázku vzhledu** (úvod, školení, ceník, kontakt) deploy bez DB stačí.

### LMS tabulky (Drizzle → PostgreSQL)

LMS používá **samostatnou** proměnnou `LMS_DATABASE_URL` (Supabase nebo Neon). Prisma `DATABASE_URL` může zůstat SQLite lokálně.

1. Vytvořte projekt na [Neon](https://neon.tech) nebo [Supabase](https://supabase.com).
2. Zkopírujte **PostgreSQL connection string** (URI):
   - **Neon:** Dashboard → Connect → connection string
   - **Supabase:** Project Settings → Database → URI (Transaction pooler pro serverless)
3. Do `.env` přidejte:

   ```env
   LMS_DATABASE_URL="postgresql://user:password@host:5432/postgres?sslmode=require"
   ```

4. Vytvořte tabulky:

   ```bash
   npm run db:lms:push
   ```

5. Na Vercelu přidejte stejnou proměnnou `LMS_DATABASE_URL` a redeploy.

Pravidla závěrečného testu: **10 otázek**, úspěch od **8 správných (80 %)** – viz `src/lib/lms/quiz-config.ts`.

---

## 2. Dočasný odkaz z vašeho počítače (tunel)

Pokud nechcete hned nasazovat na Vercel:

```bash
cd onlineskoleni-web
npm run preview
# v druhém terminálu:
npx localtunnel --port 3000
```

Dostanete adresu typu `https://xxx.loca.lt` – tu pošlete klientovi (počítač musí běžet).

Alternativa: [ngrok](https://ngrok.com) – `ngrok http 3000`.

---

## 3. Lokální náhled u vás

```bash
npm run preview
```

Otevřete **http://127.0.0.1:3000** (ne vždy `localhost`).

Pokud port 3000 nefunguje:

```bash
kill -9 $(lsof -t -i :3000) 2>/dev/null
npm run preview
```

---

## 4. PDF / screenshoty

Pro rychlou prezentaci bez techniky: screenshoty hlavních stránek nebo export do PDF z prohlížeče.

---

## Co klient uvidí vs. co ještě není hotové

| Funkce | Stav |
|--------|------|
| Marketingové stránky, nový design, logo | Hotovo |
| Objednávka + GoPay | Hotovo (vyžaduje credentials + DB na serveru) |
| LMS (přihlášení, kurzy, testy) | Připravujeme – tlačítko „Přihlásit se“ je zatím informační |
| Certifikáty po testu | Další fáze |
