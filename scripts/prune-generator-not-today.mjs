#!/usr/bin/env node
/**
 * Smaže záznamy generátoru kromě těch vytvořených dnes (lokální čas serveru).
 * Použití: node scripts/prune-generator-not-today.mjs [--dry-run]
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function todayBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function main() {
  const { start, end } = todayBounds();

  const keepToday = await prisma.generatedImage.findMany({
    where: { createdAt: { gte: start, lt: end } },
    select: { id: true, fileName: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const processingToday = keepToday.filter((item) => item.status === "PROCESSING").length;

  const toDeleteWhere = {
    createdAt: { lt: start },
  };

  const toDeleteCount = await prisma.generatedImage.count({ where: toDeleteWhere });

  console.log(`Dnes (${start.toISOString().slice(0, 10)}): ponechat ${keepToday.length} záznamů`);
  if (processingToday > 0) {
    console.log(`  (včetně ${processingToday} právě generujících)`);
  }
  console.log(`Ke smazání: ${toDeleteCount} záznamů ze starších dnů`);

  if (dryRun) {
    const sample = await prisma.generatedImage.findMany({
      where: toDeleteWhere,
      select: { fileName: true, status: true, createdAt: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    console.log("Ukázka ke smazání:", sample);
    return;
  }

  const result = await prisma.generatedImage.deleteMany({ where: toDeleteWhere });

  const remaining = await prisma.generatedImage.count();
  console.log(`Smazáno: ${result.count}, zbývá: ${remaining}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
