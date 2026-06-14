#!/usr/bin/env node
/**
 * Vytvoří / aktualizuje admin účty z env proměnných.
 * Usage: node scripts/seed-admin-users.mjs
 */

import { randomBytes, scrypt } from "node:crypto";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const scryptAsync = promisify(scrypt);

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional when vars are already exported
  }
}

async function hashAdminPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

loadEnvFile();

const prisma = new PrismaClient();

const usersToSeed = [
  {
    username: process.env.ADMIN_USERNAME?.trim() || "admin",
    password: process.env.ADMIN_PASSWORD?.trim(),
    role: "ADMIN",
    label: "ADMIN (plný přístup)",
  },
  {
    username: process.env.ADMIN_ORDERS_USERNAME?.trim(),
    password: process.env.ADMIN_ORDERS_PASSWORD?.trim(),
    role: "ORDERS_MANAGER",
    label: "ORDERS_MANAGER (manuální objednávky)",
  },
  {
    username: process.env.ADMIN_IMAGE_USERNAME?.trim(),
    password: process.env.ADMIN_IMAGE_PASSWORD?.trim(),
    role: "IMAGE_CREATOR",
    label: "IMAGE_CREATOR (generátor ilustrací)",
  },
];

async function upsertUser(username, password, role, label) {
  if (!username || !password) {
    console.log(`– Přeskočeno (${label}): chybí username nebo password v env`);
    return;
  }

  const passwordHash = await hashAdminPassword(password);

  await prisma.adminUser.upsert({
    where: { username },
    create: { username, passwordHash, role },
    update: { passwordHash, role },
  });

  console.log(`✓ ${label}: ${username}`);
}

async function main() {
  for (const user of usersToSeed) {
    await upsertUser(user.username, user.password, user.role, user.label);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
