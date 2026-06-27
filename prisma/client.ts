import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";
import { config } from "../lib/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = config.db.url;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString,
});

// Configure Prisma 7.x Driver Adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: !config.isProduction ? ["error", "warn"] : ["error"],
  });

if (!config.isProduction) globalForPrisma.prisma = prisma;
