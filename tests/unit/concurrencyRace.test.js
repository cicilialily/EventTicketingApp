const test = require('node:test');
const assert = require('node:assert/strict');

const { canReserveQuantity } = require('../../src/services/ticketService');

test('canReserveQuantity blocks oversell when demand exceeds remaining stock', () => {
  const stock = { totalQuantity: 10, quantitySold: 8 };

  assert.equal(canReserveQuantity(stock, 2), true);
  assert.equal(canReserveQuantity(stock, 3), false);
});
