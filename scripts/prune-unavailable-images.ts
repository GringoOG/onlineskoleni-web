import "dotenv/config";
import { pruneUnavailableCompletedImages } from "../src/lib/admin/image-generator/prune-unavailable-images";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await pruneUnavailableCompletedImages();
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
