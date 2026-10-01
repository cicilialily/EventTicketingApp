import QRCode from 'qrcode';
import { signPayload, verifyPayload } from '../utils/signing.js';

export function signQrPayload(payload) {
  return signPayload(payload);
}

export async function generateQrPng(token) {
  return QRCode.toBuffer(token, {
    type: 'png',
    margin: 1,
    width: 220,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

export function decodeQrPayload(token) {
  if (!token || typeof token !== 'string') return null;

  // 1. Signed JWT-style payload (contains dot)
  if (token.includes('.')) {
    try {
      const [body] = token.split('.');
      if (!body) return null;
      return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch (error) {
      return null;
    }
  }

  // 2. Legacy string format: "TICKET:TCK-1790805955216-3356:e6ca8bbd-0435-4012-8e4c-c7b7e0d3b5c3"
  if (token.startsWith('TICKET:TCK-')) {
    const parts = token.split(':');
    const ticketId = parts[2] || null; // Extract UUID if present at the end
    return {
      ticketId,
      rawToken: token,
      isLegacy: true,
    };
  }

  return null;
}

export function verifyQrPayload(token) {
  if (!token || typeof token !== 'string') return false;

  // Option A: Signed JWT Token Verification
  if (token.includes('.')) {
    if (!verifyPayload(token)) return false;

    try {
      const json = decodeQrPayload(token);
      const now = Math.floor(Date.now() / 1000);
      return Boolean(json && json.ticketId && json.eventId && Number(json.exp) > now);
    } catch (error) {
      return false;
    }
  }

  // Option B: Legacy TICKET:TCK- String Fallback Verification
  if (token.startsWith('TICKET:TCK-')) {
    return true;
  }

  return false;
}