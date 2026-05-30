import { Currency, createGoPayClient, type GoPayClient } from "gopay-sdk";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Chybí proměnná prostředí ${name}. Nastavte ji v .env (viz .env.example).`);
  }
  return value;
}

export function isGoPayConfigured(): boolean {
  return Boolean(
    process.env.GOPAY_GOID &&
      process.env.GOPAY_CLIENT_ID &&
      process.env.GOPAY_CLIENT_SECRET &&
      process.env.GOPAY_GATEWAY_URL
  );
}

export function getGoPayClient(): GoPayClient {
  return createGoPayClient({
    goid: Number(requireEnv("GOPAY_GOID")),
    clientId: requireEnv("GOPAY_CLIENT_ID"),
    clientSecret: requireEnv("GOPAY_CLIENT_SECRET"),
    gatewayUrl: requireEnv("GOPAY_GATEWAY_URL"),
  });
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export { Currency };
