const crypto = require('crypto');

const DEFAULT_SECRET = process.env.QR_SIGNING_SECRET || 'development-secret-change-me';

function createSignature(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function signPayload(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createSignature(DEFAULT_SECRET, body);
  return `${body}.${sig}`;
}

function verifyPayload(token) {
  if (!token || typeof token !== 'string') return false;
  const [body, signature] = token.split('.');
  if (!body || !signature) return false;
  const expected = createSignature(DEFAULT_SECRET, body);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

module.exports = { signPayload, verifyPayload };
