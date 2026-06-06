import QRCode from "qrcode";
import {
  buildSpaydString,
  getQrPaymentConfig,
  orderNumberToVariableSymbol,
  type QrPaymentConfig,
} from "@/lib/payment/czech-qr-payment";

export interface QrPaymentDetails {
  config: QrPaymentConfig;
  spayd: string;
  qrDataUrl: string;
  variableSymbol: string;
  amountHalere: number;
  message: string;
}

export async function buildQrPaymentDetails(input: {
  orderNumber: string;
  amountHalere: number;
  companyName?: string;
}): Promise<QrPaymentDetails> {
  const config = getQrPaymentConfig();
  const variableSymbol = orderNumberToVariableSymbol(input.orderNumber);
  const message = `Online skoleni ${input.orderNumber}`.slice(0, 60);

  const spayd = buildSpaydString(config, {
    amountHalere: input.amountHalere,
    variableSymbol,
    message,
    recipientName: config.accountHolder,
  });

  const qrDataUrl = await QRCode.toDataURL(spayd, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
  });

  return {
    config,
    spayd,
    qrDataUrl,
    variableSymbol,
    amountHalere: input.amountHalere,
    message,
  };
}
