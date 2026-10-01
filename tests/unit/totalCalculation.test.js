const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateOrderTotal } = require('../../src/services/orderService');

test('calculateOrderTotal sums item subtotals from server-side ticket prices', () => {
  const ticketTypes = {
    tt_1: { id: 'tt_1', price: 35.5 },
    tt_2: { id: 'tt_2', price: 50 },
  };

  const items = [
    { ticketTypeId: 'tt_1', quantity: 2 },
    { ticketTypeId: 'tt_2', quantity: 1 },
  ];

  const result = calculateOrderTotal(items, ticketTypes);

  assert.equal(result, 121);
});
