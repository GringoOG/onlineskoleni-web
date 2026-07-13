import catalogData from "../../content/order-catalog.json";

export type CatalogAudience = "zamestnanec" | "vedouci";

export interface OrderCatalogItem {
  courseSlug: string;
  name: string;
  pricePerPersonHalere: number;
  vatRate: number;
  bundleCourses?: string[];
  /** LMS kurz (např. pozarni); výchozí = courseSlug. */
  lmsCourseSlug?: string;
  /** Typ školení z nabídky – určuje test i platnost certifikátu. */
  audience?: CatalogAudience;
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

export interface ComputeCartOptions {
  /** Přepíše automatickou množstevní slevu (0, 10, 15). */
  discountPercentOverride?: number;
}

export function computeCart(
  lines: CartLineInput[],
  options?: ComputeCartOptions
): {
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

    let discountPercent: number;
    if (options?.discountPercentOverride !== undefined) {
      discountPercent = options.discountPercentOverride;
    } else {
      const discount = getBulkDiscountPercent(line.quantity);
      if (discount === "contact") {
        return {
          error:
            "Pro 100 a více osob u jednoho kurzu nebo balíčku nás prosím kontaktujte pro individuální nabídku.",
        };
      }
      discountPercent = discount;
    }

    const catalog = getCatalogItem(line.courseSlug);
    if (!catalog) {
      return { error: `Neznámý kurz: ${line.courseSlug}` };
    }

    const unitPriceHalere = Math.round(
      (catalog.pricePerPersonHalere * (100 - discountPercent)) / 100
    );
    const lineTotalHalere = unitPriceHalere * line.quantity;

    items.push({
      courseSlug: catalog.courseSlug,
      name: catalog.name,
      quantity: line.quantity,
      unitPriceHalere,
      discountPercent,
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
  audience?: CatalogAudience | null;
}

function toEnrollmentItem(
  catalog: OrderCatalogItem,
  quantity: number
): OrderItemForEnrollment {
  return {
    courseSlug: catalog.lmsCourseSlug ?? catalog.courseSlug,
    name: catalog.name,
    quantity,
    audience: catalog.audience ?? null,
  };
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
        if (course) {
          expanded.push(toEnrollmentItem(course, item.quantity));
        } else {
          expanded.push({
            courseSlug: slug,
            name: slug,
            quantity: item.quantity,
            audience: null,
          });
        }
      }
      continue;
    }

    if (catalog) {
      expanded.push(toEnrollmentItem(catalog, item.quantity));
      continue;
    }

    // Legacy objednávky se slugem „pozarni“ (před rozdělením nabídky).
    if (item.courseSlug === "pozarni") {
      expanded.push({
        courseSlug: "pozarni",
        name: item.name || "Požární ochrana (PO)",
        quantity: item.quantity,
        audience: item.audience ?? null,
      });
      continue;
    }

    expanded.push({
      courseSlug: item.courseSlug,
      name: item.name,
      quantity: item.quantity,
      audience: item.audience ?? null,
    });
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
