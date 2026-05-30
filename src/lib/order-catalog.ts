import catalogData from "../../content/order-catalog.json";

export interface OrderCatalogItem {
  courseSlug: string;
  name: string;
  pricePerPersonHalere: number;
  vatRate: number;
}

export const orderCatalog = catalogData as OrderCatalogItem[];

export function getCatalogItem(courseSlug: string): OrderCatalogItem | undefined {
  return orderCatalog.find((item) => item.courseSlug === courseSlug);
}

export function formatPriceFromHalere(halere: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(halere / 100);
}

export interface CartLineInput {
  courseSlug: string;
  quantity: number;
}

export interface ComputedCartLine {
  courseSlug: string;
  name: string;
  quantity: number;
  unitPriceHalere: number;
  lineTotalHalere: number;
  vatRate: number;
}

export function computeCart(lines: CartLineInput[]): {
  items: ComputedCartLine[];
  totalAmountHalere: number;
} | { error: string } {
  if (lines.length === 0) {
    return { error: "Vyberte alespoň jeden kurz." };
  }

  const items: ComputedCartLine[] = [];
  let totalAmountHalere = 0;

  for (const line of lines) {
    if (line.quantity < 1 || line.quantity > 500) {
      return { error: "Neplatný počet zaměstnanců (1–500)." };
    }
    const catalog = getCatalogItem(line.courseSlug);
    if (!catalog) {
      return { error: `Neznámý kurz: ${line.courseSlug}` };
    }
    const lineTotalHalere = catalog.pricePerPersonHalere * line.quantity;
    items.push({
      courseSlug: catalog.courseSlug,
      name: catalog.name,
      quantity: line.quantity,
      unitPriceHalere: catalog.pricePerPersonHalere,
      lineTotalHalere,
      vatRate: catalog.vatRate,
    });
    totalAmountHalere += lineTotalHalere;
  }

  return { items, totalAmountHalere };
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `OS-${y}${m}${d}-${rand}`;
}
