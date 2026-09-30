import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis;

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is missing from environment variables.');
    return null;
  }

  try {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    return null;
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;