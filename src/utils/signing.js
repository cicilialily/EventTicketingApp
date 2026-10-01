import crypto from 'crypto';

const DEFAULT_SECRET = process.env.QR_SIGNING_SECRET || 'development-secret-change-me';

function createSignature(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function signPayload(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createSignature(DEFAULT_SECRET, body);
  return `${body}.${sig}`;
}

export function verifyPayload(token) {
  if (!token || typeof token !== 'string') return false;

  const [body, signature] = token.split('.');
  if (!body || !signature) return false;

  const expected = createSignature(DEFAULT_SECRET, body);

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  // Buffer length check to prevent crypto.timingSafeEqual from throwing an unhandled exception
  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}