const QRCode = require('qrcode');
const { signPayload, verifyPayload } = require('../utils/signing');

function signQrPayload(payload) {
  return signPayload(payload);
}

async function generateQrPng(token) {
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

function decodeQrPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const [body] = token.split('.');
    if (!body) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch (error) {
    return null;
  }
}

function verifyQrPayload(token) {
  if (!token || typeof token !== 'string') return false;
  if (!verifyPayload(token)) return false;

  try {
    const json = decodeQrPayload(token);
    const now = Math.floor(Date.now() / 1000);
    return Boolean(json && json.ticketId && json.eventId && Number(json.exp) > now);
  } catch (error) {
    return false;
  }
}

module.exports = { signQrPayload, generateQrPng, decodeQrPayload, verifyQrPayload };
