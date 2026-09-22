const test = require('node:test');
const assert = require('node:assert/strict');

const { signQrPayload, verifyQrPayload } = require('../../src/services/qrService');

test('QR payload signing produces tamper-evident payloads', () => {
  const payload = { ticketId: 'ticket_123', eventId: 'event_456', exp: Math.floor(Date.now() / 1000) + 3600 };
  const signed = signQrPayload(payload);

  assert.equal(typeof signed, 'string');
  assert.equal(verifyQrPayload(signed), true);

  const altered = signed.slice(0, -1) + (signed.at(-1) === 'A' ? 'B' : 'A');
  assert.equal(verifyQrPayload(altered), false);
});
