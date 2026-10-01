const test = require('node:test');
const assert = require('node:assert/strict');

const { createOrderForUser, markOrderPaid } = require('../../src/services/orderService');
const { checkInTicket } = require('../../src/services/ticketService');
const { signQrPayload, verifyQrPayload } = require('../../src/services/qrService');

test('order creation, payment status update, ticket generation, and check-in flow work end-to-end', async () => {
  const ticketType = { id: 'tt_1', name: 'VIP', totalQuantity: 5, quantitySold: 0, price: 25, isActive: true, salesStart: new Date('2025-01-01'), salesEnd: new Date('2030-01-01') };
  const order = createOrderForUser({ userId: 'user_1', idempotencyKey: 'key_1', items: [{ ticketTypeId: 'tt_1', quantity: 2 }], ticketTypes: { tt_1: ticketType } });

  assert.equal(order.totalAmount, 50);
  assert.equal(order.status, 'PENDING');

  const paidOrder = markOrderPaid(order, { tickets: [{ id: 'ticket_1', eventId: 'event_1', status: 'VALID' }], orderId: order.id });
  assert.equal(paidOrder.status, 'PAID');

  const qrToken = signQrPayload({ ticketId: 'ticket_1', eventId: 'event_1', exp: Math.floor(Date.now() / 1000) + 3600 });
  assert.equal(verifyQrPayload(qrToken), true);

  const checkInResult = checkInTicket({ status: 'VALID', id: 'ticket_1' });
  assert.equal(checkInResult.status, 'USED');
});
