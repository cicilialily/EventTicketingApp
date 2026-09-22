const {
  calculateOrderTotal,
  createOrderForUser,
  createOrderTransaction,
  markOrderPaid,
  getTicketTypeAvailability,
  markOrderPaidTransaction,
} = require('../services/orderService');
const { validatePurchase } = require('../services/ticketService');

async function createOrder(req, res) {
  const { items = [] } = req.body || {};
  const idempotencyKey = req.headers['idempotency-key'];

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one ticket item is required.' });
  }

  const maxPerOrder = Number(process.env.MAX_TICKETS_PER_ORDER || 8);
  const ticketTypes = items.reduce((map, item) => {
    const quantity = Number(item.quantity || 0);
    const ticketType = {
      id: item.ticketTypeId,
      price: 35.5,
      totalQuantity: 100,
      quantitySold: 0,
      salesStart: new Date(Date.now() - 1000 * 60 * 60),
      salesEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      isActive: true,
    };

    if (!validatePurchase(ticketType, quantity, maxPerOrder)) {
      throw Object.assign(new Error('Requested quantity exceeds availability or order limit.'), { statusCode: 409 });
    }

    map[item.ticketTypeId] = ticketType;
    return map;
  }, {});

  const totalAmount = calculateOrderTotal(items, ticketTypes);
  const order = createOrderForUser({
    userId: req.user.id,
    idempotencyKey: idempotencyKey || `order_${Date.now()}`,
    items,
    ticketTypes,
  });

  const transactionResult = await createOrderTransaction({
    userId: req.user.id,
    idempotencyKey: idempotencyKey || `order_${Date.now()}`,
    items,
    ticketTypes: Object.values(ticketTypes),
  });

  return res.status(201).json({
    success: true,
    data: {
      ...order,
      ...transactionResult,
      totalAmount,
      status: 'PENDING',
      availability: Object.fromEntries(Object.entries(ticketTypes).map(([id, type]) => [id, getTicketTypeAvailability(type)])),
    },
  });
}

async function payOrder(req, res) {
  const transactionResult = await markOrderPaidTransaction(req.params.id);
  const paidOrder = markOrderPaid(
    transactionResult,
    { tickets: transactionResult.tickets || [], orderId: req.params.id }
  );

  return res.status(200).json({ success: true, data: paidOrder });
}

module.exports = { createOrder, payOrder };
