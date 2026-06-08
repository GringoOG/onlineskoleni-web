import catalogData from "../../content/order-catalog.json";

export interface OrderCatalogItem {
  courseSlug: string;
  name: string;
  pricePerPersonHalere: number;
  vatRate: number;
  bundleCourses?: string[];
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

export function getBulkDiscountPercent(
  quantity: number
): number | "contact" {
  if (quantity >= 100) return "contact";
  if (quantity >= 50) return 15;
  if (quantity >= 10) return 10;
  return 0;
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
  discountPercent: number;
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
    if (line.quantity < 1 || line.quantity > 99) {
      return { error: "Neplatný počet zaměstnanců (1–99). Pro 100+ osob nás kontaktujte." };
    }

    const discount = getBulkDiscountPercent(line.quantity);
    if (discount === "contact") {
      return {
        error:
          "Pro 100 a více osob u jednoho kurzu nebo balíčku nás prosím kontaktujte pro individuální nabídku.",
      };
    }

    const catalog = getCatalogItem(line.courseSlug);
    if (!catalog) {
      return { error: `Neznámý kurz: ${line.courseSlug}` };
    }

    const unitPriceHalere = Math.round(
      (catalog.pricePerPersonHalere * (100 - discount)) / 100
    );
    const lineTotalHalere = unitPriceHalere * line.quantity;

    items.push({
      courseSlug: catalog.courseSlug,
      name: catalog.name,
      quantity: line.quantity,
      unitPriceHalere,
      discountPercent: discount,
      lineTotalHalere,
      vatRate: catalog.vatRate,
    });
    totalAmountHalere += lineTotalHalere;
  }

  return { items, totalAmountHalere };
}

export interface OrderItemForEnrollment {
  courseSlug: string;
  name: string;
  quantity: number;
}

/** Rozbalí balíčky na jednotlivé kurzy pro přiřazení v LMS. */
export function expandOrderItemsForEnrollment(
  items: OrderItemForEnrollment[]
): OrderItemForEnrollment[] {
  const expanded: OrderItemForEnrollment[] = [];

  for (const item of items) {
    const catalog = getCatalogItem(item.courseSlug);
    if (catalog?.bundleCourses?.length) {
      for (const slug of catalog.bundleCourses) {
        const course = getCatalogItem(slug);
        expanded.push({
          courseSlug: slug,
          name: course?.name ?? slug,
          quantity: item.quantity,
        });
      }
      continue;
    }
    expanded.push(item);
  }

  return expanded;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `OS-${y}${m}${d}-${rand}`;
}
