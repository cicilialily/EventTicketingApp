let prisma;

try {
  if (!process.env.DATABASE_URL) {
    module.exports = null;
    return;
  }

  const { PrismaClient } = require('@prisma/client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  prisma = new PrismaClient({ adapter });
} catch (error) {
  prisma = null;
}

module.exports = prisma;
