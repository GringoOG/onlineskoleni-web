# GoPay – testovací integrace (onlineskoleni.eu)

EVC: **1672149259** (uvádět v předmětu e-mailů na GoPay)

## Stav kódu

Integrace je hotová:
- vytvoření platby: `POST /api/gopay/create-payment`
- notifikace: `GET /api/gopay/webhook?id=…` (GoPay volá sám)
- návrat zákazníka: `/objednavka/dekujeme?order=…`
- kontrola env: `GET /api/gopay/status`

Notifikační URL pro GoPay:

```text
https://www.onlineskoleni.eu/api/gopay/webhook
```

## 1. Nastavit proměnné na Vercelu (Production)

Vercel → projekt → **Settings → Environment Variables** (Environment: Production):

| Proměnná | Hodnota z e-mailu GoPay |
|----------|-------------------------|
| `GOPAY_GOID` | Test GoID |
| `GOPAY_CLIENT_ID` | Test ClientID |
| `GOPAY_CLIENT_SECRET` | Test ClientSecret |
| `GOPAY_GATEWAY_URL` | `https://gw.sandbox.gopay.com/api` |
| `NEXT_PUBLIC_APP_URL` | `https://www.onlineskoleni.eu` |

**Nedávejte do gitu.** Test uživatelské jméno/heslo a Shareable Key jsou jen pro přihlášení do GoPay sandbox účtu, ne do webu.

Po uložení: **Redeploy** Production.

Ověření: otevřít  
https://www.onlineskoleni.eu/api/gopay/status  
→ `"configured": true`, `"environment": "sandbox"`.

## 2. Testovací platby

1. Přihlášení do sandbox účtu (odkaz z e-mailu GoPay + test user/heslo).
2. Na webu: https://www.onlineskoleni.eu/objednavka → platba kartou/GoPay (sandbox brána).
3. Projít scénáře z nápovědy GoPay „Provádění plateb v testovacím prostředí“:
   - úspěšná platba → objednávka `PAID`, přístupové e-maily
   - zamítnutá / zrušená platba → stav není PAID
4. V adminu objednávek zkontrolovat stav platby.

## 3. Odpověď GoPay (až testy projdou)

Na `integrace@gopay.cz`, předmět např. `EVC 1672149259 – testy hotové`:

- notifikační URL: `https://www.onlineskoleni.eu/api/gopay/webhook`
- testovací platby provedeny
- prosba o přepnutí / vydání produkčních údajů

## 4. Ostrý provoz (až GoPay pošle produkci)

Na Vercelu nahradit:

- produkční GoID / ClientID / ClientSecret
- `GOPAY_GATEWAY_URL=https://gateway.gopay.com/api`

Znovu redeploy. Status endpoint musí hlásit `"environment": "production"`.

## Poznámka během sandboxu na www

Dokud běží sandbox credentials na produkční doméně, **reálné platby kartou neberte** (QR převod funguje dál). Po přepnutí na produkční údaje je karta v pořádku.
