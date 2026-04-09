import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);

  const artists = await prisma.topArtist.findMany();
  console.log("Artists:", artists);
}

main().then(() => process.exit(0));