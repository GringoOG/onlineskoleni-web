/**
 * Záložní pixel Google Ads konverze (když gtag event nedorazí do Ads).
 * Používá GET Image – sendBeacon dělá POST a Ads ho často nepočítá.
 * send_to formát: AW-XXXXXXXXX/LABEL
 */
export function sendGoogleAdsConversionPixel(input: {
  sendTo: string;
  value?: number;
  currency?: string;
  transactionId?: string;
}): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const match = input.sendTo.match(/^AW-(\d+)\/(.+)$/);
  if (!match) {
    return;
  }

  const [, conversionId, label] = match;
  const query = new URLSearchParams({
    label,
    guid: "ON",
    script: "0",
  });

  if (input.value !== undefined) {
    query.set("value", String(input.value));
  }
  if (input.currency) {
    query.set("currency_code", input.currency);
  }
  if (input.transactionId) {
    query.set("oid", input.transactionId);
  }

  const url = `https://www.googleadservices.com/pagead/conversion/${conversionId}/?${query.toString()}`;

  try {
    const img = new Image(1, 1);
    img.src = url;
  } catch {
    // ignore
  }
}
