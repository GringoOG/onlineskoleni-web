import { pages } from "@/lib/content";

export interface QrPaymentConfig {
  accountNumber: string;
  bankCode: string;
  accountLabel: string;
  accountHolder: string;
  iban: string;
}

/** Údaje pro QR platbu (SPAYD) – TechnikPO s.r.o. */
export function getQrPaymentConfig(): QrPaymentConfig {
  const { accountNumber, bankCode, accountLabel, accountHolder } = pages.qrPayment;

  return {
    accountNumber,
    bankCode,
    accountLabel,
    accountHolder,
    iban: czechAccountToIban(accountNumber, bankCode),
  };
}

/** Převod českého účtu (číslo/banka) na IBAN. */
export function czechAccountToIban(
  accountNumber: string,
  bankCode: string,
  prefix = "000000"
): string {
  const account = accountNumber.replace(/\s/g, "").padStart(10, "0");
  const bank = bankCode.replace(/\s/g, "").padStart(4, "0");
  const accountPrefix = prefix.replace(/\s/g, "").padStart(6, "0");
  const bban = `${bank}${accountPrefix}${account}`;

  const rearranged = `${bban}123500`;
  let remainder = 0;
  for (const digit of rearranged) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  const checkDigits = String(98 - remainder).padStart(2, "0");

  return `CZ${checkDigits}${bban}`;
}

export interface SpaydPaymentInput {
  amountHalere: number;
  variableSymbol: string;
  message: string;
  recipientName?: string;
}

/** Sestaví řetězec SPAYD pro QR platbu dle českého standardu. */
export function buildSpaydString(
  config: QrPaymentConfig,
  input: SpaydPaymentInput
): string {
  const amount = (input.amountHalere / 100).toFixed(2);
  const parts = [
    "SPD*1.0",
    `ACC:${config.iban}`,
    `AM:${amount}`,
    "CC:CZK",
    `MSG:${escapeSpaydValue(input.message)}`,
    `RN:${escapeSpaydValue(input.recipientName ?? config.accountHolder)}`,
    `X-VS:${input.variableSymbol.replace(/\D/g, "").slice(0, 10)}`,
  ];

  return parts.join("*");
}

function escapeSpaydValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "%2A")
    .replace(/%/g, "%25")
    .slice(0, 60);
}

/** Stabilní variabilní symbol z čísla objednávky (max. 10 číslic). */
export function orderNumberToVariableSymbol(orderNumber: string): string {
  const match = orderNumber.match(/OS-(\d{8})-([A-Z0-9]+)/i);
  if (!match) {
    return String(Date.now()).slice(-10);
  }

  const datePart = match[1];
  const suffixHash = match[2]
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return `${datePart}${String(suffixHash % 10000).padStart(4, "0")}`.slice(0, 10);
}
