const prisma = require('../lib/prisma');

async function getPurchaseHistory(userId, { page = 1, pageSize = 20 } = {}) {
  if (!prisma) {
    const error = new Error('Database is not configured.');
    error.statusCode = 503;
    throw error;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const where = { userId };
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: { items: { include: { ticketType: true, tickets: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, page: safePage, pageSize: safePageSize, total };
}

module.exports = { getPurchaseHistory };