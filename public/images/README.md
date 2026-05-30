# Logo webu

## Jak vložit svůj přesný obrázek

1. Exportujte logo z Canva / Photoshop / Figma jako **PNG** (průhledné pozadí, pokud ho máte).
2. Soubor uložte sem jako:

   **`logo_bez_HRB.png`**

   (plná cesta: `onlineskoleni-web/public/images/logo.png`)

3. Obnovte stránku v prohlížeči (Ctrl+R / Cmd+R).

Hotovo – kód už načítá `/images/logo.png` automaticky.

## Jiný formát nebo název

- `logo.webp` / `logo.jpg` – změňte v `src/lib/brand.ts` řádek `LOGO_SRC`
- Nebo v `.env`: `NEXT_PUBLIC_LOGO_SRC=/images/vase-logo.png`

## Odstranění starého SVG

Soubor `logo.svg` můžete smazat, pokud používáte PNG.
